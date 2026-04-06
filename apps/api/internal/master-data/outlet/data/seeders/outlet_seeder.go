package seeders

import (
	"log"

	sharedModels "gipos/api/internal/core/shared/models"
	"gipos/api/internal/master-data/outlet/data/models"

	"gorm.io/gorm"
)

// RunSeeders runs all outlet seeders
func RunSeeders(db *gorm.DB) {
	// Get tenant ID first
	var tenant sharedModels.Tenant
	if err := db.Where("email = ?", "admin@gipos.id").First(&tenant).Error; err != nil {
		log.Printf("⚠️  WARNING: Could not find tenant, skipping outlet seeder: %v", err)
		return
	}

	seeder := &OutletSeeder{db: db}
	if err := seeder.Seed(tenant.ID); err != nil {
		log.Printf("❌ Outlet seeder failed: %v", err)
	}
}

// OutletSeeder handles outlet seeding
type OutletSeeder struct {
	db *gorm.DB
}

// Seed seeds initial outlets
func (s *OutletSeeder) Seed(tenantID uint) error {
	log.Println("🌱 Seeding outlets...")

	// Check if outlets already exist for this tenant
	var count int64
	s.db.Model(&models.Outlet{}).Where("tenant_id = ?", tenantID).Count(&count)
	if count > 0 {
		log.Println("⚠️  Outlets already exist for this tenant, skipping seed")
		return nil
	}

	// Seed outlets
	outlets := []models.Outlet{
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			Code:       "OUTLET-001",
			Name:       "Outlet Pusat",
			Address:    "Jl. Merdeka No. 123",
			City:       "Jakarta",
			Province:   "DKI Jakarta",
			PostalCode: "10110",
			Phone:      "021-12345678",
			Email:      "pusat@gipos.id",
			Status:     "active",
			IsMain:     true,
			Timezone:   "Asia/Jakarta",
		},
		{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantID,
			},
			Code:       "OUTLET-002",
			Name:       "Outlet Cabang A",
			Address:    "Jl. Sudirman No. 456",
			City:       "Jakarta",
			Province:   "DKI Jakarta",
			PostalCode: "10220",
			Phone:      "021-87654321",
			Email:      "cabang-a@gipos.id",
			Status:     "active",
			IsMain:     false,
			Timezone:   "Asia/Jakarta",
		},
	}

	createdCount := 0
	for i := range outlets {
		if err := s.db.Create(&outlets[i]).Error; err != nil {
			log.Printf("❌ Failed to create outlet %s: %v", outlets[i].Code, err)
			continue
		}
		log.Printf("✅ Created outlet: %s (%s) - ID: %d", outlets[i].Code, outlets[i].Name, outlets[i].ID)
		createdCount++
	}

	if createdCount == 0 {
		log.Println("⚠️  No outlets were created")
		return nil // Return nil to allow continuation, but log warning
	}

	log.Printf("✅ Outlet seeding completed: %d outlet(s) created", createdCount)
	return nil
}
