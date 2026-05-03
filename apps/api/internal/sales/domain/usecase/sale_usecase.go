package usecase

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	sharedModels "gipos/api/internal/core/shared/models"
	outletRepo "gipos/api/internal/master-data/outlet/data/repositories"
	productRepo "gipos/api/internal/master-data/products/data/repositories"
	productStockRepo "gipos/api/internal/master-data/products/data/repositories"
	"gipos/api/internal/sales/data/models"
	"gipos/api/internal/sales/data/repositories"
	"gipos/api/internal/sales/domain/dto"
	stockService "gipos/api/internal/stock/domain/service"

	"gorm.io/gorm"
)

// Helper functions for ID conversion
func stringToUint(s string) (uint, error) {
	if s == "" {
		return 0, errors.New("empty string")
	}
	val, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(val), nil
}

func uintToString(u uint) string {
	return strconv.FormatUint(uint64(u), 10)
}

func stringPtrToUintPtr(s *string) (*uint, error) {
	if s == nil || *s == "" {
		return nil, nil
	}
	val, err := stringToUint(*s)
	if err != nil {
		return nil, err
	}
	return &val, nil
}

func uintPtrToStringPtr(u *uint) *string {
	if u == nil {
		return nil
	}
	s := uintToString(*u)
	return &s
}

func parseTimestamp(raw string) (time.Time, error) {
	parsed, err := time.Parse(time.RFC3339Nano, raw)
	if err == nil {
		return parsed.UTC(), nil
	}

	parsed, err = time.Parse(time.RFC3339, raw)
	if err == nil {
		return parsed.UTC(), nil
	}

	return time.Time{}, err
}

// SaleUsecase handles sale business logic
type SaleUsecase struct {
	saleRepo        *repositories.SaleRepository
	saleItemRepo    *repositories.SaleItemRepository
	productRepo     *productRepo.ProductRepository
	productStockRepo *productStockRepo.ProductStockRepository
	outletRepo      *outletRepo.OutletRepository
	shiftRepo       *repositories.ShiftRepository
	stockService    *stockService.StockService
	db              *gorm.DB
}

// NewSaleUsecase creates a new sale usecase
func NewSaleUsecase(
	saleRepo *repositories.SaleRepository,
	saleItemRepo *repositories.SaleItemRepository,
	productRepo *productRepo.ProductRepository,
	productStockRepo *productStockRepo.ProductStockRepository,
	outletRepo *outletRepo.OutletRepository,
	shiftRepo *repositories.ShiftRepository,
	stockService *stockService.StockService,
	db *gorm.DB,
) *SaleUsecase {
	return &SaleUsecase{
		saleRepo:        saleRepo,
		saleItemRepo:    saleItemRepo,
		productRepo:     productRepo,
		productStockRepo: productStockRepo,
		outletRepo:      outletRepo,
		shiftRepo:       shiftRepo,
		stockService:    stockService,
		db:              db,
	}
}

