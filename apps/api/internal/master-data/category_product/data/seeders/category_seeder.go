package seeders

import (
	"errors"
	"log"

	sharedModels "gipos/api/internal/core/shared/models"
	"gipos/api/internal/master-data/category_product/data/models"
	productModels "gipos/api/internal/master-data/products/data/models"

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

	type categorySeed struct {
		Name        string
		Slug        string
		Description string
		SortOrder   int
	}

	targetCategories := []categorySeed{
		{
			Name:        "Nasi",
			Slug:        "nasi",
			Description: "Kategori untuk menu nasi",
			SortOrder:   1,
		},
		{
			Name:        "Makanan",
			Slug:        "makanan",
			Description: "Kategori untuk menu makanan",
			SortOrder:   2,
		},
		{
			Name:        "Minuman",
			Slug:        "minuman",
			Description: "Kategori untuk menu minuman",
			SortOrder:   3,
		},
		{
			Name:        "Paket",
			Slug:        "paket",
			Description: "Kategori untuk menu paket",
			SortOrder:   4,
		},
	}

	keepIDs := make([]uint, 0, len(targetCategories))
	for _, target := range targetCategories {
		var category models.Category
		query := s.db.Model(&models.Category{}).
			Where("tenant_id = ? AND slug = ?", tenantID, target.Slug)
		if outletID != nil {
			query = query.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
		} else {
			query = query.Where("outlet_id IS NULL")
		}

		err := query.First(&category).Error
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

			category = models.Category{
				TenantModel: sharedModels.TenantModel{TenantID: tenantID},
				OutletID:    outletID,
				Name:        target.Name,
				Slug:        target.Slug,
				Description: target.Description,
				SortOrder:   target.SortOrder,
				Status:      "active",
			}
			if err := s.db.Create(&category).Error; err != nil {
				return err
			}
			log.Printf("✅ Created category: %s (%s) - ID: %d", category.Name, category.Slug, category.ID)
		} else {
			updates := map[string]interface{}{
				"name":        target.Name,
				"slug":        target.Slug,
				"description": target.Description,
				"sort_order":  target.SortOrder,
				"status":      "active",
				"outlet_id":   outletID,
			}
			if err := s.db.Model(&models.Category{}).
				Where("id = ?", category.ID).
				Updates(updates).Error; err != nil {
				return err
			}
			log.Printf("🔄 Synced category: %s (%s) - ID: %d", target.Name, target.Slug, category.ID)
		}

		keepIDs = append(keepIDs, category.ID)
	}

	if len(keepIDs) == 0 {
		return nil
	}

	fallbackCategoryID := keepIDs[0]
	productQuery := s.db.Model(&productModels.Product{}).
		Where("tenant_id = ? AND category_id IS NOT NULL", tenantID)
	if outletID != nil {
		productQuery = productQuery.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
	}
	if err := productQuery.
		Where("category_id NOT IN ?", keepIDs).
		Update("category_id", fallbackCategoryID).Error; err != nil {
		return err
	}

	deleteQuery := s.db.Where("tenant_id = ?", tenantID)
	if outletID != nil {
		deleteQuery = deleteQuery.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
	} else {
		deleteQuery = deleteQuery.Where("outlet_id IS NULL")
	}
	if err := deleteQuery.Where("id NOT IN ?", keepIDs).Delete(&models.Category{}).Error; err != nil {
		return err
	}

	log.Println("✅ Category seeding completed: synced to Nasi, Makanan, Minuman, Paket")
	return nil
}

