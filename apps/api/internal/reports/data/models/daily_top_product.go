package models

import (
	sharedModels "gipos/api/internal/core/shared/models"
	"time"
)

// DailyTopProduct stores aggregated top product metrics per day and outlet.
type DailyTopProduct struct {
	sharedModels.TenantModel
	OutletID       *uint     `gorm:"index:idx_report_top_product_outlet" json:"outlet_id,omitempty"`
	ReportDate     time.Time `gorm:"type:date;not null;index:idx_report_top_product_date" json:"report_date"`
	ProductID      uint      `gorm:"not null;index:idx_report_top_product_product" json:"product_id"`
	ProductName    string    `gorm:"type:varchar(200);not null" json:"product_name"`
	CategoryID     *uint     `gorm:"index:idx_report_top_product_category" json:"category_id,omitempty"`
	CategoryName   string    `gorm:"type:varchar(200)" json:"category_name,omitempty"`
	QuantitySold   int64     `gorm:"type:bigint;not null;default:0" json:"quantity_sold"`
	Revenue        int64     `gorm:"type:bigint;not null;default:0" json:"revenue"`
	Rank           int       `gorm:"type:integer;not null;default:0" json:"rank"`
	SourceUpdatedAt time.Time `gorm:"type:timestamp;not null" json:"source_updated_at"`
}

func (DailyTopProduct) TableName() string {
	return "report_daily_top_products"
}