// CreateSale creates a new sale transaction
func (uc *SaleUsecase) CreateSale(tenantID string, req *dto.CreateSaleRequest, cashierID string) (*dto.SaleResponse, error) {
	// Convert tenantID from string to uint
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	// Convert cashierID from string to uint
	cashierIDUint, err := stringToUint(cashierID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	// Validate shift if provided
	var shiftIDUint *uint
	var shiftOutletIDUint *uint
	if req.ShiftID != nil && strings.TrimSpace(*req.ShiftID) != "" {
		normalizedShiftID := strings.TrimSpace(*req.ShiftID)
		shiftIDUint, err = stringPtrToUintPtr(&normalizedShiftID)
		if err != nil {
			return nil, errors.New("INVALID_SHIFT_ID")
		}
		shift, err := uc.shiftRepo.GetByID(tenantIDUint, *shiftIDUint)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("SHIFT_NOT_FOUND")
			}
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
		// Validate shift is open
		if shift.Status != models.ShiftStatusOpen {
			return nil, errors.New("SHIFT_NOT_OPEN")
		}

		shiftOutletIDUint = &shift.OutletID
	}

	normalizedOutletID := strings.TrimSpace(req.OutletID)
	var outletIDUint uint
	var outletCode string

	if normalizedOutletID != "" {
		outletIDUint, err = stringToUint(normalizedOutletID)
		if err != nil {
			return nil, errors.New("INVALID_OUTLET_ID")
		}

		outlet, err := uc.outletRepo.GetByID(tenantIDUint, outletIDUint)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("OUTLET_NOT_FOUND")
			}
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}

		if shiftOutletIDUint != nil && *shiftOutletIDUint != outletIDUint {
			return nil, errors.New("SHIFT_OUTLET_MISMATCH")
		}

		outletCode = outlet.Code
	} else if shiftOutletIDUint != nil {
		outletIDUint = *shiftOutletIDUint
		outlet, err := uc.outletRepo.GetByID(tenantIDUint, outletIDUint)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("OUTLET_NOT_FOUND")
			}
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}

		outletCode = outlet.Code
	} else {
		mainOutlet, err := uc.outletRepo.GetMainOutlet(tenantIDUint)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				outlets, _, listErr := uc.outletRepo.List(tenantIDUint, 1, 0, "", "")
				if listErr != nil {
					return nil, errors.New("INTERNAL_SERVER_ERROR")
				}
				if len(outlets) == 0 {
					return nil, errors.New("OUTLET_NOT_FOUND")
				}

				outletIDUint = outlets[0].ID
				outletCode = outlets[0].Code
			} else {
				return nil, errors.New("INTERNAL_SERVER_ERROR")
			}
		} else {
			outletIDUint = mainOutlet.ID
			outletCode = mainOutlet.Code
		}
	}

	if shiftIDUint == nil {
		// If shift not provided, try to get open shift for outlet.
		openShift, err := uc.shiftRepo.GetOpenShiftByOutlet(tenantIDUint, outletIDUint)
		if err == nil && openShift != nil {
			shiftIDUint = &openShift.ID
		}
		// If no open shift, continue without shift (optional for now)
	}

	// Validate items
	if len(req.Items) == 0 {
		return nil, errors.New("CART_EMPTY")
	}

	// Normalize incoming lines so repeated product clicks are treated as quantity increments.
	aggregatedItemByProduct := make(map[string]*dto.CreateSaleItemRequest, len(req.Items))
	productOrder := make([]string, 0, len(req.Items))
	for _, itemReq := range req.Items {
		if itemReq.ProductID == "" || itemReq.Quantity <= 0 {
			return nil, errors.New("INVALID_QUANTITY")
		}

		existing, exists := aggregatedItemByProduct[itemReq.ProductID]
		if !exists {
			cloned := itemReq
			aggregatedItemByProduct[itemReq.ProductID] = &cloned
			productOrder = append(productOrder, itemReq.ProductID)
			continue
		}

		existing.Quantity += itemReq.Quantity
		if existing.UnitPrice == nil && itemReq.UnitPrice != nil {
			unitPrice := *itemReq.UnitPrice
			existing.UnitPrice = &unitPrice
		}
		if itemReq.DiscountAmount != nil {
			if existing.DiscountAmount == nil {
				defaultDiscount := int64(0)
				existing.DiscountAmount = &defaultDiscount
			}
			*existing.DiscountAmount += *itemReq.DiscountAmount
		}
		if itemReq.DiscountPercent != nil {
			existing.DiscountPercent = itemReq.DiscountPercent
		}
	}

	normalizedItems := make([]dto.CreateSaleItemRequest, 0, len(productOrder))
	for _, productID := range productOrder {
		normalizedItems = append(normalizedItems, *aggregatedItemByProduct[productID])
	}

	// Process items
	var saleItems []models.SaleItem
	var subtotal int64 = 0
	var totalDiscountAmount int64 = 0
	var totalTaxAmount int64 = 0

	for _, itemReq := range normalizedItems {
		// Convert productID from string to uint
		productIDUint, err := stringToUint(itemReq.ProductID)
		if err != nil {
			return nil, errors.New("INVALID_PRODUCT_ID")
		}

		// Get product
		product, err := uc.productRepo.GetByID(tenantIDUint, productIDUint)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("PRODUCT_NOT_FOUND")
			}
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}

		// Validate product is active
		if product.Status != "active" {
			return nil, errors.New("PRODUCT_NOT_ACTIVE")
		}

		// Validate quantity
		if itemReq.Quantity <= 0 {
			return nil, errors.New("INVALID_QUANTITY")
		}

		// Get unit price (use provided or product price)
		unitPrice := product.Price
		if itemReq.UnitPrice != nil && *itemReq.UnitPrice > 0 {
			unitPrice = *itemReq.UnitPrice
		}

		// Calculate item amounts
		itemSubtotal := int64(itemReq.Quantity) * unitPrice
		itemDiscountAmount := int64(0)
		if itemReq.DiscountAmount != nil {
			itemDiscountAmount = *itemReq.DiscountAmount
		} else if itemReq.DiscountPercent != nil {
			itemDiscountAmount = int64(float64(itemSubtotal) * (*itemReq.DiscountPercent) / 100.0)
		}
		// Ensure discount doesn't exceed subtotal
		if itemDiscountAmount > itemSubtotal {
			itemDiscountAmount = itemSubtotal
		}

		itemAfterDiscount := itemSubtotal - itemDiscountAmount
		itemTaxAmount := int64(0)
		itemTotal := itemAfterDiscount + itemTaxAmount

		// Create sale item
		saleItem := models.SaleItem{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantIDUint,
			},
			ProductID:      productIDUint,
			ProductName:    product.Name,
			ProductSKU:     product.SKU,
			Quantity:       itemReq.Quantity,
			UnitPrice:      unitPrice,
			DiscountAmount: itemDiscountAmount,
			DiscountPercent: 0,
			TaxAmount:      itemTaxAmount,
			Subtotal:       itemSubtotal,
			Total:          itemTotal,
		}
		if itemReq.DiscountPercent != nil {
			saleItem.DiscountPercent = *itemReq.DiscountPercent
		}

		saleItems = append(saleItems, saleItem)
		subtotal += itemSubtotal
		totalDiscountAmount += itemDiscountAmount
		totalTaxAmount += itemTaxAmount
	}

	// Apply sale-level discount if provided
	if req.DiscountAmount != nil && *req.DiscountAmount > 0 {
		totalDiscountAmount += *req.DiscountAmount
	} else if req.DiscountPercent != nil && *req.DiscountPercent > 0 {
		discountAmount := int64(float64(subtotal) * (*req.DiscountPercent) / 100.0)
		totalDiscountAmount += discountAmount
	}
	// Ensure total discount doesn't exceed subtotal
	if totalDiscountAmount > subtotal {
		totalDiscountAmount = subtotal
	}

	// Calculate final total
	finalSubtotal := subtotal - totalDiscountAmount
	total := finalSubtotal

	// Calculate discount percent
	discountPercent := float64(0)
	if subtotal > 0 {
		discountPercent = float64(totalDiscountAmount) / float64(subtotal) * 100.0
	}

	occurredAt := time.Now().UTC()
	if req.OccurredAt != nil && strings.TrimSpace(*req.OccurredAt) != "" {
		parsedAt, err := parseTimestamp(strings.TrimSpace(*req.OccurredAt))
		if err != nil {
			return nil, errors.New("INVALID_DATE")
		}
		occurredAt = parsedAt
	}

	// Generate invoice number
	dateStr := occurredAt.Format("20060102")
	// Get sequence number for today
	var sequence int
	var lastSale models.Sale
	err = uc.db.Where("tenant_id = ? AND outlet_id = ? AND invoice_number LIKE ?", tenantIDUint, outletIDUint, fmt.Sprintf("INV-%s-%s-%%", dateStr, outletCode)).
		Order("invoice_number DESC").
		Limit(1).
		Find(&lastSale).Error
	if err == nil && lastSale.ID != 0 {
		// Extract sequence from last invoice number
		// Format: INV-YYYYMMDD-OUTLETCODE-SEQUENCE
		if len(lastSale.InvoiceNumber) > len(fmt.Sprintf("INV-%s-%s-", dateStr, outletCode)) {
			seqStr := lastSale.InvoiceNumber[len(fmt.Sprintf("INV-%s-%s-", dateStr, outletCode)):]
			if seq, err := strconv.Atoi(seqStr); err == nil {
				sequence = seq + 1
			} else {
				sequence = 1
			}
		} else {
			sequence = 1
		}
	} else {
		sequence = 1
	}
	invoiceNumber := fmt.Sprintf("INV-%s-%s-%04d", dateStr, outletCode, sequence)

	// Convert customerID from string to uint if provided
	var customerIDUint *uint
	if req.CustomerID != nil && *req.CustomerID != "" {
		customerIDUint, err = stringPtrToUintPtr(req.CustomerID)
		if err != nil {
			return nil, errors.New("INVALID_CUSTOMER_ID")
		}
	}

	// Create sale in transaction
	var sale *models.Sale
	err = uc.db.Transaction(func(tx *gorm.DB) error {
		// Create sale
		sale = &models.Sale{
			TenantModel: sharedModels.TenantModel{
				BaseModel: sharedModels.BaseModel{
					CreatedAt: occurredAt,
					UpdatedAt: occurredAt,
				},
				TenantID: tenantIDUint,
			},
			OutletID:       outletIDUint,
			ShiftID:        shiftIDUint,
			InvoiceNumber:  invoiceNumber,
			CustomerID:     customerIDUint,
			CashierID:      cashierIDUint,
			Subtotal:       subtotal,
			DiscountAmount: totalDiscountAmount,
			DiscountPercent: discountPercent,
			TaxAmount:      totalTaxAmount,
			Total:          total,
			PaymentMethod:  req.PaymentMethod,
			PaymentStatus:  models.PaymentStatusPending,
			Status:         models.SaleStatusPending,
			Notes:          req.Notes,
		}

		if err := tx.Create(sale).Error; err != nil {
			return err
		}

		// Create sale items
		for i := range saleItems {
			saleItems[i].SaleID = sale.ID
		}
		if err := tx.Create(&saleItems).Error; err != nil {
			return err
		}

		var persistedTotals struct {
			Subtotal       int64 `gorm:"column:subtotal"`
			DiscountAmount int64 `gorm:"column:discount_amount"`
			TaxAmount      int64 `gorm:"column:tax_amount"`
			Total          int64 `gorm:"column:total"`
		}
		if err := tx.Table("sale_items").
			Where("tenant_id = ? AND sale_id = ? AND deleted_at IS NULL", tenantIDUint, sale.ID).
			Select("COALESCE(SUM(subtotal), 0) AS subtotal, COALESCE(SUM(discount_amount), 0) AS discount_amount, COALESCE(SUM(tax_amount), 0) AS tax_amount, COALESCE(SUM(total), 0) AS total").
			Scan(&persistedTotals).Error; err != nil {
			return err
		}

		if persistedTotals.Subtotal != sale.Subtotal || persistedTotals.TaxAmount != sale.TaxAmount {
			return errors.New("ITEMS_TOTAL_MISMATCH")
		}

		if sale.DiscountAmount < persistedTotals.DiscountAmount {
			return errors.New("ITEMS_TOTAL_MISMATCH")
		}

		saleLevelDiscountAmount := sale.DiscountAmount - persistedTotals.DiscountAmount
		expectedSaleTotal := persistedTotals.Total - saleLevelDiscountAmount
		if expectedSaleTotal != sale.Total {
			return errors.New("ITEMS_TOTAL_MISMATCH")
		}

		return nil
	})

	if err != nil {
		switch err.Error() {
		case "ITEMS_TOTAL_MISMATCH":
			return nil, errors.New(err.Error())
		default:
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
	}

	// Reload sale with relations
	sale, err = uc.saleRepo.GetByID(tenantIDUint, sale.ID)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toSaleResponse(sale), nil
}

