package models

import (
	"errors"
	"gipos/api/internal/core/shared/models"
	"gorm.io/gorm"
)

// Outlet represents a physical outlet/branch
type Outlet struct {
	models.TenantModel
	Code        string `gorm:"type:varchar(50);not null;index:idx_outlet_tenant_code" json:"code"` // Outlet code (unique per tenant)
	Name        string `gorm:"type:varchar(200);not null;index:idx_outlet_tenant_name" json:"name"` // Composite index with tenant
	Address     string `gorm:"type:text" json:"address"`
	City        string `gorm:"type:varchar(100);index" json:"city"`
	Province    string `gorm:"type:varchar(100);index" json:"province"`
	PostalCode  string `gorm:"type:varchar(10)" json:"postal_code"`
	Phone       string `gorm:"type:varchar(20);index" json:"phone"`
	Email       string `gorm:"type:varchar(255);index" json:"email"`
	Status      string `gorm:"type:varchar(20);default:'active';index:idx_outlet_status" json:"status"` // active, inactive
	IsMain      bool   `gorm:"default:false;index:idx_outlet_main" json:"is_main"` // Main outlet flag
	Timezone    string `gorm:"type:varchar(50);default:'Asia/Jakarta'" json:"timezone"` // Timezone for outlet
	LogoURL     string  `gorm:"type:varchar(500)" json:"logo_url,omitempty"` // Logo URL
	Settings    *string `gorm:"type:jsonb" json:"settings,omitempty"` // JSON settings for outlet configuration (nullable)
	CreatedBy   *uint `gorm:"index" json:"created_by,omitempty"` // User who created this outlet
	UpdatedBy   *uint `gorm:"index" json:"updated_by,omitempty"` // User who last updated this outlet
}

// TableName specifies the table name
func (Outlet) TableName() string {
	return "outlets"
}

// BeforeCreate hook to ensure unique code per tenant
func (o *Outlet) BeforeCreate(tx *gorm.DB) error {
	// Ensure code is unique per tenant
	var count int64
	tx.Model(&Outlet{}).
		Where("tenant_id = ? AND code = ?", o.TenantID, o.Code).
		Count(&count)
	if count > 0 {
		return errors.New("outlet code already exists for this tenant")
	}
	return nil
}

