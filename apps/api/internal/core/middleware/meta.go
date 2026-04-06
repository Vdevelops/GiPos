package middleware

import (
	"github.com/gin-gonic/gin"
)

// MetaMiddleware extracts tenant/outlet/user info and adds to context
// This will be enhanced later with JWT token parsing
func MetaMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract from JWT token or headers (will be implemented later)
		// For now, we'll extract from headers if available
		
		// Tenant ID from header (for development/testing)
		if tenantID := c.GetHeader("X-Tenant-ID"); tenantID != "" {
			c.Set("tenant_id", tenantID)
		}

		// Outlet ID from header (for development/testing)
		if outletID := c.GetHeader("X-Outlet-ID"); outletID != "" {
			c.Set("outlet_id", outletID)
		}

		// User ID will be extracted from JWT token later
		// For now, from header (for development/testing)
		if userID := c.GetHeader("X-User-ID"); userID != "" {
			c.Set("user_id", userID)
		}

		c.Next()
	}
}


