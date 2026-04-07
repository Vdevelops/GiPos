package usecase

import (
	"errors"
	"strconv"
	"time"

	"gipos/api/internal/auth/data/models"
	"gipos/api/internal/auth/data/repositories"
	"gipos/api/internal/auth/domain/dto"
	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/redis"
	sharedModels "gipos/api/internal/core/shared/models"
	"gipos/api/internal/core/utils/response"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
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

// AuthUsecase handles authentication business logic
type AuthUsecase struct {
	userRepo *repositories.UserRepository
	cfg      *config.Config
}

// NewAuthUsecase creates a new auth usecase
func NewAuthUsecase(userRepo *repositories.UserRepository, cfg *config.Config) *AuthUsecase {
	return &AuthUsecase{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares password with hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// generateToken generates JWT token
func (uc *AuthUsecase) generateToken(user *models.User) (string, string, int64, error) {
	// Access token expires in configured duration
	accessExpiresIn := int64(uc.cfg.JWT.AccessTokenExpiry.Seconds())
	accessExpiresAt := time.Now().Add(uc.cfg.JWT.AccessTokenExpiry)

	// Refresh token expires in configured duration
	refreshExpiresAt := time.Now().Add(uc.cfg.JWT.RefreshTokenExpiry)

	// Generate access token
	// Convert uint IDs to string for JWT compatibility
	accessClaims := jwt.MapClaims{
		"user_id":    uintToString(user.ID),
		"tenant_id":  uintToString(user.TenantID),
		"outlet_id":  uintPtrToStringPtr(user.OutletID),
		"email":      user.Email,
		"role":       user.Role,
		"exp":        accessExpiresAt.Unix(),
		"iat":        time.Now().Unix(),
		"token_type": "access",
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(uc.cfg.JWT.Secret))
	if err != nil {
		return "", "", 0, err
	}

	// Generate refresh token
	// Convert uint IDs to string for JWT compatibility
	refreshClaims := jwt.MapClaims{
		"user_id":    uintToString(user.ID),
		"tenant_id":  uintToString(user.TenantID),
		"exp":        refreshExpiresAt.Unix(),
		"iat":        time.Now().Unix(),
		"token_type": "refresh",
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(uc.cfg.JWT.Secret))
	if err != nil {
		return "", "", 0, err
	}

	return accessTokenString, refreshTokenString, accessExpiresIn, nil
}

// Login authenticates a user and returns tokens
// If tenantID is provided, it will search within that tenant, otherwise search all tenants
func (uc *AuthUsecase) Login(tenantID string, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	var user *models.User
	var err error

	// If tenantID is provided, search within that tenant
	if tenantID != "" {
		tenantIDUint, err := stringToUint(tenantID)
		if err != nil {
			return nil, errors.New("INVALID_TENANT_ID")
		}
		user, err = uc.userRepo.GetByEmailAndTenant(req.Email, tenantIDUint)
	} else {
		// Otherwise, search by email only (for login, user might not know tenant)
		user, err = uc.userRepo.GetByEmail(req.Email)
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("INVALID_CREDENTIALS")
		}
		return nil, err
	}

	// Check if account is active
	if user.Status != "active" {
		return nil, errors.New("ACCOUNT_DISABLED")
	}

	// Verify password
	if !CheckPasswordHash(req.Password, user.Password) {
		return nil, errors.New("INVALID_CREDENTIALS")
	}

	// Update last login
	_ = uc.userRepo.UpdateLastLogin(user.ID)

	// Generate tokens
	accessToken, refreshToken, expiresIn, err := uc.generateToken(user)
	if err != nil {
		return nil, err
	}

	// Store refresh token in Redis (if available)
	userIDStr := uintToString(user.ID)
	refreshExpiry := uc.cfg.JWT.RefreshTokenExpiry
	if err := redis.SetRefreshToken(userIDStr, refreshToken, refreshExpiry); err != nil {
		// Log warning but continue - refresh token will still work without Redis
		// This allows graceful degradation if Redis is unavailable
	}

	// Build user response
	var lastLoginAt *string
	if user.LastLoginAt != nil {
		formatted := response.FormatDateTime(*user.LastLoginAt)
		lastLoginAt = &formatted
	}

	// Build response
	loginResponse := &dto.LoginResponse{
		User: &dto.UserResponse{
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
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
	}

	return loginResponse, nil
}

// Register creates a new user account
func (uc *AuthUsecase) Register(tenantID string, req *dto.RegisterRequest) (*dto.UserResponse, error) {
	// Convert tenantID from string to uint
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	// Check if email already exists
	_, err = uc.userRepo.GetByEmailAndTenant(req.Email, tenantIDUint)
	if err == nil {
		return nil, errors.New("RESOURCE_ALREADY_EXISTS")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Hash password
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Set default role if not provided
	role := req.Role
	if role == "" {
		role = "cashier"
	}

	// Convert outletID from string to uint if provided
	var outletIDUint *uint
	if req.OutletID != nil && *req.OutletID != "" {
		outletIDUint, err = stringPtrToUintPtr(req.OutletID)
		if err != nil {
			return nil, errors.New("INVALID_OUTLET_ID")
		}
	}

	// Create user
	user := &models.User{
		TenantModel: sharedModels.TenantModel{
			BaseModel: sharedModels.BaseModel{},
			TenantID:  tenantIDUint,
		},
		Email:    req.Email,
		Password: hashedPassword,
		Name:     req.Name,
		Phone:    req.Phone,
		Role:     role,
		Status:   "active",
		OutletID: outletIDUint,
	}

	if err := uc.userRepo.Create(user); err != nil {
		return nil, err
	}

	// Build response
	userResponse := &dto.UserResponse{
		ID:        uintToString(user.ID),
		TenantID:  uintToString(user.TenantID),
		Email:     user.Email,
		Name:      user.Name,
		Phone:     user.Phone,
		Role:      user.Role,
		Status:    user.Status,
		OutletID: uintPtrToStringPtr(user.OutletID),
		CreatedAt: response.FormatDateTime(user.CreatedAt),
		UpdatedAt: response.FormatDateTime(user.UpdatedAt),
	}

	return userResponse, nil
}

// RefreshToken refreshes access token using refresh token
func (uc *AuthUsecase) RefreshToken(refreshTokenString string) (*dto.TokenResponse, error) {
	// Parse and validate refresh token
	token, err := jwt.Parse(refreshTokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("TOKEN_INVALID")
		}
		return []byte(uc.cfg.JWT.Secret), nil
	})

	if err != nil {
		return nil, errors.New("REFRESH_TOKEN_INVALID")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("REFRESH_TOKEN_INVALID")
	}

	// Check token type
	if claims["token_type"] != "refresh" {
		return nil, errors.New("REFRESH_TOKEN_INVALID")
	}

	// Verify refresh token exists in Redis (if Redis is available)
	userIDStr := ""
	if userIDFloat, ok := claims["user_id"].(float64); ok {
		userIDStr = uintToString(uint(userIDFloat))
	} else if userIDStrVal, ok := claims["user_id"].(string); ok {
		userIDStr = userIDStrVal
	}

	if userIDStr != "" {
		storedToken, err := redis.GetRefreshToken(userIDStr)
		if err == nil {
			// Redis is available and token exists - verify it matches
			if storedToken != refreshTokenString {
				return nil, errors.New("REFRESH_TOKEN_INVALID")
			}
		}
		// If Redis error, continue without Redis validation (graceful degradation)
	}

	// Get user
	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		// Try string for backward compatibility
		userIDStr, okStr := claims["user_id"].(string)
		if !okStr {
			return nil, errors.New("REFRESH_TOKEN_INVALID")
		}
		userIDUint, err := stringToUint(userIDStr)
		if err != nil {
			return nil, errors.New("REFRESH_TOKEN_INVALID")
		}
		user, err := uc.userRepo.GetByID(userIDUint)
		if err != nil {
			return nil, errors.New("USER_NOT_FOUND")
		}
		// Check if account is active
		if user.Status != "active" {
			return nil, errors.New("ACCOUNT_DISABLED")
		}
		// Generate new tokens
		accessToken, refreshToken, expiresIn, err := uc.generateToken(user)
		if err != nil {
			return nil, err
		}

		// Rotate refresh token in Redis (if available)
		if err := redis.SetRefreshToken(uintToString(user.ID), refreshToken, uc.cfg.JWT.RefreshTokenExpiry); err != nil {
			// Graceful degradation: keep flow running if Redis is unavailable
		}

		return &dto.TokenResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    expiresIn,
			TokenType:    "Bearer",
		}, nil
	}

	userIDUint := uint(userIDFloat)
	user, err := uc.userRepo.GetByID(userIDUint)
	if err != nil {
		return nil, errors.New("USER_NOT_FOUND")
	}

	// Check if account is active
	if user.Status != "active" {
		return nil, errors.New("ACCOUNT_DISABLED")
	}

	// Generate new tokens
	accessToken, refreshToken, expiresIn, err := uc.generateToken(user)
	if err != nil {
		return nil, err
	}

	// Rotate refresh token in Redis (if available)
	if err := redis.SetRefreshToken(uintToString(user.ID), refreshToken, uc.cfg.JWT.RefreshTokenExpiry); err != nil {
		// Graceful degradation: keep flow running if Redis is unavailable
	}

	return &dto.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
	}, nil
}

// VerifyToken verifies and extracts claims from JWT token
func (uc *AuthUsecase) VerifyToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("TOKEN_INVALID")
		}
		return []byte(uc.cfg.JWT.Secret), nil
	})

	if err != nil {
		return nil, errors.New("TOKEN_INVALID")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("TOKEN_INVALID")
	}

	// Check if token is expired
	if exp, ok := claims["exp"].(float64); ok {
		if time.Now().Unix() > int64(exp) {
			return nil, errors.New("TOKEN_EXPIRED")
		}
	}

	return claims, nil
}
