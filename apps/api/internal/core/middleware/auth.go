package middleware

import (
	"fmt"
	"strings"

	"gipos/api/internal/auth/data/repositories"
	"gipos/api/internal/auth/domain/usecase"
	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/utils/errors"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT token and sets user context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			errors.Error(c, "TOKEN_MISSING", nil, nil)
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			errors.Error(c, "TOKEN_INVALID", nil, nil)
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Verify token
		cfg := config.Get()
		db := database.GetDB()
		userRepo := repositories.NewUserRepository(db)
		authUsecase := usecase.NewAuthUsecase(userRepo, cfg)

		claims, err := authUsecase.VerifyToken(tokenString)
		if err != nil {
			errorCode := err.Error()
			errors.Error(c, errorCode, nil, nil)
			c.Abort()
			return
		}

		// Set user context
		// Handle user_id - can be string (old tokens) or float64 (new tokens with uint)
		if userIDStr, ok := claims["user_id"].(string); ok {
			c.Set("user_id", userIDStr)
		} else if userIDFloat, ok := claims["user_id"].(float64); ok {
			c.Set("user_id", fmt.Sprintf("%.0f", userIDFloat))
		}

		// Handle tenant_id - can be string (old tokens) or float64 (new tokens with uint)
		if tenantIDStr, ok := claims["tenant_id"].(string); ok {
			c.Set("tenant_id", tenantIDStr)
		} else if tenantIDFloat, ok := claims["tenant_id"].(float64); ok {
			c.Set("tenant_id", fmt.Sprintf("%.0f", tenantIDFloat))
		}

		// Handle outlet_id - can be string, float64, or nil
		if outletIDStr, ok := claims["outlet_id"].(string); ok {
			c.Set("outlet_id", outletIDStr)
		} else if outletIDFloat, ok := claims["outlet_id"].(float64); ok {
			c.Set("outlet_id", fmt.Sprintf("%.0f", outletIDFloat))
		}
		// If outlet_id is nil or not present, don't set it

		if email, ok := claims["email"].(string); ok {
			c.Set("email", email)
		}
		if role, ok := claims["role"].(string); ok {
			c.Set("role", role)
		}

		c.Next()
	}
}
