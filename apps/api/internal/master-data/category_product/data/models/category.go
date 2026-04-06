package models

import (
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	"gipos/api/internal/core/shared/models"
)

// Category represents a product category
type Category struct {
	models.TenantModel
	OutletID    *uint `gorm:"index:idx_category_tenant_outlet" json:"outlet_id,omitempty"` // Nullable for tenant-level categories
	Name        string  `gorm:"type:varchar(200);not null;index:idx_category_tenant_name" json:"name"` // Composite index with tenant
	Slug        string  `gorm:"type:varchar(255);index:idx_category_slug" json:"slug"` // URL-friendly slug
	Description string  `gorm:"type:text" json:"description,omitempty"`
	ParentID    *uint `gorm:"index:idx_category_parent" json:"parent_id,omitempty"` // For nested categories
	ImageURL    string  `gorm:"type:varchar(500)" json:"image_url,omitempty"` // Category image
	SortOrder   int     `gorm:"default:0;index:idx_category_sort" json:"sort_order"` // For ordering
	Status      string  `gorm:"type:varchar(20);default:'active';index:idx_category_status" json:"status"` // active, inactive
	CreatedBy   *uint `gorm:"index" json:"created_by,omitempty"`
	UpdatedBy   *uint `gorm:"index" json:"updated_by,omitempty"`

	// Relations
	Outlet      *outletModels.Outlet `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Parent      *Category            `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children    []Category           `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

// TableName specifies the table name
func (Category) TableName() string {
	return "categories"
}

