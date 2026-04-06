package models

import (
	"gipos/api/internal/core/shared/models"
	warehouseModels "gipos/api/internal/master-data/warehouse/data/models"
	"time"
)

// ProductStock represents stock quantity for a product in a specific warehouse
type ProductStock struct {
	models.TenantModel
	ProductID   uint       `gorm:"not null;index:idx_product_stock_product" json:"product_id"`     // Foreign key to products
	WarehouseID uint       `gorm:"not null;index:idx_product_stock_warehouse" json:"warehouse_id"` // Foreign key to warehouses
	Quantity    int        `gorm:"type:integer;not null;default:0;index" json:"quantity"`          // Current stock quantity
	Reserved    int        `gorm:"type:integer;default:0" json:"reserved"`                         // Reserved quantity (for pending sales)
	MinStock    int        `gorm:"type:integer;default:0" json:"min_stock"`                        // Minimum stock level (for alerts)
	MaxStock    int        `gorm:"type:integer;default:0" json:"max_stock"`                        // Maximum stock level
	LastUpdated *time.Time `gorm:"index" json:"last_updated,omitempty"`                            // Last time stock was updated

	// Relations
	Product   *Product                   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Warehouse *warehouseModels.Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
}

// TableName specifies the table name
func (ProductStock) TableName() string {
	return "product_stocks"
}

// Unique constraint: one stock record per product per warehouse per tenant
// This is enforced by composite unique index in migration
