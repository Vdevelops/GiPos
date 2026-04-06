package models

import (
	authModels "gipos/api/internal/auth/data/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	"gipos/api/internal/core/shared/models"
	"time"

	"gorm.io/gorm"
)

// ShiftStatus represents the status of a shift
const (
	ShiftStatusOpen   = "open"   // Shift is open
	ShiftStatusClosed = "closed" // Shift is closed
)

// Shift represents a cashier shift
type Shift struct {
	models.TenantModel
	OutletID    uint `gorm:"not null;index:idx_shift_tenant_outlet" json:"outlet_id"` // Foreign key to outlets
	UserID      uint `gorm:"not null;index:idx_shift_user" json:"user_id"`            // Foreign key to users (cashier)
	ShiftNumber string `gorm:"type:varchar(50);not null;index:idx_shift_number" json:"shift_number"`     // Shift number (e.g., SHIFT-20240115-001)
	Status      string `gorm:"type:varchar(20);default:'open';index:idx_shift_status" json:"status"`     // open, closed

	// Opening
	OpeningCash  int64     `gorm:"type:bigint;not null;default:0" json:"opening_cash"`                       // Opening cash amount (in sen)
	OpeningTime  time.Time `gorm:"type:timestamp;not null;index:idx_shift_opening_time" json:"opening_time"` // When shift was opened
	OpeningNotes string    `gorm:"type:text" json:"opening_notes,omitempty"`                                 // Opening notes

	// Closing
	ClosingCash  *int64     `gorm:"type:bigint" json:"closing_cash,omitempty"`                                 // Closing cash amount (in sen)
	ExpectedCash *int64     `gorm:"type:bigint" json:"expected_cash,omitempty"`                                // Expected cash (opening + cash sales)
	Difference   *int64     `gorm:"type:bigint" json:"difference,omitempty"`                                   // Difference between expected and actual
	ClosingTime  *time.Time `gorm:"type:timestamp;index:idx_shift_closing_time" json:"closing_time,omitempty"` // When shift was closed
	ClosingNotes string     `gorm:"type:text" json:"closing_notes,omitempty"`                                  // Closing notes

	// Statistics (calculated)
	TotalSales        int64 `gorm:"type:bigint;default:0" json:"total_sales"`         // Total sales amount (in sen)
	TotalTransactions int   `gorm:"type:integer;default:0" json:"total_transactions"` // Total number of transactions
	CashSales         int64 `gorm:"type:bigint;default:0" json:"cash_sales"`          // Total cash sales (in sen)
	NonCashSales      int64 `gorm:"type:bigint;default:0" json:"non_cash_sales"`      // Total non-cash sales (in sen)

	// Relations
	Outlet *outletModels.Outlet `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	User   *authModels.User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Sales  []Sale               `gorm:"foreignKey:ShiftID" json:"sales,omitempty"`
}

// TableName specifies the table name
func (Shift) TableName() string {
	return "shifts"
}

// BeforeCreate hook to generate shift number
func (s *Shift) BeforeCreate(tx *gorm.DB) error {
	if s.ShiftNumber == "" {
		// Generate shift number: SHIFT-{YYYYMMDD}-{SEQUENCE}
		// Example: SHIFT-20240115-001
		s.ShiftNumber = generateShiftNumber(s.TenantID, s.OutletID)
	}
	return nil
}

// generateShiftNumber generates a unique shift number
func generateShiftNumber(tenantID, outletID uint) string {
	// Implementation: Generate based on date and sequence
	return "SHIFT-" + time.Now().Format("20060102") + "-001"
}
