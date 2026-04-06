package models

import (
	productModels "gipos/api/internal/master-data/products/data/models"
	"gipos/api/internal/core/shared/models"
)

// SaleItem represents an item in a sale transaction
type SaleItem struct {
	models.TenantModel
	SaleID        uint  `gorm:"not null;index:idx_sale_item_sale" json:"sale_id"` // Foreign key to sales
	ProductID     uint  `gorm:"not null;index:idx_sale_item_product" json:"product_id"` // Foreign key to products
	ProductName   string  `gorm:"type:varchar(200);not null" json:"product_name"` // Snapshot of product name at time of sale
	ProductSKU    string  `gorm:"type:varchar(100)" json:"product_sku"` // Snapshot of SKU
	Quantity      int     `gorm:"type:integer;not null" json:"quantity"` // Quantity sold
	UnitPrice     int64   `gorm:"type:bigint;not null" json:"unit_price"` // Price per unit at time of sale (in sen)
	DiscountAmount int64  `gorm:"type:bigint;default:0" json:"discount_amount"` // Discount amount for this item (in sen)
	DiscountPercent float64 `gorm:"type:decimal(5,2);default:0" json:"discount_percent"` // Discount percentage for this item
	TaxAmount     int64   `gorm:"type:bigint;default:0" json:"tax_amount"` // Tax amount for this item (in sen)
	Subtotal      int64   `gorm:"type:bigint;not null" json:"subtotal"` // Subtotal before discount and tax (quantity * unit_price)
	Total         int64   `gorm:"type:bigint;not null" json:"total"` // Final total for this item (subtotal - discount + tax)
	
	// Relations
	Sale          *Sale                    `gorm:"foreignKey:SaleID" json:"sale,omitempty"`
	Product       *productModels.Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// TableName specifies the table name
func (SaleItem) TableName() string {
	return "sale_items"
}

