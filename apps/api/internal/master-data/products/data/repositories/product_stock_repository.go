package repositories

import (
	"gipos/api/internal/master-data/products/data/models"
	"gorm.io/gorm"
)

// ProductStockRepository handles product stock data access
type ProductStockRepository struct {
	db *gorm.DB
}

// NewProductStockRepository creates a new product stock repository
func NewProductStockRepository(db *gorm.DB) *ProductStockRepository {
	return &ProductStockRepository{db: db}
}

// Create creates a new product stock
func (r *ProductStockRepository) Create(stock *models.ProductStock) error {
	return r.db.Create(stock).Error
}

// GetByID retrieves a product stock by ID
func (r *ProductStockRepository) GetByID(tenantID, id uint) (*models.ProductStock, error) {
	var stock models.ProductStock
	err := r.db.Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", id, tenantID).
		Preload("Product").
		Preload("Warehouse").
		First(&stock).Error
	if err != nil {
		return nil, err
	}
	return &stock, nil
}

// GetByProductID retrieves all stocks for a product
func (r *ProductStockRepository) GetByProductID(tenantID, productID uint) ([]models.ProductStock, error) {
	var stocks []models.ProductStock
	err := r.db.Where("product_id = ? AND tenant_id = ? AND deleted_at IS NULL", productID, tenantID).
		Preload("Warehouse").
		Order("warehouse_id ASC").
		Find(&stocks).Error
	if err != nil {
		return nil, err
	}
	return stocks, nil
}

// GetByProductAndWarehouse retrieves stock for a specific product and warehouse
func (r *ProductStockRepository) GetByProductAndWarehouse(tenantID, productID, warehouseID uint) (*models.ProductStock, error) {
	var stock models.ProductStock
	err := r.db.Where("product_id = ? AND warehouse_id = ? AND tenant_id = ? AND deleted_at IS NULL",
		productID, warehouseID, tenantID).
		Preload("Product").
		Preload("Warehouse").
		First(&stock).Error
	if err != nil {
		return nil, err
	}
	return &stock, nil
}

// Update updates a product stock
func (r *ProductStockRepository) Update(stock *models.ProductStock) error {
	return r.db.Omit("Product", "Warehouse").Save(stock).Error
}

// Delete soft deletes a product stock
func (r *ProductStockRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.ProductStock{}, "id = ?", id).Error
}

// DeleteByProductID deletes all stocks for a product
func (r *ProductStockRepository) DeleteByProductID(tenantID, productID uint) error {
	return r.db.Where("tenant_id = ? AND product_id = ?", tenantID, productID).
		Delete(&models.ProductStock{}).Error
}

// GetTotalStock calculates total stock quantity for a product across all warehouses
func (r *ProductStockRepository) GetTotalStock(tenantID, productID uint) (int, error) {
	var total int
	err := r.db.Model(&models.ProductStock{}).
		Where("product_id = ? AND tenant_id = ? AND deleted_at IS NULL", productID, tenantID).
		Select("COALESCE(SUM(quantity), 0)").
		Scan(&total).Error
	if err != nil {
		return 0, err
	}
	return total, nil
}

// GetTotalReserved calculates total reserved quantity for a product
func (r *ProductStockRepository) GetTotalReserved(tenantID, productID uint) (int, error) {
	var total int
	err := r.db.Model(&models.ProductStock{}).
		Where("product_id = ? AND tenant_id = ? AND deleted_at IS NULL", productID, tenantID).
		Select("COALESCE(SUM(reserved), 0)").
		Scan(&total).Error
	if err != nil {
		return 0, err
	}
	return total, nil
}

// BulkCreate creates multiple product stocks
func (r *ProductStockRepository) BulkCreate(stocks []models.ProductStock) error {
	if len(stocks) == 0 {
		return nil
	}
	return r.db.Create(&stocks).Error
}

