package models

import (
	authModels "gipos/api/internal/auth/data/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	"gipos/api/internal/core/shared/models"
	"time"

	"gorm.io/gorm"
)

// SaleStatus represents the status of a sale
const (
	SaleStatusPending   = "pending"   // Sale created but not paid
	SaleStatusCompleted = "completed" // Sale paid and completed
	SaleStatusCancelled = "cancelled" // Sale cancelled
	SaleStatusRefunded  = "refunded"  // Sale refunded
)

// Sale represents a sales transaction
type Sale struct {
	models.TenantModel
	OutletID      uint  `gorm:"not null;index:idx_sale_tenant_outlet" json:"outlet_id"` // Foreign key to outlets
	ShiftID       *uint `gorm:"index:idx_sale_shift" json:"shift_id,omitempty"`         // Foreign key to shifts
	InvoiceNumber string  `gorm:"type:varchar(100);not null;index:idx_sale_invoice" json:"invoice_number"` // Unique invoice number
	CustomerID    *uint `gorm:"index:idx_sale_customer" json:"customer_id,omitempty"`   // Foreign key to customers (nullable)
	CashierID     uint  `gorm:"not null;index:idx_sale_cashier" json:"cashier_id"`      // Foreign key to users (cashier)

	// Amounts (all in sen)
	Subtotal        int64   `gorm:"type:bigint;not null" json:"subtotal"`                   // Subtotal before discount and tax
	DiscountAmount  int64   `gorm:"type:bigint;default:0" json:"discount_amount"`           // Total discount amount
	DiscountPercent float64 `gorm:"type:decimal(5,2);default:0" json:"discount_percent"`    // Discount percentage
	TaxAmount       int64   `gorm:"type:bigint;default:0" json:"tax_amount"`                // Tax amount (PPN)
	Total           int64   `gorm:"type:bigint;not null;index:idx_sale_total" json:"total"` // Final total amount

	// Payment
	PaymentMethod string  `gorm:"type:varchar(50);not null;index:idx_sale_payment_method" json:"payment_method"`          // cash, qris, e_wallet, transfer, card
	PaymentStatus string  `gorm:"type:varchar(20);default:'pending';index:idx_sale_payment_status" json:"payment_status"` // pending, completed, failed, refunded
	PaymentID     *string `gorm:"type:varchar(100);index" json:"payment_id,omitempty"`                                    // Payment gateway ID (Xendit, etc.)

	// Status
	Status string `gorm:"type:varchar(20);default:'pending';index:idx_sale_status" json:"status"` // pending, completed, cancelled, refunded
	Notes  string `gorm:"type:text" json:"notes,omitempty"`                                       // Additional notes

	// Timestamps
	CompletedAt *time.Time `gorm:"index:idx_sale_completed_at" json:"completed_at,omitempty"` // When sale was completed
	PaidAt      *time.Time `gorm:"index:idx_sale_paid_at" json:"paid_at,omitempty"`           // When payment was completed
	CancelledAt *time.Time `json:"cancelled_at,omitempty"`                                    // When sale was cancelled

	// Relations
	Outlet   *outletModels.Outlet `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	// Shift relation is defined in shift.go to avoid circular import
	Cashier  *authModels.User     `gorm:"foreignKey:CashierID" json:"cashier,omitempty"`
	Items    []SaleItem           `gorm:"foreignKey:SaleID" json:"items,omitempty"`
	Payment  *Payment             `gorm:"foreignKey:SaleID" json:"payment,omitempty"`
}

// TableName specifies the table name
func (Sale) TableName() string {
	return "sales"
}

// BeforeCreate hook to generate invoice number
func (s *Sale) BeforeCreate(tx *gorm.DB) error {
	if s.InvoiceNumber == "" {
		// Generate invoice number: INV-{YYYYMMDD}-{OUTLET_CODE}-{SEQUENCE}
		// Example: INV-20240115-001-0001
		s.InvoiceNumber = generateInvoiceNumber(s.TenantID, s.OutletID)
	}
	return nil
}

// generateInvoiceNumber generates a unique invoice number
func generateInvoiceNumber(tenantID, outletID uint) string {
	// Implementation: Generate based on date and sequence
	// This should query the last invoice number for today and increment
	return "INV-" + time.Now().Format("20060102") + "-001"
}
