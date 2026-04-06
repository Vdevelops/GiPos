package models

import (
	"errors"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	"gipos/api/internal/core/shared/models"
	"gorm.io/gorm"
)

// Warehouse represents a warehouse/storage location
type Warehouse struct {
	models.TenantModel
	OutletID    *uint `gorm:"index:idx_warehouse_tenant_outlet" json:"outlet_id,omitempty"` // Nullable for tenant-level warehouses
	Code        string  `gorm:"type:varchar(50);not null;index:idx_warehouse_tenant_code" json:"code"` // Warehouse code (unique per tenant)
	Name        string  `gorm:"type:varchar(200);not null;index:idx_warehouse_name" json:"name"`
	Address     string  `gorm:"type:text" json:"address,omitempty"`
	Type        string  `gorm:"type:varchar(50);default:'main';index" json:"type"` // main, secondary, virtual
	Status      string  `gorm:"type:varchar(20);default:'active';index:idx_warehouse_status" json:"status"` // active, inactive
	IsDefault   bool    `gorm:"default:false;index:idx_warehouse_default" json:"is_default"` // Default warehouse for outlet
	CreatedBy   *uint `gorm:"index" json:"created_by,omitempty"`
	UpdatedBy   *uint `gorm:"index" json:"updated_by,omitempty"`
	
	// Relations
	Outlet       *outletModels.Outlet `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
}

// TableName specifies the table name
func (Warehouse) TableName() string {
	return "warehouses"
}

// BeforeCreate hook to ensure unique code per tenant
func (w *Warehouse) BeforeCreate(tx *gorm.DB) error {
	// Ensure code is unique per tenant
	var count int64
	tx.Model(&Warehouse{}).
		Where("tenant_id = ? AND code = ?", w.TenantID, w.Code).
		Count(&count)
	if count > 0 {
		return errors.New("warehouse code already exists for this tenant")
	}
	return nil
}

