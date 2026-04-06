package models

import (
	"gipos/api/internal/core/shared/models"
)

// Role represents a role in the RBAC system
type Role struct {
	models.TenantModel
	Name        string `gorm:"type:varchar(100);not null;index:idx_role_tenant_name" json:"name"` // Composite unique per tenant
	Description string `gorm:"type:text" json:"description,omitempty"`
	IsSystem    bool   `gorm:"default:false;index" json:"is_system"` // System roles cannot be deleted
	IsActive    bool   `gorm:"default:true;index" json:"is_active"`

	// Relations
	Permissions []RolePermission `gorm:"foreignKey:RoleID" json:"permissions,omitempty"`
	Users       []User           `gorm:"many2many:user_roles;" json:"users,omitempty"`
}

// TableName specifies the table name
func (Role) TableName() string {
	return "roles"
}

// RolePermission represents the many-to-many relationship between roles and permissions
type RolePermission struct {
	models.BaseModel
	RoleID       uint `gorm:"not null;index:idx_role_permission" json:"role_id"`
	PermissionID uint `gorm:"not null;index:idx_role_permission" json:"permission_id"`

	// Relations
	Role       Role       `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Permission Permission `gorm:"foreignKey:PermissionID" json:"permission,omitempty"`
}

// TableName specifies the table name
func (RolePermission) TableName() string {
	return "role_permissions"
}

// UserRole represents the many-to-many relationship between users and roles
type UserRole struct {
	models.BaseModel
	UserID uint `gorm:"not null;index:idx_user_role" json:"user_id"`
	RoleID uint `gorm:"not null;index:idx_user_role" json:"role_id"`

	// Relations
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Role Role `gorm:"foreignKey:RoleID" json:"role,omitempty"`
}

// TableName specifies the table name
func (UserRole) TableName() string {
	return "user_roles"
}


