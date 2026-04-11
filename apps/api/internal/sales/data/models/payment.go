package models

import (
	"encoding/json"
	"strings"
	"time"
	"gipos/api/internal/core/shared/models"

	"gorm.io/gorm"
)

// PaymentMethod represents payment method types
const (
	PaymentMethodCash     = "cash"      // Cash payment
	PaymentMethodQRIS     = "qris"      // QRIS payment
	PaymentMethodEWallet  = "e_wallet"  // E-wallet (GoPay, OVO, etc.)
	PaymentMethodTransfer = "transfer" // Bank transfer
	PaymentMethodCard     = "card"      // Debit/Credit card
)

// PaymentStatus represents payment status
const (
	PaymentStatusPending   = "pending"   // Payment pending
	PaymentStatusCompleted = "completed" // Payment completed
	PaymentStatusFailed    = "failed"    // Payment failed
	PaymentStatusCancelled = "cancelled" // Payment cancelled
	PaymentStatusRefunded  = "refunded"  // Payment refunded
)

// Payment represents a payment transaction
type Payment struct {
	models.TenantModel
	SaleID         uint     `gorm:"not null;index:idx_payment_sale" json:"sale_id"` // Foreign key to sales
	Method         string     `gorm:"type:varchar(50);not null;index:idx_payment_method" json:"method"` // cash, qris, e_wallet, transfer, card
	Amount         int64      `gorm:"type:bigint;not null;index:idx_payment_amount" json:"amount"` // Payment amount (in sen)
	Status         string     `gorm:"type:varchar(20);default:'pending';index:idx_payment_status" json:"status"` // pending, completed, failed, cancelled, refunded
	
	// Payment Gateway Info
	Gateway        string     `gorm:"type:varchar(50)" json:"gateway,omitempty"` // xendit, midtrans, etc.
	GatewayID      *string    `gorm:"type:varchar(100);index:idx_payment_gateway_id" json:"gateway_id,omitempty"` // Payment gateway transaction ID
	GatewayResponse string    `gorm:"type:jsonb" json:"gateway_response,omitempty"` // Full gateway response (JSON)
	
	// QRIS Specific
	QRCodeURL      *string    `gorm:"type:varchar(500)" json:"qr_code_url,omitempty"` // QR code image URL
	QRISExpiredAt  *time.Time `gorm:"index" json:"qris_expired_at,omitempty"` // QRIS expiration time
	
	// E-Wallet Specific
	EWalletType    *string    `gorm:"type:varchar(50)" json:"e_wallet_type,omitempty"` // gopay, ovo, shopee_pay, dana
	PaymentLink    *string    `gorm:"type:varchar(500)" json:"payment_link,omitempty"` // Payment link URL
	
	// Transfer Specific
	BankName       *string    `gorm:"type:varchar(100)" json:"bank_name,omitempty"` // Bank name (BCA, Mandiri, etc.)
	AccountNumber  *string    `gorm:"type:varchar(50)" json:"account_number,omitempty"` // Account number
	
	// Card Specific
	CardType       *string    `gorm:"type:varchar(50)" json:"card_type,omitempty"` // debit, credit
	CardLast4      *string    `gorm:"type:varchar(4)" json:"card_last_4,omitempty"` // Last 4 digits
	
	// Timestamps
	PaidAt         *time.Time `gorm:"index:idx_payment_paid_at" json:"paid_at,omitempty"` // When payment was completed
	FailedAt       *time.Time `json:"failed_at,omitempty"` // When payment failed
	FailureReason  string      `gorm:"type:text" json:"failure_reason,omitempty"` // Reason for failure
	
	// Relations
	Sale           *Sale      `gorm:"foreignKey:SaleID" json:"sale,omitempty"`
}

func (p *Payment) normalizeGatewayResponse() {
	trimmed := strings.TrimSpace(p.GatewayResponse)
	if trimmed == "" {
		p.GatewayResponse = "{}"
		return
	}

	if json.Valid([]byte(trimmed)) {
		p.GatewayResponse = trimmed
		return
	}

	// Fallback to a valid JSON string to avoid jsonb insert errors.
	encoded, err := json.Marshal(trimmed)
	if err != nil {
		p.GatewayResponse = "{}"
		return
	}
	p.GatewayResponse = string(encoded)
}

// BeforeCreate ensures jsonb fields are valid before insert.
func (p *Payment) BeforeCreate(_ *gorm.DB) error {
	p.normalizeGatewayResponse()
	return nil
}

// BeforeUpdate ensures jsonb fields are valid before update.
func (p *Payment) BeforeUpdate(_ *gorm.DB) error {
	p.normalizeGatewayResponse()
	return nil
}

// TableName specifies the table name
func (Payment) TableName() string {
	return "payments"
}

