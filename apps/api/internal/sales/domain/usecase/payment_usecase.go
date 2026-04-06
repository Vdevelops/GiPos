package usecase

import (
	"errors"
	"time"

	sharedModels "gipos/api/internal/core/shared/models"
	"gipos/api/internal/sales/data/models"
	"gipos/api/internal/sales/data/repositories"
	"gipos/api/internal/sales/domain/dto"

	"gorm.io/gorm"
)

// PaymentUsecase handles payment business logic
type PaymentUsecase struct {
	paymentRepo *repositories.PaymentRepository
	saleRepo    *repositories.SaleRepository
}

// NewPaymentUsecase creates a new payment usecase
func NewPaymentUsecase(paymentRepo *repositories.PaymentRepository, saleRepo *repositories.SaleRepository) *PaymentUsecase {
	return &PaymentUsecase{
		paymentRepo: paymentRepo,
		saleRepo:    saleRepo,
	}
}

// ProcessPayment processes a payment for a sale
func (uc *PaymentUsecase) ProcessPayment(tenantID string, req *dto.ProcessPaymentRequest) (*dto.PaymentResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	saleIDUint, err := stringToUint(req.SaleID)
	if err != nil {
		return nil, errors.New("INVALID_SALE_ID")
	}

	// Get sale
	sale, err := uc.saleRepo.GetByID(tenantIDUint, saleIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("SALE_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Validate sale status
	if sale.Status != models.SaleStatusPending {
		return nil, errors.New("SALE_ALREADY_COMPLETED")
	}

	// Validate payment amount matches sale total
	if req.Amount != sale.Total {
		return nil, errors.New("INVALID_PAYMENT_AMOUNT")
	}

	// Validate payment method matches sale payment method
	if req.Method != sale.PaymentMethod {
		return nil, errors.New("PAYMENT_METHOD_MISMATCH")
	}

	// Check if payment already exists
	existingPayment, _ := uc.paymentRepo.GetBySaleID(tenantIDUint, saleIDUint)
	if existingPayment != nil {
		return nil, errors.New("PAYMENT_ALREADY_PROCESSED")
	}

	// Create payment
	payment := &models.Payment{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantIDUint,
		},
		SaleID:          saleIDUint,
		Method:          req.Method,
		Amount:          req.Amount,
		Status:          models.PaymentStatusCompleted,
		GatewayResponse: "{}",
	}
	var changeAmount *int64

	// Set method-specific fields
	if req.Method == models.PaymentMethodCash {
		amountPaid := req.AmountPaid
		if amountPaid == nil {
			amountPaid = req.CashReceived
		}
		if amountPaid == nil || *amountPaid < req.Amount {
			return nil, errors.New("INSUFFICIENT_BALANCE")
		}
		change := *amountPaid - req.Amount
		changeAmount = &change
	} else if req.Method != models.PaymentMethodQRIS {
		return nil, errors.New("PAYMENT_METHOD_MISMATCH")
	}

	// Both cash and qris are completed immediately in POS flow.
	now := time.Now()
	payment.PaidAt = &now

	if err := uc.paymentRepo.Create(payment); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Update sale payment status and link payment
	sale.PaymentStatus = payment.Status
	sale.PaymentID = payment.GatewayID
	if payment.Status == models.PaymentStatusCompleted {
		now := time.Now()
		sale.PaidAt = &now
		sale.Status = models.SaleStatusCompleted
		sale.CompletedAt = &now
	}

	if err := uc.saleRepo.Update(sale); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Reload payment
	payment, err = uc.paymentRepo.GetByID(tenantIDUint, payment.ID)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	paymentResponse := toPaymentResponse(payment)
	if changeAmount != nil {
		paymentResponse.Change = changeAmount
	}

	return paymentResponse, nil
}

// UpdatePaymentStatus updates payment status (for webhooks or manual confirmation)
func (uc *PaymentUsecase) UpdatePaymentStatus(tenantID, paymentID string, req *dto.UpdatePaymentRequest) (*dto.PaymentResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	paymentIDUint, err := stringToUint(paymentID)
	if err != nil {
		return nil, errors.New("INVALID_PAYMENT_ID")
	}

	// Get payment
	payment, err := uc.paymentRepo.GetByID(tenantIDUint, paymentIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PAYMENT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Update payment fields
	if req.Status != nil {
		payment.Status = *req.Status
		if *req.Status == models.PaymentStatusCompleted {
			now := time.Now()
			payment.PaidAt = &now
		} else if *req.Status == models.PaymentStatusFailed {
			now := time.Now()
			payment.FailedAt = &now
		}
	}
	if req.GatewayID != nil {
		payment.GatewayID = req.GatewayID
	}
	if req.QRCodeURL != nil {
		payment.QRCodeURL = req.QRCodeURL
	}
	if req.PaymentLink != nil {
		payment.PaymentLink = req.PaymentLink
	}
	if req.FailureReason != nil {
		payment.FailureReason = *req.FailureReason
	}

	if err := uc.paymentRepo.Update(payment); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Update sale status if payment completed
	if payment.Status == models.PaymentStatusCompleted {
		sale, err := uc.saleRepo.GetByID(tenantIDUint, payment.SaleID)
		if err == nil {
			sale.PaymentStatus = models.PaymentStatusCompleted
			now := time.Now()
			sale.PaidAt = &now
			sale.Status = models.SaleStatusCompleted
			sale.CompletedAt = &now
			uc.saleRepo.Update(sale)
		}
	}

	// Reload payment
	payment, err = uc.paymentRepo.GetByID(tenantIDUint, paymentIDUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toPaymentResponse(payment), nil
}

// GetPaymentByID retrieves a payment by ID
func (uc *PaymentUsecase) GetPaymentByID(tenantID, id string) (*dto.PaymentResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_PAYMENT_ID")
	}

	payment, err := uc.paymentRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PAYMENT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toPaymentResponse(payment), nil
}

// GetPaymentBySaleID retrieves a payment by sale ID
func (uc *PaymentUsecase) GetPaymentBySaleID(tenantID, saleID string) (*dto.PaymentResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	saleIDUint, err := stringToUint(saleID)
	if err != nil {
		return nil, errors.New("INVALID_SALE_ID")
	}

	payment, err := uc.paymentRepo.GetBySaleID(tenantIDUint, saleIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PAYMENT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toPaymentResponse(payment), nil
}
