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

// Seed seeds a single default outlet
func (s *OutletSeeder) Seed(tenantID uint) error {
	log.Println("🌱 Seeding outlets...")

	// Check if outlets already exist for this tenant
	var count int64
	s.db.Model(&models.Outlet{}).Where("tenant_id = ?", tenantID).Count(&count)
	if count > 0 {
		log.Println("⚠️  Outlets already exist for this tenant, skipping seed")
		return nil
	}

	// Seed a single outlet
	outlet := models.Outlet{
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
	}

	if err := s.db.Create(&outlet).Error; err != nil {
		log.Printf("❌ Failed to create outlet %s: %v", outlet.Code, err)
		return nil
	}

	log.Printf("✅ Created outlet: %s (%s) - ID: %d", outlet.Code, outlet.Name, outlet.ID)
	log.Println("✅ Outlet seeding completed: 1 outlet created")
	return nil
}
