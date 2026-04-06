package middleware

import (
	"gipos/api/internal/core/utils/errors"

	"github.com/gin-gonic/gin"
)

// PermissionMiddleware checks if user has required permission
// Usage: router.Use(middleware.AuthMiddleware(), middleware.PermissionMiddleware("products.create"))
func PermissionMiddleware(requiredPermission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user role from context (set by AuthMiddleware)
		role, exists := c.Get("role")
		if !exists {
			errors.Error(c, "UNAUTHORIZED", nil, nil)
			c.Abort()
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			errors.Error(c, "UNAUTHORIZED", nil, nil)
			c.Abort()
			return
		}

		// System admin and tenant owner have all permissions
		if roleStr == "system_admin" || roleStr == "tenant_owner" {
			c.Next()
			return
		}

		// TODO: Check permission from database (roles and permissions tables)
		// For now, we'll use a simple role-based check
		// This will be enhanced when role-permission mapping is fully implemented

		// Basic permission mapping based on role
		hasPermission := checkPermissionByRole(roleStr, requiredPermission)
		if !hasPermission {
			errors.Error(c, "FORBIDDEN", map[string]interface{}{
				"required_permission": requiredPermission,
				"user_role":           roleStr,
			}, nil)
			c.Abort()
			return
		}

		c.Next()
	}
}

// checkPermissionByRole checks if role has permission (temporary implementation)
// This will be replaced with database lookup once role-permission mapping is complete
func checkPermissionByRole(role, permission string) bool {
	// Permission matrix based on role
	permissionMap := map[string][]string{
		"manager": {
			"products.create", "products.read", "products.update", "products.delete",
			"sales.create", "sales.read", "sales.update", "sales.refund",
			"customers.create", "customers.read", "customers.update", "customers.delete",
			"reports.read", "reports.export",
			"employees.create", "employees.read", "employees.update",
		},
		"cashier": {
			"products.read",
			"sales.create", "sales.read", "sales.refund",
			"customers.create", "customers.read", "customers.update",
		},
		"accountant": {
			"sales.read",
			"reports.read", "reports.export",
			"finance.read", "finance.export",
		},
		"supervisor": {
			"products.read", "products.update",
			"sales.create", "sales.read", "sales.update", "sales.refund",
			"customers.read", "customers.update",
			"reports.read",
		},
	}

	permissions, exists := permissionMap[role]
	if !exists {
		return false
	}

	for _, perm := range permissions {
		if perm == permission {
			return true
		}
	}

	return false
}

// RequirePermission is a helper to require specific permission
// Usage: router.GET("/products", middleware.AuthMiddleware(), middleware.RequirePermission("products.read"), handler)
func RequirePermission(permission string) gin.HandlerFunc {
	return PermissionMiddleware(permission)
}

// RequireAnyPermission checks if user has any of the required permissions
func RequireAnyPermission(permissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			errors.Error(c, "UNAUTHORIZED", nil, nil)
			c.Abort()
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			errors.Error(c, "UNAUTHORIZED", nil, nil)
			c.Abort()
			return
		}

		// System admin and tenant owner have all permissions
		if roleStr == "system_admin" || roleStr == "tenant_owner" {
			c.Next()
			return
		}

		// Check if user has any of the required permissions
		for _, perm := range permissions {
			if checkPermissionByRole(roleStr, perm) {
				c.Next()
				return
			}
		}

		errors.Error(c, "FORBIDDEN", map[string]interface{}{
			"required_permissions": permissions,
			"user_role":            roleStr,
		}, nil)
		c.Abort()
	}
}

// RequireRole checks if user has required role
func RequireRole(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			errors.Error(c, "UNAUTHORIZED", nil, nil)
			c.Abort()
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			errors.Error(c, "UNAUTHORIZED", nil, nil)
			c.Abort()
			return
		}

		for _, requiredRole := range requiredRoles {
			if roleStr == requiredRole {
				c.Next()
				return
			}
		}

		errors.Error(c, "FORBIDDEN", map[string]interface{}{
			"required_roles": requiredRoles,
			"user_role":      roleStr,
		}, nil)
		c.Abort()
	}
}


