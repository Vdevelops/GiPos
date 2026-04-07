package repositories

import (
	"fmt"
	sharedModels "gipos/api/internal/core/shared/models"
	reportModels "gipos/api/internal/reports/data/models"
	salesModels "gipos/api/internal/sales/data/models"
	"strings"
	"time"

	"gorm.io/gorm"
)

// ReportFilters contains strongly-typed filters for reports queries.
type ReportFilters struct {
	TenantID   uint
	StartDate  time.Time
	EndDate    time.Time
	OutletID   *uint
	ProductID  *uint
	CategoryID *uint
}

// ReportSummaryRow is an internal projection for summary metrics.
type ReportSummaryRow struct {
	TotalRevenue      int64
	TotalTransactions int64
	TotalItemsSold    int64
	AverageOrderValue int64
	LastUpdatedAt     *time.Time
}

// ReportSalesPointRow is an internal projection for sales timeseries.
type ReportSalesPointRow struct {
	Period            time.Time
	TotalRevenue      int64
	TotalTransactions int64
	TotalItemsSold    int64
}

// ReportTopProductRow is an internal projection for top products.
type ReportTopProductRow struct {
	ProductID    uint
	ProductName  string
	CategoryID   *uint
	CategoryName string
	QuantitySold int64
	Revenue      int64
}

// ReportPaymentMethodRow is an internal projection for payment distribution.
type ReportPaymentMethodRow struct {
	Method            string
	TotalTransactions int64
	TotalRevenue      int64
}

// ReportConsistencyIssueRow is an internal projection for sale header/detail mismatch.
type ReportConsistencyIssueRow struct {
	SaleID        uint
	InvoiceNumber string
	CreatedAt     time.Time
	SaleSubtotal  int64
	ItemsSubtotal int64
	SaleTotal     int64
	ItemsTotal    int64
}

// ReportRepository handles report queries and aggregation refresh.
type ReportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

func (r *ReportRepository) getExecutor(tx *gorm.DB) *gorm.DB {
	if tx != nil {
		return tx
	}
	return r.db
}

// RefreshDailyAggregatesForSale refreshes summary tables for a sale's date and outlet.
func (r *ReportRepository) RefreshDailyAggregatesForSale(tx *gorm.DB, tenantID, saleID uint) error {
	db := r.getExecutor(tx)

	var sale salesModels.Sale
	if err := db.Where("tenant_id = ? AND id = ? AND deleted_at IS NULL", tenantID, saleID).
		First(&sale).Error; err != nil {
		return err
	}

	reportDate := time.Date(sale.CreatedAt.Year(), sale.CreatedAt.Month(), sale.CreatedAt.Day(), 0, 0, 0, 0, time.UTC)
	outletID := sale.OutletID

	return r.RefreshDailyAggregates(db, tenantID, &outletID, reportDate)
}

// RefreshDateRange refreshes summary tables for each day in date range.
func (r *ReportRepository) RefreshDateRange(tx *gorm.DB, tenantID uint, outletID *uint, startDate, endDate time.Time) error {
	db := r.getExecutor(tx)
	start := time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, time.UTC)
	end := time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 0, 0, 0, 0, time.UTC)

	for day := start; !day.After(end); day = day.AddDate(0, 0, 1) {
		if err := r.RefreshDailyAggregates(db, tenantID, outletID, day); err != nil {
			return err
		}
	}

	return nil
}

