package dto

// CreateProductRequest represents request DTO for creating a product
type CreateProductRequest struct {
	Name        string  `json:"name" binding:"required,min=3,max=200"`
	SKU         string  `json:"sku" binding:"required,min=1,max=100"`
	Barcode     string  `json:"barcode,omitempty" binding:"omitempty,max=100"`
	Description string  `json:"description,omitempty"`
	Price       int64   `json:"price" binding:"required,min=1"`
	Cost        int64   `json:"cost,omitempty" binding:"omitempty,min=0"`
	CategoryID  *string `json:"category_id,omitempty"`
	Taxable     bool    `json:"taxable,omitempty"`
	TrackStock  bool    `json:"track_stock,omitempty"`
	Status      string  `json:"status,omitempty" binding:"omitempty,oneof=active inactive archived"`
}

// UpdateProductRequest represents request DTO for updating a product
type UpdateProductRequest struct {
	Name        *string `json:"name,omitempty" binding:"omitempty,min=3,max=200"`
	Barcode     *string `json:"barcode,omitempty" binding:"omitempty,max=100"`
	Description *string `json:"description,omitempty"`
	Price       *int64  `json:"price,omitempty" binding:"omitempty,min=1"`
	Cost        *int64  `json:"cost,omitempty" binding:"omitempty,min=0"`
	CategoryID  *string `json:"category_id,omitempty"`
	Taxable     *bool   `json:"taxable,omitempty"`
	Status      *string `json:"status,omitempty" binding:"omitempty,oneof=active inactive archived"`
}

// ProductResponse represents response DTO for product
type ProductResponse struct {
	ID          string                    `json:"id"`
	OutletID    *string                   `json:"outlet_id,omitempty"`
	Outlet      *OutletReference          `json:"outlet,omitempty"`
	CategoryID  *string                   `json:"category_id,omitempty"`
	Category    *CategoryReference        `json:"category,omitempty"`
	Name        string                    `json:"name"`
	SKU         string                    `json:"sku"`
	Barcode     string                    `json:"barcode,omitempty"`
	Description string                    `json:"description,omitempty"`
	Price       int64                     `json:"price"`
	Cost        int64                     `json:"cost,omitempty"`
	Taxable     bool                      `json:"taxable"`
	TrackStock  bool                      `json:"track_stock"`
	Status      string                    `json:"status"`
	Stocks      []ProductStockReference   `json:"stocks,omitempty"`
	CreatedAt   string                    `json:"created_at"`
	UpdatedAt   string                    `json:"updated_at"`
}

// CategoryReference represents a category reference in product response
type CategoryReference struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// OutletReference represents an outlet reference in product response
type OutletReference struct {
	ID   string `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

// ProductStockReference represents a product stock reference
type ProductStockReference struct {
	WarehouseID string `json:"warehouse_id"`
	Warehouse   *WarehouseReference `json:"warehouse,omitempty"`
	Quantity    int    `json:"quantity"`
	Reserved    int    `json:"reserved"`
}

// WarehouseReference represents a warehouse reference
type WarehouseReference struct {
	ID   string `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

// ProductImageRequest represents request DTO for creating/updating product image
type ProductImageRequest struct {
	URL          string `json:"url" binding:"required,url,max=500"`
	ThumbnailURL string `json:"thumbnail_url,omitempty" binding:"omitempty,url,max=500"`
	Order        int    `json:"order,omitempty"`
	Alt          string `json:"alt,omitempty" binding:"max=200"`
	Size         *int64 `json:"size,omitempty"`
	Width        *int   `json:"width,omitempty"`
	Height       *int   `json:"height,omitempty"`
	MimeType     string `json:"mime_type,omitempty" binding:"max=50"`
}

// ProductImageResponse represents response DTO for product image
type ProductImageResponse struct {
	ID           string `json:"id"`
	ProductID    string `json:"product_id"`
	URL          string `json:"url"`
	ThumbnailURL string `json:"thumbnail_url,omitempty"`
	Order        int    `json:"order"`
	Alt          string `json:"alt,omitempty"`
	Size         *int64 `json:"size,omitempty"`
	Width        *int   `json:"width,omitempty"`
	Height       *int   `json:"height,omitempty"`
	MimeType     string `json:"mime_type,omitempty"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// UpdateProductImageRequest represents request DTO for updating product image
type UpdateProductImageRequest struct {
	URL          *string `json:"url,omitempty" binding:"omitempty,url,max=500"`
	ThumbnailURL *string `json:"thumbnail_url,omitempty" binding:"omitempty,url,max=500"`
	Order        *int    `json:"order,omitempty"`
	Alt          *string `json:"alt,omitempty" binding:"omitempty,max=200"`
	Size         *int64  `json:"size,omitempty"`
	Width        *int    `json:"width,omitempty"`
	Height       *int    `json:"height,omitempty"`
	MimeType     *string `json:"mime_type,omitempty" binding:"omitempty,max=50"`
}

// ProductStockRequest represents request DTO for creating/updating product stock
type ProductStockRequest struct {
	WarehouseID string `json:"warehouse_id" binding:"required"`
	Quantity    int    `json:"quantity" binding:"min=0"`
	Reserved    int    `json:"reserved,omitempty" binding:"omitempty,min=0"`
	MinStock    int    `json:"min_stock,omitempty" binding:"omitempty,min=0"`
	MaxStock    int    `json:"max_stock,omitempty" binding:"omitempty,min=0"`
}

// ProductStockResponse represents response DTO for product stock
type ProductStockResponse struct {
	ID         string             `json:"id"`
	ProductID  string             `json:"product_id"`
	WarehouseID string             `json:"warehouse_id"`
	Warehouse  *WarehouseReference `json:"warehouse,omitempty"`
	Quantity   int                 `json:"quantity"`
	Reserved   int                 `json:"reserved"`
	MinStock   int                 `json:"min_stock"`
	MaxStock   int                 `json:"max_stock"`
	LastUpdated *string            `json:"last_updated,omitempty"`
	CreatedAt  string             `json:"created_at"`
	UpdatedAt  string             `json:"updated_at"`
}

// UpdateProductStockRequest represents request DTO for updating product stock
type UpdateProductStockRequest struct {
	Quantity    *int `json:"quantity,omitempty" binding:"omitempty,min=0"`
	Reserved    *int `json:"reserved,omitempty" binding:"omitempty,min=0"`
	MinStock    *int `json:"min_stock,omitempty" binding:"omitempty,min=0"`
	MaxStock    *int `json:"max_stock,omitempty" binding:"omitempty,min=0"`
}

// BulkProductImageRequest represents request DTO for bulk creating product images
type BulkProductImageRequest struct {
	Images []ProductImageRequest `json:"images" binding:"required,min=1,dive"`
}

// BulkProductStockRequest represents request DTO for bulk creating product stocks
type BulkProductStockRequest struct {
	Stocks []ProductStockRequest `json:"stocks" binding:"required,min=1,dive"`
}


