package usecase

import (
	"errors"
	"time"

	sharedModels "gipos/api/internal/core/shared/models"
	productModels "gipos/api/internal/master-data/products/data/models"
	"gipos/api/internal/master-data/products/data/repositories"
	"gipos/api/internal/master-data/products/domain/dto"
	productRepo "gipos/api/internal/master-data/products/data/repositories"
	warehouseRepo "gipos/api/internal/master-data/warehouse/data/repositories"
	"gorm.io/gorm"
)

// ProductStockUsecase handles product stock business logic
type ProductStockUsecase struct {
	stockRepo     *repositories.ProductStockRepository
	productRepo   *productRepo.ProductRepository
	warehouseRepo *warehouseRepo.WarehouseRepository
}

// NewProductStockUsecase creates a new product stock usecase
func NewProductStockUsecase(stockRepo *repositories.ProductStockRepository, productRepo *productRepo.ProductRepository, warehouseRepo *warehouseRepo.WarehouseRepository) *ProductStockUsecase {
	return &ProductStockUsecase{
		stockRepo:     stockRepo,
		productRepo:   productRepo,
		warehouseRepo: warehouseRepo,
	}
}

// CreateProductStock creates a new product stock
func (uc *ProductStockUsecase) CreateProductStock(tenantID, productID string, req *dto.ProductStockRequest, userID string) (*dto.ProductStockResponse, error) {
	// Convert IDs from string to uint
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	productIDUint, err := stringToUint(productID)
	if err != nil {
		return nil, errors.New("INVALID_PRODUCT_ID")
	}

	// Validate product exists
	product, err := uc.productRepo.GetByID(tenantIDUint, productIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Check if product tracks stock
	if !product.TrackStock {
		return nil, errors.New("PRODUCT_DOES_NOT_TRACK_STOCK")
	}

	// Convert warehouseID from string to uint
	warehouseIDUint, err := stringToUint(req.WarehouseID)
	if err != nil {
		return nil, errors.New("INVALID_WAREHOUSE_ID")
	}

	// Validate warehouse exists
	_, err = uc.warehouseRepo.GetByID(tenantIDUint, warehouseIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("WAREHOUSE_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Check if stock already exists for this product and warehouse
	existing, _ := uc.stockRepo.GetByProductAndWarehouse(tenantIDUint, productIDUint, warehouseIDUint)
	if existing != nil {
		return nil, errors.New("STOCK_ALREADY_EXISTS")
	}

	// Validate reserved <= quantity
	if req.Reserved > req.Quantity {
		return nil, errors.New("INVALID_RESERVED_QUANTITY")
	}

	now := time.Now()

	// Create product stock
	stock := &productModels.ProductStock{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantIDUint,
		},
		ProductID:   productIDUint,
		WarehouseID: warehouseIDUint,
		Quantity:    req.Quantity,
		Reserved:    req.Reserved,
		MinStock:    req.MinStock,
		MaxStock:    req.MaxStock,
		LastUpdated: &now,
	}

	if err := uc.stockRepo.Create(stock); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Reload with relations
	stock, err = uc.stockRepo.GetByID(tenantIDUint, stock.ID)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductStockResponse(stock), nil
}

// GetProductStockByID retrieves a product stock by ID
func (uc *ProductStockUsecase) GetProductStockByID(tenantID, id string) (*dto.ProductStockResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_STOCK_ID")
	}

	stock, err := uc.stockRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_STOCK_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductStockResponse(stock), nil
}

// GetProductStocksByProductID retrieves all stocks for a product
func (uc *ProductStockUsecase) GetProductStocksByProductID(tenantID, productID string) ([]dto.ProductStockResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	productIDUint, err := stringToUint(productID)
	if err != nil {
		return nil, errors.New("INVALID_PRODUCT_ID")
	}

	stocks, err := uc.stockRepo.GetByProductID(tenantIDUint, productIDUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	responses := make([]dto.ProductStockResponse, len(stocks))
	for i, stock := range stocks {
		responses[i] = *toProductStockResponse(&stock)
	}

	return responses, nil
}

// UpdateProductStock updates a product stock
func (uc *ProductStockUsecase) UpdateProductStock(tenantID, id string, req *dto.UpdateProductStockRequest) (*dto.ProductStockResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_STOCK_ID")
	}

	stock, err := uc.stockRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_STOCK_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Update fields
	if req.Quantity != nil {
		stock.Quantity = *req.Quantity
	}
	if req.Reserved != nil {
		stock.Reserved = *req.Reserved
	}
	if req.MinStock != nil {
		stock.MinStock = *req.MinStock
	}
	if req.MaxStock != nil {
		stock.MaxStock = *req.MaxStock
	}

	// Validate reserved <= quantity
	if stock.Reserved > stock.Quantity {
		return nil, errors.New("INVALID_RESERVED_QUANTITY")
	}

	now := time.Now()
	stock.LastUpdated = &now

	if err := uc.stockRepo.Update(stock); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Reload with relations
	stock, err = uc.stockRepo.GetByID(tenantIDUint, stock.ID)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductStockResponse(stock), nil
}

// DeleteProductStock deletes a product stock
func (uc *ProductStockUsecase) DeleteProductStock(tenantID, id string) error {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return errors.New("INVALID_STOCK_ID")
	}

	if err := uc.stockRepo.Delete(tenantIDUint, idUint); err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	return nil
}

