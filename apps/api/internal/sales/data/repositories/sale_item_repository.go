package repositories

import (
	"gipos/api/internal/sales/data/models"

	"gorm.io/gorm"
)

// SaleItemRepository handles sale item data access
type SaleItemRepository struct {
	db *gorm.DB
}

// NewSaleItemRepository creates a new sale item repository
func NewSaleItemRepository(db *gorm.DB) *SaleItemRepository {
	return &SaleItemRepository{db: db}
}

// Create creates a new sale item
func (r *SaleItemRepository) Create(saleItem *models.SaleItem) error {
	return r.db.Create(saleItem).Error
}

// CreateBatch creates multiple sale items
func (r *SaleItemRepository) CreateBatch(saleItems []models.SaleItem) error {
	if len(saleItems) == 0 {
		return nil
	}
	return r.db.Create(&saleItems).Error
}

// GetByID retrieves a sale item by ID
func (r *SaleItemRepository) GetByID(tenantID, id uint) (*models.SaleItem, error) {
	var saleItem models.SaleItem
	err := r.db.Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", id, tenantID).
		Preload("Sale").
		Preload("Product").
		First(&saleItem).Error
	if err != nil {
		return nil, err
	}
	return &saleItem, nil
}

// GetBySaleID retrieves all sale items for a sale
func (r *SaleItemRepository) GetBySaleID(tenantID, saleID uint) ([]models.SaleItem, error) {
	var saleItems []models.SaleItem
	err := r.db.Where("sale_id = ? AND tenant_id = ? AND deleted_at IS NULL", saleID, tenantID).
		Preload("Product").
		Find(&saleItems).Error
	if err != nil {
		return nil, err
	}
	return saleItems, nil
}

// Update updates a sale item
func (r *SaleItemRepository) Update(saleItem *models.SaleItem) error {
	return r.db.Omit("Sale", "Product").Save(saleItem).Error
}

// Delete soft deletes a sale item
func (r *SaleItemRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.SaleItem{}, "id = ?", id).Error
}

// DeleteBySaleID soft deletes all sale items for a sale
func (r *SaleItemRepository) DeleteBySaleID(tenantID, saleID uint) error {
	return r.db.Where("tenant_id = ? AND sale_id = ?", tenantID, saleID).Delete(&models.SaleItem{}).Error
}
