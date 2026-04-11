package dto

// ReportFilterQuery represents common filters for reports endpoints.
type ReportFilterQuery struct {
	StartDate  *string
	EndDate    *string
	OutletID   *string
	ProductID  *string
	CategoryID *string
}

// ReportSummaryResponse represents summary cards data.
type ReportSummaryResponse struct {
	StartDate         string  `json:"start_date"`
	EndDate           string  `json:"end_date"`
	TotalRevenue      int64   `json:"total_revenue"`
	TotalTransactions int64   `json:"total_transactions"`
	TotalItemsSold    int64   `json:"total_items_sold"`
	AverageOrderValue int64   `json:"average_order_value"`
	LastUpdatedAt     *string `json:"last_updated_at,omitempty"`
}

// SalesSeriesPoint represents an aggregated sales point for charts.
type SalesSeriesPoint struct {
	Period            string `json:"period"`
	TotalRevenue      int64  `json:"total_revenue"`
	TotalTransactions int64  `json:"total_transactions"`
	TotalItemsSold    int64  `json:"total_items_sold"`
	AverageOrderValue int64  `json:"average_order_value"`
}

// ReportSalesResponse represents sales trend response.
type ReportSalesResponse struct {
	Range     string             `json:"range"`
	StartDate string             `json:"start_date"`
	EndDate   string             `json:"end_date"`
	Data      []SalesSeriesPoint `json:"data"`
}

// TopProductRow represents top selling product metrics.
type TopProductRow struct {
	ProductID    string  `json:"product_id"`
	ProductName  string  `json:"product_name"`
	CategoryID   *string `json:"category_id,omitempty"`
	CategoryName string  `json:"category_name,omitempty"`
	QuantitySold int64   `json:"quantity_sold"`
	Revenue      int64   `json:"revenue"`
}

// TopProductsResponse represents top-products endpoint response.
type TopProductsResponse struct {
	StartDate string          `json:"start_date"`
	EndDate   string          `json:"end_date"`
	Limit     int             `json:"limit"`
	Data      []TopProductRow `json:"data"`
}

// ProductSalesRow represents product sales metrics in selected period.
type ProductSalesRow struct {
	ProductID    string  `json:"product_id"`
	ProductName  string  `json:"product_name"`
	ProductSKU   string  `json:"product_sku"`
	ProductStatus string `json:"product_status"`
	CategoryID   *string `json:"category_id,omitempty"`
	CategoryName string  `json:"category_name,omitempty"`
	QuantitySold int64   `json:"quantity_sold"`
	Revenue      int64   `json:"revenue"`
}

// ProductSalesReportResponse represents full product sales list response.
type ProductSalesReportResponse struct {
	StartDate string            `json:"start_date"`
	EndDate   string            `json:"end_date"`
	SortBy    string            `json:"sort_by"`
	SortOrder string            `json:"sort_order"`
	Page      int               `json:"page"`
	PerPage   int               `json:"per_page"`
	Total     int64             `json:"total"`
	Data      []ProductSalesRow `json:"data"`
}

// PaymentMethodRow represents payment distribution row.
type PaymentMethodRow struct {
	Method            string  `json:"method"`
	TotalTransactions int64   `json:"total_transactions"`
	TotalRevenue      int64   `json:"total_revenue"`
	Percentage        float64 `json:"percentage"`
}

// PaymentMethodsResponse represents payment methods analytics response.
type PaymentMethodsResponse struct {
	StartDate string             `json:"start_date"`
	EndDate   string             `json:"end_date"`
	Data      []PaymentMethodRow `json:"data"`
}

// ConsistencyIssueRow represents a sale whose header totals differ from aggregated item totals.
type ConsistencyIssueRow struct {
	SaleID        string `json:"sale_id"`
	InvoiceNumber string `json:"invoice_number"`
	CreatedAt     string `json:"created_at"`
	SaleSubtotal  int64  `json:"sale_subtotal"`
	ItemsSubtotal int64  `json:"items_subtotal"`
	SaleTotal     int64  `json:"sale_total"`
	ItemsTotal    int64  `json:"items_total"`
}

// ConsistencyCheckResponse summarizes data consistency between sales headers and sale items.
type ConsistencyCheckResponse struct {
	StartDate     string                `json:"start_date"`
	EndDate       string                `json:"end_date"`
	Limit         int                   `json:"limit"`
	TotalChecked  int64                 `json:"total_checked"`
	TotalMismatch int64                 `json:"total_mismatch"`
	Data          []ConsistencyIssueRow `json:"data"`
}
