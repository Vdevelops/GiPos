package dto

// CreateCategoryRequest represents request DTO for creating a category
type CreateCategoryRequest struct {
	Name        string  `json:"name" binding:"required,min=3,max=200"`
	Slug        string  `json:"slug,omitempty" binding:"omitempty,max=255"`
	Description string  `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	ImageURL    string  `json:"image_url,omitempty" binding:"omitempty,url,max=500"`
	SortOrder   int     `json:"sort_order,omitempty"`
	Status      string  `json:"status,omitempty" binding:"omitempty,oneof=active inactive"`
}

// UpdateCategoryRequest represents request DTO for updating a category
type UpdateCategoryRequest struct {
	Name        *string `json:"name,omitempty" binding:"omitempty,min=3,max=200"`
	Slug        *string `json:"slug,omitempty" binding:"omitempty,max=255"`
	Description *string `json:"description,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	ImageURL    *string `json:"image_url,omitempty" binding:"omitempty,url,max=500"`
	SortOrder   *int    `json:"sort_order,omitempty"`
	Status      *string `json:"status,omitempty" binding:"omitempty,oneof=active inactive"`
}

// CategoryResponse represents response DTO for category
type CategoryResponse struct {
	ID          string  `json:"id"`
	OutletID    *string `json:"outlet_id,omitempty"`
	ParentID    *string `json:"parent_id,omitempty"`
	Name        string  `json:"name"`
	Slug        string  `json:"slug"`
	Description string  `json:"description,omitempty"`
	ImageURL    string  `json:"image_url,omitempty"`
	SortOrder   int     `json:"sort_order"`
	Status      string  `json:"status"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

