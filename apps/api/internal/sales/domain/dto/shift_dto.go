package dto

// CreateShiftRequest represents the request to open a shift
type CreateShiftRequest struct {
	OutletID     string `json:"outlet_id" binding:"required"`
	OpeningCash  int64  `json:"opening_cash" binding:"min=0"`
	OpeningNotes string `json:"opening_notes,omitempty"`
}

// CloseShiftRequest represents the request to close a shift
type CloseShiftRequest struct {
	ClosingCash  int64  `json:"closing_cash" binding:"required,min=0"`
	ClosingNotes string `json:"closing_notes,omitempty"`
}

// ShiftResponse represents a shift in the response
type ShiftResponse struct {
	ID               string            `json:"id"`
	OutletID         string            `json:"outlet_id"`
	UserID           string            `json:"user_id"`
	ShiftNumber      string            `json:"shift_number"`
	Status           string            `json:"status"`
	OpeningCash      int64             `json:"opening_cash"`
	OpeningTime      string            `json:"opening_time"`
	OpeningNotes     string            `json:"opening_notes,omitempty"`
	ClosingCash      *int64            `json:"closing_cash,omitempty"`
	ExpectedCash     *int64            `json:"expected_cash,omitempty"`
	Difference       *int64            `json:"difference,omitempty"`
	ClosingTime      *string           `json:"closing_time,omitempty"`
	ClosingNotes     string            `json:"closing_notes,omitempty"`
	TotalSales       int64             `json:"total_sales"`
	TotalTransactions int              `json:"total_transactions"`
	CashSales        int64             `json:"cash_sales"`
	NonCashSales     int64             `json:"non_cash_sales"`
	CreatedAt        string            `json:"created_at"`
	UpdatedAt        string            `json:"updated_at"`
	Outlet           *OutletReference  `json:"outlet,omitempty"`
	User             *UserReference    `json:"user,omitempty"`
}

// UserReference represents user reference in response
type UserReference struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
