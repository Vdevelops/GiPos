package seeders

import (
	"log"

	sharedModels "gipos/api/internal/core/shared/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	"gipos/api/internal/master-data/warehouse/data/models"

	"gorm.io/gorm"
)

// RunSeeders runs all warehouse seeders.
func RunSeeders(db *gorm.DB) {
	var tenant sharedModels.Tenant
	if err := db.Where("email = ?", "admin@gipos.id").First(&tenant).Error; err != nil {
		log.Printf("⚠️  WARNING: Could not find tenant, skipping warehouse seeder: %v", err)
		return
	}

	seeder := &WarehouseSeeder{db: db}
	if err := seeder.Seed(tenant.ID); err != nil {
		log.Printf("❌ Warehouse seeder failed: %v", err)
	}
}

// WarehouseSeeder handles warehouse seeding.
type WarehouseSeeder struct {
	db *gorm.DB
}

// Seed creates a single default warehouse for the tenant.
func (s *WarehouseSeeder) Seed(tenantID uint) error {
	log.Println("🌱 Seeding warehouses...")

	var count int64
	s.db.Model(&models.Warehouse{}).Where("tenant_id = ?", tenantID).Count(&count)
	if count > 0 {
		log.Println("⚠️  Warehouses already exist for this tenant, skipping seed")
		return nil
	}

	var firstOutlet outletModels.Outlet
	if err := s.db.Where("tenant_id = ? AND deleted_at IS NULL", tenantID).Order("id ASC").First(&firstOutlet).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Println("⚠️  No outlets found, creating tenant-level default warehouse")
		} else {
			return err
		}
	}

	var outletID *uint
	address := ""
	if firstOutlet.ID != 0 {
		outletID = &firstOutlet.ID
		address = firstOutlet.Address
	}

	warehouse := models.Warehouse{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantID,
		},
		OutletID:  outletID,
		Code:      "WH-001",
		Name:      "Default Warehouse",
		Address:   address,
		Type:      "main",
		Status:    "active",
		IsDefault: true,
	}

	if err := s.db.Create(&warehouse).Error; err != nil {
		return err
	}

	log.Printf("✅ Created default warehouse: %s (%s) - ID: %d", warehouse.Code, warehouse.Name, warehouse.ID)
	log.Println("✅ Warehouse seeding completed: 1 warehouse created")
	return nil
}
