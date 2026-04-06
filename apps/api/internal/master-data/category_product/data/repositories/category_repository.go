package repositories

import (
	"gipos/api/internal/master-data/category_product/data/models"
	"gorm.io/gorm"
)

// CategoryRepository handles category data access
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository creates a new category repository
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// Create creates a new category
func (r *CategoryRepository) Create(category *models.Category) error {
	return r.db.Create(category).Error
}

// GetByID retrieves a category by ID
func (r *CategoryRepository) GetByID(tenantID, id uint) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("id = ? AND tenant_id = ?", id, tenantID).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetBySlug retrieves a category by slug
func (r *CategoryRepository) GetBySlug(tenantID uint, slug string) (*models.Category, error) {
	var category models.Category
	err := r.db.Where("slug = ? AND tenant_id = ?", slug, tenantID).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// Update updates a category
func (r *CategoryRepository) Update(category *models.Category) error {
	return r.db.Save(category).Error
}

// Delete soft deletes a category
func (r *CategoryRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.Category{}, "id = ?", id).Error
}

// List retrieves a list of categories with pagination
func (r *CategoryRepository) List(tenantID uint, outletID *uint, parentID *uint, limit, offset int, search string, status string) ([]models.Category, int64, error) {
	var categories []models.Category
	var total int64

	query := r.db.Model(&models.Category{}).Where("tenant_id = ?", tenantID)

	// Apply outlet filter
	if outletID != nil && *outletID > 0 {
		query = query.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
	}

	// Apply parent filter
	if parentID != nil && *parentID > 0 {
		query = query.Where("parent_id = ?", *parentID)
	} else if parentID != nil && *parentID == 0 {
		// If parentID is explicitly 0, get only root categories
		query = query.Where("parent_id IS NULL")
	}

	// Apply search filter
	if search != "" {
		query = query.Where("name ILIKE ? OR slug ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Apply status filter
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := query.Order("sort_order ASC, name ASC").
		Limit(limit).
		Offset(offset).
		Find(&categories).Error
	if err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

// GetChildren retrieves child categories of a parent
func (r *CategoryRepository) GetChildren(tenantID, parentID uint) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Where("tenant_id = ? AND parent_id = ?", tenantID, parentID).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return categories, nil
}

