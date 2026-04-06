package handler

import (
	"gipos/api/internal/auth/domain/usecase"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"

	"github.com/gin-gonic/gin"
)

// UserHandler handles HTTP requests for users
type UserHandler struct {
	userUsecase *usecase.UserUsecase
}

// NewUserHandler creates a new user handler
func NewUserHandler(userUsecase *usecase.UserUsecase) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
	}
}

// GetUser handles GET /api/v1/users/:id
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	userResponse, err := h.userUsecase.GetUserByID(id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	response.Success(c, userResponse, meta)
}

// ListUsers handles GET /api/v1/users
func (h *UserHandler) ListUsers(c *gin.Context) {
	// Get pagination params
	page, perPage := response.ParsePaginationParams(c)

	// Get tenant_id from context
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	// Get outlet_id from query (optional)
	var outletID *string
	if outletIDStr := c.Query("outlet_id"); outletIDStr != "" {
		outletID = &outletIDStr
	}

	users, total, err := h.userUsecase.ListUsers(tenantID.(string), outletID, page, perPage)
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

	response.Success(c, users, meta)
}

