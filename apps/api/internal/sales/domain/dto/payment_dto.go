package dto

// ProcessPaymentRequest represents the request to process a payment
type ProcessPaymentRequest struct {
	SaleID        string  `json:"sale_id" binding:"required"`
	Method        string  `json:"method" binding:"required,oneof=cash qris e_wallet transfer card"`
	Amount        int64   `json:"amount" binding:"required,min=1"`
	CashReceived  *int64  `json:"cash_received,omitempty"` // For cash payment
	EWalletType   *string `json:"e_wallet_type,omitempty"` // gopay, ovo, shopee_pay, dana
	BankName      *string `json:"bank_name,omitempty"`      // For transfer payment
	AccountNumber *string `json:"account_number,omitempty"` // For transfer payment
}

// UpdatePaymentRequest represents the request to update payment status
type UpdatePaymentRequest struct {
	Status        *string `json:"status,omitempty" binding:"omitempty,oneof=pending completed failed cancelled refunded"`
	GatewayID     *string `json:"gateway_id,omitempty"`
	QRCodeURL     *string `json:"qr_code_url,omitempty"`
	PaymentLink   *string `json:"payment_link,omitempty"`
	FailureReason *string `json:"failure_reason,omitempty"`
}

// PaymentResponse represents a payment in the response
type PaymentResponse struct {
	ID             string  `json:"id"`
	SaleID         string  `json:"sale_id"`
	Method         string  `json:"method"`
	Amount         int64   `json:"amount"`
	Status         string  `json:"status"`
	Gateway        string  `json:"gateway,omitempty"`
	GatewayID      *string `json:"gateway_id,omitempty"`
	QRCodeURL      *string `json:"qr_code_url,omitempty"`
	QRISExpiredAt  *string `json:"qris_expired_at,omitempty"`
	EWalletType    *string `json:"e_wallet_type,omitempty"`
	PaymentLink    *string `json:"payment_link,omitempty"`
	BankName       *string `json:"bank_name,omitempty"`
	AccountNumber  *string `json:"account_number,omitempty"`
	CardType       *string `json:"card_type,omitempty"`
	CardLast4      *string `json:"card_last_4,omitempty"`
	PaidAt         *string `json:"paid_at,omitempty"`
	FailedAt       *string `json:"failed_at,omitempty"`
	FailureReason  string  `json:"failure_reason,omitempty"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}
