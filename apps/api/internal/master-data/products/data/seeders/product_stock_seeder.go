package seeders

import (
	"errors"
	"log"
	"time"

	sharedModels "gipos/api/internal/core/shared/models"
	productModels "gipos/api/internal/master-data/products/data/models"
	warehouseModels "gipos/api/internal/master-data/warehouse/data/models"
	stockModels "gipos/api/internal/stock/data/models"

	"gorm.io/gorm"
)

// ProductStockSeeder handles initial stock and movement seeding.
type ProductStockSeeder struct {
	db *gorm.DB
}

// Seed seeds initial product stocks and stock movements.
func (s *ProductStockSeeder) Seed(tenantID uint) error {
	log.Println("🌱 Seeding product stocks and stock movements...")

	var products []productModels.Product
	if err := s.db.Where("tenant_id = ? AND track_stock = ? AND status = ? AND deleted_at IS NULL", tenantID, true, "active").Order("id ASC").Find(&products).Error; err != nil {
		return err
	}
	if len(products) == 0 {
		log.Println("⚠️  No trackable products found, skipping product stock seeder")
		return nil
	}

	var warehouses []warehouseModels.Warehouse
	if err := s.db.Where("tenant_id = ? AND status = ? AND deleted_at IS NULL", tenantID, "active").Order("id ASC").Find(&warehouses).Error; err != nil {
		return err
	}
	if len(warehouses) == 0 {
		log.Println("⚠️  No warehouses found, skipping product stock seeder")
		return nil
	}

	createdStocks := 0
	createdMovements := 0
	now := time.Now()

	for pi, product := range products {
		for wi, warehouse := range warehouses {
			var existing productModels.ProductStock
			err := s.db.Where("tenant_id = ? AND product_id = ? AND warehouse_id = ? AND deleted_at IS NULL", tenantID, product.ID, warehouse.ID).
				First(&existing).Error
			if err == nil {
				continue
			}
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

			initialQty := 40 + (pi * 10) + (wi * 5)
			stock := productModels.ProductStock{
				TenantModel: sharedModels.TenantModel{TenantID: tenantID},
				ProductID:   product.ID,
				WarehouseID: warehouse.ID,
				Quantity:    initialQty,
				Reserved:    0,
				MinStock:    10,
				MaxStock:    200,
				LastUpdated: &now,
			}
			if err := s.db.Create(&stock).Error; err != nil {
				return err
			}
			createdStocks++

			movement := stockModels.StockMovement{
				TenantModel: sharedModels.TenantModel{TenantID: tenantID},
				ProductID:     product.ID,
				WarehouseID:   warehouse.ID,
				Type:          stockModels.StockMovementTypeIn,
				Quantity:      initialQty,
				BalanceBefore: 0,
				BalanceAfter:  initialQty,
				ReferenceType: stockModels.StockMovementRefManual,
				ReferenceID:   nil,
				Notes:         "Initial stock seed",
				MovementDate:  now,
			}
			if err := s.db.Create(&movement).Error; err != nil {
				return err
			}
			createdMovements++
		}
	}

	log.Printf("✅ Product stock seeding completed: %d stock row(s), %d movement row(s)", createdStocks, createdMovements)
	return nil
}
