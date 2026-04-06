package seeders

import (
	"errors"
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

	type CategoryResult struct {
		ID   uint   `gorm:"column:id"`
		Slug string `gorm:"column:slug"`
	}
	var categories []CategoryResult
	categoryQuery := db.Table("categories").
		Where("tenant_id = ?", tenant.ID).
		Where("slug IN ?", []string{"nasi", "makanan", "minuman"})
	if outletID != nil {
		categoryQuery = categoryQuery.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
	} else {
		categoryQuery = categoryQuery.Where("outlet_id IS NULL")
	}
	if err := categoryQuery.Select("id, slug").Find(&categories).Error; err != nil {
		log.Printf("⚠️  WARNING: Failed loading categories for products: %v", err)
	}

	categoryIDsBySlug := make(map[string]uint, len(categories))
	for _, category := range categories {
		categoryIDsBySlug[category.Slug] = category.ID
		log.Printf("📋 Category %s ID: %d", category.Slug, category.ID)
	}
	if len(categoryIDsBySlug) == 0 {
		log.Printf("ℹ️  No category found, creating products without category")
	}

	seeder := &ProductSeeder{db: db}
	if err := seeder.Seed(tenant.ID, outletID, categoryIDsBySlug); err != nil {
		log.Printf("❌ Product seeder failed: %v", err)
		return
	}

	stockSeeder := &ProductStockSeeder{db: db}
	if err := stockSeeder.Seed(tenant.ID); err != nil {
		log.Printf("❌ Product stock seeder failed: %v", err)
	}
}

// ProductSeeder handles product seeding
type ProductSeeder struct {
	db *gorm.DB
}