// GetSaleByID retrieves a sale by ID
func (uc *SaleUsecase) GetSaleByID(tenantID, id string) (*dto.SaleResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_SALE_ID")
	}

	sale, err := uc.saleRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("SALE_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toSaleResponse(sale), nil
}

// ListSales retrieves a list of sales with pagination
func (uc *SaleUsecase) ListSales(tenantID string, outletID *string, shiftID *string, status *string, paymentStatus *string, paymentMethod *string, startDate *string, endDate *string, page, perPage int) ([]dto.SaleResponse, int64, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, 0, errors.New("INVALID_TENANT_ID")
	}

	var outletIDUint *uint
	if outletID != nil && *outletID != "" {
		outletIDUint, err = stringPtrToUintPtr(outletID)
		if err != nil {
			return nil, 0, errors.New("INVALID_OUTLET_ID")
		}
	}

	var shiftIDUint *uint
	if shiftID != nil && *shiftID != "" {
		shiftIDUint, err = stringPtrToUintPtr(shiftID)
		if err != nil {
			return nil, 0, errors.New("INVALID_SHIFT_ID")
		}
	}

	var startDateParsed *time.Time
	if startDate != nil && *startDate != "" {
		parsed, err := time.Parse("2006-01-02", *startDate)
		if err == nil {
			startDateParsed = &parsed
		}
	}

	var endDateParsed *time.Time
	if endDate != nil && *endDate != "" {
		parsed, err := time.Parse("2006-01-02", *endDate)
		if err == nil {
			// Set to end of day
			parsed = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 23, 59, 59, 999999999, parsed.Location())
			endDateParsed = &parsed
		}
	}

	limit := perPage
	offset := (page - 1) * perPage

	sales, total, err := uc.saleRepo.List(tenantIDUint, outletIDUint, shiftIDUint, status, paymentStatus, paymentMethod, startDateParsed, endDateParsed, limit, offset)
	if err != nil {
		return nil, 0, errors.New("INTERNAL_SERVER_ERROR")
	}

	responses := make([]dto.SaleResponse, len(sales))
	for i, sale := range sales {
		responses[i] = *toSaleResponse(&sale)
	}

	return responses, total, nil
}

