package models

import sharedModels "gipos/api/internal/core/shared/models"

// ExpenseItem stores each expense line item.
type ExpenseItem struct {
	sharedModels.TenantModel
	EntryID uint   `gorm:"not null;index:idx_finance_expense_item_entry" json:"entry_id"`
	Name    string `gorm:"type:varchar(200);not null" json:"name"`
	Amount  int64  `gorm:"type:bigint;not null;default:0" json:"amount"`
}

func (ExpenseItem) TableName() string {
	return "finance_expense_items"
}
