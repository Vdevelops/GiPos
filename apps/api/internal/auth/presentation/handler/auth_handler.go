package handler

import (
	"gipos/api/internal/auth/domain/dto"
	"gipos/api/internal/auth/domain/usecase"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"

	"github.com/gin-gonic/gin"
)

// AuthHandler handles HTTP requests for authentication
type AuthHandler struct {
	authUsecase *usecase.AuthUsecase
	userUsecase *usecase.UserUsecase
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authUsecase *usecase.AuthUsecase, userUsecase *usecase.UserUsecase) *AuthHandler {
	return &AuthHandler{
		authUsecase: authUsecase,
		userUsecase: userUsecase,
	}
}

// Login handles POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	// Get tenant_id from context (optional for login - can be determined from user)
	// For login, we can search by email only, tenant_id will be extracted from user
	tenantID := ""
	if tid, exists := c.Get("tenant_id"); exists {
		tenantID = tid.(string)
	}

	loginResponse, err := h.authUsecase.Login(tenantID, &req)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = loginResponse.User.TenantID
	if loginResponse.User.OutletID != nil {
		meta.OutletID = *loginResponse.User.OutletID
	}
	
	response.Success(c, loginResponse, meta)
}

// Register handles POST /api/v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	// Get tenant_id from context (optional - can be from request body or context)
	tenantID := ""
	if tid, exists := c.Get("tenant_id"); exists {
		tenantID = tid.(string)
	}
	
	// If tenant_id is not in context, we need to determine it
	// For MVP, we can create a default tenant or require it in request
	// For now, we'll require it in context or return error
	if tenantID == "" {
		errors.Error(c, "VALIDATION_ERROR", map[string]interface{}{
			"reason": "Tenant ID is required for registration",
		}, []response.FieldError{
			{
				Field:     "tenant_id",
				Code:      "REQUIRED",
				Message:   "Tenant ID wajib diisi",
				MessageEn: "Tenant ID is required",
			},
		})
		return
	}

	userResponse, err := h.authUsecase.Register(tenantID, &req)
	if err != nil {
		errorCode := err.Error()
		if errorCode == "RESOURCE_ALREADY_EXISTS" {
			errors.Conflict(c, map[string]interface{}{
				"field":  "email",
				"reason": "Email already registered",
			})
		} else {
			errors.Error(c, errorCode, nil, nil)
		}
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID
	meta.CreatedBy = userResponse.ID

	response.SuccessCreated(c, userResponse, meta)
}

// RefreshToken handles POST /api/v1/auth/refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	tokenResponse, err := h.authUsecase.RefreshToken(req.RefreshToken)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	response.Success(c, tokenResponse, nil)
}

// Me handles GET /api/v1/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	// Get user_id from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		errors.Unauthorized(c, "User ID not found in token")
		return
	}

	// Get user details
	userResponse, err := h.userUsecase.GetUserByID(userID.(string))
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	response.Success(c, userResponse, meta)
}
