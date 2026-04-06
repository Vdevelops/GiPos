package handler

import (
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"
	"gipos/api/internal/sales/domain/dto"
	"gipos/api/internal/sales/domain/usecase"

	"github.com/gin-gonic/gin"
)

// ShiftHandler handles HTTP requests for shifts
type ShiftHandler struct {
	shiftUsecase *usecase.ShiftUsecase
}

// NewShiftHandler creates a new shift handler
func NewShiftHandler(shiftUsecase *usecase.ShiftUsecase) *ShiftHandler {
	return &ShiftHandler{
		shiftUsecase: shiftUsecase,
	}
}

// OpenShift handles POST /api/v1/shifts/open
func (h *ShiftHandler) OpenShift(c *gin.Context) {
	var req dto.CreateShiftRequest
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

	shiftResponse, err := h.shiftUsecase.OpenShift(tenantID.(string), &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.OutletID = req.OutletID
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, shiftResponse, meta)
}

// CloseShift handles POST /api/v1/shifts/:id/close
func (h *ShiftHandler) CloseShift(c *gin.Context) {
	id := c.Param("id")

	var req dto.CloseShiftRequest
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

	shiftResponse, err := h.shiftUsecase.CloseShift(tenantID.(string), id, &req)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, shiftResponse, meta)
}

// GetShift handles GET /api/v1/shifts/:id
func (h *ShiftHandler) GetShift(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	shiftResponse, err := h.shiftUsecase.GetShiftByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, shiftResponse, meta)
}

// ListShifts handles GET /api/v1/shifts
func (h *ShiftHandler) ListShifts(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	// Get pagination params
	page, perPage := response.ParsePaginationParams(c)

	// Get filters
	outletID := c.Query("outlet_id")
	userID := c.Query("user_id")
	status := c.Query("status")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var outletIDPtr *string
	if outletID != "" {
		outletIDPtr = &outletID
	}

	var userIDPtr *string
	if userID != "" {
		userIDPtr = &userID
	}

	var statusPtr *string
	if status != "" {
		statusPtr = &status
	}

	var startDatePtr *string
	if startDate != "" {
		startDatePtr = &startDate
	}

	var endDatePtr *string
	if endDate != "" {
		endDatePtr = &endDate
	}

	shifts, total, err := h.shiftUsecase.ListShifts(
		tenantID.(string),
		outletIDPtr,
		userIDPtr,
		statusPtr,
		startDatePtr,
		endDatePtr,
		page,
		perPage,
	)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.Pagination = response.NewPaginationMeta(page, perPage, int(total))

	// Add filters to meta
	filters := make(map[string]interface{})
	if outletID != "" {
		filters["outlet_id"] = outletID
	}
	if userID != "" {
		filters["user_id"] = userID
	}
	if status != "" {
		filters["status"] = status
	}
	if startDate != "" {
		filters["start_date"] = startDate
	}
	if endDate != "" {
		filters["end_date"] = endDate
	}
	if len(filters) > 0 {
		meta.Filters = filters
	}

	response.Success(c, shifts, meta)
}
