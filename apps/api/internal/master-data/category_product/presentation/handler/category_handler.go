package handler

import (
	"gipos/api/internal/master-data/category_product/domain/dto"
	"gipos/api/internal/master-data/category_product/domain/usecase"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"

	"github.com/gin-gonic/gin"
)

// CategoryHandler handles HTTP requests for categories
type CategoryHandler struct {
	categoryUsecase *usecase.CategoryUsecase
}

// NewCategoryHandler creates a new category handler
func NewCategoryHandler(categoryUsecase *usecase.CategoryUsecase) *CategoryHandler {
	return &CategoryHandler{
		categoryUsecase: categoryUsecase,
	}
}

// CreateCategory handles POST /api/v1/categories
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
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

	categoryResponse, err := h.categoryUsecase.CreateCategory(tenantID.(string), outletID, &req, userID.(string))
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
	response.SuccessCreated(c, categoryResponse, meta)
}

// GetCategory handles GET /api/v1/categories/:id
func (h *CategoryHandler) GetCategory(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	categoryResponse, err := h.categoryUsecase.GetCategoryByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, categoryResponse, meta)
}

// UpdateCategory handles PUT /api/v1/categories/:id
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateCategoryRequest
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

	categoryResponse, err := h.categoryUsecase.UpdateCategory(tenantID.(string), id, &req, userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.UpdatedBy = userID.(string)
	response.Success(c, categoryResponse, meta)
}

// DeleteCategory handles DELETE /api/v1/categories/:id
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	err := h.categoryUsecase.DeleteCategory(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	response.SuccessNoContent(c)
}

// ListCategories handles GET /api/v1/categories
func (h *CategoryHandler) ListCategories(c *gin.Context) {
	// Get pagination params
	page, perPage := response.ParsePaginationParams(c)

	// Get filters
	search := c.Query("search")
	status := c.Query("status")
	parentID := c.Query("parent_id")

	var outletID *string
	if outletIDStr := c.Query("outlet_id"); outletIDStr != "" {
		outletID = &outletIDStr
	} else if outletIDFromCtx, exists := c.Get("outlet_id"); exists {
		if id, ok := outletIDFromCtx.(string); ok {
			outletID = &id
		}
	}

	var parentIDPtr *string
	if parentID != "" {
		parentIDPtr = &parentID
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	categories, total, err := h.categoryUsecase.ListCategories(tenantID.(string), outletID, parentIDPtr, page, perPage, search, status)
	if err != nil {
		errors.Error(c, "INTERNAL_SERVER_ERROR", nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	if outletID != nil {
		meta.OutletID = *outletID
	}
	meta.Pagination = response.NewPaginationMeta(page, perPage, int(total))
	
	filters := make(map[string]interface{})
	if search != "" {
		filters["search"] = search
	}
	if status != "" {
		filters["status"] = status
	}
	if parentID != "" {
		filters["parent_id"] = parentID
	}
	if len(filters) > 0 {
		meta.Filters = filters
	}

	response.Success(c, categories, meta)
}

