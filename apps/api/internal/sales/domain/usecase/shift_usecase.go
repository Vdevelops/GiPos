package usecase

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	sharedModels "gipos/api/internal/core/shared/models"
	outletRepo "gipos/api/internal/master-data/outlet/data/repositories"
	"gipos/api/internal/sales/data/models"
	"gipos/api/internal/sales/data/repositories"
	"gipos/api/internal/sales/domain/dto"

	"gorm.io/gorm"
)

// ShiftUsecase handles shift business logic
type ShiftUsecase struct {
	shiftRepo  *repositories.ShiftRepository
	saleRepo   *repositories.SaleRepository
	outletRepo *outletRepo.OutletRepository
}

// NewShiftUsecase creates a new shift usecase
func NewShiftUsecase(shiftRepo *repositories.ShiftRepository, saleRepo *repositories.SaleRepository, outletRepo *outletRepo.OutletRepository) *ShiftUsecase {
	return &ShiftUsecase{
		shiftRepo:  shiftRepo,
		saleRepo:   saleRepo,
		outletRepo: outletRepo,
	}
}

// OpenShift opens a new shift
func (uc *ShiftUsecase) OpenShift(tenantID string, req *dto.CreateShiftRequest, userID string) (*dto.ShiftResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	outletIDUint, err := stringToUint(req.OutletID)
	if err != nil {
		return nil, errors.New("INVALID_OUTLET_ID")
	}

	// Validate outlet exists
	_, err = uc.outletRepo.GetByID(tenantIDUint, outletIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("OUTLET_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Check if there's an open shift for this outlet
	openShift, err := uc.shiftRepo.GetOpenShiftByOutlet(tenantIDUint, outletIDUint)
	if err == nil && openShift != nil {
		return nil, errors.New("SHIFT_ALREADY_OPEN")
	}

	// Generate shift number
	dateStr := time.Now().Format("20060102")
	var sequence int
	var lastShift models.Shift
	err = uc.shiftRepo.GetDB().Where("tenant_id = ? AND outlet_id = ? AND shift_number LIKE ?", tenantIDUint, outletIDUint, fmt.Sprintf("SHIFT-%s-%%", dateStr)).
		Order("shift_number DESC").
		First(&lastShift).Error
	if err == nil {
		// Extract sequence from last shift number
		if len(lastShift.ShiftNumber) > len(fmt.Sprintf("SHIFT-%s-", dateStr)) {
			seqStr := lastShift.ShiftNumber[len(fmt.Sprintf("SHIFT-%s-", dateStr)):]
			if seq, err := strconv.Atoi(seqStr); err == nil {
				sequence = seq + 1
			} else {
				sequence = 1
			}
		} else {
			sequence = 1
		}
	} else {
		sequence = 1
	}
	shiftNumber := fmt.Sprintf("SHIFT-%s-%03d", dateStr, sequence)

	// Create shift
	shift := &models.Shift{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantIDUint,
		},
		OutletID:    outletIDUint,
		UserID:      userIDUint,
		ShiftNumber: shiftNumber,
		Status:      models.ShiftStatusOpen,
		OpeningCash: req.OpeningCash,
		OpeningTime: time.Now(),
		OpeningNotes: req.OpeningNotes,
	}

	if err := uc.shiftRepo.Create(shift); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Reload shift with relations
	shift, err = uc.shiftRepo.GetByID(tenantIDUint, shift.ID)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toShiftResponse(shift), nil
}

// CloseShift closes a shift
func (uc *ShiftUsecase) CloseShift(tenantID, id string, req *dto.CloseShiftRequest) (*dto.ShiftResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_SHIFT_ID")
	}

	// Get shift
	shift, err := uc.shiftRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("SHIFT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Validate shift is open
	if shift.Status != models.ShiftStatusOpen {
		return nil, errors.New("SHIFT_ALREADY_CLOSED")
	}

	// Calculate shift statistics
	sales, _, err := uc.saleRepo.List(tenantIDUint, &shift.OutletID, &shift.ID, nil, nil, nil, nil, nil, 1000, 0)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	var totalSales int64 = 0
	var totalTransactions int = 0
	var cashSales int64 = 0
	var nonCashSales int64 = 0

	for _, sale := range sales {
		if sale.Status == models.SaleStatusCompleted {
			totalSales += sale.Total
			totalTransactions++
			if sale.PaymentMethod == models.PaymentMethodCash {
				cashSales += sale.Total
			} else {
				nonCashSales += sale.Total
			}
		}
	}

	// Calculate expected cash
	expectedCash := shift.OpeningCash + cashSales
	difference := req.ClosingCash - expectedCash

	// Update shift
	now := time.Now()
	shift.Status = models.ShiftStatusClosed
	shift.ClosingCash = &req.ClosingCash
	shift.ExpectedCash = &expectedCash
	shift.Difference = &difference
	shift.ClosingTime = &now
	shift.ClosingNotes = req.ClosingNotes
	shift.TotalSales = totalSales
	shift.TotalTransactions = totalTransactions
	shift.CashSales = cashSales
	shift.NonCashSales = nonCashSales

	if err := uc.shiftRepo.Update(shift); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Reload shift with relations
	shift, err = uc.shiftRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toShiftResponse(shift), nil
}

// GetShiftByID retrieves a shift by ID
func (uc *ShiftUsecase) GetShiftByID(tenantID, id string) (*dto.ShiftResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_SHIFT_ID")
	}

	shift, err := uc.shiftRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("SHIFT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toShiftResponse(shift), nil
}

// ListShifts retrieves a list of shifts with pagination
func (uc *ShiftUsecase) ListShifts(tenantID string, outletID *string, userID *string, status *string, startDate *string, endDate *string, page, perPage int) ([]dto.ShiftResponse, int64, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, 0, errors.New("INVALID_TENANT_ID")
	}

	var outletIDUint *uint
	if outletID != nil && *outletID != "" {
		outletIDUint, err = stringPtrToUintPtr(outletID)
		if err != nil {
			return nil, 0, errors.New("INVALID_OUTLET_ID")
		}
	}

	var userIDUint *uint
	if userID != nil && *userID != "" {
		userIDUint, err = stringPtrToUintPtr(userID)
		if err != nil {
			return nil, 0, errors.New("INVALID_USER_ID")
		}
	}

	var startDateParsed *time.Time
	if startDate != nil && *startDate != "" {
		parsed, err := time.Parse("2006-01-02", *startDate)
		if err == nil {
			startDateParsed = &parsed
		}
	}

	var endDateParsed *time.Time
	if endDate != nil && *endDate != "" {
		parsed, err := time.Parse("2006-01-02", *endDate)
		if err == nil {
			// Set to end of day
			parsed = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 23, 59, 59, 999999999, parsed.Location())
			endDateParsed = &parsed
		}
	}

	limit := perPage
	offset := (page - 1) * perPage

	shifts, total, err := uc.shiftRepo.List(tenantIDUint, outletIDUint, userIDUint, status, startDateParsed, endDateParsed, limit, offset)
	if err != nil {
		return nil, 0, errors.New("INTERNAL_SERVER_ERROR")
	}

	responses := make([]dto.ShiftResponse, len(shifts))
	for i, shift := range shifts {
		responses[i] = *toShiftResponse(&shift)
	}

	return responses, total, nil
}

