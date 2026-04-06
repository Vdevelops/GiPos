package models

import (
	categoryModels "gipos/api/internal/master-data/category_product/data/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	"gipos/api/internal/core/shared/models"
)

// Product represents a product/item in the system
type Product struct {
	models.TenantModel
	OutletID     *uint `gorm:"index:idx_product_tenant_outlet" json:"outlet_id,omitempty"` // Nullable for tenant-level products
	CategoryID   *uint `gorm:"index:idx_product_category" json:"category_id,omitempty"` // Foreign key to categories
	Name         string  `gorm:"type:varchar(200);not null;index:idx_product_name" json:"name"` // Index for search
	SKU          string  `gorm:"type:varchar(100);not null;index:idx_product_sku" json:"sku"` // Stock Keeping Unit (unique per tenant)
	Barcode      string  `gorm:"type:varchar(100);index:idx_product_barcode" json:"barcode,omitempty"` // Barcode (EAN, UPC, etc.)
	Description  string  `gorm:"type:text" json:"description,omitempty"`
	Price        int64   `gorm:"type:bigint;not null;index:idx_product_price" json:"price"` // Price in sen (Rupiah * 100)
	Cost         int64   `gorm:"type:bigint;index" json:"cost,omitempty"` // Cost in sen (for profit calculation)
	Taxable      bool    `gorm:"default:true;index" json:"taxable"` // Whether product is taxable (PPN)
	TrackStock   bool    `gorm:"default:true;index" json:"track_stock"` // Whether to track stock for this product
	Status       string  `gorm:"type:varchar(20);default:'active';index:idx_product_status" json:"status"` // active, inactive, archived
	CreatedBy    *uint `gorm:"index" json:"created_by,omitempty"`
	UpdatedBy    *uint `gorm:"index" json:"updated_by,omitempty"`
	
	// Relations (not stored in DB, for GORM associations)
	Outlet       *outletModels.Outlet `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Category     *categoryModels.Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Images       []ProductImage `gorm:"foreignKey:ProductID" json:"images,omitempty"`
	Stocks       []ProductStock `gorm:"foreignKey:ProductID" json:"stocks,omitempty"`
}

// TableName specifies the table name
func (Product) TableName() string {
	return "products"
}

