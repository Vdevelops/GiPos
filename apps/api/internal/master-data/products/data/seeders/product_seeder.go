package seeders

import (
	"log"

	sharedModels "gipos/api/internal/core/shared/models"
	"gipos/api/internal/master-data/products/data/models"

	"gorm.io/gorm"
)

// RunSeeders runs all product seeders
func RunSeeders(db *gorm.DB) {
	// Get tenant ID first
	var tenant sharedModels.Tenant
	if err := db.Where("email = ?", "admin@gipos.id").First(&tenant).Error; err != nil {
		log.Printf("⚠️  WARNING: Could not find tenant, skipping product seeder: %v", err)
		return
	}

	// Get first outlet ID (optional)
	var outletID *uint
	type OutletResult struct {
		ID uint `gorm:"column:id"`
	}
	var outlet OutletResult
	if err := db.Table("outlets").Where("tenant_id = ?", tenant.ID).Select("id").First(&outlet).Error; err == nil {
		outletID = &outlet.ID
		log.Printf("📋 Using Outlet ID: %d", *outletID)
	} else {
		log.Printf("ℹ️  No outlet found, creating tenant-level products")
	}

	// Get first category ID (optional)
	var categoryID *uint
	type CategoryResult struct {
		ID uint `gorm:"column:id"`
	}
	var category CategoryResult
	if err := db.Table("categories").Where("tenant_id = ?", tenant.ID).Select("id").First(&category).Error; err == nil {
		categoryID = &category.ID
		log.Printf("📋 Using Category ID: %d", *categoryID)
	} else {
		log.Printf("ℹ️  No category found, creating products without category")
	}

	seeder := &ProductSeeder{db: db}
	if err := seeder.Seed(tenant.ID, outletID, categoryID); err != nil {
		log.Printf("❌ Product seeder failed: %v", err)
	}
}

// ProductSeeder handles product seeding
type ProductSeeder struct {
	db *gorm.DB
}

// Seed seeds initial products
func (s *ProductSeeder) Seed(tenantID uint, outletID *uint, categoryID *uint) error {
	log.Println("🌱 Seeding products...")

	// Check if products already exist for this tenant
	var count int64
	query := s.db.Model(&models.Product{}).Where("tenant_id = ?", tenantID)
	if outletID != nil {
		query = query.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
	}
	query.Count(&count)
	if count > 0 {
		log.Println("⚠️  Products already exist for this tenant, skipping seed")
		return nil
	}

	// Seed products
	products := []models.Product{
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			CategoryID:  categoryID,
			Name:        "Produk A",
			SKU:         "SKU-001",
			Barcode:     "1234567890123",
			Description: "Deskripsi produk A",
			Price:       50000, // Rp 50.000
			Cost:        30000, // Rp 30.000
			Taxable:     true,
			TrackStock:  true,
			Status:      "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			CategoryID:  categoryID,
			Name:        "Produk B",
			SKU:         "SKU-002",
			Barcode:     "1234567890124",
			Description: "Deskripsi produk B",
			Price:       75000, // Rp 75.000
			Cost:        45000, // Rp 45.000
			Taxable:     true,
			TrackStock:  true,
			Status:      "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			CategoryID:  categoryID,
			Name:        "Produk C",
			SKU:         "SKU-003",
			Barcode:     "1234567890125",
			Description: "Deskripsi produk C",
			Price:       100000, // Rp 100.000
			Cost:        60000,  // Rp 60.000
			Taxable:     false,
			TrackStock:  true,
			Status:      "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			CategoryID:  categoryID,
			Name:        "Produk D",
			SKU:         "SKU-004",
			Barcode:     "1234567890126",
			Description: "Deskripsi produk D",
			Price:       25000, // Rp 25.000
			Cost:        15000, // Rp 15.000
			Taxable:     true,
			TrackStock:  false,
			Status:      "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			CategoryID:  categoryID,
			Name:        "Produk E",
			SKU:         "SKU-005",
			Barcode:     "1234567890127",
			Description: "Deskripsi produk E",
			Price:       150000, // Rp 150.000
			Cost:        90000,  // Rp 90.000
			Taxable:     true,
			TrackStock:  true,
			Status:      "active",
		},
	}

	createdCount := 0
	for i := range products {
		if err := s.db.Create(&products[i]).Error; err != nil {
			log.Printf("❌ Failed to create product %s: %v", products[i].SKU, err)
			continue
		}
		log.Printf("✅ Created product: %s (%s) - Rp %d - ID: %d", products[i].Name, products[i].SKU, products[i].Price, products[i].ID)
		createdCount++
	}

	if createdCount == 0 {
		log.Println("⚠️  No products were created")
		return nil // Return nil to allow continuation, but log warning
	}

	log.Printf("✅ Product seeding completed: %d product(s) created", createdCount)
	return nil
}
