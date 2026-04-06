package middleware

import (
	"github.com/gin-gonic/gin"
	"gipos/api/internal/core/utils/response"
)

// LocaleMiddleware extracts locale from request and sets it in context
func LocaleMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		locale := response.GetLocale(c)
		c.Set("locale", locale)
		c.Next()
	}
}

