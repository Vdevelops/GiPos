package service

import (
	"fmt"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	sharedModels "gipos/api/internal/core/shared/models"
	categoryModels "gipos/api/internal/master-data/category_product/data/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	productModels "gipos/api/internal/master-data/products/data/models"
	warehouseModels "gipos/api/internal/master-data/warehouse/data/models"
	stockModels "gipos/api/internal/stock/data/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type stockFixture struct {
	tenantID  uint
	productID uint
	stockID   uint
}

func TestApplyStockChangeIdempotency(t *testing.T) {
	db := openTestDB(t)
	fx := seedStockFixture(t, db, 10)

	svc := NewStockService()
	key := "sale-100-item-1-deduct"

	err := db.Transaction(func(tx *gorm.DB) error {
		return svc.ApplyStockChange(tx, ApplyStockChangeRequest{
			TenantID:       fx.tenantID,
			ProductID:      fx.productID,
			Delta:          -3,
			ReferenceType:  stockModels.StockMovementRefSale,
			IdempotencyKey: &key,
			MovementDate:   time.Now(),
		})
	})
	if err != nil {
		t.Fatalf("first apply failed: %v", err)
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		return svc.ApplyStockChange(tx, ApplyStockChangeRequest{
			TenantID:       fx.tenantID,
			ProductID:      fx.productID,
			Delta:          -3,
			ReferenceType:  stockModels.StockMovementRefSale,
			IdempotencyKey: &key,
			MovementDate:   time.Now(),
		})
	})
	if err != nil {
		t.Fatalf("second apply with same idempotency key failed: %v", err)
	}

	var stock productModels.ProductStock
	if err := db.Where("id = ?", fx.stockID).First(&stock).Error; err != nil {
		t.Fatalf("failed to load stock: %v", err)
	}
	if stock.Quantity != 7 {
		t.Fatalf("expected quantity 7, got %d", stock.Quantity)
	}

	var movementCount int64
	if err := db.Model(&stockModels.StockMovement{}).
		Where("tenant_id = ? AND idempotency_key = ?", fx.tenantID, key).
		Count(&movementCount).Error; err != nil {
		t.Fatalf("failed to count movements: %v", err)
	}
	if movementCount != 1 {
		t.Fatalf("expected 1 movement for idempotency key, got %d", movementCount)
	}
}

func TestApplyStockChangeConcurrentNonNegative(t *testing.T) {
	db := openTestDB(t)
	fx := seedStockFixture(t, db, 5)

	svc := NewStockService()
	var success int32
	var insufficient int32

	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()

			key := fmt.Sprintf("conc-deduct-%d", i)
			err := retryOnSQLiteLock(func() error {
				return db.Transaction(func(tx *gorm.DB) error {
					return svc.ApplyStockChange(tx, ApplyStockChangeRequest{
						TenantID:       fx.tenantID,
						ProductID:      fx.productID,
						Delta:          -1,
						ReferenceType:  stockModels.StockMovementRefSale,
						IdempotencyKey: &key,
						MovementDate:   time.Now(),
					})
				})
			})
			if err == nil {
				atomic.AddInt32(&success, 1)
				return
			}
			if err.Error() == "INSUFFICIENT_STOCK" {
				atomic.AddInt32(&insufficient, 1)
				return
			}

			t.Errorf("unexpected error: %v", err)
		}(i)
	}
	wg.Wait()

	if success != 5 {
		t.Fatalf("expected 5 successful deductions, got %d", success)
	}
	if insufficient != 5 {
		t.Fatalf("expected 5 insufficient stock errors, got %d", insufficient)
	}

	var stock productModels.ProductStock
	if err := db.Where("id = ?", fx.stockID).First(&stock).Error; err != nil {
		t.Fatalf("failed to load stock after concurrency test: %v", err)
	}
	if stock.Quantity != 0 {
		t.Fatalf("expected quantity 0 after concurrent deductions, got %d", stock.Quantity)
	}

	var movementCount int64
	if err := db.Model(&stockModels.StockMovement{}).
		Where("tenant_id = ? AND product_id = ?", fx.tenantID, fx.productID).
		Count(&movementCount).Error; err != nil {
		t.Fatalf("failed to count movements: %v", err)
	}
	if movementCount != int64(success) {
		t.Fatalf("expected movement count %d, got %d", success, movementCount)
	}
}

func openTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	dsn := fmt.Sprintf("file:%s_%d?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "_"), time.Now().UnixNano())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Skipf("sqlite not available in this environment: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("failed to get sql db: %v", err)
	}
	sqlDB.SetMaxOpenConns(20)
	t.Cleanup(func() {
		_ = sqlDB.Close()
	})

	err = db.AutoMigrate(
		&outletModels.Outlet{},
		&categoryModels.Category{},
		&warehouseModels.Warehouse{},
		&productModels.Product{},
		&productModels.ProductStock{},
		&stockModels.StockMovement{},
	)
	if err != nil {
		if shouldSkipSQLiteErr(err) {
			t.Skipf("sqlite migrations unavailable in this environment: %v", err)
		}
		t.Fatalf("failed to automigrate test models: %v", err)
	}

	return db
}

func seedStockFixture(t *testing.T, db *gorm.DB, initialQty int) stockFixture {
	t.Helper()

	tenantID := uint(1)

	product := productModels.Product{
		TenantModel: sharedModels.TenantModel{TenantID: tenantID},
		Name:        "Test Product",
		SKU:         fmt.Sprintf("SKU-%d", time.Now().UnixNano()),
		Price:       10000,
		Cost:        6000,
		Taxable:     true,
		TrackStock:  true,
		Status:      "active",
	}
	if err := db.Create(&product).Error; err != nil {
		t.Fatalf("failed to create product: %v", err)
	}

	warehouse := warehouseModels.Warehouse{
		TenantModel: sharedModels.TenantModel{TenantID: tenantID},
		Code:      fmt.Sprintf("WH-%d", time.Now().UnixNano()),
		Name:      "Main Warehouse",
		Type:      "main",
		Status:    "active",
		IsDefault: true,
	}
	if err := db.Create(&warehouse).Error; err != nil {
		t.Fatalf("failed to create warehouse: %v", err)
	}

	now := time.Now()
	stock := productModels.ProductStock{
		TenantModel: sharedModels.TenantModel{TenantID: tenantID},
		ProductID:   product.ID,
		WarehouseID: warehouse.ID,
		Quantity:    initialQty,
		Reserved:    0,
		MinStock:    0,
		MaxStock:    0,
		LastUpdated: &now,
	}
	if err := db.Create(&stock).Error; err != nil {
		t.Fatalf("failed to create product stock: %v", err)
	}

	return stockFixture{
		tenantID:  tenantID,
		productID: product.ID,
		stockID:   stock.ID,
	}
}

func retryOnSQLiteLock(fn func() error) error {
	var err error
	for i := 0; i < 8; i++ {
		err = fn()
		if err == nil {
			return nil
		}
		if !isSQLiteLockErr(err) {
			return err
		}
		time.Sleep(10 * time.Millisecond)
	}
	return err
}

func isSQLiteLockErr(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "database is locked") || strings.Contains(msg, "database table is locked")
}

func shouldSkipSQLiteErr(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "build constraints exclude all go files") ||
		strings.Contains(msg, "binary was compiled with") ||
		strings.Contains(msg, "sqlite") && strings.Contains(msg, "cgo")
}