// Seed seeds initial products
func (s *ProductSeeder) Seed(tenantID uint, outletID *uint, categoryIDsBySlug map[string]uint) error {
	log.Println("🌱 Seeding products...")

	type productSeed struct {
		Name         string
		SKU          string
		Barcode      string
		Description  string
		Price        int64
		Cost         int64
		Taxable      bool
		TrackStock   bool
		CategorySlug string
	}

	seedProducts := []productSeed{
		{
			Name:         "Ayam Boiler",
			SKU:          "PENYET-001",
			Barcode:      "8991000000001",
			Description:  "Menu penyetan ayam boiler",
			Price:        18000,
			Cost:         11000,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Ayam Pejantan",
			SKU:          "PENYET-002",
			Barcode:      "8991000000002",
			Description:  "Menu penyetan ayam pejantan",
			Price:        20000,
			Cost:         12500,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Bebek",
			SKU:          "PENYET-003",
			Barcode:      "8991000000003",
			Description:  "Menu penyetan bebek",
			Price:        25000,
			Cost:         16000,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Lele",
			SKU:          "PENYET-004",
			Barcode:      "8991000000004",
			Description:  "Menu penyetan lele",
			Price:        17000,
			Cost:         10500,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Bandeng",
			SKU:          "PENYET-005",
			Barcode:      "8991000000005",
			Description:  "Menu penyetan bandeng",
			Price:        19000,
			Cost:         12000,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Sate Jeroan",
			SKU:          "PENYET-006",
			Barcode:      "8991000000006",
			Description:  "Sate jeroan pelengkap penyetan",
			Price:        9000,
			Cost:         5000,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Telur",
			SKU:          "PENYET-007",
			Barcode:      "8991000000007",
			Description:  "Telur sebagai lauk tambahan",
			Price:        5000,
			Cost:         2500,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Tahu",
			SKU:          "PENYET-008",
			Barcode:      "8991000000008",
			Description:  "Tahu goreng pelengkap penyetan",
			Price:        3000,
			Cost:         1400,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Tempe",
			SKU:          "PENYET-009",
			Barcode:      "8991000000009",
			Description:  "Tempe goreng pelengkap penyetan",
			Price:        3000,
			Cost:         1300,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Terong",
			SKU:          "PENYET-010",
			Barcode:      "8991000000010",
			Description:  "Terong goreng pelengkap penyetan",
			Price:        4000,
			Cost:         2000,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Nasi",
			SKU:          "PENYET-011",
			Barcode:      "8991000000011",
			Description:  "Nasi putih",
			Price:        5000,
			Cost:         2200,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "nasi",
		},
		{
			Name:         "Es Teh",
			SKU:          "PENYET-012",
			Barcode:      "8991000000012",
			Description:  "Es teh manis",
			Price:        5000,
			Cost:         1700,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "minuman",
		},
		{
			Name:         "Infus Water",
			SKU:          "PENYET-013",
			Barcode:      "8991000000013",
			Description:  "Infused water segar",
			Price:        7000,
			Cost:         2600,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "minuman",
		},
		{
			Name:         "Ati Ampela",
			SKU:          "PENYET-014",
			Barcode:      "8991000000014",
			Description:  "Ati ampela goreng pelengkap",
			Price:        7000,
			Cost:         4000,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
		{
			Name:         "Usus Crispy",
			SKU:          "PENYET-015",
			Barcode:      "8991000000015",
			Description:  "Usus crispy pelengkap",
			Price:        7000,
			Cost:         3800,
			Taxable:      false,
			TrackStock:   true,
			CategorySlug: "makanan",
		},
	}

	keepSKUs := make([]string, 0, len(seedProducts))
	createdCount := 0
	updatedCount := 0

	for _, item := range seedProducts {
		keepSKUs = append(keepSKUs, item.SKU)

		var categoryID *uint
		if id, ok := categoryIDsBySlug[item.CategorySlug]; ok {
			categoryID = &id
		} else {
			log.Printf("⚠️  Category %s not found, product %s will be created without category", item.CategorySlug, item.SKU)
		}

		var existing models.Product
		query := s.db.Model(&models.Product{}).Where("tenant_id = ? AND sku = ?", tenantID, item.SKU)
		if outletID != nil {
			query = query.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
		} else {
			query = query.Where("outlet_id IS NULL")
		}

		err := query.First(&existing).Error
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

			product := models.Product{
				TenantModel: sharedModels.TenantModel{TenantID: tenantID},
				OutletID:    outletID,
				CategoryID:  categoryID,
				Name:        item.Name,
				SKU:         item.SKU,
				Barcode:     item.Barcode,
				Description: item.Description,
				Price:       item.Price,
				Cost:        item.Cost,
				Taxable:     item.Taxable,
				TrackStock:  item.TrackStock,
				Status:      "active",
			}
			if err := s.db.Create(&product).Error; err != nil {
				return err
			}
			createdCount++
			log.Printf("✅ Created product: %s (%s) - Rp %d - ID: %d", product.Name, product.SKU, product.Price, product.ID)
			continue
		}

		updates := map[string]interface{}{
			"outlet_id":    outletID,
			"category_id":  categoryID,
			"name":         item.Name,
			"barcode":      item.Barcode,
			"description":  item.Description,
			"price":        item.Price,
			"cost":         item.Cost,
			"taxable":      item.Taxable,
			"track_stock":  item.TrackStock,
			"status":       "active",
			"deleted_at":   nil,
		}
		if err := s.db.Model(&models.Product{}).Where("id = ?", existing.ID).Updates(updates).Error; err != nil {
			return err
		}
		updatedCount++
		log.Printf("🔄 Synced product: %s (%s) - ID: %d", item.Name, item.SKU, existing.ID)
	}

	cleanupQuery := s.db.Where("tenant_id = ?", tenantID)
	if outletID != nil {
		cleanupQuery = cleanupQuery.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
	} else {
		cleanupQuery = cleanupQuery.Where("outlet_id IS NULL")
	}
	if err := cleanupQuery.
		Where("sku LIKE ?", "PENYET-%").
		Where("sku NOT IN ?", keepSKUs).
		Delete(&models.Product{}).Error; err != nil {
		return err
	}

	legacySKUs := []string{"SKU-001", "SKU-002", "SKU-003", "SKU-004", "SKU-005"}
	legacyQuery := s.db.Where("tenant_id = ?", tenantID)
	if outletID != nil {
		legacyQuery = legacyQuery.Where("outlet_id = ? OR outlet_id IS NULL", *outletID)
	} else {
		legacyQuery = legacyQuery.Where("outlet_id IS NULL")
	}
	if err := legacyQuery.Where("sku IN ?", legacySKUs).Delete(&models.Product{}).Error; err != nil {
		return err
	}

	if createdCount == 0 && updatedCount == 0 {
		log.Println("⚠️  No products were created or updated")
		return nil
	}

	log.Printf("✅ Product seeding completed: %d created, %d updated", createdCount, updatedCount)
	return nil
}
