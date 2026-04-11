package service

import (
	"errors"
	"time"

	sharedModels "gipos/api/internal/core/shared/models"
	productModels "gipos/api/internal/master-data/products/data/models"
	stockModels "gipos/api/internal/stock/data/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ApplyStockChangeRequest describes a stock mutation request.
type ApplyStockChangeRequest struct {
	TenantID      uint
	ProductID     uint
	Delta         int
	StockID       *uint
	ReferenceType string
	ReferenceID   *uint
	IdempotencyKey *string
	Notes         string
	MovementDate  time.Time
	CreatedBy     *uint
}

// SetStockQuantityRequest describes an absolute stock update on a specific stock row.
type SetStockQuantityRequest struct {
	TenantID        uint
	StockID         uint
	TargetQuantity  int
	ReferenceType   string
	ReferenceID     *uint
	IdempotencyKey  *string
	Notes           string
	MovementDate    time.Time
	CreatedBy       *uint
}

// StockService centralizes stock mutations and movement logging.
type StockService struct{}

// NewStockService creates a stock service.
func NewStockService() *StockService {
	return &StockService{}
}

// ApplyStockChange applies a stock delta and writes stock movement logs atomically.
func (s *StockService) ApplyStockChange(tx *gorm.DB, req ApplyStockChangeRequest) error {
	if tx == nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}
	if req.Delta == 0 {
		return nil
	}
	if req.ReferenceType == "" {
		return errors.New("INTERNAL_SERVER_ERROR")
	}
	if req.MovementDate.IsZero() {
		req.MovementDate = time.Now()
	}
	if req.IdempotencyKey != nil {
		exists, err := s.hasIdempotentMovement(tx, req.TenantID, *req.IdempotencyKey)
		if err != nil {
			return err
		}
		if exists {
			return nil
		}
	}
	if req.StockID != nil {
		return s.applyByStockID(tx, req)
	}

	var stocks []productModels.ProductStock
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("tenant_id = ? AND product_id = ? AND deleted_at IS NULL", req.TenantID, req.ProductID).
		Order("warehouse_id ASC").
		Find(&stocks).Error
	if err != nil {
		return err
	}
	if len(stocks) == 0 {
		return errors.New("INSUFFICIENT_STOCK")
	}

	if req.Delta < 0 {
		return s.applyDecrease(tx, stocks, req)
	}

	return s.applyIncrease(tx, stocks[0], req)
}

// SetStockQuantity sets an absolute quantity on a single stock row and writes a movement log.
func (s *StockService) SetStockQuantity(tx *gorm.DB, req SetStockQuantityRequest) error {
	if tx == nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}
	if req.ReferenceType == "" {
		return errors.New("INTERNAL_SERVER_ERROR")
	}
	if req.TargetQuantity < 0 {
		return errors.New("STOCK_NEGATIVE")
	}
	if req.MovementDate.IsZero() {
		req.MovementDate = time.Now()
	}
	if req.IdempotencyKey != nil {
		exists, err := s.hasIdempotentMovement(tx, req.TenantID, *req.IdempotencyKey)
		if err != nil {
			return err
		}
		if exists {
			return nil
		}
	}

	var stock productModels.ProductStock
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", req.StockID, req.TenantID).
		First(&stock).Error
	if err != nil {
		return err
	}

	balanceBefore := stock.Quantity
	delta := req.TargetQuantity - balanceBefore
	if delta == 0 {
		return nil
	}

	balanceAfter := req.TargetQuantity
	if balanceAfter < 0 {
		return errors.New("STOCK_NEGATIVE")
	}

	if err := tx.Model(&productModels.ProductStock{}).
		Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", stock.ID, req.TenantID).
		Updates(map[string]interface{}{
			"quantity":     balanceAfter,
			"last_updated": req.MovementDate,
		}).Error; err != nil {
		return err
	}

	movementType := stockModels.StockMovementTypeIn
	if delta < 0 {
		movementType = stockModels.StockMovementTypeOut
	}

	movement := stockModels.StockMovement{
		TenantModel: sharedModels.TenantModel{
			TenantID: req.TenantID,
		},
		ProductID:      stock.ProductID,
		WarehouseID:    stock.WarehouseID,
		Type:           movementType,
		Quantity:       delta,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   balanceAfter,
		ReferenceType:  req.ReferenceType,
		ReferenceID:    req.ReferenceID,
		IdempotencyKey: req.IdempotencyKey,
		Notes:          req.Notes,
		MovementDate:   req.MovementDate,
		CreatedBy:      req.CreatedBy,
	}
	if err := tx.Create(&movement).Error; err != nil {
		return err
	}

	return nil
}

