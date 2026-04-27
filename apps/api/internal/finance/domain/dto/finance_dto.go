package dto

type SetOpeningBalanceRequest struct {
	Amount        int64   `json:"amount" binding:"required,min=0"`
	EffectiveDate *string `json:"effective_date,omitempty"`
}

type CreateExpenseLineItemRequest struct {
	Name   string `json:"name" binding:"required,min=1,max=200"`
	Amount int64  `json:"amount" binding:"required,min=1"`
}

type CreateExpenseRequest struct {
	EntryDate *string                        `json:"entry_date,omitempty"`
	Notes     string                         `json:"notes,omitempty"`
	Items     []CreateExpenseLineItemRequest `json:"items" binding:"required,min=1,dive"`
}

type CreateFixedExpenseComponentRequest struct {
	Name   string `json:"name" binding:"required,min=1,max=200"`
	Amount int64  `json:"amount" binding:"required,min=0"`
}

type UpdateFixedExpenseComponentRequest struct {
	Name   *string `json:"name,omitempty"`
	Amount *int64  `json:"amount,omitempty"`
}

type UpdateExpenseItemRequest struct {
	Name   *string `json:"name,omitempty"`
	Amount *int64  `json:"amount,omitempty"`
}

type FinanceSummaryQuery struct {
	StartDate *string
	EndDate   *string
}

type OpeningBalanceResponse struct {
	ID            string `json:"id"`
	EffectiveDate string `json:"effective_date"`
	Amount        int64  `json:"amount"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

type ExpenseLineItemResponse struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Amount int64  `json:"amount"`
}

type ExpenseRecordResponse struct {
	ID         string                    `json:"id"`
	Kind       string                    `json:"kind"`
	EntryDate  string                    `json:"entry_date"`
	Total      int64                     `json:"total"`
	Notes      string                    `json:"notes,omitempty"`
	CreatedAt  string                    `json:"created_at"`
	UpdatedAt  string                    `json:"updated_at"`
	LineItems  []ExpenseLineItemResponse `json:"line_items"`
}

type FixedExpenseComponentResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Amount    int64  `json:"amount"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type FinanceDaySummary struct {
	Date                  string                  `json:"date"`
	OpeningBalance        int64                   `json:"opening_balance"`
	SalesCash             int64                   `json:"sales_cash"`
	SalesQRIS             int64                   `json:"sales_qris"`
	TotalRevenue          int64                   `json:"total_revenue"`
	GeneralExpenses       []ExpenseRecordResponse `json:"general_expenses"`
	GeneralExpenseTotal   int64                   `json:"general_expense_total"`
	FixedExpenses         []ExpenseRecordResponse `json:"fixed_expenses"`
	FixedExpenseTotal     int64                   `json:"fixed_expense_total"`
	WarungBalance         int64                   `json:"warung_balance"`
	EndingBalance         int64                   `json:"ending_balance"`
	IsEndingBalanceMinus  bool                    `json:"is_ending_balance_minus"`
	NextOpeningBalance    int64                   `json:"next_opening_balance"`
}

type FinanceSummaryResponse struct {
	StartDate           string              `json:"start_date"`
	EndDate             string              `json:"end_date"`
	HasOpeningBalance   bool                `json:"has_opening_balance"`
	OpeningBalance      int64               `json:"opening_balance"`
	FixedExpenseBudget  int64               `json:"fixed_expense_budget"`
	TotalRevenue        int64               `json:"total_revenue"`
	TotalGeneralExpense int64               `json:"total_general_expense"`
	TotalFixedExpense   int64               `json:"total_fixed_expense"`
	EndingBalance       int64               `json:"ending_balance"`
	FixedComponents     []FixedExpenseComponentResponse `json:"fixed_components"`
	Days                []FinanceDaySummary `json:"days"`
}
