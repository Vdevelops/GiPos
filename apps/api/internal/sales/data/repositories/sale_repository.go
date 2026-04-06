package repositories

import (
	"time"

	"gipos/api/internal/sales/data/models"

	"gorm.io/gorm"
)

// SaleRepository handles sale data access
type SaleRepository struct {
	db *gorm.DB
}

// NewSaleRepository creates a new sale repository
func NewSaleRepository(db *gorm.DB) *SaleRepository {
	return &SaleRepository{db: db}
}

// Create creates a new sale
func (r *SaleRepository) Create(sale *models.Sale) error {
	return r.db.Create(sale).Error
}

// GetByID retrieves a sale by ID
func (r *SaleRepository) GetByID(tenantID, id uint) (*models.Sale, error) {
	var sale models.Sale
	err := r.db.Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", id, tenantID).
		Preload("Outlet").
		Preload("Cashier").
		Preload("Items").
		Preload("Items.Product").
		Preload("Payment").
		First(&sale).Error
	if err != nil {
		return nil, err
	}
	return &sale, nil
}

// GetByInvoiceNumber retrieves a sale by invoice number
func (r *SaleRepository) GetByInvoiceNumber(tenantID uint, invoiceNumber string) (*models.Sale, error) {
	var sale models.Sale
	err := r.db.Where("invoice_number = ? AND tenant_id = ? AND deleted_at IS NULL", invoiceNumber, tenantID).
		Preload("Outlet").
		Preload("Cashier").
		Preload("Items").
		Preload("Items.Product").
		Preload("Payment").
		First(&sale).Error
	if err != nil {
		return nil, err
	}
	return &sale, nil
}

// Update updates a sale
func (r *SaleRepository) Update(sale *models.Sale) error {
	return r.db.Omit("Outlet", "Cashier", "Items", "Payment").Save(sale).Error
}

// Delete soft deletes a sale
func (r *SaleRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.Sale{}, "id = ?", id).Error
}

// List retrieves a list of sales with pagination
func (r *SaleRepository) List(tenantID uint, outletID *uint, shiftID *uint, status *string, paymentStatus *string, paymentMethod *string, startDate *time.Time, endDate *time.Time, limit, offset int) ([]models.Sale, int64, error) {
	var sales []models.Sale
	var total int64

	// Build base query with tenant filter
	query := r.db.Model(&models.Sale{}).Where("tenant_id = ? AND deleted_at IS NULL", tenantID)

	// Apply outlet filter
	if outletID != nil && *outletID > 0 {
		query = query.Where("outlet_id = ?", *outletID)
	}

	// Apply shift filter
	if shiftID != nil && *shiftID > 0 {
		query = query.Where("shift_id = ?", *shiftID)
	}

	// Apply status filter
	if status != nil && *status != "" {
		query = query.Where("status = ?", *status)
	}

	// Apply payment status filter
	if paymentStatus != nil && *paymentStatus != "" {
		query = query.Where("payment_status = ?", *paymentStatus)
	}

	// Apply payment method filter
	if paymentMethod != nil && *paymentMethod != "" {
		query = query.Where("payment_method = ?", *paymentMethod)
	}

	// Apply date range filter
	if startDate != nil {
		query = query.Where("created_at >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("created_at <= ?", *endDate)
	}

	// Count total before pagination
	countQuery := query
	if err := countQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results with relations
	err := query.
		Preload("Outlet").
		Preload("Cashier").
		Preload("Items").
		Preload("Items.Product").
		Preload("Payment").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&sales).Error
	if err != nil {
		return nil, 0, err
	}

	return sales, total, nil
}

// GetDB returns the database connection (for raw queries)
func (r *SaleRepository) GetDB() *gorm.DB {
	return r.db
}
