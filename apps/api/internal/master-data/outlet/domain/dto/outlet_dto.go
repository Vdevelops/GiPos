package dto

// CreateOutletRequest represents request DTO for creating an outlet
type CreateOutletRequest struct {
	Code      string `json:"code" binding:"required,min=1,max=50"`
	Name      string `json:"name" binding:"required,min=3,max=200"`
	Address   string `json:"address,omitempty"`
	City      string `json:"city,omitempty" binding:"max=100"`
	Province  string `json:"province,omitempty" binding:"max=100"`
	PostalCode string `json:"postal_code,omitempty" binding:"max=10"`
	Phone     string `json:"phone,omitempty" binding:"max=20"`
	Email     string `json:"email,omitempty" binding:"omitempty,email"`
	Status    string `json:"status,omitempty" binding:"omitempty,oneof=active inactive"`
	IsMain    bool   `json:"is_main,omitempty"`
	Timezone  string `json:"timezone,omitempty" binding:"max=50"`
	LogoURL   string  `json:"logo_url,omitempty" binding:"omitempty,url,max=500"`
	Settings  *string `json:"settings,omitempty"` // JSON string (nullable)
}

// UpdateOutletRequest represents request DTO for updating an outlet
type UpdateOutletRequest struct {
	Code      *string `json:"code,omitempty" binding:"omitempty,min=1,max=50"`
	Name      *string `json:"name,omitempty" binding:"omitempty,min=3,max=200"`
	Address   *string `json:"address,omitempty"`
	City      *string `json:"city,omitempty" binding:"omitempty,max=100"`
	Province  *string `json:"province,omitempty" binding:"omitempty,max=100"`
	PostalCode *string `json:"postal_code,omitempty" binding:"omitempty,max=10"`
	Phone     *string `json:"phone,omitempty" binding:"omitempty,max=20"`
	Email     *string `json:"email,omitempty" binding:"omitempty,email"`
	Status    *string `json:"status,omitempty" binding:"omitempty,oneof=active inactive"`
	IsMain    *bool   `json:"is_main,omitempty"`
	Timezone  *string `json:"timezone,omitempty" binding:"omitempty,max=50"`
	LogoURL   *string `json:"logo_url,omitempty" binding:"omitempty,url,max=500"`
	Settings  *string `json:"settings,omitempty"` // JSON string
}

// OutletResponse represents response DTO for outlet
type OutletResponse struct {
	ID         string `json:"id"`
	Code       string `json:"code"`
	Name       string `json:"name"`
	Address    string `json:"address,omitempty"`
	City       string `json:"city,omitempty"`
	Province   string `json:"province,omitempty"`
	PostalCode string `json:"postal_code,omitempty"`
	Phone      string `json:"phone,omitempty"`
	Email      string `json:"email,omitempty"`
	Status     string `json:"status"`
	IsMain     bool   `json:"is_main"`
	Timezone   string `json:"timezone"`
	LogoURL    string  `json:"logo_url,omitempty"`
	Settings   *string `json:"settings,omitempty"` // JSON string (nullable)
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}
