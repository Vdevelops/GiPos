package middleware

import (
	"log"
	"runtime/debug"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"

	"github.com/gin-gonic/gin"
)

// RecoveryMiddleware recovers from panics and returns error response
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Generate error ID for tracking
				errorID := response.GenerateRequestID()
				requestID := response.GetRequestID(c)
				
				// Log panic details
				log.Printf("")
				log.Printf("========================================")
				log.Printf("❌ PANIC RECOVERED")
				log.Printf("========================================")
				log.Printf("Request ID: %s", requestID)
				log.Printf("Error ID: %s", errorID)
				log.Printf("Method: %s", c.Request.Method)
				log.Printf("Path: %s", c.Request.URL.Path)
				log.Printf("Error: %v", err)
				log.Printf("Stack Trace:")
				log.Printf("%s", debug.Stack())
				log.Printf("========================================")
				log.Printf("")
				
				// Return internal server error
				errors.InternalServerError(c, errorID)
				c.Abort()
			}
		}()
		c.Next()
	}
}

