package dto

// CreateSaleRequest represents the request to create a sale
type CreateSaleRequest struct {
	OutletID        string                `json:"outlet_id,omitempty"`
	ShiftID         *string               `json:"shift_id,omitempty"`
	CustomerID      *string               `json:"customer_id,omitempty"`
	Items           []CreateSaleItemRequest `json:"items" binding:"required,min=1,dive"`
	DiscountAmount  *int64                `json:"discount_amount,omitempty"`
	DiscountPercent *float64              `json:"discount_percent,omitempty"`
	PaymentMethod   string                `json:"payment_method" binding:"required,oneof=cash qris"`
	Notes           string                `json:"notes,omitempty"`
}

// CreateSaleItemRequest represents a sale item in the request
type CreateSaleItemRequest struct {
	ProductID       string   `json:"product_id" binding:"required"`
	Quantity        int      `json:"quantity" binding:"required,min=1"`
	UnitPrice       *int64   `json:"unit_price,omitempty"` // If not provided, use product price
	DiscountAmount  *int64   `json:"discount_amount,omitempty"`
	DiscountPercent *float64 `json:"discount_percent,omitempty"`
}

// UpdateSaleRequest represents the request to update a sale (for void/refund)
type UpdateSaleRequest struct {
	Status *string `json:"status,omitempty" binding:"omitempty,oneof=pending completed cancelled refunded"`
	Notes  *string `json:"notes,omitempty"`
}

// SaleResponse represents a sale in the response
type SaleResponse struct {
	ID              string                `json:"id"`
	OutletID        string                `json:"outlet_id"`
	ShiftID         *string               `json:"shift_id,omitempty"`
	InvoiceNumber   string                `json:"invoice_number"`
	CustomerID      *string               `json:"customer_id,omitempty"`
	CashierID       string                `json:"cashier_id"`
	Items           []SaleItemResponse    `json:"items"`
	Subtotal        int64                 `json:"subtotal"`
	DiscountAmount  int64                 `json:"discount_amount"`
	DiscountPercent float64               `json:"discount_percent"`
	TaxAmount       int64                 `json:"tax_amount"`
	Total           int64                 `json:"total"`
	PaymentMethod   string                `json:"payment_method"`
	PaymentStatus   string                `json:"payment_status"`
	Status          string                `json:"status"`
	Notes           string                `json:"notes,omitempty"`
	CompletedAt     *string               `json:"completed_at,omitempty"`
	PaidAt          *string               `json:"paid_at,omitempty"`
	CancelledAt     *string               `json:"cancelled_at,omitempty"`
	CreatedAt       string                `json:"created_at"`
	UpdatedAt       string                `json:"updated_at"`
	Outlet          *OutletReference      `json:"outlet,omitempty"`
	Cashier         *CashierReference     `json:"cashier,omitempty"`
	Payment         *PaymentResponse      `json:"payment,omitempty"`
}

// SaleItemResponse represents a sale item in the response
type SaleItemResponse struct {
	ID              string            `json:"id"`
	ProductID       string            `json:"product_id"`
	ProductName     string            `json:"product_name"`
	ProductSKU      string            `json:"product_sku"`
	Quantity        int               `json:"quantity"`
	UnitPrice       int64             `json:"unit_price"`
	DiscountAmount  int64             `json:"discount_amount"`
	DiscountPercent float64           `json:"discount_percent"`
	TaxAmount       int64             `json:"tax_amount"`
	Subtotal        int64             `json:"subtotal"`
	Total           int64             `json:"total"`
	Product         *ProductReference `json:"product,omitempty"`
}

// OutletReference represents outlet reference in response
type OutletReference struct {
	ID   string `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

// CashierReference represents cashier reference in response
type CashierReference struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// ProductReference represents product reference in response
type ProductReference struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	SKU   string `json:"sku"`
	Price int64  `json:"price"`
}
