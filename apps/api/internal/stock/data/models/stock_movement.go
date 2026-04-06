package models

import (
	"time"
	productModels "gipos/api/internal/master-data/products/data/models"
	warehouseModels "gipos/api/internal/master-data/warehouse/data/models"
	"gipos/api/internal/core/shared/models"
)

// StockMovementType represents the type of stock movement
const (
	StockMovementTypeIn     = "in"      // Stock masuk (purchase, adjustment, transfer in)
	StockMovementTypeOut    = "out"     // Stock keluar (sale, adjustment, transfer out)
	StockMovementTypeAdjust = "adjust"  // Stock adjustment (opname, correction)
)

// StockMovementReferenceType represents the reference type for stock movement
const (
	StockMovementRefSale        = "sale"         // Reference to sale
	StockMovementRefPurchase     = "purchase"     // Reference to purchase
	StockMovementRefAdjustment  = "adjustment"   // Reference to stock adjustment
	StockMovementRefTransfer     = "transfer"     // Reference to stock transfer
	StockMovementRefOpname       = "opname"       // Reference to stock opname
	StockMovementRefManual       = "manual"       // Manual entry
)

// StockMovement represents a stock movement/transaction
type StockMovement struct {
	models.TenantModel
	ProductID     uint  `gorm:"not null;index:idx_stock_movement_product" json:"product_id"` // Foreign key to products
	WarehouseID  uint  `gorm:"not null;index:idx_stock_movement_warehouse" json:"warehouse_id"` // Foreign key to warehouses
	Type          string  `gorm:"type:varchar(20);not null;index:idx_stock_movement_type" json:"type"` // in, out, adjust
	Quantity      int     `gorm:"type:integer;not null" json:"quantity"` // Positive for in, negative for out
	BalanceBefore int     `gorm:"type:integer;not null" json:"balance_before"` // Stock before movement
	BalanceAfter  int     `gorm:"type:integer;not null" json:"balance_after"` // Stock after movement
	ReferenceType string  `gorm:"type:varchar(50);index:idx_stock_movement_ref" json:"reference_type"` // sale, purchase, adjustment, transfer, opname, manual
	ReferenceID   *uint `gorm:"index:idx_stock_movement_ref" json:"reference_id,omitempty"` // ID of reference (sale_id, etc.)
	Notes         string  `gorm:"type:text" json:"notes,omitempty"` // Additional notes
	MovementDate  time.Time `gorm:"type:timestamp;not null;index:idx_stock_movement_date" json:"movement_date"` // Date of movement
	CreatedBy     *uint `gorm:"index" json:"created_by,omitempty"`
	
	// Relations
	Product       *productModels.Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Warehouse    *warehouseModels.Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
}

// TableName specifies the table name
func (StockMovement) TableName() string {
	return "stock_movements"
}

