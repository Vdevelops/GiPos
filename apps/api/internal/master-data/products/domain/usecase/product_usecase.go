package usecase

import (
	"errors"
	"strconv"
	"strings"

	sharedModels "gipos/api/internal/core/shared/models"
	categoryRepo "gipos/api/internal/master-data/category_product/data/repositories"
	outletRepo "gipos/api/internal/master-data/outlet/data/repositories"
	productModels "gipos/api/internal/master-data/products/data/models"
	"gipos/api/internal/master-data/products/data/repositories"
	"gipos/api/internal/master-data/products/domain/dto"
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

// ProductUsecase handles product business logic
type ProductUsecase struct {
	productRepo  *repositories.ProductRepository
	categoryRepo *categoryRepo.CategoryRepository
	outletRepo   *outletRepo.OutletRepository
}

// NewProductUsecase creates a new product usecase
func NewProductUsecase(productRepo *repositories.ProductRepository, categoryRepo *categoryRepo.CategoryRepository, outletRepo *outletRepo.OutletRepository) *ProductUsecase {
	return &ProductUsecase{
		productRepo:  productRepo,
		categoryRepo: categoryRepo,
		outletRepo:   outletRepo,
	}
}

// CreateProduct creates a new product
func (uc *ProductUsecase) CreateProduct(tenantID string, outletID *string, req *dto.CreateProductRequest, userID string) (*dto.ProductResponse, error) {
	// Convert tenantID from string to uint
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	// Convert outletID from string to uint if provided
	var outletIDUint *uint
	if outletID != nil && *outletID != "" {
		outletIDUint, err = stringPtrToUintPtr(outletID)
		if err != nil {
			return nil, errors.New("INVALID_OUTLET_ID")
		}
		// Validate outlet if provided
		_, err := uc.outletRepo.GetByID(tenantIDUint, *outletIDUint)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("OUTLET_NOT_FOUND")
			}
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
	}

	// Check if SKU already exists
	existing, _ := uc.productRepo.GetBySKU(tenantIDUint, req.SKU)
	if existing != nil {
		return nil, errors.New("DUPLICATE_SKU")
	}

	// Normalize barcode: empty string becomes empty (validate uniqueness only if not empty)
	var barcode string
	if req.Barcode != "" {
		barcode = strings.TrimSpace(req.Barcode)
		// Check if barcode already exists (only if not empty)
		existing, _ := uc.productRepo.GetByBarcode(tenantIDUint, barcode)
		if existing != nil {
			return nil, errors.New("DUPLICATE_BARCODE")
		}
	}

	// Validate cost <= price (business rule)
	if req.Cost > 0 && req.Price > 0 && req.Cost > req.Price {
		return nil, errors.New("INVALID_COST_PRICE")
	}

	// Convert categoryID from string to uint if provided
	var categoryIDUint *uint
	if req.CategoryID != nil && *req.CategoryID != "" {
		categoryIDUint, err = stringPtrToUintPtr(req.CategoryID)
		if err != nil {
			return nil, errors.New("INVALID_CATEGORY_ID")
		}
		// Validate category if provided
		_, err := uc.categoryRepo.GetByID(tenantIDUint, *categoryIDUint)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("CATEGORY_NOT_FOUND")
			}
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
	}

	// Convert userID from string to uint
	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	// Set default status
	status := req.Status
	if status == "" {
		status = "active"
	}

	// Create product
	product := &productModels.Product{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantIDUint,
		},
		OutletID:    outletIDUint,
		CategoryID:  categoryIDUint,
		Name:        req.Name,
		SKU:         req.SKU,
		Barcode:     barcode,
		Description: req.Description,
		Price:       req.Price,
		Cost:        req.Cost,
		Taxable:     req.Taxable,
		TrackStock:  req.TrackStock,
		Status:      status,
		CreatedBy:   &userIDUint,
	}

	if err := uc.productRepo.Create(product); err != nil {
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "already exists") {
			return nil, errors.New("DUPLICATE_VALUE")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Reload with relations
	product, err = uc.productRepo.GetByID(tenantIDUint, product.ID)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductResponse(product), nil
}

