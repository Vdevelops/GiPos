package usecase

import (
	"errors"
	"fmt"
	sharedModels "gipos/api/internal/core/shared/models"
	"gipos/api/internal/master-data/warehouse/data/models"
	"gipos/api/internal/master-data/warehouse/data/repositories"
	"gipos/api/internal/master-data/warehouse/domain/dto"

	"gorm.io/gorm"
)

// WarehouseUsecase handles warehouse business logic
type WarehouseUsecase struct {
	warehouseRepo *repositories.WarehouseRepository
}

// NewWarehouseUsecase creates a new warehouse usecase
func NewWarehouseUsecase(warehouseRepo *repositories.WarehouseRepository) *WarehouseUsecase {
	return &WarehouseUsecase{
		warehouseRepo: warehouseRepo,
	}
}

// CreateWarehouse creates a new warehouse
func (uc *WarehouseUsecase) CreateWarehouse(tenantID string, req *dto.CreateWarehouseRequest, userID string) (*dto.WarehouseResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	// Check if code already exists
	_, err = uc.warehouseRepo.GetByCode(tenantIDUint, req.Code)
	if err == nil {
		return nil, errors.New("WAREHOUSE_CODE_EXISTS")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Convert outlet ID if provided
	var outletIDUint *uint
	if req.OutletID != nil {
		id, err := stringToUint(*req.OutletID)
		if err != nil {
			return nil, errors.New("INVALID_OUTLET_ID")
		}
		outletIDUint = &id
	}

	// Set defaults
	status := req.Status
	if status == "" {
		status = "active"
	}
	warehouseType := req.Type
	if warehouseType == "" {
		warehouseType = "main"
	}

	// Handle Address pointer
	var address string
	if req.Address != nil {
		address = *req.Address
	}

	warehouse := &models.Warehouse{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantIDUint,
		},
		Code:      req.Code,
		Name:      req.Name,
		Address:   address,
		OutletID:  outletIDUint,
		Type:      warehouseType,
		Status:    status,
		IsDefault: req.IsDefault,
		CreatedBy: &userIDUint,
	}

	if err := uc.warehouseRepo.Create(warehouse); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return uc.toWarehouseResponse(warehouse), nil
}

// GetWarehouseByID retrieves a warehouse by ID
func (uc *WarehouseUsecase) GetWarehouseByID(tenantID, id string) (*dto.WarehouseResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_WAREHOUSE_ID")
	}

	warehouse, err := uc.warehouseRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("WAREHOUSE_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return uc.toWarehouseResponse(warehouse), nil
}

// ListWarehouses retrieves a list of warehouses with pagination
func (uc *WarehouseUsecase) ListWarehouses(tenantID string, outletID *string, status string, page, perPage int) (*dto.WarehouseListResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	var outletIDUint *uint
	if outletID != nil {
		id, err := stringToUint(*outletID)
		if err != nil {
			return nil, errors.New("INVALID_OUTLET_ID")
		}
		outletIDUint = &id
	}

	// Calculate offset
	offset := (page - 1) * perPage

	warehouses, total, err := uc.warehouseRepo.List(tenantIDUint, outletIDUint, status, perPage, offset)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Convert to response
	responses := make([]dto.WarehouseResponse, len(warehouses))
	for i, warehouse := range warehouses {
		responses[i] = *uc.toWarehouseResponse(&warehouse)
	}

	// Calculate total pages
	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	return &dto.WarehouseListResponse{
		Data: responses,
		Pagination: dto.Pagination{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

// UpdateWarehouse updates an existing warehouse
func (uc *WarehouseUsecase) UpdateWarehouse(tenantID, id string, req *dto.UpdateWarehouseRequest) (*dto.WarehouseResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_WAREHOUSE_ID")
	}

	warehouse, err := uc.warehouseRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("WAREHOUSE_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Check code uniqueness if code is being updated
	if req.Code != nil && *req.Code != warehouse.Code {
		existing, err := uc.warehouseRepo.GetByCode(tenantIDUint, *req.Code)
		if err == nil && existing.ID != warehouse.ID {
			return nil, errors.New("WAREHOUSE_CODE_EXISTS")
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
		warehouse.Code = *req.Code
	}

	// Update fields
	if req.Name != nil {
		warehouse.Name = *req.Name
	}
	if req.Address != nil {
		warehouse.Address = *req.Address
	}
	if req.OutletID != nil {
		outletIDUint, err := stringToUint(*req.OutletID)
		if err != nil {
			return nil, errors.New("INVALID_OUTLET_ID")
		}
		warehouse.OutletID = &outletIDUint
	}
	if req.Type != nil {
		warehouse.Type = *req.Type
	}
	if req.Status != nil {
		warehouse.Status = *req.Status
	}
	if req.IsDefault != nil {
		warehouse.IsDefault = *req.IsDefault
	}

	if err := uc.warehouseRepo.Update(warehouse); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return uc.toWarehouseResponse(warehouse), nil
}

// DeleteWarehouse deletes a warehouse
func (uc *WarehouseUsecase) DeleteWarehouse(tenantID, id string) error {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}

	idUint, err := stringToUint(id)
	if err != nil {
		return errors.New("INVALID_WAREHOUSE_ID")
	}

	// Check if warehouse exists
	_, err = uc.warehouseRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("WAREHOUSE_NOT_FOUND")
		}
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	if err := uc.warehouseRepo.Delete(tenantIDUint, idUint); err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	return nil
}

// Helper functions
func stringToUint(s string) (uint, error) {
	var result uint
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}

func uintToString(u uint) string {
	return fmt.Sprintf("%d", u)
}

// toWarehouseResponse converts warehouse model to response DTO
func (uc *WarehouseUsecase) toWarehouseResponse(warehouse *models.Warehouse) *dto.WarehouseResponse {
	// Handle Address pointer
	var addressPtr *string
	if warehouse.Address != "" {
		addressPtr = &warehouse.Address
	}

	resp := &dto.WarehouseResponse{
		ID:        uintToString(warehouse.ID),
		Code:      warehouse.Code,
		Name:      warehouse.Name,
		Address:   addressPtr,
		Type:      warehouse.Type,
		Status:    warehouse.Status,
		IsDefault: warehouse.IsDefault,
		CreatedAt: warehouse.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt: warehouse.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}

	if warehouse.OutletID != nil {
		outletIDStr := uintToString(*warehouse.OutletID)
		resp.OutletID = &outletIDStr
	}

	if warehouse.Outlet != nil {
		resp.Outlet = &dto.OutletReference{
			ID:   uintToString(warehouse.Outlet.ID),
			Code: warehouse.Outlet.Code,
			Name: warehouse.Outlet.Name,
		}
	}

	return resp
}
