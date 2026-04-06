package repositories

import (
	"strings"

	"gipos/api/internal/master-data/products/data/models"
	"gorm.io/gorm"
)

// ProductRepository handles product data access
type ProductRepository struct {
	db *gorm.DB
}

// GetDB returns the database connection (for raw queries)
func (r *ProductRepository) GetDB() *gorm.DB {
	return r.db
}

// NewProductRepository creates a new product repository
func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// Create creates a new product
func (r *ProductRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

// GetByID retrieves a product by ID
func (r *ProductRepository) GetByID(tenantID, id uint) (*models.Product, error) {
	var product models.Product
	err := r.db.Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", id, tenantID).
		Preload("Outlet").
		Preload("Category").
		Preload("Images").
		Preload("Stocks").
		Preload("Stocks.Warehouse").
		First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

// GetBySKU retrieves a product by SKU (case-insensitive)
func (r *ProductRepository) GetBySKU(tenantID uint, sku string) (*models.Product, error) {
	var product models.Product
	err := r.db.Where("LOWER(sku) = LOWER(?) AND tenant_id = ? AND deleted_at IS NULL", sku, tenantID).
		Preload("Outlet").
		Preload("Category").
		Preload("Images").
		Preload("Stocks").
		Preload("Stocks.Warehouse").
		First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

// GetByBarcode retrieves a product by barcode
func (r *ProductRepository) GetByBarcode(tenantID uint, barcode string) (*models.Product, error) {
	if barcode == "" {
		return nil, gorm.ErrRecordNotFound
	}
	var product models.Product
	err := r.db.Where("barcode = ? AND tenant_id = ? AND deleted_at IS NULL", barcode, tenantID).
		Preload("Outlet").
		Preload("Category").
		Preload("Images").
		Preload("Stocks").
		Preload("Stocks.Warehouse").
		First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

// Update updates a product
func (r *ProductRepository) Update(product *models.Product) error {
	// Use Omit to exclude relations from being updated
	// This prevents GORM from trying to update relations (Outlet, Category, Images, Stocks)
	// GORM will automatically update UpdatedAt field
	return r.db.Omit("Outlet", "Category", "Images", "Stocks").Save(product).Error
}

// Delete soft deletes a product
func (r *ProductRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.Product{}, "id = ?", id).Error
}

// List retrieves a list of products with pagination
func (r *ProductRepository) List(tenantID uint, outletID *uint, categoryID *uint, limit, offset int, search string, status string, sortBy string, sortOrder string, includeTenantLevel bool) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	// Build base query with tenant filter
	query := r.db.Model(&models.Product{}).Where("tenant_id = ? AND deleted_at IS NULL", tenantID)

	// Apply outlet filter
	if outletID != nil && *outletID > 0 {
		if includeTenantLevel {
			// Include both outlet-specific and tenant-level products (outlet_id = X OR outlet_id IS NULL)
			query = query.Where("(outlet_id = ? OR outlet_id IS NULL)", *outletID)
		} else {
			// Only outlet-specific products
			query = query.Where("outlet_id = ?", *outletID)
		}
	}

	// Apply category filter
	if categoryID != nil && *categoryID > 0 {
		query = query.Where("category_id = ?", *categoryID)
	}

	// Apply search filter (search in name, SKU, or barcode)
	if search != "" {
		searchPattern := "%" + strings.TrimSpace(search) + "%"
		query = query.Where("(name ILIKE ? OR sku ILIKE ? OR barcode ILIKE ?)", searchPattern, searchPattern, searchPattern)
	}

	// Apply status filter
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Count total before pagination (clone query to avoid affecting the main query)
	countQuery := query
	if err := countQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Validate and set sort
	allowedSorts := map[string]bool{
		"name":       true,
		"price":      true,
		"created_at": true,
		"updated_at": true,
	}
	if !allowedSorts[sortBy] {
		sortBy = "created_at"
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	// Get paginated results with relations
	err := query.
		Preload("Outlet").
		Preload("Category").
		Preload("Images").
		Preload("Stocks").
		Preload("Stocks.Warehouse").
		Order(sortBy + " " + strings.ToUpper(sortOrder)).
		Limit(limit).
		Offset(offset).
		Find(&products).Error
	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

