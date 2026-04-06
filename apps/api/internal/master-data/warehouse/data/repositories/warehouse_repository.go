package repositories

import (
	"gipos/api/internal/master-data/warehouse/data/models"

	"gorm.io/gorm"
)

// WarehouseRepository handles warehouse data access
type WarehouseRepository struct {
	db *gorm.DB
}

// NewWarehouseRepository creates a new warehouse repository
func NewWarehouseRepository(db *gorm.DB) *WarehouseRepository {
	return &WarehouseRepository{db: db}
}

// GetByID retrieves a warehouse by ID
func (r *WarehouseRepository) GetByID(tenantID, id uint) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	err := r.db.Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", id, tenantID).
		Preload("Outlet").
		First(&warehouse).Error
	if err != nil {
		return nil, err
	}
	return &warehouse, nil
}

// GetByCode retrieves a warehouse by code
func (r *WarehouseRepository) GetByCode(tenantID uint, code string) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	err := r.db.Where("tenant_id = ? AND code = ? AND deleted_at IS NULL", tenantID, code).
		Preload("Outlet").
		First(&warehouse).Error
	if err != nil {
		return nil, err
	}
	return &warehouse, nil
}

// List retrieves all warehouses for a tenant with pagination
func (r *WarehouseRepository) List(tenantID uint, outletID *uint, status string, limit, offset int) ([]models.Warehouse, int64, error) {
	var warehouses []models.Warehouse
	var total int64

	query := r.db.Model(&models.Warehouse{}).
		Where("tenant_id = ? AND deleted_at IS NULL", tenantID)

	if outletID != nil {
		query = query.Where("outlet_id = ?", *outletID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := query.
		Preload("Outlet").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&warehouses).Error

	if err != nil {
		return nil, 0, err
	}

	return warehouses, total, nil
}

// Create creates a new warehouse
func (r *WarehouseRepository) Create(warehouse *models.Warehouse) error {
	return r.db.Create(warehouse).Error
}

// Update updates an existing warehouse
func (r *WarehouseRepository) Update(warehouse *models.Warehouse) error {
	return r.db.Save(warehouse).Error
}

// Delete soft deletes a warehouse
func (r *WarehouseRepository) Delete(tenantID, id uint) error {
	return r.db.Where("id = ? AND tenant_id = ?", id, tenantID).
		Delete(&models.Warehouse{}).Error
}

// GetDefaultWarehouse retrieves the default warehouse for an outlet
func (r *WarehouseRepository) GetDefaultWarehouse(tenantID, outletID uint) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	err := r.db.Where("tenant_id = ? AND outlet_id = ? AND is_default = true AND deleted_at IS NULL", tenantID, outletID).
		Preload("Outlet").
		First(&warehouse).Error
	if err != nil {
		return nil, err
	}
	return &warehouse, nil
}
