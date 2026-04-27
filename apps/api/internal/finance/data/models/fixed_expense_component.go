package models

import sharedModels "gipos/api/internal/core/shared/models"

// FixedExpenseComponent stores tenant-level recurring fixed expense defaults.
type FixedExpenseComponent struct {
	sharedModels.TenantModel
	Name      string `gorm:"type:varchar(200);not null" json:"name"`
	Amount    int64  `gorm:"type:bigint;not null;default:0" json:"amount"`
	SortOrder int    `gorm:"not null;default:0" json:"sort_order"`
	CreatedBy *uint  `gorm:"index" json:"created_by,omitempty"`
}

func (FixedExpenseComponent) TableName() string {
	return "finance_fixed_expense_components"
}