// toShiftResponse converts shift model to response DTO
func toShiftResponse(shift *models.Shift) *dto.ShiftResponse {
	resp := &dto.ShiftResponse{
		ID:               uintToString(shift.ID),
		OutletID:         uintToString(shift.OutletID),
		UserID:           uintToString(shift.UserID),
		ShiftNumber:      shift.ShiftNumber,
		Status:           shift.Status,
		OpeningCash:      shift.OpeningCash,
		OpeningTime:      shift.OpeningTime.Format("2006-01-02T15:04:05+07:00"),
		OpeningNotes:     shift.OpeningNotes,
		TotalSales:       shift.TotalSales,
		TotalTransactions: shift.TotalTransactions,
		CashSales:        shift.CashSales,
		NonCashSales:     shift.NonCashSales,
		CreatedAt:        shift.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt:        shift.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}

	if shift.ClosingCash != nil {
		resp.ClosingCash = shift.ClosingCash
	}
	if shift.ExpectedCash != nil {
		resp.ExpectedCash = shift.ExpectedCash
	}
	if shift.Difference != nil {
		resp.Difference = shift.Difference
	}
	if shift.ClosingTime != nil {
		closingTime := shift.ClosingTime.Format("2006-01-02T15:04:05+07:00")
		resp.ClosingTime = &closingTime
	}
	if shift.ClosingNotes != "" {
		resp.ClosingNotes = shift.ClosingNotes
	}

	// Include outlet if loaded
	if shift.Outlet != nil {
		resp.Outlet = &dto.OutletReference{
			ID:   uintToString(shift.Outlet.ID),
			Code: shift.Outlet.Code,
			Name: shift.Outlet.Name,
		}
	}

	// Include user if loaded
	if shift.User != nil {
		resp.User = &dto.UserReference{
			ID:    uintToString(shift.User.ID),
			Name:  shift.User.Name,
			Email: shift.User.Email,
		}
	}

	return resp
}
