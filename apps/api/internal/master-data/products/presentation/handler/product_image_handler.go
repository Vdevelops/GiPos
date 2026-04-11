package handler

import (
	"gipos/api/internal/master-data/products/domain/dto"
	"gipos/api/internal/master-data/products/domain/usecase"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"

	"github.com/gin-gonic/gin"
)

// ProductImageHandler handles HTTP requests for product images
type ProductImageHandler struct {
	imageUsecase *usecase.ProductImageUsecase
}

// NewProductImageHandler creates a new product image handler
func NewProductImageHandler(imageUsecase *usecase.ProductImageUsecase) *ProductImageHandler {
	return &ProductImageHandler{
		imageUsecase: imageUsecase,
	}
}

func getProductIDParam(c *gin.Context) string {
	productID := c.Param("product_id")
	if productID == "" {
		productID = c.Param("id")
	}
	return productID
}

// CreateProductImage handles POST /api/v1/products/:product_id/images
func (h *ProductImageHandler) CreateProductImage(c *gin.Context) {
	productID := getProductIDParam(c)

	var req dto.ProductImageRequest
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

	imageResponse, err := h.imageUsecase.CreateProductImage(tenantID.(string), productID, &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, imageResponse, meta)
}

// GetProductImage handles GET /api/v1/products/images/:id
func (h *ProductImageHandler) GetProductImage(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	imageResponse, err := h.imageUsecase.GetProductImageByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, imageResponse, meta)
}

// GetProductImages handles GET /api/v1/products/:product_id/images
func (h *ProductImageHandler) GetProductImages(c *gin.Context) {
	productID := getProductIDParam(c)

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	images, err := h.imageUsecase.GetProductImagesByProductID(tenantID.(string), productID)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, images, meta)
}

// UpdateProductImage handles PUT /api/v1/products/images/:id
func (h *ProductImageHandler) UpdateProductImage(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateProductImageRequest
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

	imageResponse, err := h.imageUsecase.UpdateProductImage(tenantID.(string), id, &req)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, imageResponse, meta)
}

// DeleteProductImage handles DELETE /api/v1/products/images/:id
func (h *ProductImageHandler) DeleteProductImage(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	err := h.imageUsecase.DeleteProductImage(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	response.SuccessNoContent(c)
}

// BulkCreateProductImages handles POST /api/v1/products/:product_id/images/bulk
func (h *ProductImageHandler) BulkCreateProductImages(c *gin.Context) {
	productID := getProductIDParam(c)

	var req dto.BulkProductImageRequest
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

	images, err := h.imageUsecase.BulkCreateProductImages(tenantID.(string), productID, &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, images, meta)
}

