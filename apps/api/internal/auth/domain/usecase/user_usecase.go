package usecase

import (
	"errors"

	"gipos/api/internal/auth/data/models"
	"gipos/api/internal/auth/data/repositories"
	"gipos/api/internal/auth/domain/dto"
	"gipos/api/internal/core/utils/response"
	"gorm.io/gorm"
)

// UserUsecase handles user business logic
type UserUsecase struct {
	userRepo *repositories.UserRepository
}

// NewUserUsecase creates a new user usecase
func NewUserUsecase(userRepo *repositories.UserRepository) *UserUsecase {
	return &UserUsecase{
		userRepo: userRepo,
	}
}

// GetUserByID retrieves a user by ID
func (uc *UserUsecase) GetUserByID(id string) (*dto.UserResponse, error) {
	idUint, err := stringToUint(id)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	user, err := uc.userRepo.GetByID(idUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("USER_NOT_FOUND")
		}
		return nil, err
	}

	return toUserResponse(user), nil
}

// ListUsers retrieves a list of users
func (uc *UserUsecase) ListUsers(tenantID string, outletID *string, page, perPage int) ([]dto.UserResponse, int64, error) {
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

	limit := perPage
	offset := (page - 1) * perPage

	users, total, err := uc.userRepo.List(tenantIDUint, outletIDUint, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]dto.UserResponse, len(users))
	for i, user := range users {
		responses[i] = *toUserResponse(&user)
	}

	return responses, total, nil
}

// toUserResponse converts user model to response DTO
func toUserResponse(user *models.User) *dto.UserResponse {
	var lastLoginAt *string
	if user.LastLoginAt != nil {
		formatted := response.FormatDateTime(*user.LastLoginAt)
		lastLoginAt = &formatted
	}

	return &dto.UserResponse{
		ID:          uintToString(user.ID),
		TenantID:    uintToString(user.TenantID),
		Email:       user.Email,
		Name:        user.Name,
		Phone:       user.Phone,
		Role:        user.Role,
		Status:      user.Status,
		OutletID:    uintPtrToStringPtr(user.OutletID),
		LastLoginAt: lastLoginAt,
		CreatedAt:   response.FormatDateTime(user.CreatedAt),
		UpdatedAt:   response.FormatDateTime(user.UpdatedAt),
	}
}

// GetUserByID is a helper function to get user by ID (used by auth usecase)
func GetUserByID(userRepo *repositories.UserRepository, userID string) (*dto.UserResponse, error) {
	userIDUint, err := stringToUint(userID)
	if err != nil {
		return nil, errors.New("INVALID_USER_ID")
	}

	user, err := userRepo.GetByID(userIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("USER_NOT_FOUND")
		}
		return nil, err
	}
	return toUserResponse(user), nil
}

