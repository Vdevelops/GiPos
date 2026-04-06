package repositories

import (
	"gipos/api/internal/master-data/outlet/data/models"
	"gorm.io/gorm"
)

// OutletRepository handles outlet data access
type OutletRepository struct {
	db *gorm.DB
}

// NewOutletRepository creates a new outlet repository
func NewOutletRepository(db *gorm.DB) *OutletRepository {
	return &OutletRepository{db: db}
}

// Create creates a new outlet
func (r *OutletRepository) Create(outlet *models.Outlet) error {
	return r.db.Create(outlet).Error
}

// GetByID retrieves an outlet by ID
func (r *OutletRepository) GetByID(tenantID, id uint) (*models.Outlet, error) {
	var outlet models.Outlet
	err := r.db.Where("id = ? AND tenant_id = ?", id, tenantID).First(&outlet).Error
	if err != nil {
		return nil, err
	}
	return &outlet, nil
}

// GetByCode retrieves an outlet by code
func (r *OutletRepository) GetByCode(tenantID uint, code string) (*models.Outlet, error) {
	var outlet models.Outlet
	err := r.db.Where("code = ? AND tenant_id = ?", code, tenantID).First(&outlet).Error
	if err != nil {
		return nil, err
	}
	return &outlet, nil
}

// Update updates an outlet
func (r *OutletRepository) Update(outlet *models.Outlet) error {
	return r.db.Save(outlet).Error
}

// Delete soft deletes an outlet
func (r *OutletRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.Outlet{}, "id = ?", id).Error
}

// List retrieves a list of outlets with pagination
func (r *OutletRepository) List(tenantID uint, limit, offset int, search string, status string) ([]models.Outlet, int64, error) {
	var outlets []models.Outlet
	var total int64

	query := r.db.Model(&models.Outlet{}).Where("tenant_id = ?", tenantID)

	// Apply search filter
	if search != "" {
		query = query.Where("name ILIKE ? OR code ILIKE ? OR city ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Apply status filter
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results - ensure ID is loaded
	err := query.Select("*").Order("created_at DESC").Limit(limit).Offset(offset).Find(&outlets).Error
	if err != nil {
		return nil, 0, err
	}

	return outlets, total, nil
}

// GetMainOutlet retrieves the main outlet for a tenant
func (r *OutletRepository) GetMainOutlet(tenantID uint) (*models.Outlet, error) {
	var outlet models.Outlet
	err := r.db.Where("tenant_id = ? AND is_main = ?", tenantID, true).First(&outlet).Error
	if err != nil {
		return nil, err
	}
	return &outlet, nil
}

