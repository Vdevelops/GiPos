package handler

import (
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"
	"gipos/api/internal/sales/domain/dto"
	"gipos/api/internal/sales/domain/usecase"

	"github.com/gin-gonic/gin"
)

// SaleHandler handles HTTP requests for sales
type SaleHandler struct {
	saleUsecase *usecase.SaleUsecase
}

// NewSaleHandler creates a new sale handler
func NewSaleHandler(saleUsecase *usecase.SaleUsecase) *SaleHandler {
	return &SaleHandler{
		saleUsecase: saleUsecase,
	}
}

// CreateSale handles POST /api/v1/sales
func (h *SaleHandler) CreateSale(c *gin.Context) {
	var req dto.CreateSaleRequest
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

	saleResponse, err := h.saleUsecase.CreateSale(tenantID.(string), &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.OutletID = saleResponse.OutletID
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, saleResponse, meta)
}

// GetSale handles GET /api/v1/sales/:id
func (h *SaleHandler) GetSale(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	saleResponse, err := h.saleUsecase.GetSaleByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, saleResponse, meta)
}

// ListSales handles GET /api/v1/sales
func (h *SaleHandler) ListSales(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	// Get pagination params
	page, perPage := response.ParsePaginationParams(c)

	// Get filters
	outletID := c.Query("outlet_id")
	shiftID := c.Query("shift_id")
	status := c.Query("status")
	paymentStatus := c.Query("payment_status")
	paymentMethod := c.Query("payment_method")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var outletIDPtr *string
	if outletID != "" {
		outletIDPtr = &outletID
	}

	var shiftIDPtr *string
	if shiftID != "" {
		shiftIDPtr = &shiftID
	}

	var statusPtr *string
	if status != "" {
		statusPtr = &status
	}

	var paymentStatusPtr *string
	if paymentStatus != "" {
		paymentStatusPtr = &paymentStatus
	}

	var paymentMethodPtr *string
	if paymentMethod != "" {
		paymentMethodPtr = &paymentMethod
	}

	var startDatePtr *string
	if startDate != "" {
		startDatePtr = &startDate
	}

	var endDatePtr *string
	if endDate != "" {
		endDatePtr = &endDate
	}

	sales, total, err := h.saleUsecase.ListSales(
		tenantID.(string),
		outletIDPtr,
		shiftIDPtr,
		statusPtr,
		paymentStatusPtr,
		paymentMethodPtr,
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
	if shiftID != "" {
		filters["shift_id"] = shiftID
	}
	if status != "" {
		filters["status"] = status
	}
	if paymentStatus != "" {
		filters["payment_status"] = paymentStatus
	}
	if paymentMethod != "" {
		filters["payment_method"] = paymentMethod
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

	response.Success(c, sales, meta)
}

// VoidSale handles POST /api/v1/sales/:id/void
func (h *SaleHandler) VoidSale(c *gin.Context) {
	id := c.Param("id")

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

	err := h.saleUsecase.VoidSale(tenantID.(string), id, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	response.SuccessNoContent(c)
}