// RefreshDailyAggregates rebuilds all daily aggregate tables for a specific day and outlet.
func (r *ReportRepository) RefreshDailyAggregates(db *gorm.DB, tenantID uint, outletID *uint, reportDate time.Time) error {
	dayStart := time.Date(reportDate.Year(), reportDate.Month(), reportDate.Day(), 0, 0, 0, 0, time.UTC)
	dayEnd := dayStart.AddDate(0, 0, 1)
	now := time.Now().UTC()

	summaryDelete := db.Where("tenant_id = ? AND report_date = ?", tenantID, dayStart)
	topDelete := db.Where("tenant_id = ? AND report_date = ?", tenantID, dayStart)
	paymentDelete := db.Where("tenant_id = ? AND report_date = ?", tenantID, dayStart)
	if outletID != nil {
		summaryDelete = summaryDelete.Where("outlet_id = ?", *outletID)
		topDelete = topDelete.Where("outlet_id = ?", *outletID)
		paymentDelete = paymentDelete.Where("outlet_id = ?", *outletID)
	} else {
		summaryDelete = summaryDelete.Where("outlet_id IS NULL")
		topDelete = topDelete.Where("outlet_id IS NULL")
		paymentDelete = paymentDelete.Where("outlet_id IS NULL")
	}
	if err := summaryDelete.Delete(&reportModels.DailySummary{}).Error; err != nil {
		return err
	}
	if err := topDelete.Delete(&reportModels.DailyTopProduct{}).Error; err != nil {
		return err
	}
	if err := paymentDelete.Delete(&reportModels.DailyPaymentMethod{}).Error; err != nil {
		return err
	}

	completedSales := db.Table("sales s").
		Where("s.tenant_id = ? AND s.deleted_at IS NULL", tenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at < ?", dayStart, dayEnd)
	if outletID != nil {
		completedSales = completedSales.Where("s.outlet_id = ?", *outletID)
	}

	var summarySalesAgg struct {
		TotalRevenue      int64 `gorm:"column:total_revenue"`
		TotalTransactions int64 `gorm:"column:total_transactions"`
	}
	if err := completedSales.
		Select("COALESCE(SUM(s.total), 0) AS total_revenue, COUNT(*) AS total_transactions").
		Scan(&summarySalesAgg).Error; err != nil {
		return err
	}

	itemsAggQuery := db.Table("sale_items si").
		Joins("JOIN sales s ON s.id = si.sale_id AND s.tenant_id = si.tenant_id AND s.deleted_at IS NULL").
		Where("si.tenant_id = ? AND si.deleted_at IS NULL", tenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at < ?", dayStart, dayEnd)
	if outletID != nil {
		itemsAggQuery = itemsAggQuery.Where("s.outlet_id = ?", *outletID)
	}

	var itemsAgg struct {
		TotalItemsSold int64 `gorm:"column:total_items_sold"`
	}
	if err := itemsAggQuery.
		Select("COALESCE(SUM(si.quantity), 0) AS total_items_sold").
		Scan(&itemsAgg).Error; err != nil {
		return err
	}

	if summarySalesAgg.TotalTransactions > 0 {
		aov := summarySalesAgg.TotalRevenue / summarySalesAgg.TotalTransactions
		summary := reportModels.DailySummary{
			TenantModel:       sharedModels.TenantModel{TenantID: tenantID},
			OutletID:          outletID,
			ReportDate:        dayStart,
			TotalRevenue:      summarySalesAgg.TotalRevenue,
			TotalTransactions: summarySalesAgg.TotalTransactions,
			TotalItemsSold:    itemsAgg.TotalItemsSold,
			AverageOrderValue: aov,
			SourceUpdatedAt:   now,
		}
		if err := db.Create(&summary).Error; err != nil {
			return err
		}
	}

	topQuery := db.Table("sale_items si").
		Joins("JOIN sales s ON s.id = si.sale_id AND s.tenant_id = si.tenant_id AND s.deleted_at IS NULL").
		Joins("LEFT JOIN products p ON p.id = si.product_id AND p.tenant_id = si.tenant_id AND p.deleted_at IS NULL").
		Joins("LEFT JOIN categories c ON c.id = p.category_id AND c.tenant_id = si.tenant_id AND c.deleted_at IS NULL").
		Where("si.tenant_id = ? AND si.deleted_at IS NULL", tenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at < ?", dayStart, dayEnd)
	if outletID != nil {
		topQuery = topQuery.Where("s.outlet_id = ?", *outletID)
	}

	var topRows []ReportTopProductRow
	if err := topQuery.
		Select(strings.Join([]string{
			"si.product_id",
			"MAX(si.product_name) AS product_name",
			"p.category_id",
			"COALESCE(MAX(c.name), '') AS category_name",
			"COALESCE(SUM(si.quantity), 0) AS quantity_sold",
			"COALESCE(SUM(si.total), 0) AS revenue",
		}, ", ")).
		Group("si.product_id, p.category_id").
		Order("quantity_sold DESC, revenue DESC").
		Limit(20).
		Scan(&topRows).Error; err != nil {
		return err
	}

	if len(topRows) > 0 {
		topModels := make([]reportModels.DailyTopProduct, 0, len(topRows))
		for i, row := range topRows {
			topModels = append(topModels, reportModels.DailyTopProduct{
				TenantModel:     sharedModels.TenantModel{TenantID: tenantID},
				OutletID:        outletID,
				ReportDate:      dayStart,
				ProductID:       row.ProductID,
				ProductName:     row.ProductName,
				CategoryID:      row.CategoryID,
				CategoryName:    row.CategoryName,
				QuantitySold:    row.QuantitySold,
				Revenue:         row.Revenue,
				Rank:            i + 1,
				SourceUpdatedAt: now,
			})
		}
		if err := db.Create(&topModels).Error; err != nil {
			return err
		}
	}

	paymentQuery := db.Table("sales s").
		Where("s.tenant_id = ? AND s.deleted_at IS NULL", tenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at < ?", dayStart, dayEnd)
	if outletID != nil {
		paymentQuery = paymentQuery.Where("s.outlet_id = ?", *outletID)
	}

	var paymentRows []ReportPaymentMethodRow
	if err := paymentQuery.
		Select("s.payment_method AS method, COUNT(*) AS total_transactions, COALESCE(SUM(s.total), 0) AS total_revenue").
		Group("s.payment_method").
		Scan(&paymentRows).Error; err != nil {
		return err
	}

	if len(paymentRows) > 0 {
		paymentModels := make([]reportModels.DailyPaymentMethod, 0, len(paymentRows))
		for _, row := range paymentRows {
			paymentModels = append(paymentModels, reportModels.DailyPaymentMethod{
				TenantModel:       sharedModels.TenantModel{TenantID: tenantID},
				OutletID:          outletID,
				ReportDate:        dayStart,
				PaymentMethod:     row.Method,
				TotalRevenue:      row.TotalRevenue,
				TotalTransactions: row.TotalTransactions,
				SourceUpdatedAt:   now,
			})
		}
		if err := db.Create(&paymentModels).Error; err != nil {
			return err
		}
	}

	return nil
}

func (r *ReportRepository) GetSummaryFromAggregates(filters ReportFilters) (*ReportSummaryRow, error) {
	query := r.db.Table("report_daily_summaries rds").
		Where("rds.tenant_id = ? AND rds.deleted_at IS NULL", filters.TenantID).
		Where("rds.report_date >= ? AND rds.report_date <= ?", dateOnly(filters.StartDate), dateOnly(filters.EndDate))
	if filters.OutletID != nil {
		query = query.Where("rds.outlet_id = ?", *filters.OutletID)
	} else {
		query = query.Where("rds.outlet_id IS NULL")
	}

	var row ReportSummaryRow
	if err := query.Select(strings.Join([]string{
		"COALESCE(SUM(rds.total_revenue), 0) AS total_revenue",
		"COALESCE(SUM(rds.total_transactions), 0) AS total_transactions",
		"COALESCE(SUM(rds.total_items_sold), 0) AS total_items_sold",
		"COALESCE(MAX(rds.source_updated_at), NULL) AS last_updated_at",
	}, ", ")).Scan(&row).Error; err != nil {
		return nil, err
	}

	if row.TotalTransactions > 0 {
		row.AverageOrderValue = row.TotalRevenue / row.TotalTransactions
	}

	return &row, nil
}

func (r *ReportRepository) GetSummaryFromRaw(filters ReportFilters) (*ReportSummaryRow, error) {
	query := r.db.Table("sale_items si").
		Joins("JOIN sales s ON s.id = si.sale_id AND s.tenant_id = si.tenant_id AND s.deleted_at IS NULL").
		Joins("LEFT JOIN products p ON p.id = si.product_id AND p.tenant_id = si.tenant_id AND p.deleted_at IS NULL").
		Where("si.tenant_id = ? AND si.deleted_at IS NULL", filters.TenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at <= ?", filters.StartDate, filters.EndDate)

	if filters.OutletID != nil {
		query = query.Where("s.outlet_id = ?", *filters.OutletID)
	}
	if filters.ProductID != nil {
		query = query.Where("si.product_id = ?", *filters.ProductID)
	}
	if filters.CategoryID != nil {
		query = query.Where("p.category_id = ?", *filters.CategoryID)
	}

	var row ReportSummaryRow
	if err := query.Select(strings.Join([]string{
		"COALESCE(SUM(si.total), 0) AS total_revenue",
		"COALESCE(COUNT(DISTINCT si.sale_id), 0) AS total_transactions",
		"COALESCE(SUM(si.quantity), 0) AS total_items_sold",
		"COALESCE(MAX(s.updated_at), NULL) AS last_updated_at",
	}, ", ")).Scan(&row).Error; err != nil {
		return nil, err
	}

	if row.TotalTransactions > 0 {
		row.AverageOrderValue = row.TotalRevenue / row.TotalTransactions
	}

	return &row, nil
}

func (r *ReportRepository) GetSalesSeriesFromAggregates(filters ReportFilters, rangeType string) ([]ReportSalesPointRow, error) {
	periodExpr, err := periodExprForAggregates(rangeType)
	if err != nil {
		return nil, err
	}

	query := r.db.Table("report_daily_summaries rds").
		Where("rds.tenant_id = ? AND rds.deleted_at IS NULL", filters.TenantID).
		Where("rds.report_date >= ? AND rds.report_date <= ?", dateOnly(filters.StartDate), dateOnly(filters.EndDate))
	if filters.OutletID != nil {
		query = query.Where("rds.outlet_id = ?", *filters.OutletID)
	} else {
		query = query.Where("rds.outlet_id IS NULL")
	}

	var rows []ReportSalesPointRow
	if err := query.Select(fmt.Sprintf("%s AS period, COALESCE(SUM(rds.total_revenue), 0) AS total_revenue, COALESCE(SUM(rds.total_transactions), 0) AS total_transactions, COALESCE(SUM(rds.total_items_sold), 0) AS total_items_sold", periodExpr)).
		Group("period").
		Order("period ASC").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *ReportRepository) GetSalesSeriesFromRaw(filters ReportFilters, rangeType string) ([]ReportSalesPointRow, error) {
	periodExpr, err := periodExprForRaw(rangeType)
	if err != nil {
		return nil, err
	}

	query := r.db.Table("sale_items si").
		Joins("JOIN sales s ON s.id = si.sale_id AND s.tenant_id = si.tenant_id AND s.deleted_at IS NULL").
		Joins("LEFT JOIN products p ON p.id = si.product_id AND p.tenant_id = si.tenant_id AND p.deleted_at IS NULL").
		Where("si.tenant_id = ? AND si.deleted_at IS NULL", filters.TenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at <= ?", filters.StartDate, filters.EndDate)
	if filters.OutletID != nil {
		query = query.Where("s.outlet_id = ?", *filters.OutletID)
	}
	if filters.ProductID != nil {
		query = query.Where("si.product_id = ?", *filters.ProductID)
	}
	if filters.CategoryID != nil {
		query = query.Where("p.category_id = ?", *filters.CategoryID)
	}

	var rows []ReportSalesPointRow
	if err := query.Select(fmt.Sprintf("%s AS period, COALESCE(SUM(si.total), 0) AS total_revenue, COALESCE(COUNT(DISTINCT si.sale_id), 0) AS total_transactions, COALESCE(SUM(si.quantity), 0) AS total_items_sold", periodExpr)).
		Group("period").
		Order("period ASC").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *ReportRepository) GetTopProducts(filters ReportFilters, limit int) ([]ReportTopProductRow, error) {
	query := r.db.Table("report_daily_top_products rdtp").
		Where("rdtp.tenant_id = ? AND rdtp.deleted_at IS NULL", filters.TenantID).
		Where("rdtp.report_date >= ? AND rdtp.report_date <= ?", dateOnly(filters.StartDate), dateOnly(filters.EndDate))
	if filters.OutletID != nil {
		query = query.Where("rdtp.outlet_id = ?", *filters.OutletID)
	} else {
		query = query.Where("rdtp.outlet_id IS NULL")
	}
	if filters.ProductID != nil {
		query = query.Where("rdtp.product_id = ?", *filters.ProductID)
	}
	if filters.CategoryID != nil {
		query = query.Where("rdtp.category_id = ?", *filters.CategoryID)
	}

	var rows []ReportTopProductRow
	if err := query.Select(strings.Join([]string{
		"rdtp.product_id",
		"MAX(rdtp.product_name) AS product_name",
		"rdtp.category_id",
		"COALESCE(MAX(rdtp.category_name), '') AS category_name",
		"COALESCE(SUM(rdtp.quantity_sold), 0) AS quantity_sold",
		"COALESCE(SUM(rdtp.revenue), 0) AS revenue",
	}, ", ")).
		Group("rdtp.product_id, rdtp.category_id").
		Order("quantity_sold DESC, revenue DESC").
		Limit(limit).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *ReportRepository) GetPaymentMethodsFromAggregates(filters ReportFilters) ([]ReportPaymentMethodRow, error) {
	query := r.db.Table("report_daily_payment_methods rdpm").
		Where("rdpm.tenant_id = ? AND rdpm.deleted_at IS NULL", filters.TenantID).
		Where("rdpm.report_date >= ? AND rdpm.report_date <= ?", dateOnly(filters.StartDate), dateOnly(filters.EndDate))
	if filters.OutletID != nil {
		query = query.Where("rdpm.outlet_id = ?", *filters.OutletID)
	} else {
		query = query.Where("rdpm.outlet_id IS NULL")
	}

	var rows []ReportPaymentMethodRow
	if err := query.Select("rdpm.payment_method AS method, COALESCE(SUM(rdpm.total_transactions), 0) AS total_transactions, COALESCE(SUM(rdpm.total_revenue), 0) AS total_revenue").
		Group("rdpm.payment_method").
		Order("total_revenue DESC").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *ReportRepository) GetPaymentMethodsFromRaw(filters ReportFilters) ([]ReportPaymentMethodRow, error) {
	query := r.db.Table("sale_items si").
		Joins("JOIN sales s ON s.id = si.sale_id AND s.tenant_id = si.tenant_id AND s.deleted_at IS NULL").
		Joins("LEFT JOIN products p ON p.id = si.product_id AND p.tenant_id = si.tenant_id AND p.deleted_at IS NULL").
		Where("si.tenant_id = ? AND si.deleted_at IS NULL", filters.TenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at <= ?", filters.StartDate, filters.EndDate)
	if filters.OutletID != nil {
		query = query.Where("s.outlet_id = ?", *filters.OutletID)
	}
	if filters.ProductID != nil {
		query = query.Where("si.product_id = ?", *filters.ProductID)
	}
	if filters.CategoryID != nil {
		query = query.Where("p.category_id = ?", *filters.CategoryID)
	}

	var rows []ReportPaymentMethodRow
	if err := query.Select("s.payment_method AS method, COALESCE(COUNT(DISTINCT si.sale_id), 0) AS total_transactions, COALESCE(SUM(si.total), 0) AS total_revenue").
		Group("s.payment_method").
		Order("total_revenue DESC").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *ReportRepository) CountCompletedSales(filters ReportFilters) (int64, error) {
	query := r.db.Table("sales s").
		Where("s.tenant_id = ? AND s.deleted_at IS NULL", filters.TenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at <= ?", filters.StartDate, filters.EndDate)

	if filters.OutletID != nil {
		query = query.Where("s.outlet_id = ?", *filters.OutletID)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return 0, err
	}

	return total, nil
}

func (r *ReportRepository) GetConsistencyIssues(filters ReportFilters, limit int) ([]ReportConsistencyIssueRow, int64, error) {
	base := r.db.Table("sales s").
		Joins("LEFT JOIN sale_items si ON si.sale_id = s.id AND si.tenant_id = s.tenant_id AND si.deleted_at IS NULL").
		Where("s.tenant_id = ? AND s.deleted_at IS NULL", filters.TenantID).
		Where("s.status = ? AND s.payment_status = ?", salesModels.SaleStatusCompleted, salesModels.PaymentStatusCompleted).
		Where("s.created_at >= ? AND s.created_at <= ?", filters.StartDate, filters.EndDate)

	if filters.OutletID != nil {
		base = base.Where("s.outlet_id = ?", *filters.OutletID)
	}

	mismatchCondition := strings.Join([]string{
		"s.subtotal <> COALESCE(SUM(si.subtotal), 0)",
		"s.total <> COALESCE(SUM(si.total), 0)",
	}, " OR ")

	mismatchSubQuery := base.
		Select("s.id").
		Group("s.id").
		Having(mismatchCondition)

	var totalMismatch int64
	if err := r.db.Table("(?) AS mismatches", mismatchSubQuery).Count(&totalMismatch).Error; err != nil {
		return nil, 0, err
	}

	var rows []ReportConsistencyIssueRow
	if err := base.
		Select(strings.Join([]string{
			"s.id AS sale_id",
			"s.invoice_number",
			"s.created_at",
			"s.subtotal AS sale_subtotal",
			"COALESCE(SUM(si.subtotal), 0) AS items_subtotal",
			"s.total AS sale_total",
			"COALESCE(SUM(si.total), 0) AS items_total",
		}, ", ")).
		Group("s.id, s.invoice_number, s.created_at, s.subtotal, s.total").
		Having(mismatchCondition).
		Order("s.created_at DESC").
		Limit(limit).
		Scan(&rows).Error; err != nil {
		return nil, 0, err
	}

	return rows, totalMismatch, nil
}

func periodExprForAggregates(rangeType string) (string, error) {
	switch rangeType {
	case "daily":
		return "DATE(rds.report_date)", nil
	case "monthly":
		return "DATE_TRUNC('month', rds.report_date)", nil
	case "yearly":
		return "DATE_TRUNC('year', rds.report_date)", nil
	default:
		return "", fmt.Errorf("unsupported range type")
	}
}

func periodExprForRaw(rangeType string) (string, error) {
	switch rangeType {
	case "hourly":
		return "DATE_TRUNC('hour', s.created_at)", nil
	case "daily":
		return "DATE(s.created_at)", nil
	case "monthly":
		return "DATE_TRUNC('month', s.created_at)", nil
	case "yearly":
		return "DATE_TRUNC('year', s.created_at)", nil
	default:
		return "", fmt.Errorf("unsupported range type")
	}
}

func dateOnly(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}