// GetProductByID retrieves a product by ID
func (uc *ProductUsecase) GetProductByID(tenantID, id string) (*dto.ProductResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_PRODUCT_ID")
	}

	product, err := uc.productRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductResponse(product), nil
}

// GetProductBySKU retrieves a product by SKU
func (uc *ProductUsecase) GetProductBySKU(tenantID, sku string) (*dto.ProductResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	product, err := uc.productRepo.GetBySKU(tenantIDUint, sku)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductResponse(product), nil
}

// GetProductByBarcode retrieves a product by barcode
func (uc *ProductUsecase) GetProductByBarcode(tenantID, barcode string) (*dto.ProductResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	product, err := uc.productRepo.GetByBarcode(tenantIDUint, barcode)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductResponse(product), nil
}

// UpdateProduct updates a product
func (uc *ProductUsecase) UpdateProduct(tenantID, id string, req *dto.UpdateProductRequest, userID string) (*dto.ProductResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_PRODUCT_ID")
	}

	product, err := uc.productRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Update fields
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Barcode != nil {
		// Normalize barcode
		barcode := strings.TrimSpace(*req.Barcode)
		// Check if new barcode already exists (excluding current product, only if not empty)
		if barcode != "" {
			existing, _ := uc.productRepo.GetByBarcode(tenantIDUint, barcode)
			if existing != nil && existing.ID != idUint {
				return nil, errors.New("DUPLICATE_BARCODE")
			}
		}
		product.Barcode = barcode
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	
	// Validate cost <= price when updating price or cost
	newPrice := product.Price
	newCost := product.Cost
	if req.Price != nil {
		newPrice = *req.Price
	}
	if req.Cost != nil {
		newCost = *req.Cost
	}
	if newCost > 0 && newPrice > 0 && newCost > newPrice {
		return nil, errors.New("INVALID_COST_PRICE")
	}
	
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.Cost != nil {
		product.Cost = *req.Cost
	}
	if req.CategoryID != nil {
		// Convert categoryID from string to uint if provided
		if *req.CategoryID != "" {
			categoryIDUint, err := stringPtrToUintPtr(req.CategoryID)
			if err != nil {
				return nil, errors.New("INVALID_CATEGORY_ID")
			}
			// Validate category if provided
			_, err = uc.categoryRepo.GetByID(tenantIDUint, *categoryIDUint)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, errors.New("CATEGORY_NOT_FOUND")
				}
				return nil, errors.New("INTERNAL_SERVER_ERROR")
			}
			product.CategoryID = categoryIDUint
		} else {
			product.CategoryID = nil
		}
	}
	if req.Taxable != nil {
		product.Taxable = *req.Taxable
	}
	if req.Status != nil {
		product.Status = *req.Status
	}
	
	// Convert userID from string to uint
	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}
	product.UpdatedBy = &userIDUint

	if err := uc.productRepo.Update(product); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Reload with relations
	product, err = uc.productRepo.GetByID(tenantIDUint, product.ID)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductResponse(product), nil
}

// DeleteProduct deletes a product
func (uc *ProductUsecase) DeleteProduct(tenantID, id string) error {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return errors.New("INVALID_PRODUCT_ID")
	}

	// Check if product exists
	product, err := uc.productRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("PRODUCT_NOT_FOUND")
		}
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	// Business rule validation: Check if product can be deleted
	if product.TrackStock {
		// Check stock quantity using raw query
		var totalStock int
		err := uc.productRepo.GetDB().Table("product_stocks").
			Where("product_id = ? AND tenant_id = ? AND deleted_at IS NULL", product.ID, tenantIDUint).
			Select("COALESCE(SUM(quantity), 0)").
			Scan(&totalStock).Error
		if err == nil && totalStock > 0 {
			return errors.New("PRODUCT_HAS_STOCK")
		}
	}

	// Check sales history using raw query
	var saleCount int64
	err = uc.productRepo.GetDB().Table("sale_items").
		Where("product_id = ? AND tenant_id = ?", product.ID, tenantIDUint).
		Count(&saleCount).Error
	if err == nil && saleCount > 0 {
		return errors.New("PRODUCT_HAS_SALES")
	}

	if err := uc.productRepo.Delete(tenantIDUint, idUint); err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	return nil
}

