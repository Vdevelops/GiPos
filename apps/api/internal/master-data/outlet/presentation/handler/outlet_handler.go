package handler

import (
	"gipos/api/internal/master-data/outlet/domain/dto"
	"gipos/api/internal/master-data/outlet/domain/usecase"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"

	"github.com/gin-gonic/gin"
)

// OutletHandler handles HTTP requests for outlets
type OutletHandler struct {
	outletUsecase *usecase.OutletUsecase
}

// NewOutletHandler creates a new outlet handler
func NewOutletHandler(outletUsecase *usecase.OutletUsecase) *OutletHandler {
	return &OutletHandler{
		outletUsecase: outletUsecase,
	}
}

// CreateOutlet handles POST /api/v1/outlets
func (h *OutletHandler) CreateOutlet(c *gin.Context) {
	var req dto.CreateOutletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	// Get tenant_id and user_id from context
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

	outletResponse, err := h.outletUsecase.CreateOutlet(tenantID.(string), &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, outletResponse, meta)
}

// GetOutlet handles GET /api/v1/outlets/:id
func (h *OutletHandler) GetOutlet(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	outletResponse, err := h.outletUsecase.GetOutletByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, outletResponse, meta)
}

// UpdateOutlet handles PUT /api/v1/outlets/:id
func (h *OutletHandler) UpdateOutlet(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateOutletRequest
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

	outletResponse, err := h.outletUsecase.UpdateOutlet(tenantID.(string), id, &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.UpdatedBy = userID.(string)
	response.Success(c, outletResponse, meta)
}

// DeleteOutlet handles DELETE /api/v1/outlets/:id
func (h *OutletHandler) DeleteOutlet(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	err := h.outletUsecase.DeleteOutlet(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	response.SuccessNoContent(c)
}

// ListOutlets handles GET /api/v1/outlets
func (h *OutletHandler) ListOutlets(c *gin.Context) {
	// Get pagination params
	page, perPage := response.ParsePaginationParams(c)

	// Get filters
	search := c.Query("search")
	status := c.Query("status")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	outlets, total, err := h.outletUsecase.ListOutlets(tenantID.(string), page, perPage, search, status)
	if err != nil {
		errors.Error(c, "INTERNAL_SERVER_ERROR", nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.Pagination = response.NewPaginationMeta(page, perPage, int(total))
	if search != "" {
		meta.Filters = map[string]interface{}{
			"search": search,
		}
	}
	if status != "" {
		if meta.Filters == nil {
			meta.Filters = make(map[string]interface{})
		}
		meta.Filters["status"] = status
	}

	response.Success(c, outlets, meta)
}

