package models

import (
	"gipos/api/internal/core/shared/models"
)

// Permission represents a permission in the RBAC system
type Permission struct {
	models.BaseModel
	Code        string `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"` // Unique permission code (e.g., "products.create")
	Name        string `gorm:"type:varchar(200);not null" json:"name"`             // Human-readable name
	Description string `gorm:"type:text" json:"description,omitempty"`
	Module      string `gorm:"type:varchar(50);index" json:"module"` // Module name (e.g., "products", "sales", "reports")
	Action      string `gorm:"type:varchar(50);index" json:"action"` // Action (e.g., "create", "read", "update", "delete", "approve")

	// Relations
	Roles []Role `gorm:"many2many:role_permissions;" json:"roles,omitempty"`
}

// TableName specifies the table name
func (Permission) TableName() string {
	return "permissions"
}

// Predefined permission codes
const (
	// POS Core permissions
	PermissionSalesCreate    = "sales.create"
	PermissionSalesRead      = "sales.read"
	PermissionSalesUpdate    = "sales.update"
	PermissionSalesDelete    = "sales.delete"
	PermissionSalesRefund    = "sales.refund"
	PermissionSalesVoid      = "sales.void"

	// Product permissions
	PermissionProductsCreate = "products.create"
	PermissionProductsRead   = "products.read"
	PermissionProductsUpdate = "products.update"
	PermissionProductsDelete = "products.delete"
	PermissionProductsImport = "products.import"
	PermissionProductsExport = "products.export"

	// Customer permissions
	PermissionCustomersCreate = "customers.create"
	PermissionCustomersRead   = "customers.read"
	PermissionCustomersUpdate = "customers.update"
	PermissionCustomersDelete = "customers.delete"

	// Reports permissions
	PermissionReportsRead   = "reports.read"
	PermissionReportsExport = "reports.export"

	// Finance permissions
	PermissionFinanceRead      = "finance.read"
	PermissionFinanceReconcile = "finance.reconcile"
	PermissionFinanceExport    = "finance.export"

	// Employee permissions
	PermissionEmployeesCreate = "employees.create"
	PermissionEmployeesRead    = "employees.read"
	PermissionEmployeesUpdate = "employees.update"
	PermissionEmployeesDelete = "employees.delete"

	// Settings permissions
	PermissionSettingsManageOutlet      = "settings.manage_outlet"
	PermissionSettingsManageSubscription = "settings.manage_subscription"
	PermissionSettingsManageSystem     = "settings.manage_system"
)