// BulkCreateProductStocks creates multiple product stocks
func (uc *ProductStockUsecase) BulkCreateProductStocks(tenantID, productID string, req *dto.BulkProductStockRequest, userID string) ([]dto.ProductStockResponse, error) {
	// Convert IDs from string to uint
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	productIDUint, err := stringToUint(productID)
	if err != nil {
		return nil, errors.New("INVALID_PRODUCT_ID")
	}

	// Validate product exists
	product, err := uc.productRepo.GetByID(tenantIDUint, productIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Check if product tracks stock
	if !product.TrackStock {
		return nil, errors.New("PRODUCT_DOES_NOT_TRACK_STOCK")
	}

	now := time.Now()

	// Validate all warehouses and check for duplicates
	warehouseMap := make(map[uint]bool)
	for _, stockReq := range req.Stocks {
		// Convert warehouseID from string to uint
		warehouseIDUint, err := stringToUint(stockReq.WarehouseID)
		if err != nil {
			return nil, errors.New("INVALID_WAREHOUSE_ID")
		}

		// Validate warehouse exists
		_, err = uc.warehouseRepo.GetByID(tenantIDUint, warehouseIDUint)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("WAREHOUSE_NOT_FOUND")
			}
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}

		// Check for duplicate warehouse in request
		if warehouseMap[warehouseIDUint] {
			return nil, errors.New("DUPLICATE_WAREHOUSE_IN_REQUEST")
		}
		warehouseMap[warehouseIDUint] = true

		// Check if stock already exists
		existing, _ := uc.stockRepo.GetByProductAndWarehouse(tenantIDUint, productIDUint, warehouseIDUint)
		if existing != nil {
			return nil, errors.New("STOCK_ALREADY_EXISTS")
		}

		// Validate reserved <= quantity
		if stockReq.Reserved > stockReq.Quantity {
			return nil, errors.New("INVALID_RESERVED_QUANTITY")
		}
	}

	// Create product stocks
	stocks := make([]productModels.ProductStock, len(req.Stocks))
	for i, stockReq := range req.Stocks {
		// Convert warehouseID from string to uint
		warehouseIDUint, _ := stringToUint(stockReq.WarehouseID)
		
		stocks[i] = productModels.ProductStock{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantIDUint,
			},
			ProductID:   productIDUint,
			WarehouseID: warehouseIDUint,
			Quantity:    stockReq.Quantity,
			Reserved:    stockReq.Reserved,
			MinStock:    stockReq.MinStock,
			MaxStock:    stockReq.MaxStock,
			LastUpdated: &now,
		}
	}

	if err := uc.stockRepo.BulkCreate(stocks); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Reload with relations
	responses := make([]dto.ProductStockResponse, len(stocks))
	for i := range stocks {
		stock, err := uc.stockRepo.GetByID(tenantIDUint, stocks[i].ID)
		if err != nil {
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
		responses[i] = *toProductStockResponse(stock)
	}

	return responses, nil
}

// GetProductTotalStock calculates total stock quantity for a product
func (uc *ProductStockUsecase) GetProductTotalStock(tenantID, productID string) (int, int, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return 0, 0, errors.New("INVALID_TENANT_ID")
	}
	productIDUint, err := stringToUint(productID)
	if err != nil {
		return 0, 0, errors.New("INVALID_PRODUCT_ID")
	}

	totalQuantity, err := uc.stockRepo.GetTotalStock(tenantIDUint, productIDUint)
	if err != nil {
		return 0, 0, errors.New("INTERNAL_SERVER_ERROR")
	}

	totalReserved, err := uc.stockRepo.GetTotalReserved(tenantIDUint, productIDUint)
	if err != nil {
		return 0, 0, errors.New("INTERNAL_SERVER_ERROR")
	}

	return totalQuantity, totalReserved, nil
}

// toProductStockResponse converts product stock model to response DTO
func toProductStockResponse(stock *productModels.ProductStock) *dto.ProductStockResponse {
	resp := &dto.ProductStockResponse{
		ID:          uintToString(stock.ID),
		ProductID:   uintToString(stock.ProductID),
		WarehouseID: uintToString(stock.WarehouseID),
		Quantity:    stock.Quantity,
		Reserved:    stock.Reserved,
		MinStock:    stock.MinStock,
		MaxStock:    stock.MaxStock,
		CreatedAt:   stock.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt:   stock.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}

	if stock.LastUpdated != nil {
		formatted := stock.LastUpdated.Format("2006-01-02T15:04:05+07:00")
		resp.LastUpdated = &formatted
	}

	if stock.Warehouse != nil {
		resp.Warehouse = &dto.WarehouseReference{
			ID:   uintToString(stock.Warehouse.ID),
			Code: stock.Warehouse.Code,
			Name: stock.Warehouse.Name,
		}
	}

	return resp
}