// UpdateSale edits mutable sale fields (items, payment method, notes, status) and recalculates totals.
func (uc *SaleUsecase) UpdateSale(tenantID, id string, req *dto.UpdateSaleRequest) (*dto.SaleResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_SALE_ID")
	}

	sale, err := uc.saleRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("SALE_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	if sale.Status == models.SaleStatusCancelled || sale.Status == models.SaleStatusRefunded {
		return nil, errors.New("SALE_UPDATE_NOT_ALLOWED")
	}

	oldItemsDiscount := int64(0)
	existingProductIDs := make(map[uint]struct{}, len(sale.Items))
	for _, item := range sale.Items {
		oldItemsDiscount += item.DiscountAmount
		existingProductIDs[item.ProductID] = struct{}{}
	}
	globalDiscount := sale.DiscountAmount - oldItemsDiscount
	if globalDiscount < 0 {
		globalDiscount = 0
	}

	newSaleItems := make([]models.SaleItem, 0)
	newSubtotal := sale.Subtotal
	newItemsDiscount := oldItemsDiscount
	newTaxAmount := sale.TaxAmount

	if len(req.Items) > 0 {
		aggregatedItemByProduct := make(map[string]*dto.CreateSaleItemRequest, len(req.Items))
		productOrder := make([]string, 0, len(req.Items))

		for _, itemReq := range req.Items {
			if itemReq.ProductID == "" || itemReq.Quantity <= 0 {
				return nil, errors.New("INVALID_QUANTITY")
			}

			existing, exists := aggregatedItemByProduct[itemReq.ProductID]
			if !exists {
				cloned := itemReq
				aggregatedItemByProduct[itemReq.ProductID] = &cloned
				productOrder = append(productOrder, itemReq.ProductID)
				continue
			}

			existing.Quantity += itemReq.Quantity
			if existing.UnitPrice == nil && itemReq.UnitPrice != nil {
				unitPrice := *itemReq.UnitPrice
				existing.UnitPrice = &unitPrice
			}
			if itemReq.DiscountAmount != nil {
				if existing.DiscountAmount == nil {
					defaultDiscount := int64(0)
					existing.DiscountAmount = &defaultDiscount
				}
				*existing.DiscountAmount += *itemReq.DiscountAmount
			}
			if itemReq.DiscountPercent != nil {
				existing.DiscountPercent = itemReq.DiscountPercent
			}
		}

		normalizedItems := make([]dto.CreateSaleItemRequest, 0, len(productOrder))
		for _, productID := range productOrder {
			normalizedItems = append(normalizedItems, *aggregatedItemByProduct[productID])
		}

		newSaleItems = make([]models.SaleItem, 0, len(normalizedItems))
		newSubtotal = 0
		newItemsDiscount = 0
		newTaxAmount = 0

		for _, itemReq := range normalizedItems {
			productIDUint, convErr := stringToUint(itemReq.ProductID)
			if convErr != nil {
				return nil, errors.New("INVALID_PRODUCT_ID")
			}

			product, productErr := uc.productRepo.GetByID(tenantIDUint, productIDUint)
			if productErr != nil {
				if errors.Is(productErr, gorm.ErrRecordNotFound) {
					return nil, errors.New("PRODUCT_NOT_FOUND")
				}
				return nil, errors.New("INTERNAL_SERVER_ERROR")
			}

			if product.Status != "active" {
				if _, existsInOriginalSale := existingProductIDs[product.ID]; !existsInOriginalSale {
					return nil, errors.New("PRODUCT_INACTIVE")
				}
			}

			unitPrice := product.Price
			if itemReq.UnitPrice != nil {
				if *itemReq.UnitPrice < 0 {
					return nil, errors.New("INVALID_PRICE")
				}
				unitPrice = *itemReq.UnitPrice
			}

			itemSubtotal := int64(itemReq.Quantity) * unitPrice

			itemDiscountAmount := int64(0)
			if itemReq.DiscountAmount != nil {
				itemDiscountAmount = *itemReq.DiscountAmount
			}
			if itemReq.DiscountPercent != nil {
				itemDiscountAmount = int64(float64(itemSubtotal) * (*itemReq.DiscountPercent) / 100.0)
			}
			if itemDiscountAmount > itemSubtotal {
				itemDiscountAmount = itemSubtotal
			}

			itemAfterDiscount := itemSubtotal - itemDiscountAmount

			saleItem := models.SaleItem{
				TenantModel: sharedModels.TenantModel{TenantID: tenantIDUint},
				SaleID:      sale.ID,
				ProductID:   product.ID,
				ProductName: product.Name,
				ProductSKU:  product.SKU,
				Quantity:    itemReq.Quantity,
				UnitPrice:   unitPrice,
				DiscountAmount:  itemDiscountAmount,
				DiscountPercent: 0,
				TaxAmount:       0,
				Subtotal:        itemSubtotal,
				Total:           itemAfterDiscount,
			}

			newSaleItems = append(newSaleItems, saleItem)
			newSubtotal += itemSubtotal
			newItemsDiscount += itemDiscountAmount
		}
	}

	newDiscountAmount := newItemsDiscount + globalDiscount
	if newDiscountAmount > newSubtotal {
		newDiscountAmount = newSubtotal
	}
	newTotal := newSubtotal - newDiscountAmount + newTaxAmount

	err = uc.db.Transaction(func(tx *gorm.DB) error {
		sale.Subtotal = newSubtotal
		sale.DiscountAmount = newDiscountAmount
		sale.TaxAmount = newTaxAmount
		sale.Total = newTotal

		if req.Notes != nil {
			sale.Notes = strings.TrimSpace(*req.Notes)
		}
		if req.PaymentMethod != nil {
			sale.PaymentMethod = strings.TrimSpace(*req.PaymentMethod)
		}
		if req.Status != nil {
			sale.Status = strings.TrimSpace(*req.Status)
		}

		if len(req.Items) > 0 {
			oldQtyByProduct := make(map[uint]int, len(sale.Items))
			for _, oldItem := range sale.Items {
				oldQtyByProduct[oldItem.ProductID] += oldItem.Quantity
			}

			newQtyByProduct := make(map[uint]int, len(newSaleItems))
			for _, newItem := range newSaleItems {
				newQtyByProduct[newItem.ProductID] += newItem.Quantity
			}

			// Stock adjustments during sale edit are disabled per request.
			// Previously we applied stockService.ApplyStockChange here to reverse and reapply stock deltas.
			// Skipping stock mutations ensures edits won't fail due to inventory constraints.

			if err := tx.Where("tenant_id = ? AND sale_id = ?", tenantIDUint, sale.ID).Delete(&models.SaleItem{}).Error; err != nil {
				return err
			}
			if len(newSaleItems) > 0 {
				if err := tx.Create(&newSaleItems).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Omit("Outlet", "Cashier", "Items", "Payment").Save(sale).Error; err != nil {
			return err
		}

		paymentUpdates := map[string]interface{}{
			"amount": newTotal,
		}
		if req.PaymentMethod != nil {
			paymentUpdates["method"] = strings.TrimSpace(*req.PaymentMethod)
		}

		if err := tx.Model(&models.Payment{}).
			Where("tenant_id = ? AND sale_id = ? AND deleted_at IS NULL", tenantIDUint, sale.ID).
			Updates(paymentUpdates).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		switch err.Error() {
		case "INSUFFICIENT_STOCK", "STOCK_NEGATIVE", "INVALID_PRICE", "PRODUCT_INACTIVE", "INVALID_PRODUCT_ID", "INVALID_QUANTITY":
			return nil, errors.New(err.Error())
		default:
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
	}

	updatedSale, err := uc.saleRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toSaleResponse(updatedSale), nil
}

// VoidSale voids a sale (before payment)
func (uc *SaleUsecase) VoidSale(tenantID, id string, _ string) error {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return errors.New("INVALID_SALE_ID")
	}

	sale, err := uc.saleRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("SALE_NOT_FOUND")
		}
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	// Validate sale can be voided
	// Allow voiding even if the sale was already paid/completed.
	// Only disallow if the sale is already cancelled.
	if sale.Status == models.SaleStatusCancelled {
		return errors.New("VOID_NOT_ALLOWED")
	}

	// Void sale
	now := time.Now()
	err = uc.db.Transaction(func(tx *gorm.DB) error {
		// Update sale status
		sale.Status = models.SaleStatusCancelled
		sale.CancelledAt = &now
		if err := tx.Save(sale).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	return nil
}

// toSaleResponse converts sale model to response DTO
func toSaleResponse(sale *models.Sale) *dto.SaleResponse {
	resp := &dto.SaleResponse{
		ID:              uintToString(sale.ID),
		OutletID:        uintToString(sale.OutletID),
		ShiftID:         uintPtrToStringPtr(sale.ShiftID),
		InvoiceNumber:   sale.InvoiceNumber,
		CustomerID:      uintPtrToStringPtr(sale.CustomerID),
		CashierID:       uintToString(sale.CashierID),
		Subtotal:        sale.Subtotal,
		DiscountAmount:  sale.DiscountAmount,
		DiscountPercent: sale.DiscountPercent,
		TaxAmount:       sale.TaxAmount,
		Total:           sale.Total,
		PaymentMethod:   sale.PaymentMethod,
		PaymentStatus:   sale.PaymentStatus,
		Status:          sale.Status,
		Notes:           sale.Notes,
		CreatedAt:       sale.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt:       sale.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}

	if sale.CompletedAt != nil {
		completedAt := sale.CompletedAt.Format("2006-01-02T15:04:05+07:00")
		resp.CompletedAt = &completedAt
	}
	if sale.PaidAt != nil {
		paidAt := sale.PaidAt.Format("2006-01-02T15:04:05+07:00")
		resp.PaidAt = &paidAt
	}
	if sale.CancelledAt != nil {
		cancelledAt := sale.CancelledAt.Format("2006-01-02T15:04:05+07:00")
		resp.CancelledAt = &cancelledAt
	}

	// Include outlet if loaded
	if sale.Outlet != nil {
		resp.Outlet = &dto.OutletReference{
			ID:   uintToString(sale.Outlet.ID),
			Code: sale.Outlet.Code,
			Name: sale.Outlet.Name,
		}
	}

	// Include cashier if loaded
	if sale.Cashier != nil {
		resp.Cashier = &dto.CashierReference{
			ID:    uintToString(sale.Cashier.ID),
			Name:  sale.Cashier.Name,
			Email: sale.Cashier.Email,
		}
	}

	// Include items if loaded
	if len(sale.Items) > 0 {
		resp.Items = make([]dto.SaleItemResponse, len(sale.Items))
		for i, item := range sale.Items {
			resp.Items[i] = dto.SaleItemResponse{
				ID:              uintToString(item.ID),
				ProductID:       uintToString(item.ProductID),
				ProductName:     item.ProductName,
				ProductSKU:      item.ProductSKU,
				Quantity:        item.Quantity,
				UnitPrice:       item.UnitPrice,
				DiscountAmount:  item.DiscountAmount,
				DiscountPercent: item.DiscountPercent,
				TaxAmount:       item.TaxAmount,
				Subtotal:        item.Subtotal,
				Total:           item.Total,
			}
			if item.Product != nil {
				resp.Items[i].Product = &dto.ProductReference{
					ID:    uintToString(item.Product.ID),
					Name:  item.Product.Name,
					SKU:   item.Product.SKU,
					Price: item.Product.Price,
				}
			}
		}
	}

	// Include payment if loaded
	if sale.Payment != nil {
		resp.Payment = toPaymentResponse(sale.Payment)
	}

	return resp
}

// toPaymentResponse converts payment model to response DTO (helper function)
func toPaymentResponse(payment *models.Payment) *dto.PaymentResponse {
	resp := &dto.PaymentResponse{
		ID:        uintToString(payment.ID),
		SaleID:    uintToString(payment.SaleID),
		Method:    payment.Method,
		Amount:    payment.Amount,
		Status:    payment.Status,
		Gateway:   payment.Gateway,
		GatewayID: payment.GatewayID,
		CreatedAt: payment.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt: payment.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}

	if payment.QRCodeURL != nil {
		resp.QRCodeURL = payment.QRCodeURL
	}
	if payment.QRISExpiredAt != nil {
		expiredAt := payment.QRISExpiredAt.Format("2006-01-02T15:04:05+07:00")
		resp.QRISExpiredAt = &expiredAt
	}
	if payment.EWalletType != nil {
		resp.EWalletType = payment.EWalletType
	}
	if payment.PaymentLink != nil {
		resp.PaymentLink = payment.PaymentLink
	}
	if payment.BankName != nil {
		resp.BankName = payment.BankName
	}
	if payment.AccountNumber != nil {
		resp.AccountNumber = payment.AccountNumber
	}
	if payment.CardType != nil {
		resp.CardType = payment.CardType
	}
	if payment.CardLast4 != nil {
		resp.CardLast4 = payment.CardLast4
	}
	if payment.PaidAt != nil {
		paidAt := payment.PaidAt.Format("2006-01-02T15:04:05+07:00")
		resp.PaidAt = &paidAt
	}
	if payment.FailedAt != nil {
		failedAt := payment.FailedAt.Format("2006-01-02T15:04:05+07:00")
		resp.FailedAt = &failedAt
	}
	if payment.FailureReason != "" {
		resp.FailureReason = payment.FailureReason
	}

	return resp
}
