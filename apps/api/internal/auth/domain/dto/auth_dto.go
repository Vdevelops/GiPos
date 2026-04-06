package dto

// LoginRequest represents login request DTO
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// RegisterRequest represents register request DTO
type RegisterRequest struct {
	Email    string  `json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"required,min=6"`
	Name     string  `json:"name" binding:"required,min=3,max=200"`
	Phone    string  `json:"phone,omitempty"`
	Role     string  `json:"role,omitempty"` // system_admin, tenant_owner, manager, cashier, accountant, supervisor
	OutletID *string `json:"outlet_id,omitempty"`
}

// RefreshTokenRequest represents refresh token request DTO
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// ChangePasswordRequest represents change password request DTO
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// ResetPasswordRequest represents reset password request DTO
type ResetPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// VerifyResetPasswordRequest represents verify reset password request DTO
type VerifyResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// LoginResponse represents login response DTO
type LoginResponse struct {
	User         *UserResponse `json:"user"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresIn    int64         `json:"expires_in"` // seconds
	TokenType    string        `json:"token_type"` // "Bearer"
}

// UserResponse represents user response DTO
type UserResponse struct {
	ID          string  `json:"id"`
	TenantID    string  `json:"tenant_id"`
	Email       string  `json:"email"`
	Name        string  `json:"name"`
	Phone       string  `json:"phone,omitempty"`
	Role        string  `json:"role"`
	Status      string  `json:"status"`
	OutletID    *string `json:"outlet_id,omitempty"`
	LastLoginAt *string `json:"last_login_at,omitempty"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

// TokenResponse represents token response DTO
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"` // seconds
	TokenType    string `json:"token_type"` // "Bearer"
}
