package dto

// CreateWarehouseRequest represents the request to create a warehouse
type CreateWarehouseRequest struct {
	Code      string  `json:"code" binding:"required,min=1,max=50"`
	Name      string  `json:"name" binding:"required,min=1,max=200"`
	Address   *string `json:"address,omitempty"`
	OutletID  *string `json:"outlet_id,omitempty"`
	Type      string  `json:"type" binding:"omitempty,oneof=main secondary virtual"`
	Status    string  `json:"status" binding:"omitempty,oneof=active inactive"`
	IsDefault bool    `json:"is_default"`
}

// UpdateWarehouseRequest represents the request to update a warehouse
type UpdateWarehouseRequest struct {
	Code      *string `json:"code,omitempty" binding:"omitempty,min=1,max=50"`
	Name      *string `json:"name,omitempty" binding:"omitempty,min=1,max=200"`
	Address   *string `json:"address,omitempty"`
	OutletID  *string `json:"outlet_id,omitempty"`
	Type      *string `json:"type,omitempty" binding:"omitempty,oneof=main secondary virtual"`
	Status    *string `json:"status,omitempty" binding:"omitempty,oneof=active inactive"`
	IsDefault *bool   `json:"is_default,omitempty"`
}

// WarehouseResponse represents a warehouse response
type WarehouseResponse struct {
	ID        string  `json:"id"`
	Code      string  `json:"code"`
	Name      string  `json:"name"`
	Address   *string `json:"address,omitempty"`
	OutletID  *string `json:"outlet_id,omitempty"`
	Outlet    *OutletReference `json:"outlet,omitempty"`
	Type      string  `json:"type"`
	Status    string  `json:"status"`
	IsDefault bool    `json:"is_default"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

// OutletReference represents an outlet reference
type OutletReference struct {
	ID   string `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

// WarehouseListResponse represents a paginated list of warehouses
type WarehouseListResponse struct {
	Data       []WarehouseResponse `json:"data"`
	Pagination Pagination          `json:"pagination"`
}

// Pagination represents pagination metadata
type Pagination struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}
