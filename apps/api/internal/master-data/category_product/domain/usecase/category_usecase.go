package usecase

import (
	"errors"
	"strconv"
	"strings"

	sharedModels "gipos/api/internal/core/shared/models"
	categoryModels "gipos/api/internal/master-data/category_product/data/models"
	"gipos/api/internal/master-data/category_product/data/repositories"
	"gipos/api/internal/master-data/category_product/domain/dto"
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

// CategoryUsecase handles category business logic
type CategoryUsecase struct {
	categoryRepo *repositories.CategoryRepository
}

// NewCategoryUsecase creates a new category usecase
func NewCategoryUsecase(categoryRepo *repositories.CategoryRepository) *CategoryUsecase {
	return &CategoryUsecase{
		categoryRepo: categoryRepo,
	}
}

// CreateCategory creates a new category
func (uc *CategoryUsecase) CreateCategory(tenantID string, outletID *string, req *dto.CreateCategoryRequest, userID string) (*dto.CategoryResponse, error) {
	// Convert tenantID from string to uint
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	// Generate slug if not provided
	slug := req.Slug
	if slug == "" {
		slug = generateSlug(req.Name)
	}

	// Check if slug already exists
	existing, _ := uc.categoryRepo.GetBySlug(tenantIDUint, slug)
	if existing != nil {
		return nil, errors.New("DUPLICATE_VALUE")
	}

	// Convert outletID from string to uint if provided
	var outletIDUint *uint
	if outletID != nil && *outletID != "" {
		outletIDUint, err = stringPtrToUintPtr(outletID)
		if err != nil {
			return nil, errors.New("INVALID_OUTLET_ID")
		}
	}

	// Convert parentID from string to uint if provided
	var parentIDUint *uint
	if req.ParentID != nil && *req.ParentID != "" {
		parentIDUint, err = stringPtrToUintPtr(req.ParentID)
		if err != nil {
			return nil, errors.New("INVALID_PARENT_ID")
		}
		// Validate parent if provided
		_, err := uc.categoryRepo.GetByID(tenantIDUint, *parentIDUint)
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

	// Create category
	category := &categoryModels.Category{
		TenantModel: sharedModels.TenantModel{
			TenantID: tenantIDUint,
		},
		OutletID:    outletIDUint,
		ParentID:    parentIDUint,
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		SortOrder:   req.SortOrder,
		Status:      req.Status,
		CreatedBy:   &userIDUint,
	}

	if req.Status == "" {
		category.Status = "active"
	}

	if err := uc.categoryRepo.Create(category); err != nil {
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "already exists") {
			return nil, errors.New("DUPLICATE_VALUE")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toCategoryResponse(category), nil
}

// GetCategoryByID retrieves a category by ID
func (uc *CategoryUsecase) GetCategoryByID(tenantID, id string) (*dto.CategoryResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_CATEGORY_ID")
	}

	category, err := uc.categoryRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("CATEGORY_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toCategoryResponse(category), nil
}

// UpdateCategory updates a category
func (uc *CategoryUsecase) UpdateCategory(tenantID, id string, req *dto.UpdateCategoryRequest, userID string) (*dto.CategoryResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_CATEGORY_ID")
	}

	category, err := uc.categoryRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("CATEGORY_NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	// Update fields
	if req.Name != nil {
		category.Name = *req.Name
		// Regenerate slug if name changed and slug not provided
		if req.Slug == nil || *req.Slug == "" {
			category.Slug = generateSlug(*req.Name)
		}
	}
	if req.Slug != nil {
		// Check if new slug already exists (excluding current category)
		if *req.Slug != "" {
			existing, _ := uc.categoryRepo.GetBySlug(tenantIDUint, *req.Slug)
			if existing != nil && existing.ID != idUint {
				return nil, errors.New("DUPLICATE_VALUE")
			}
		}
		category.Slug = *req.Slug
	}
	if req.Description != nil {
		category.Description = *req.Description
	}
	if req.ParentID != nil {
		// Convert parentID from string to uint if provided
		if *req.ParentID != "" {
			parentIDUint, err := stringPtrToUintPtr(req.ParentID)
			if err != nil {
				return nil, errors.New("INVALID_PARENT_ID")
			}
			// Prevent self-reference
			if parentIDUint != nil && *parentIDUint == idUint {
				return nil, errors.New("INVALID_VALUE")
			}
			// Validate parent if provided
			_, err = uc.categoryRepo.GetByID(tenantIDUint, *parentIDUint)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, errors.New("CATEGORY_NOT_FOUND")
				}
				return nil, errors.New("INTERNAL_SERVER_ERROR")
			}
			category.ParentID = parentIDUint
		} else {
			category.ParentID = nil
		}
	}
	if req.ImageURL != nil {
		category.ImageURL = *req.ImageURL
	}
	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}
	if req.Status != nil {
		category.Status = *req.Status
	}
	
	// Convert userID from string to uint
	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}
	category.UpdatedBy = &userIDUint

	if err := uc.categoryRepo.Update(category); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toCategoryResponse(category), nil
}

