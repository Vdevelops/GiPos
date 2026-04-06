package seeders

import (
	"log"

	sharedModels "gipos/api/internal/core/shared/models"
	"gipos/api/internal/master-data/category_product/data/models"

	"gorm.io/gorm"
)

// RunSeeders runs all category seeders
func RunSeeders(db *gorm.DB) {
	// Get tenant ID first
	var tenant sharedModels.Tenant
	if err := db.Where("email = ?", "admin@gipos.id").First(&tenant).Error; err != nil {
		log.Printf("⚠️  WARNING: Could not find tenant, skipping category seeder: %v", err)
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
		log.Printf("ℹ️  No outlet found, creating tenant-level categories")
	}

	seeder := &CategorySeeder{db: db}
	if err := seeder.Seed(tenant.ID, outletID); err != nil {
		log.Printf("❌ Category seeder failed: %v", err)
	}
}

// CategorySeeder handles category seeding
type CategorySeeder struct {
	db *gorm.DB
}

// Seed seeds initial categories
func (s *CategorySeeder) Seed(tenantID uint, outletID *uint) error {
	log.Println("🌱 Seeding categories...")

	// Check if categories already exist for this tenant
	var count int64
	query := s.db.Model(&models.Category{}).Where("tenant_id = ?", tenantID)
	if outletID != nil {
		query = query.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
	}
	query.Count(&count)
	if count > 0 {
		log.Println("⚠️  Categories already exist for this tenant, skipping seed")
		return nil
	}

	// Seed categories
	categories := []models.Category{
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			Name:         "Makanan & Minuman",
			Slug:         "makanan-minuman",
			Description:  "Kategori untuk makanan dan minuman",
			SortOrder:    1,
			Status:       "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			Name:         "Elektronik",
			Slug:         "elektronik",
			Description:  "Kategori untuk produk elektronik",
			SortOrder:    2,
			Status:       "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			Name:         "Pakaian",
			Slug:         "pakaian",
			Description:  "Kategori untuk pakaian dan aksesoris",
			SortOrder:    3,
			Status:       "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			Name:         "Kebutuhan Rumah Tangga",
			Slug:         "kebutuhan-rumah-tangga",
			Description:  "Kategori untuk kebutuhan rumah tangga",
			SortOrder:    4,
			Status:       "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			OutletID:    outletID,
			Name:         "Lainnya",
			Slug:         "lainnya",
			Description:  "Kategori untuk produk lainnya",
			SortOrder:    99,
			Status:       "active",
		},
	}

	for i := range categories {
		if err := s.db.Create(&categories[i]).Error; err != nil {
			log.Printf("❌ Failed to create category %s: %v", categories[i].Name, err)
			continue
		}
		log.Printf("✅ Created category: %s (%s) - ID: %d", categories[i].Name, categories[i].Slug, categories[i].ID)
	}

	log.Println("✅ Category seeding completed")
	return nil
}