// ListProducts retrieves a list of products
func (uc *ProductUsecase) ListProducts(tenantID string, outletID *string, categoryID *string, page, perPage int, search, status string, sortBy string, sortOrder string, includeTenantLevel bool) ([]dto.ProductResponse, int64, error) {
	// Convert tenantID from string to uint
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, 0, errors.New("INVALID_TENANT_ID")
	}

	// Convert outletID from string to uint if provided
	var outletIDUint *uint
	if outletID != nil && *outletID != "" {
		outletIDUint, err = stringPtrToUintPtr(outletID)
		if err != nil {
			return nil, 0, errors.New("INVALID_OUTLET_ID")
		}
	}

	// Convert categoryID from string to uint if provided
	var categoryIDUint *uint
	if categoryID != nil && *categoryID != "" {
		categoryIDUint, err = stringPtrToUintPtr(categoryID)
		if err != nil {
			return nil, 0, errors.New("INVALID_CATEGORY_ID")
		}
	}

	limit := perPage
	offset := (page - 1) * perPage

	products, total, err := uc.productRepo.List(tenantIDUint, outletIDUint, categoryIDUint, limit, offset, search, status, sortBy, sortOrder, includeTenantLevel)
	if err != nil {
		return nil, 0, errors.New("INTERNAL_SERVER_ERROR")
	}

	responses := make([]dto.ProductResponse, len(products))
	for i, product := range products {
		responses[i] = *toProductResponse(&product)
	}

	return responses, total, nil
}

// toProductResponse converts product model to response DTO
func toProductResponse(product *productModels.Product) *dto.ProductResponse {
	resp := &dto.ProductResponse{
		ID:          uintToString(product.ID),
		OutletID:    uintPtrToStringPtr(product.OutletID),
		CategoryID:  uintPtrToStringPtr(product.CategoryID),
		Name:        product.Name,
		SKU:         product.SKU,
		Barcode:     product.Barcode,
		Description: product.Description,
		Price:       product.Price,
		Cost:        product.Cost,
		Taxable:     product.Taxable,
		TrackStock:  product.TrackStock,
		Status:      product.Status,
		CreatedAt:   product.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt:   product.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}

	// Include category if loaded
	if product.Category != nil {
		resp.Category = &dto.CategoryReference{
			ID:   uintToString(product.Category.ID),
			Name: product.Category.Name,
		}
	}

	// Include outlet if loaded
	if product.Outlet != nil {
		resp.Outlet = &dto.OutletReference{
			ID:   uintToString(product.Outlet.ID),
			Code: product.Outlet.Code,
			Name: product.Outlet.Name,
		}
	}

	// Include stocks if loaded
	if len(product.Stocks) > 0 {
		resp.Stocks = make([]dto.ProductStockReference, len(product.Stocks))
		for i, stock := range product.Stocks {
			stockRef := dto.ProductStockReference{
				WarehouseID: uintToString(stock.WarehouseID),
				Quantity:    stock.Quantity,
				Reserved:    stock.Reserved,
			}
			if stock.Warehouse != nil {
				stockRef.Warehouse = &dto.WarehouseReference{
					ID:   uintToString(stock.Warehouse.ID),
					Code: stock.Warehouse.Code,
					Name: stock.Warehouse.Name,
				}
			}
			resp.Stocks[i] = stockRef
		}
	}

	// Include images if loaded
	if len(product.Images) > 0 {
		resp.Images = make([]dto.ProductImageResponse, len(product.Images))
		for i, image := range product.Images {
			resp.Images[i] = dto.ProductImageResponse{
				ID:           uintToString(image.ID),
				ProductID:    uintToString(image.ProductID),
				URL:          image.URL,
				ThumbnailURL: image.ThumbnailURL,
				Order:        image.Order,
				Alt:          image.Alt,
				Size:         getInt64Ptr(image.Size),
				Width:        getIntPtr(image.Width),
				Height:       getIntPtr(image.Height),
				MimeType:     image.MimeType,
				CreatedAt:    image.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
				UpdatedAt:    image.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
			}
		}
	}

	return resp
}

