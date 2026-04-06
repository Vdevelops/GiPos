package repositories

import (
	"gipos/api/internal/master-data/products/data/models"
	"gorm.io/gorm"
)

// ProductImageRepository handles product image data access
type ProductImageRepository struct {
	db *gorm.DB
}

// NewProductImageRepository creates a new product image repository
func NewProductImageRepository(db *gorm.DB) *ProductImageRepository {
	return &ProductImageRepository{db: db}
}

// Create creates a new product image
func (r *ProductImageRepository) Create(image *models.ProductImage) error {
	return r.db.Create(image).Error
}

// GetByID retrieves a product image by ID
func (r *ProductImageRepository) GetByID(tenantID, id uint) (*models.ProductImage, error) {
	var image models.ProductImage
	err := r.db.Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", id, tenantID).
		Preload("Product").
		First(&image).Error
	if err != nil {
		return nil, err
	}
	return &image, nil
}

// GetByProductID retrieves all images for a product
func (r *ProductImageRepository) GetByProductID(tenantID, productID uint) ([]models.ProductImage, error) {
	var images []models.ProductImage
	err := r.db.Where("product_id = ? AND tenant_id = ? AND deleted_at IS NULL", productID, tenantID).
		Order("`order` ASC, created_at ASC").
		Find(&images).Error
	if err != nil {
		return nil, err
	}
	return images, nil
}

// Update updates a product image
func (r *ProductImageRepository) Update(image *models.ProductImage) error {
	return r.db.Omit("Product").Save(image).Error
}

// Delete soft deletes a product image
func (r *ProductImageRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.ProductImage{}, "id = ?", id).Error
}

// DeleteByProductID deletes all images for a product
func (r *ProductImageRepository) DeleteByProductID(tenantID, productID uint) error {
	return r.db.Where("tenant_id = ? AND product_id = ?", tenantID, productID).
		Delete(&models.ProductImage{}).Error
}

// BulkCreate creates multiple product images
func (r *ProductImageRepository) BulkCreate(images []models.ProductImage) error {
	if len(images) == 0 {
		return nil
	}
	return r.db.Create(&images).Error
}

