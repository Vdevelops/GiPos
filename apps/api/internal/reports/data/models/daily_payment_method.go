package models

import (
	sharedModels "gipos/api/internal/core/shared/models"
	"time"
)

// DailyPaymentMethod stores aggregated payment method distribution per day and outlet.
type DailyPaymentMethod struct {
	sharedModels.TenantModel
	OutletID          *uint     `gorm:"index:idx_report_payment_method_outlet" json:"outlet_id,omitempty"`
	ReportDate        time.Time `gorm:"type:date;not null;index:idx_report_payment_method_date" json:"report_date"`
	PaymentMethod     string    `gorm:"type:varchar(50);not null;index:idx_report_payment_method_method" json:"payment_method"`
	TotalRevenue      int64     `gorm:"type:bigint;not null;default:0" json:"total_revenue"`
	TotalTransactions int64     `gorm:"type:bigint;not null;default:0" json:"total_transactions"`
	SourceUpdatedAt   time.Time `gorm:"type:timestamp;not null" json:"source_updated_at"`
}

func (DailyPaymentMethod) TableName() string {
	return "report_daily_payment_methods"
}
