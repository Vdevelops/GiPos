package usecase

import (
	"errors"
	"fmt"
	"strings"
	"time"

	redisInfra "gipos/api/internal/core/infrastructure/redis"
	sharedModels "gipos/api/internal/core/shared/models"
	reportRepo "gipos/api/internal/reports/data/repositories"
	"gipos/api/internal/sales/data/models"
	"gipos/api/internal/sales/data/repositories"
	"gipos/api/internal/sales/domain/dto"

	"gorm.io/gorm"
)

// PaymentUsecase handles payment business logic
type PaymentUsecase struct {
	paymentRepo *repositories.PaymentRepository
	saleRepo    *repositories.SaleRepository
	reportRepo  *reportRepo.ReportRepository
	db          *gorm.DB
}

// NewPaymentUsecase creates a new payment usecase
func NewPaymentUsecase(paymentRepo *repositories.PaymentRepository, saleRepo *repositories.SaleRepository, reportRepo *reportRepo.ReportRepository, db *gorm.DB) *PaymentUsecase {
	return &PaymentUsecase{
		paymentRepo: paymentRepo,
		saleRepo:    saleRepo,
		reportRepo:  reportRepo,
		db:          db,
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

	paidAt := time.Now().UTC()
	if req.PaidAt != nil && strings.TrimSpace(*req.PaidAt) != "" {
		parsedAt, err := parseTimestamp(strings.TrimSpace(*req.PaidAt))
		if err != nil {
			return nil, errors.New("INVALID_DATE")
		}
		paidAt = parsedAt
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
		PaidAt:          &paidAt,
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

	err = uc.db.Transaction(func(tx *gorm.DB) error {
		var existingPayment models.Payment
		err := tx.Where("tenant_id = ? AND sale_id = ? AND deleted_at IS NULL", tenantIDUint, saleIDUint).
			First(&existingPayment).Error
		if err == nil {
			return errors.New("PAYMENT_ALREADY_PROCESSED")
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		if err := tx.Create(payment).Error; err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				return errors.New("PAYMENT_ALREADY_PROCESSED")
			}
			return err
		}

		sale.PaymentStatus = payment.Status
		paymentID := uintToString(payment.ID)
		sale.PaymentID = &paymentID
		if payment.Status == models.PaymentStatusCompleted {
			sale.PaidAt = &paidAt
			sale.Status = models.SaleStatusCompleted
			sale.CompletedAt = &paidAt
		}

		if err := tx.Model(&models.Sale{}).
			Where("tenant_id = ? AND id = ? AND deleted_at IS NULL", tenantIDUint, saleIDUint).
			Updates(map[string]interface{}{
				"payment_status": sale.PaymentStatus,
				"payment_id":     sale.PaymentID,
				"paid_at":        sale.PaidAt,
				"status":         sale.Status,
				"completed_at":   sale.CompletedAt,
			}).Error; err != nil {
			return err
		}

		if payment.Status == models.PaymentStatusCompleted && uc.reportRepo != nil {
			if err := uc.reportRepo.RefreshDailyAggregatesForSale(tx, tenantIDUint, saleIDUint); err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		if err.Error() == "PAYMENT_ALREADY_PROCESSED" {
			return nil, errors.New("PAYMENT_ALREADY_PROCESSED")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	if payment.Status == models.PaymentStatusCompleted {
		uc.invalidateReportsCache(tenantIDUint)
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
			paymentID := uintToString(payment.ID)
			sale.PaymentID = &paymentID
			now := time.Now()
			sale.PaidAt = &now
			sale.Status = models.SaleStatusCompleted
			sale.CompletedAt = &now
			if updateErr := uc.saleRepo.Update(sale); updateErr == nil && uc.reportRepo != nil {
				_ = uc.reportRepo.RefreshDailyAggregatesForSale(nil, tenantIDUint, payment.SaleID)
				uc.invalidateReportsCache(tenantIDUint)
			}
		}
	}

	// Reload payment
	payment, err = uc.paymentRepo.GetByID(tenantIDUint, paymentIDUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toPaymentResponse(payment), nil
}

func (uc *PaymentUsecase) invalidateReportsCache(tenantID uint) {
	prefix := fmt.Sprintf("reports:tenant:%d:", tenantID)
	_ = redisInfra.DeleteByPrefix(prefix)
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
