package repositories

import (
	"time"

	"gipos/api/internal/sales/data/models"

	"gorm.io/gorm"
)

// ShiftRepository handles shift data access
type ShiftRepository struct {
	db *gorm.DB
}

// NewShiftRepository creates a new shift repository
func NewShiftRepository(db *gorm.DB) *ShiftRepository {
	return &ShiftRepository{db: db}
}

// GetDB returns the database connection (for raw queries)
func (r *ShiftRepository) GetDB() *gorm.DB {
	return r.db
}

// Create creates a new shift
func (r *ShiftRepository) Create(shift *models.Shift) error {
	return r.db.Create(shift).Error
}

// GetByID retrieves a shift by ID
func (r *ShiftRepository) GetByID(tenantID, id uint) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", id, tenantID).
		Preload("Outlet").
		Preload("User").
		Preload("Sales").
		First(&shift).Error
	if err != nil {
		return nil, err
	}
	return &shift, nil
}

// GetByShiftNumber retrieves a shift by shift number
func (r *ShiftRepository) GetByShiftNumber(tenantID uint, shiftNumber string) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.Where("shift_number = ? AND tenant_id = ? AND deleted_at IS NULL", shiftNumber, tenantID).
		Preload("Outlet").
		Preload("User").
		Preload("Sales").
		First(&shift).Error
	if err != nil {
		return nil, err
	}
	return &shift, nil
}

// GetOpenShiftByOutlet retrieves the open shift for an outlet
func (r *ShiftRepository) GetOpenShiftByOutlet(tenantID, outletID uint) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.Where("tenant_id = ? AND outlet_id = ? AND status = ? AND deleted_at IS NULL", tenantID, outletID, models.ShiftStatusOpen).
		Preload("Outlet").
		Preload("User").
		Order("opening_time DESC").
		First(&shift).Error
	if err != nil {
		return nil, err
	}
	return &shift, nil
}

// GetOpenShiftByUser retrieves the open shift for a user
func (r *ShiftRepository) GetOpenShiftByUser(tenantID, userID uint) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.Where("tenant_id = ? AND user_id = ? AND status = ? AND deleted_at IS NULL", tenantID, userID, models.ShiftStatusOpen).
		Preload("Outlet").
		Preload("User").
		Order("opening_time DESC").
		First(&shift).Error
	if err != nil {
		return nil, err
	}
	return &shift, nil
}

// Update updates a shift
func (r *ShiftRepository) Update(shift *models.Shift) error {
	return r.db.Omit("Outlet", "User", "Sales").Save(shift).Error
}

// Delete soft deletes a shift
func (r *ShiftRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.Shift{}, "id = ?", id).Error
}

// List retrieves a list of shifts with pagination
func (r *ShiftRepository) List(tenantID uint, outletID *uint, userID *uint, status *string, startDate *time.Time, endDate *time.Time, limit, offset int) ([]models.Shift, int64, error) {
	var shifts []models.Shift
	var total int64

	// Build base query with tenant filter
	query := r.db.Model(&models.Shift{}).Where("tenant_id = ? AND deleted_at IS NULL", tenantID)

	// Apply outlet filter
	if outletID != nil && *outletID > 0 {
		query = query.Where("outlet_id = ?", *outletID)
	}

	// Apply user filter
	if userID != nil && *userID > 0 {
		query = query.Where("user_id = ?", *userID)
	}

	// Apply status filter
	if status != nil && *status != "" {
		query = query.Where("status = ?", *status)
	}

	// Apply date range filter
	if startDate != nil {
		query = query.Where("opening_time >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("opening_time <= ?", *endDate)
	}

	// Count total before pagination
	countQuery := query
	if err := countQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results with relations
	err := query.
		Preload("Outlet").
		Preload("User").
		Order("opening_time DESC").
		Limit(limit).
		Offset(offset).
		Find(&shifts).Error
	if err != nil {
		return nil, 0, err
	}

	return shifts, total, nil
}
