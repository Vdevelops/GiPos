package handler

import (
	"gipos/api/internal/master-data/products/domain/dto"
	"gipos/api/internal/master-data/products/domain/usecase"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"

	"github.com/gin-gonic/gin"
)

// ProductStockHandler handles HTTP requests for product stocks
type ProductStockHandler struct {
	stockUsecase *usecase.ProductStockUsecase
}

// NewProductStockHandler creates a new product stock handler
func NewProductStockHandler(stockUsecase *usecase.ProductStockUsecase) *ProductStockHandler {
	return &ProductStockHandler{
		stockUsecase: stockUsecase,
	}
}

// CreateProductStock handles POST /api/v1/products/:product_id/stocks
func (h *ProductStockHandler) CreateProductStock(c *gin.Context) {
	productID := c.Param("product_id")

	var req dto.ProductStockRequest
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

	stockResponse, err := h.stockUsecase.CreateProductStock(tenantID.(string), productID, &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, stockResponse, meta)
}

// GetProductStock handles GET /api/v1/products/stocks/:id
func (h *ProductStockHandler) GetProductStock(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	stockResponse, err := h.stockUsecase.GetProductStockByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, stockResponse, meta)
}

// GetProductStocks handles GET /api/v1/products/:product_id/stocks
func (h *ProductStockHandler) GetProductStocks(c *gin.Context) {
	productID := c.Param("product_id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	stocks, err := h.stockUsecase.GetProductStocksByProductID(tenantID.(string), productID)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, stocks, meta)
}

// UpdateProductStock handles PUT /api/v1/products/stocks/:id
func (h *ProductStockHandler) UpdateProductStock(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateProductStockRequest
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

	stockResponse, err := h.stockUsecase.UpdateProductStock(tenantID.(string), id, &req)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, stockResponse, meta)
}

// DeleteProductStock handles DELETE /api/v1/products/stocks/:id
func (h *ProductStockHandler) DeleteProductStock(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	err := h.stockUsecase.DeleteProductStock(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	response.SuccessNoContent(c)
}

// BulkCreateProductStocks handles POST /api/v1/products/:product_id/stocks/bulk
func (h *ProductStockHandler) BulkCreateProductStocks(c *gin.Context) {
	productID := c.Param("product_id")

	var req dto.BulkProductStockRequest
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

	stocks, err := h.stockUsecase.BulkCreateProductStocks(tenantID.(string), productID, &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, stocks, meta)
}

// GetProductTotalStock handles GET /api/v1/products/:product_id/stocks/total
func (h *ProductStockHandler) GetProductTotalStock(c *gin.Context) {
	productID := c.Param("product_id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	totalQuantity, totalReserved, err := h.stockUsecase.GetProductTotalStock(tenantID.(string), productID)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	data := map[string]interface{}{
		"total_quantity": totalQuantity,
		"total_reserved": totalReserved,
		"available":     totalQuantity - totalReserved,
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, data, meta)
}

