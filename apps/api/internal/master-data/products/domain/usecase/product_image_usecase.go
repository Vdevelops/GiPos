package usecase

import (
	"errors"

	sharedModels "gipos/api/internal/core/shared/models"
	productModels "gipos/api/internal/master-data/products/data/models"
	"gipos/api/internal/master-data/products/data/repositories"
	"gipos/api/internal/master-data/products/domain/dto"
	productRepo "gipos/api/internal/master-data/products/data/repositories"
	"gorm.io/gorm"
)

// ProductImageUsecase handles product image business logic
type ProductImageUsecase struct {
	imageRepo  *repositories.ProductImageRepository
	productRepo *productRepo.ProductRepository
}

// NewProductImageUsecase creates a new product image usecase
func NewProductImageUsecase(imageRepo *repositories.ProductImageRepository, productRepo *productRepo.ProductRepository) *ProductImageUsecase {
	return &ProductImageUsecase{
		imageRepo:  imageRepo,
		productRepo: productRepo,
	}
}

// CreateProductImage creates a new product image
func (uc *ProductImageUsecase) CreateProductImage(tenantID, productID string, req *dto.ProductImageRequest, userID string) (*dto.ProductImageResponse, error) {
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
	_, err = uc.productRepo.GetByID(tenantIDUint, productIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Convert userID from string to uint
	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	// Create product image
	image := &productModels.ProductImage{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantIDUint,
		},
		ProductID:    productIDUint,
		URL:          req.URL,
		ThumbnailURL: req.ThumbnailURL,
		Order:        req.Order,
		Alt:          req.Alt,
		Size:         getInt64Value(req.Size),
		Width:        getIntValue(req.Width),
		Height:       getIntValue(req.Height),
		MimeType:     req.MimeType,
		CreatedBy:    &userIDUint,
	}

	if err := uc.imageRepo.Create(image); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductImageResponse(image), nil
}

// GetProductImageByID retrieves a product image by ID
func (uc *ProductImageUsecase) GetProductImageByID(tenantID, id string) (*dto.ProductImageResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_IMAGE_ID")
	}

	image, err := uc.imageRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_IMAGE_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductImageResponse(image), nil
}

// GetProductImagesByProductID retrieves all images for a product
func (uc *ProductImageUsecase) GetProductImagesByProductID(tenantID, productID string) ([]dto.ProductImageResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	productIDUint, err := stringToUint(productID)
	if err != nil {
		return nil, errors.New("INVALID_PRODUCT_ID")
	}

	images, err := uc.imageRepo.GetByProductID(tenantIDUint, productIDUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	responses := make([]dto.ProductImageResponse, len(images))
	for i, image := range images {
		responses[i] = *toProductImageResponse(&image)
	}

	return responses, nil
}

// UpdateProductImage updates a product image
func (uc *ProductImageUsecase) UpdateProductImage(tenantID, id string, req *dto.UpdateProductImageRequest) (*dto.ProductImageResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_IMAGE_ID")
	}

	image, err := uc.imageRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_IMAGE_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Update fields
	if req.URL != nil {
		image.URL = *req.URL
	}
	if req.ThumbnailURL != nil {
		image.ThumbnailURL = *req.ThumbnailURL
	}
	if req.Order != nil {
		image.Order = *req.Order
	}
	if req.Alt != nil {
		image.Alt = *req.Alt
	}
	if req.Size != nil {
		image.Size = *req.Size
	}
	if req.Width != nil {
		image.Width = *req.Width
	}
	if req.Height != nil {
		image.Height = *req.Height
	}
	if req.MimeType != nil {
		image.MimeType = *req.MimeType
	}

	if err := uc.imageRepo.Update(image); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toProductImageResponse(image), nil
}

// DeleteProductImage deletes a product image
func (uc *ProductImageUsecase) DeleteProductImage(tenantID, id string) error {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return errors.New("INVALID_IMAGE_ID")
	}

	if err := uc.imageRepo.Delete(tenantIDUint, idUint); err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	return nil
}

// BulkCreateProductImages creates multiple product images
func (uc *ProductImageUsecase) BulkCreateProductImages(tenantID, productID string, req *dto.BulkProductImageRequest, userID string) ([]dto.ProductImageResponse, error) {
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
	_, err = uc.productRepo.GetByID(tenantIDUint, productIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("PRODUCT_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Convert userID from string to uint
	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	// Create product images
	images := make([]productModels.ProductImage, len(req.Images))
	for i, imgReq := range req.Images {
		images[i] = productModels.ProductImage{
			TenantModel: sharedModels.TenantModel{
				TenantID: tenantIDUint,
			},
			ProductID:    productIDUint,
			URL:          imgReq.URL,
			ThumbnailURL: imgReq.ThumbnailURL,
			Order:        imgReq.Order,
			Alt:          imgReq.Alt,
			Size:         getInt64Value(imgReq.Size),
			Width:        getIntValue(imgReq.Width),
			Height:       getIntValue(imgReq.Height),
			MimeType:     imgReq.MimeType,
			CreatedBy:    &userIDUint,
		}
	}

	if err := uc.imageRepo.BulkCreate(images); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Convert to response
	responses := make([]dto.ProductImageResponse, len(images))
	for i := range images {
		responses[i] = *toProductImageResponse(&images[i])
	}

	return responses, nil
}

// Helper function to convert *int to int
func getIntValue(ptr *int) int {
	if ptr == nil {
		return 0
	}
	return *ptr
}

// Helper function to convert *int64 to int64
func getInt64Value(ptr *int64) int64 {
	if ptr == nil {
		return 0
	}
	return *ptr
}

// toProductImageResponse converts product image model to response DTO
func toProductImageResponse(image *productModels.ProductImage) *dto.ProductImageResponse {
	widthPtr := getIntPtr(image.Width)
	heightPtr := getIntPtr(image.Height)
	sizePtr := getInt64Ptr(image.Size)
	
	return &dto.ProductImageResponse{
		ID:           uintToString(image.ID),
		ProductID:    uintToString(image.ProductID),
		URL:          image.URL,
		ThumbnailURL: image.ThumbnailURL,
		Order:        image.Order,
		Alt:          image.Alt,
		Size:         sizePtr,
		Width:        widthPtr,
		Height:       heightPtr,
		MimeType:     image.MimeType,
		CreatedAt:    image.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt:    image.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}
}

// Helper function to convert int to *int
func getIntPtr(val int) *int {
	if val == 0 {
		return nil
	}
	return &val
}

// Helper function to convert int64 to *int64
func getInt64Ptr(val int64) *int64 {
	if val == 0 {
		return nil
	}
	return &val
}

