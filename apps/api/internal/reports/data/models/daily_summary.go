package models

import (
	sharedModels "gipos/api/internal/core/shared/models"
	"time"
)

// DailySummary stores aggregated sales metrics per day and outlet.
type DailySummary struct {
	sharedModels.TenantModel
	OutletID          *uint     `gorm:"index:idx_report_summary_outlet" json:"outlet_id,omitempty"`
	ReportDate        time.Time `gorm:"type:date;not null;index:idx_report_summary_date" json:"report_date"`
	TotalRevenue      int64     `gorm:"type:bigint;not null;default:0" json:"total_revenue"`
	TotalTransactions int64     `gorm:"type:bigint;not null;default:0" json:"total_transactions"`
	TotalItemsSold    int64     `gorm:"type:bigint;not null;default:0" json:"total_items_sold"`
	AverageOrderValue int64     `gorm:"type:bigint;not null;default:0" json:"average_order_value"`
	SourceUpdatedAt   time.Time `gorm:"type:timestamp;not null" json:"source_updated_at"`
}

func (DailySummary) TableName() string {
	return "report_daily_summaries"
}
