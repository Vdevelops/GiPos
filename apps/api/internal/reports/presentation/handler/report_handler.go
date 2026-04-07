package handler

import (
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	reportDTO "gipos/api/internal/reports/domain/dto"
	reportUsecase "gipos/api/internal/reports/domain/usecase"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ReportHandler handles HTTP requests for reports endpoints.
type ReportHandler struct {
	reportUsecase *reportUsecase.ReportUsecase
}

func NewReportHandler(reportUsecase *reportUsecase.ReportUsecase) *ReportHandler {
	return &ReportHandler{reportUsecase: reportUsecase}
}

// GetSummary handles GET /api/v1/reports/summary.
func (h *ReportHandler) GetSummary(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	query := parseFilterQuery(c)
	result, err := h.reportUsecase.GetSummary(tenantID.(string), query)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.Filters = buildMetaFilters(c)
	response.Success(c, result, meta)
}

// GetSales handles GET /api/v1/reports/sales.
func (h *ReportHandler) GetSales(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	rangeType := c.DefaultQuery("range", "daily")
	query := parseFilterQuery(c)

	result, err := h.reportUsecase.GetSalesSeries(tenantID.(string), rangeType, query)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.Filters = buildMetaFilters(c)
	response.Success(c, result, meta)
}

// GetTopProducts handles GET /api/v1/reports/top-products.
func (h *ReportHandler) GetTopProducts(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	query := parseFilterQuery(c)
	limit := 10
	if limitQuery := c.Query("limit"); limitQuery != "" {
		parsed, err := strconv.Atoi(limitQuery)
		if err == nil && parsed > 0 {
			limit = parsed
		}
	}

	result, err := h.reportUsecase.GetTopProducts(tenantID.(string), query, limit)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.Filters = buildMetaFilters(c)
	response.Success(c, result, meta)
}

// GetPaymentMethods handles GET /api/v1/reports/payment-methods.
func (h *ReportHandler) GetPaymentMethods(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	query := parseFilterQuery(c)
	result, err := h.reportUsecase.GetPaymentMethods(tenantID.(string), query)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.Filters = buildMetaFilters(c)
	response.Success(c, result, meta)
}

// GetConsistencyCheck handles GET /api/v1/reports/consistency-check.
func (h *ReportHandler) GetConsistencyCheck(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	query := parseFilterQuery(c)
	limit := 20
	if limitQuery := c.Query("limit"); limitQuery != "" {
		parsed, err := strconv.Atoi(limitQuery)
		if err == nil && parsed > 0 {
			limit = parsed
		}
	}

	result, err := h.reportUsecase.GetConsistencyCheck(tenantID.(string), query, limit)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.Filters = buildMetaFilters(c)
	response.Success(c, result, meta)
}

func parseFilterQuery(c *gin.Context) reportDTO.ReportFilterQuery {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	outletID := c.Query("outlet_id")
	productID := c.Query("product_id")
	categoryID := c.Query("category_id")

	query := reportDTO.ReportFilterQuery{}
	if startDate != "" {
		query.StartDate = &startDate
	}
	if endDate != "" {
		query.EndDate = &endDate
	}
	if outletID != "" {
		query.OutletID = &outletID
	}
	if productID != "" {
		query.ProductID = &productID
	}
	if categoryID != "" {
		query.CategoryID = &categoryID
	}
	return query
}

func buildMetaFilters(c *gin.Context) map[string]interface{} {
	filters := map[string]interface{}{}
	for _, key := range []string{"start_date", "end_date", "outlet_id", "product_id", "category_id", "range", "limit"} {
		if value := c.Query(key); value != "" {
			filters[key] = value
		}
	}
	if len(filters) == 0 {
		return nil
	}
	return filters
}
