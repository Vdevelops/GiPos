package handlers

import (
	"gipos/api/internal/core/utils/response"

	"github.com/gin-gonic/gin"
)

// HealthCheck handles health check requests
func HealthCheck(c *gin.Context) {
	data := map[string]interface{}{
		"status":  "ok",
		"service": "GiPos API",
		"version":   "1.0.0",
	}

	meta := response.GetMetaFromContext(c)
	response.Success(c, data, meta)
}

