package models

import "time"

// Tenant represents a tenant (organization/business) in the multi-tenant system
type Tenant struct {
	BaseModel
	Code        string `gorm:"type:varchar(50);uniqueIndex" json:"code,omitempty"` // Tenant code for reference
	Name        string `gorm:"type:varchar(200);not null" json:"name"`
	Email       string `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Phone       string `gorm:"type:varchar(20)" json:"phone"`
	Address     string `gorm:"type:text" json:"address,omitempty"` // Tenant address
	Status      string `gorm:"type:varchar(20);default:'active';index" json:"status"` // active, suspended, cancelled
	Plan        string `gorm:"type:varchar(50);default:'free';index" json:"plan"` // free, basic, pro, business, enterprise
	LogoURL     string `gorm:"type:varchar(500)" json:"logo_url,omitempty"` // Logo URL
	Settings    string `gorm:"type:jsonb" json:"settings,omitempty"` // JSON settings for tenant configuration
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
}

// TableName specifies the table name
func (Tenant) TableName() string {
	return "tenants"
}


