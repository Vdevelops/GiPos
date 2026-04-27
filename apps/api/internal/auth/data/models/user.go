package models

import (
	"time"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	"gipos/api/internal/core/shared/models"
	sharedModels "gipos/api/internal/core/shared/models"
)

// User represents a user/employee in the system
type User struct {
	models.TenantModel
	OutletID    *uint `gorm:"index:idx_user_tenant_outlet" json:"outlet_id,omitempty"` // Nullable for tenant-level users, composite index
	Email       string  `gorm:"type:varchar(255);not null;index:idx_user_tenant_email" json:"email"` // Composite unique per tenant
	Password    string  `gorm:"type:varchar(255);not null" json:"-"` // Never return password
	Name        string  `gorm:"type:varchar(200);not null;index" json:"name"` // Index for search
	Phone       string  `gorm:"type:varchar(20);index" json:"phone"` // Index for search
	Role        string  `gorm:"type:varchar(50);default:'cashier';index" json:"role"` // system_admin, tenant_owner, manager, cashier, accountant, supervisor
	Status      string  `gorm:"type:varchar(20);default:'active';index" json:"status"` // active, inactive, suspended
	AvatarURL   string  `gorm:"type:varchar(500)" json:"avatar_url,omitempty"` // Avatar/profile picture URL
	LastLoginAt *time.Time `gorm:"index" json:"last_login_at,omitempty"` // Index for filtering
	CreatedBy   *uint `gorm:"index" json:"created_by,omitempty"` // User who created this user
	UpdatedBy   *uint `gorm:"index" json:"updated_by,omitempty"` // User who last updated this user
	// Relations
	Outlet      *outletModels.Outlet `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Tenant      *sharedModels.Tenant `gorm:"foreignKey:TenantID" json:"tenant,omitempty"`
}

// TableName specifies the table name
func (User) TableName() string {
	return "users"
}