// DeleteCategory deletes a category
func (uc *CategoryUsecase) DeleteCategory(tenantID, id string) error {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}
	idUint, err := stringToUint(id)
	if err != nil {
		return errors.New("INVALID_CATEGORY_ID")
	}

	// Check if category exists
	_, err = uc.categoryRepo.GetByID(tenantIDUint, idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("CATEGORY_NOT_FOUND")
		}
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	// Check if category has children
	children, _ := uc.categoryRepo.GetChildren(tenantIDUint, idUint)
	if len(children) > 0 {
		return errors.New("CANNOT_DELETE")
	}

	if err := uc.categoryRepo.Delete(tenantIDUint, idUint); err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	return nil
}

// ListCategories retrieves a list of categories
func (uc *CategoryUsecase) ListCategories(tenantID string, outletID *string, parentID *string, page, perPage int, search, status string) ([]dto.CategoryResponse, int64, error) {
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

	// Convert parentID from string to uint if provided
	var parentIDUint *uint
	if parentID != nil && *parentID != "" {
		parentIDUint, err = stringPtrToUintPtr(parentID)
		if err != nil {
			return nil, 0, errors.New("INVALID_PARENT_ID")
		}
	}

	limit := perPage
	offset := (page - 1) * perPage

	categories, total, err := uc.categoryRepo.List(tenantIDUint, outletIDUint, parentIDUint, limit, offset, search, status)
	if err != nil {
		return nil, 0, errors.New("INTERNAL_SERVER_ERROR")
	}

	responses := make([]dto.CategoryResponse, len(categories))
	for i, category := range categories {
		responses[i] = *toCategoryResponse(&category)
	}

	return responses, total, nil
}

// toCategoryResponse converts category model to response DTO
func toCategoryResponse(category *categoryModels.Category) *dto.CategoryResponse {
	return &dto.CategoryResponse{
		ID:          uintToString(category.ID),
		OutletID:    uintPtrToStringPtr(category.OutletID),
		ParentID:    uintPtrToStringPtr(category.ParentID),
		Name:        category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		ImageURL:    category.ImageURL,
		SortOrder:   category.SortOrder,
		Status:      category.Status,
		CreatedAt:   category.CreatedAt.Format("2006-01-02T15:04:05+07:00"),
		UpdatedAt:   category.UpdatedAt.Format("2006-01-02T15:04:05+07:00"),
	}
}

// generateSlug generates a URL-friendly slug from name
func generateSlug(name string) string {
	// Simple slug generation - convert to lowercase and replace spaces with hyphens
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove special characters (keep only alphanumeric and hyphens)
	var result strings.Builder
	for _, char := range slug {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-' {
			result.WriteRune(char)
		}
	}
	return result.String()
}

