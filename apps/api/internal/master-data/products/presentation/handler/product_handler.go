package handler

import (
	"strings"

	"gipos/api/internal/master-data/products/domain/dto"
	"gipos/api/internal/master-data/products/domain/usecase"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"

	"github.com/gin-gonic/gin"
)

// ProductHandler handles HTTP requests for products
type ProductHandler struct {
	productUsecase *usecase.ProductUsecase
}

// NewProductHandler creates a new product handler
func NewProductHandler(productUsecase *usecase.ProductUsecase) *ProductHandler {
	return &ProductHandler{
		productUsecase: productUsecase,
	}
}

// CreateProduct handles POST /api/v1/products
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req dto.CreateProductRequest
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

	// Get outlet_id from query or context
	var outletID *string
	if outletIDStr := c.Query("outlet_id"); outletIDStr != "" {
		outletID = &outletIDStr
	} else if outletIDFromCtx, exists := c.Get("outlet_id"); exists {
		if id, ok := outletIDFromCtx.(string); ok {
			outletID = &id
		}
	}

	productResponse, err := h.productUsecase.CreateProduct(tenantID.(string), outletID, &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	if outletID != nil {
		meta.OutletID = *outletID
	}
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, productResponse, meta)
}

// GetProduct handles GET /api/v1/products/:id
func (h *ProductHandler) GetProduct(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	productResponse, err := h.productUsecase.GetProductByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, productResponse, meta)
}

// GetProductBySKU handles GET /api/v1/products/sku/:sku
func (h *ProductHandler) GetProductBySKU(c *gin.Context) {
	sku := c.Param("sku")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	productResponse, err := h.productUsecase.GetProductBySKU(tenantID.(string), sku)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, productResponse, meta)
}

// GetProductByBarcode handles GET /api/v1/products/barcode/:barcode
func (h *ProductHandler) GetProductByBarcode(c *gin.Context) {
	barcode := c.Param("barcode")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	productResponse, err := h.productUsecase.GetProductByBarcode(tenantID.(string), barcode)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, productResponse, meta)
}

// UpdateProduct handles PUT /api/v1/products/:id
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateProductRequest
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

	productResponse, err := h.productUsecase.UpdateProduct(tenantID.(string), id, &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.UpdatedBy = userID.(string)
	response.Success(c, productResponse, meta)
}

// DeleteProduct handles DELETE /api/v1/products/:id
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	err := h.productUsecase.DeleteProduct(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	response.SuccessNoContent(c)
}

// ListProducts handles GET /api/v1/products
func (h *ProductHandler) ListProducts(c *gin.Context) {
	// Get tenant_id from context (required)
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	// Get pagination params with validation
	page, perPage := response.ParsePaginationParams(c)
	
	// Enforce max limit (per API standards: max 100)
	if perPage > 100 {
		perPage = 100
	}
	// Enforce min limit
	if perPage < 1 {
		perPage = 20 // Default per API standards
	}
	// Enforce min page
	if page < 1 {
		page = 1
	}

	// Get and validate sort options
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")
	
	// Validate sort_by field
	allowedSorts := map[string]bool{
		"name":       true,
		"price":      true,
		"created_at": true,
		"updated_at": true,
	}
	if !allowedSorts[sortBy] {
		// Invalid sort_by, return validation error
		fieldErrors := []response.FieldError{
			{
				Field:     "sort_by",
				Code:      "INVALID_ENUM",
				Message:   "Field sort_by tidak valid. Nilai yang diizinkan: name, price, created_at, updated_at",
				MessageEn: "Field sort_by is invalid. Allowed values: name, price, created_at, updated_at",
				Constraint: map[string]interface{}{
					"allowed_values": []string{"name", "price", "created_at", "updated_at"},
				},
			},
		}
		errors.ValidationError(c, fieldErrors)
		return
	}
	
	// Validate sort_order
	if sortOrder != "asc" && sortOrder != "desc" {
		// Invalid sort_order, return validation error
		fieldErrors := []response.FieldError{
			{
				Field:     "sort_order",
				Code:      "INVALID_ENUM",
				Message:   "Field sort_order tidak valid. Nilai yang diizinkan: asc, desc",
				MessageEn: "Field sort_order is invalid. Allowed values: asc, desc",
				Constraint: map[string]interface{}{
					"allowed_values": []string{"asc", "desc"},
				},
			},
		}
		errors.ValidationError(c, fieldErrors)
		return
	}

	// Get and validate filter parameters
	search := strings.TrimSpace(c.Query("search"))
	status := strings.TrimSpace(c.Query("status"))
	categoryID := strings.TrimSpace(c.Query("category_id"))
	
	// Validate status enum if provided
	if status != "" {
		allowedStatuses := map[string]bool{
			"active":   true,
			"inactive": true,
			"archived": true,
		}
		if !allowedStatuses[status] {
			fieldErrors := []response.FieldError{
				{
					Field:     "status",
					Code:      "INVALID_ENUM",
					Message:   "Field status tidak valid. Nilai yang diizinkan: active, inactive, archived",
					MessageEn: "Field status is invalid. Allowed values: active, inactive, archived",
					Constraint: map[string]interface{}{
						"allowed_values": []string{"active", "inactive", "archived"},
					},
				},
			}
			errors.ValidationError(c, fieldErrors)
			return
		}
	}

	// Parse include_tenant parameter (supports true, 1, false, 0)
	includeTenantLevel := false
	if includeTenantStr := strings.ToLower(strings.TrimSpace(c.Query("include_tenant"))); includeTenantStr != "" {
		includeTenantLevel = includeTenantStr == "true" || includeTenantStr == "1"
	}

	// Get outlet_id from query parameter or context
	var outletID *string
	if outletIDStr := strings.TrimSpace(c.Query("outlet_id")); outletIDStr != "" {
		outletID = &outletIDStr
	} else if outletIDFromCtx, exists := c.Get("outlet_id"); exists {
		if id, ok := outletIDFromCtx.(string); ok && id != "" {
			outletID = &id
		}
	}

	// Prepare category_id pointer (only if provided)
	var categoryIDPtr *string
	if categoryID != "" {
		categoryIDPtr = &categoryID
	}

	// Call usecase to get products
	products, total, err := h.productUsecase.ListProducts(
		tenantID.(string),
		outletID,
		categoryIDPtr,
		page,
		perPage,
		search,
		status,
		sortBy,
		sortOrder,
		includeTenantLevel,
	)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	// Build meta information
	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	if outletID != nil {
		meta.OutletID = *outletID
	}
	meta.Pagination = response.NewPaginationMeta(page, perPage, int(total))
	
	// Add sort meta
	meta.Sort = &response.SortMeta{
		Field: sortBy,
		Order: sortOrder,
	}
	
	// Build filters meta (include all active filters)
	filters := make(map[string]interface{})
	if search != "" {
		filters["search"] = search
	}
	if status != "" {
		filters["status"] = status
	}
	if categoryID != "" {
		filters["category_id"] = categoryID
	}
	if outletID != nil {
		filters["outlet_id"] = *outletID
		if includeTenantLevel {
			filters["include_tenant"] = true
		}
	}
	if len(filters) > 0 {
		meta.Filters = filters
	}

	// Return success response
	response.Success(c, products, meta)
}

