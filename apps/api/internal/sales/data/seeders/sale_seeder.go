package seeders

import (
	"fmt"
	"log"
	"time"

	authModels "gipos/api/internal/auth/data/models"
	sharedModels "gipos/api/internal/core/shared/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	productModels "gipos/api/internal/master-data/products/data/models"
	salesModels "gipos/api/internal/sales/data/models"
	stockModels "gipos/api/internal/stock/data/models"
	stockService "gipos/api/internal/stock/domain/service"

	"gorm.io/gorm"
)

// RunSeeders runs all sales seeders.
func RunSeeders(db *gorm.DB) {
	var tenant sharedModels.Tenant
	if err := db.Where("email = ?", "admin@gipos.id").First(&tenant).Error; err != nil {
		log.Printf("⚠️  WARNING: Could not find tenant, skipping sales seeder: %v", err)
		return
	}

	seeder := &SaleSeeder{
		db:           db,
		stockService: stockService.NewStockService(),
	}
	if err := seeder.Seed(tenant.ID); err != nil {
		log.Printf("❌ Sales seeder failed: %v", err)
	}
}

// SaleSeeder handles realistic sales transaction seeding.
type SaleSeeder struct {
	db           *gorm.DB
	stockService *stockService.StockService
}

// Seed seeds closed/open shift and completed sales with stock updates via centralized stock service.
func (s *SaleSeeder) Seed(tenantID uint) error {
	log.Println("🌱 Seeding sales transactions...")

	var existingCount int64
	if err := s.db.Model(&salesModels.Sale{}).
		Where("tenant_id = ? AND invoice_number LIKE ?", tenantID, "SEED-INV-%").
		Count(&existingCount).Error; err != nil {
		return err
	}
	if existingCount > 0 {
		log.Println("⚠️  Seeded sales already exist, skipping sales seeder")
		return nil
	}

	var cashier authModels.User
	if err := s.db.Where("tenant_id = ? AND email = ? AND deleted_at IS NULL", tenantID, "cashier@gipos.id").First(&cashier).Error; err != nil {
		log.Printf("⚠️  Cashier user not found, skipping sales seeder: %v", err)
		return nil
	}

	var outlet outletModels.Outlet
	if err := s.db.Where("tenant_id = ? AND status = ? AND deleted_at IS NULL", tenantID, "active").Order("id ASC").First(&outlet).Error; err != nil {
		log.Printf("⚠️  Active outlet not found, skipping sales seeder: %v", err)
		return nil
	}

	var products []productModels.Product
	if err := s.db.Where("tenant_id = ? AND track_stock = ? AND status = ? AND deleted_at IS NULL", tenantID, true, "active").Order("id ASC").Limit(2).Find(&products).Error; err != nil {
		return err
	}
	if len(products) < 2 {
		log.Println("⚠️  Not enough trackable products, skipping sales seeder")
		return nil
	}

	now := time.Now()
	closedOpening := now.Add(-26 * time.Hour)
	closedAt := now.Add(-18 * time.Hour)
	openShiftTime := now.Add(-2 * time.Hour)

	type itemScenario struct {
		product  productModels.Product
		quantity int
	}
	type saleScenario struct {
		paymentMethod string
		items         []itemScenario
	}

	scenarios := []saleScenario{
		{
			paymentMethod: salesModels.PaymentMethodCash,
			items: []itemScenario{
				{product: products[0], quantity: 2},
				{product: products[1], quantity: 1},
			},
		},
		{
			paymentMethod: salesModels.PaymentMethodQRIS,
			items: []itemScenario{
				{product: products[0], quantity: 1},
				{product: products[1], quantity: 2},
			},
		},
	}

	createdSales := 0
	err := s.db.Transaction(func(tx *gorm.DB) error {
		closedShift := salesModels.Shift{
			TenantModel: sharedModels.TenantModel{TenantID: tenantID},
			OutletID:    outlet.ID,
			UserID:      cashier.ID,
			ShiftNumber: fmt.Sprintf("SEED-SHIFT-CLOSED-%d", now.Unix()),
			Status:      salesModels.ShiftStatusClosed,
			OpeningCash: 500000,
			OpeningTime: closedOpening,
		}
		if err := tx.Create(&closedShift).Error; err != nil {
			return err
		}

		var totalSales int64
		var cashSales int64
		var nonCashSales int64
		var totalTransactions int

		for i, scenario := range scenarios {
			invoice := fmt.Sprintf("SEED-INV-%d-%02d", now.Unix(), i+1)
			paidAt := now.Add(-time.Duration(10-i) * time.Hour)

			var subtotal int64
			items := make([]salesModels.SaleItem, 0, len(scenario.items))
			for _, si := range scenario.items {
				lineSubtotal := int64(si.quantity) * si.product.Price
				subtotal += lineSubtotal

				items = append(items, salesModels.SaleItem{
					TenantModel: sharedModels.TenantModel{TenantID: tenantID},
					ProductID:      si.product.ID,
					ProductName:    si.product.Name,
					ProductSKU:     si.product.SKU,
					Quantity:       si.quantity,
					UnitPrice:      si.product.Price,
					DiscountAmount: 0,
					DiscountPercent: 0,
					TaxAmount:      0,
					Subtotal:       lineSubtotal,
					Total:          lineSubtotal,
				})
			}

			sale := salesModels.Sale{
				TenantModel: sharedModels.TenantModel{TenantID: tenantID},
				OutletID:      outlet.ID,
				ShiftID:       &closedShift.ID,
				InvoiceNumber: invoice,
				CashierID:     cashier.ID,
				Subtotal:      subtotal,
				DiscountAmount: 0,
				DiscountPercent: 0,
				TaxAmount:      0,
				Total:          subtotal,
				PaymentMethod:  scenario.paymentMethod,
				PaymentStatus:  salesModels.PaymentStatusCompleted,
				Status:         salesModels.SaleStatusCompleted,
				Notes:          "Seeded completed sale",
				PaidAt:         &paidAt,
				CompletedAt:    &paidAt,
			}
			if err := tx.Create(&sale).Error; err != nil {
				return err
			}

			for idx := range items {
				items[idx].SaleID = sale.ID
			}
			if err := tx.Create(&items).Error; err != nil {
				return err
			}

			payment := salesModels.Payment{
				TenantModel:      sharedModels.TenantModel{TenantID: tenantID},
				SaleID:           sale.ID,
				Method:           scenario.paymentMethod,
				Amount:           subtotal,
				Status:           salesModels.PaymentStatusCompleted,
				GatewayResponse:  "{}",
				PaidAt:           &paidAt,
			}
			if err := tx.Create(&payment).Error; err != nil {
				return err
			}

			for _, item := range items {
				idempotencyKey := fmt.Sprintf("seed:sale:%d:item:%d", sale.ID, item.ProductID)
				if err := s.stockService.ApplyStockChange(tx, stockService.ApplyStockChangeRequest{
					TenantID:       tenantID,
					ProductID:      item.ProductID,
					Delta:          -item.Quantity,
					ReferenceType:  stockModels.StockMovementRefSale,
					ReferenceID:    &sale.ID,
					IdempotencyKey: &idempotencyKey,
					Notes:          "Seeded sale deduction",
					MovementDate:   paidAt,
					CreatedBy:      &cashier.ID,
				}); err != nil {
					return err
				}
			}

			totalSales += subtotal
			totalTransactions++
			if scenario.paymentMethod == salesModels.PaymentMethodCash {
				cashSales += subtotal
			} else {
				nonCashSales += subtotal
			}
			createdSales++
		}

		expectedCash := closedShift.OpeningCash + cashSales
		closingCash := expectedCash
		difference := int64(0)
		closedShift.TotalSales = totalSales
		closedShift.TotalTransactions = totalTransactions
		closedShift.CashSales = cashSales
		closedShift.NonCashSales = nonCashSales
		closedShift.ExpectedCash = &expectedCash
		closedShift.ClosingCash = &closingCash
		closedShift.Difference = &difference
		closedShift.ClosingTime = &closedAt
		closedShift.ClosingNotes = "Seeded closed shift"
		if err := tx.Save(&closedShift).Error; err != nil {
			return err
		}

		openShift := salesModels.Shift{
			TenantModel: sharedModels.TenantModel{TenantID: tenantID},
			OutletID:    outlet.ID,
			UserID:      cashier.ID,
			ShiftNumber: fmt.Sprintf("SEED-SHIFT-OPEN-%d", now.Unix()),
			Status:      salesModels.ShiftStatusOpen,
			OpeningCash: 300000,
			OpeningTime: openShiftTime,
			OpeningNotes: "Seeded open shift",
		}
		if err := tx.Create(&openShift).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return err
	}

	log.Printf("✅ Sales seeding completed: %d sale(s) created with stock deductions", createdSales)
	return nil
}
