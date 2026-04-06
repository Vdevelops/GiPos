package usecase

import (
	"errors"
	"strconv"
	"strings"

	sharedModels "gipos/api/internal/core/shared/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	"gipos/api/internal/master-data/outlet/data/repositories"
	"gipos/api/internal/master-data/outlet/domain/dto"

	"gorm.io/gorm"
)

// Helper functions for ID conversion
func stringToUint(s string) (uint, error) {
	if s == "" {
		return 0, errors.New("empty string")
	}
	val, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(val), nil
}

func uintToString(u uint) string {
	return strconv.FormatUint(uint64(u), 10)
}

func stringPtrToUintPtr(s *string) (*uint, error) {
	if s == nil || *s == "" {
		return nil, nil
	}
	val, err := stringToUint(*s)
	if err != nil {
		return nil, err
	}
	return &val, nil
}

func uintPtrToStringPtr(u *uint) *string {
	if u == nil {
		return nil
	}
	s := uintToString(*u)
	return &s
}

// OutletUsecase handles outlet business logic
type OutletUsecase struct {
	outletRepo *repositories.OutletRepository
}

// NewOutletUsecase creates a new outlet usecase
func NewOutletUsecase(outletRepo *repositories.OutletRepository) *OutletUsecase {
	return &OutletUsecase{
		outletRepo: outletRepo,
	}
}

// CreateOutlet creates a new outlet
func (uc *OutletUsecase) CreateOutlet(tenantID string, req *dto.CreateOutletRequest, userID string) (*dto.OutletResponse, error) {
	// Convert tenantID from string to uint
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	// Check if code already exists
	existing, _ := uc.outletRepo.GetByCode(tenantIDUint, req.Code)
	if existing != nil {
		return nil, errors.New("DUPLICATE_VALUE")
	}

	// Convert userID from string to uint
	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	// Create outlet
	outlet := &outletModels.Outlet{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantIDUint,
		},
		Code:       req.Code,
		Name:       req.Name,
		Address:    req.Address,
		City:       req.City,
		Province:   req.Province,
		PostalCode: req.PostalCode,
		Phone:      req.Phone,
		Email:      req.Email,
		Status:     req.Status,
		IsMain:     req.IsMain,
		Timezone:   req.Timezone,
		LogoURL:    req.LogoURL,
		Settings:   req.Settings, // Already *string
		CreatedBy:  &userIDUint,
	}

	if req.Status == "" {
		outlet.Status = "active"
	}
	if req.Timezone == "" {
		outlet.Timezone = "Asia/Jakarta"
	}

	if err := uc.outletRepo.Create(outlet); err != nil {
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "already exists") {
			return nil, errors.New("DUPLICATE_VALUE")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toOutletResponse(outlet), nil
}

// GetOutletByID retrieves an outlet by ID
func (uc *OutletUsecase) GetOutletByID(tenantID, id string) (*dto.OutletResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_OUTLET_ID")
	}

	outlet, err := uc.outletRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("OUTLET_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toOutletResponse(outlet), nil
}

// UpdateOutlet updates an outlet
func (uc *OutletUsecase) UpdateOutlet(tenantID, id string, req *dto.UpdateOutletRequest, userID string) (*dto.OutletResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_OUTLET_ID")
	}

	outlet, err := uc.outletRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("OUTLET_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Update fields
	if req.Code != nil {
		// Check if new code already exists (excluding current outlet)
		existing, _ := uc.outletRepo.GetByCode(tenantIDUint, *req.Code)
		if existing != nil && existing.ID != idUint {
			return nil, errors.New("DUPLICATE_VALUE")
		}
		outlet.Code = *req.Code
	}
	if req.Name != nil {
		outlet.Name = *req.Name
	}
	if req.Address != nil {
		outlet.Address = *req.Address
	}
	if req.City != nil {
		outlet.City = *req.City
	}
	if req.Province != nil {
		outlet.Province = *req.Province
	}
	if req.PostalCode != nil {
		outlet.PostalCode = *req.PostalCode
	}
	if req.Phone != nil {
		outlet.Phone = *req.Phone
	}
	if req.Email != nil {
		outlet.Email = *req.Email
	}
	if req.Status != nil {
		outlet.Status = *req.Status
	}
	if req.IsMain != nil {
		outlet.IsMain = *req.IsMain
	}
	if req.Timezone != nil {
		outlet.Timezone = *req.Timezone
	}
	if req.LogoURL != nil {
		outlet.LogoURL = *req.LogoURL
	}
	if req.Settings != nil {
		outlet.Settings = req.Settings // Already *string
	}
	
	// Convert userID from string to uint
	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}
	outlet.UpdatedBy = &userIDUint

	if err := uc.outletRepo.Update(outlet); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toOutletResponse(outlet), nil
}

// DeleteOutlet deletes an outlet
func (uc *OutletUsecase) DeleteOutlet(tenantID, id string) error {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return errors.New("INVALID_OUTLET_ID")
	}

	// Check if outlet exists
	_, err = uc.outletRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("OUTLET_NOT_FOUND")
		}
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	if err := uc.outletRepo.Delete(tenantIDUint, idUint); err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	return nil
}

// ListOutlets retrieves a list of outlets
func (uc *OutletUsecase) ListOutlets(tenantID string, page, perPage int, search, status string) ([]dto.OutletResponse, int64, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, 0, errors.New("INVALID_TENANT_ID")
	}

	limit := perPage
	offset := (page - 1) * perPage

	outlets, total, err := uc.outletRepo.List(tenantIDUint, limit, offset, search, status)
	if err != nil {
		return nil, 0, errors.New("INTERNAL_SERVER_ERROR")
	}

	responses := make([]dto.OutletResponse, len(outlets))
	for i, outlet := range outlets {
		responses[i] = *toOutletResponse(&outlet)
	}

	return responses, total, nil
}

// toOutletResponse converts outlet model to response DTO
func toOutletResponse(outlet *outletModels.Outlet) *dto.OutletResponse {
	return &dto.OutletResponse{
		ID:         uintToString(outlet.ID),
		Code:       outlet.Code,
		Name:       outlet.Name,
		Address:    outlet.Address,
		City:       outlet.City,
		Province:   outlet.Province,
		PostalCode: outlet.PostalCode,
		Phone:      outlet.Phone,
		Email:      outlet.Email,
		Status:     outlet.Status,
		IsMain:     outlet.IsMain,
		Timezone:   outlet.Timezone,
		LogoURL:    outlet.LogoURL,
		Settings:   outlet.Settings, // Already *string
		CreatedAt:  outlet.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt:  outlet.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}
}
