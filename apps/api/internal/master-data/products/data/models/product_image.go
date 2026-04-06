package models

import (
	"gipos/api/internal/core/shared/models"
)

// ProductImage represents an image associated with a product
type ProductImage struct {
	models.TenantModel
	ProductID    uint   `gorm:"not null;index:idx_product_image_product" json:"product_id"` // Foreign key to products
	URL          string `gorm:"type:varchar(500);not null" json:"url"`                      // Full image URL
	ThumbnailURL string `gorm:"type:varchar(500)" json:"thumbnail_url,omitempty"`           // Thumbnail URL
	Order        int    `gorm:"default:0;index:idx_product_image_order" json:"order"`       // Display order
	Alt          string `gorm:"type:varchar(200)" json:"alt,omitempty"`                     // Alt text for accessibility
	Size         int64  `gorm:"type:bigint" json:"size,omitempty"`                          // File size in bytes
	Width        int    `json:"width,omitempty"`                                            // Image width in pixels
	Height       int    `json:"height,omitempty"`                                           // Image height in pixels
	MimeType     string `gorm:"type:varchar(50)" json:"mime_type,omitempty"`                // image/jpeg, image/png, etc.
	CreatedBy    *uint  `gorm:"index" json:"created_by,omitempty"`

	// Relations
	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// TableName specifies the table name
func (ProductImage) TableName() string {
	return "product_images"
}
