package models

import (
	"time"

	"gorm.io/gorm"
)

// BaseModel contains common fields for all models
type BaseModel struct {
	ID        uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	DeletedAt gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`
}

// TenantModel contains tenant_id for multi-tenant support
type TenantModel struct {
	BaseModel
	TenantID uint `gorm:"not null;index" json:"tenant_id"`
}


