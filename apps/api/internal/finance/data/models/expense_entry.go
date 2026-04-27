package models

import (
	sharedModels "gipos/api/internal/core/shared/models"
	"time"
)

const (
	ExpenseKindGeneral = "general"
	ExpenseKindFixed   = "fixed"
)

// ExpenseEntry stores expense transactions per date.
type ExpenseEntry struct {
	sharedModels.TenantModel
	EntryDate    time.Time     `gorm:"type:date;not null;index:idx_finance_expense_entry_date" json:"entry_date"`
	Kind         string        `gorm:"type:varchar(20);not null;index:idx_finance_expense_entry_kind" json:"kind"`
	TotalAmount  int64         `gorm:"type:bigint;not null;default:0" json:"total_amount"`
	Notes        string        `gorm:"type:text" json:"notes,omitempty"`
	CreatedBy    *uint         `gorm:"index" json:"created_by,omitempty"`
	ExpenseItems []ExpenseItem `gorm:"foreignKey:EntryID" json:"items,omitempty"`
}

func (ExpenseEntry) TableName() string {
	return "finance_expense_entries"
}
