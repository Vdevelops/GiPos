package handler

import (
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"
	"gipos/api/internal/master-data/warehouse/domain/dto"
	"gipos/api/internal/master-data/warehouse/domain/usecase"
	"strconv"

	"github.com/gin-gonic/gin"
)

// WarehouseHandler handles HTTP requests for warehouses
type WarehouseHandler struct {
	warehouseUsecase *usecase.WarehouseUsecase
}

// NewWarehouseHandler creates a new warehouse handler
func NewWarehouseHandler(warehouseUsecase *usecase.WarehouseUsecase) *WarehouseHandler {
	return &WarehouseHandler{
		warehouseUsecase: warehouseUsecase,
	}
}

// CreateWarehouse handles POST /api/v1/warehouses
func (h *WarehouseHandler) CreateWarehouse(c *gin.Context) {
	var req dto.CreateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		errors.Unauthorized(c, "User ID is required")
		return
	}

	warehouseResponse, err := h.warehouseUsecase.CreateWarehouse(tenantID.(string), &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, warehouseResponse, meta)
}

// GetWarehouse handles GET /api/v1/warehouses/:id
func (h *WarehouseHandler) GetWarehouse(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	warehouseResponse, err := h.warehouseUsecase.GetWarehouseByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, warehouseResponse, meta)
}

// ListWarehouses handles GET /api/v1/warehouses
func (h *WarehouseHandler) ListWarehouses(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	// Get query parameters
	outletID := c.Query("outlet_id")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	var outletIDPtr *string
	if outletID != "" {
		outletIDPtr = &outletID
	}

	warehouseListResponse, err := h.warehouseUsecase.ListWarehouses(tenantID.(string), outletIDPtr, status, page, perPage)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, warehouseListResponse, meta)
}

// UpdateWarehouse handles PUT /api/v1/warehouses/:id
func (h *WarehouseHandler) UpdateWarehouse(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	warehouseResponse, err := h.warehouseUsecase.UpdateWarehouse(tenantID.(string), id, &req)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, warehouseResponse, meta)
}

// DeleteWarehouse handles DELETE /api/v1/warehouses/:id
func (h *WarehouseHandler) DeleteWarehouse(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	err := h.warehouseUsecase.DeleteWarehouse(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	response.SuccessNoContent(c)
}
