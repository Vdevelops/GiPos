package models

import (
	sharedModels "gipos/api/internal/core/shared/models"
	"time"
)

// OpeningBalance stores initial balance that is set once per tenant.
type OpeningBalance struct {
	sharedModels.TenantModel
	EffectiveDate time.Time `gorm:"type:date;not null;index:idx_finance_opening_effective_date" json:"effective_date"`
	Amount        int64     `gorm:"type:bigint;not null;default:0" json:"amount"`
	CreatedBy     *uint     `gorm:"index" json:"created_by,omitempty"`
}

func (OpeningBalance) TableName() string {
	return "finance_opening_balances"
}
