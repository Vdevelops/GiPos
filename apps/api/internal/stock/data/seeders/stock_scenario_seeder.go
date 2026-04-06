package seeders

import (
	"fmt"
	"log"
	"time"

	sharedModels "gipos/api/internal/core/shared/models"
	productModels "gipos/api/internal/master-data/products/data/models"
	stockModels "gipos/api/internal/stock/data/models"
	stockService "gipos/api/internal/stock/domain/service"

	"gorm.io/gorm"
)

// RunSeeders runs stock scenario seeders (purchase and adjustment examples).
func RunSeeders(db *gorm.DB) {
	var tenant sharedModels.Tenant
	if err := db.Where("email = ?", "admin@gipos.id").First(&tenant).Error; err != nil {
		log.Printf("⚠️  WARNING: Could not find tenant, skipping stock scenario seeder: %v", err)
		return
	}

	seeder := &StockScenarioSeeder{
		db:           db,
		stockService: stockService.NewStockService(),
	}
	if err := seeder.Seed(tenant.ID); err != nil {
		log.Printf("❌ Stock scenario seeder failed: %v", err)
	}
}

// StockScenarioSeeder seeds purchase and adjustment examples via centralized stock service.
type StockScenarioSeeder struct {
	db           *gorm.DB
	stockService *stockService.StockService
}

// Seed applies sample purchase and adjustment stock mutations.
func (s *StockScenarioSeeder) Seed(tenantID uint) error {
	log.Println("🌱 Seeding stock scenarios (purchase + adjustment)...")

	var products []productModels.Product
	if err := s.db.Where("tenant_id = ? AND track_stock = ? AND status = ? AND deleted_at IS NULL", tenantID, true, "active").Order("id ASC").Limit(2).Find(&products).Error; err != nil {
		return err
	}
	if len(products) < 2 {
		log.Println("⚠️  Not enough trackable products, skipping stock scenario seeder")
		return nil
	}

	now := time.Now()
	err := s.db.Transaction(func(tx *gorm.DB) error {
		purchaseKey := fmt.Sprintf("seed:purchase:product:%d", products[0].ID)
		if err := s.stockService.ApplyStockChange(tx, stockService.ApplyStockChangeRequest{
			TenantID:       tenantID,
			ProductID:      products[0].ID,
			Delta:          8,
			ReferenceType:  stockModels.StockMovementRefPurchase,
			ReferenceID:    nil,
			IdempotencyKey: &purchaseKey,
			Notes:          "Seeded purchase receipt",
			MovementDate:   now.Add(-90 * time.Minute),
		}); err != nil {
			return err
		}

		adjustmentKey := fmt.Sprintf("seed:adjustment:product:%d", products[1].ID)
		if err := s.stockService.ApplyStockChange(tx, stockService.ApplyStockChangeRequest{
			TenantID:       tenantID,
			ProductID:      products[1].ID,
			Delta:          -2,
			ReferenceType:  stockModels.StockMovementRefAdjustment,
			ReferenceID:    nil,
			IdempotencyKey: &adjustmentKey,
			Notes:          "Seeded stock adjustment",
			MovementDate:   now.Add(-30 * time.Minute),
		}); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return err
	}

	log.Println("✅ Stock scenario seeding completed")
	return nil
}
