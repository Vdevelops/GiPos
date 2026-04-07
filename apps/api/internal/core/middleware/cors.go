package middleware

import (
	"gipos/api/internal/core/infrastructure/config"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

func isOriginAllowed(origin string, allowedOrigins []string) bool {
	for _, allowedOrigin := range allowedOrigins {
		trimmed := strings.TrimSpace(allowedOrigin)
		if trimmed == "" {
			continue
		}

		if trimmed == "*" || origin == trimmed {
			return true
		}

		if strings.Contains(trimmed, "*") {
			pattern := "^" + regexp.QuoteMeta(trimmed) + "$"
			pattern = strings.ReplaceAll(pattern, "\\*", ".*")
			if matched, err := regexp.MatchString(pattern, origin); err == nil && matched {
				return true
			}
		}
	}

	return false
}

// CORSMiddleware handles CORS headers
func CORSMiddleware() gin.HandlerFunc {
	cfg := config.Get()

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowed := isOriginAllowed(origin, cfg.CORS.AllowedOrigins)

		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Vary", "Origin")
		}

		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", strings.Join(cfg.CORS.AllowedMethods, ", "))
		c.Header("Access-Control-Allow-Headers", strings.Join(cfg.CORS.AllowedHeaders, ", "))

		if c.GetHeader("Access-Control-Request-Private-Network") == "true" {
			c.Header("Access-Control-Allow-Private-Network", "true")
		}

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			if origin != "" && !allowed {
				c.AbortWithStatus(403)
				return
			}
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