func (s *StockService) applyDecrease(tx *gorm.DB, stocks []productModels.ProductStock, req ApplyStockChangeRequest) error {
	remaining := -req.Delta

	for _, stock := range stocks {
		if remaining <= 0 {
			break
		}
		if stock.Quantity <= 0 {
			continue
		}

		deductQty := remaining
		if stock.Quantity < deductQty {
			deductQty = stock.Quantity
		}

		balanceBefore := stock.Quantity
		balanceAfter := balanceBefore - deductQty

		if err := tx.Model(&productModels.ProductStock{}).
			Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", stock.ID, req.TenantID).
			Updates(map[string]interface{}{
				"quantity":     balanceAfter,
				"last_updated": req.MovementDate,
			}).Error; err != nil {
			return err
		}

		movement := stockModels.StockMovement{
			TenantModel: sharedModels.TenantModel{
				TenantID: req.TenantID,
			},
			ProductID:      req.ProductID,
			WarehouseID:    stock.WarehouseID,
			Type:           stockModels.StockMovementTypeOut,
			Quantity:       -deductQty,
			BalanceBefore:  balanceBefore,
			BalanceAfter:   balanceAfter,
			ReferenceType:  req.ReferenceType,
			ReferenceID:    req.ReferenceID,
			IdempotencyKey: req.IdempotencyKey,
			Notes:          req.Notes,
			MovementDate:   req.MovementDate,
			CreatedBy:      req.CreatedBy,
		}
		if err := tx.Create(&movement).Error; err != nil {
			return err
		}

		remaining -= deductQty
	}

	if remaining > 0 {
		return errors.New("INSUFFICIENT_STOCK")
	}

	return nil
}

func (s *StockService) applyByStockID(tx *gorm.DB, req ApplyStockChangeRequest) error {
	if req.StockID == nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	var stock productModels.ProductStock
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", *req.StockID, req.TenantID).
		First(&stock).Error
	if err != nil {
		return err
	}

	balanceBefore := stock.Quantity
	balanceAfter := balanceBefore + req.Delta
	if balanceAfter < 0 {
		return errors.New("INSUFFICIENT_STOCK")
	}

	if err := tx.Model(&productModels.ProductStock{}).
		Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", stock.ID, req.TenantID).
		Updates(map[string]interface{}{
			"quantity":     balanceAfter,
			"last_updated": req.MovementDate,
		}).Error; err != nil {
		return err
	}

	movementType := stockModels.StockMovementTypeIn
	if req.Delta < 0 {
		movementType = stockModels.StockMovementTypeOut
	}

	movement := stockModels.StockMovement{
		TenantModel: sharedModels.TenantModel{
			TenantID: req.TenantID,
		},
		ProductID:      stock.ProductID,
		WarehouseID:    stock.WarehouseID,
		Type:           movementType,
		Quantity:       req.Delta,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   balanceAfter,
		ReferenceType:  req.ReferenceType,
		ReferenceID:    req.ReferenceID,
		IdempotencyKey: req.IdempotencyKey,
		Notes:          req.Notes,
		MovementDate:   req.MovementDate,
		CreatedBy:      req.CreatedBy,
	}
	if err := tx.Create(&movement).Error; err != nil {
		return err
	}

	return nil
}

func (s *StockService) applyIncrease(tx *gorm.DB, stock productModels.ProductStock, req ApplyStockChangeRequest) error {
	balanceBefore := stock.Quantity
	balanceAfter := balanceBefore + req.Delta
	if balanceAfter < 0 {
		return errors.New("STOCK_NEGATIVE")
	}

	if err := tx.Model(&productModels.ProductStock{}).
		Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", stock.ID, req.TenantID).
		Updates(map[string]interface{}{
			"quantity":     balanceAfter,
			"last_updated": req.MovementDate,
		}).Error; err != nil {
		return err
	}

	movement := stockModels.StockMovement{
		TenantModel: sharedModels.TenantModel{
			TenantID: req.TenantID,
		},
		ProductID:      req.ProductID,
		WarehouseID:    stock.WarehouseID,
		Type:           stockModels.StockMovementTypeIn,
		Quantity:       req.Delta,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   balanceAfter,
		ReferenceType:  req.ReferenceType,
		ReferenceID:    req.ReferenceID,
		IdempotencyKey: req.IdempotencyKey,
		Notes:          req.Notes,
		MovementDate:   req.MovementDate,
		CreatedBy:      req.CreatedBy,
	}
	if err := tx.Create(&movement).Error; err != nil {
		return err
	}

	return nil
}

func (s *StockService) hasIdempotentMovement(tx *gorm.DB, tenantID uint, idempotencyKey string) (bool, error) {
	if idempotencyKey == "" {
		return false, nil
	}

	var count int64
	err := tx.Model(&stockModels.StockMovement{}).
		Where("tenant_id = ? AND idempotency_key = ? AND deleted_at IS NULL", tenantID, idempotencyKey).
		Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
