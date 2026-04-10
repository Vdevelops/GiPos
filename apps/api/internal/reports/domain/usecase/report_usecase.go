package usecase

import (
	"encoding/json"
	"errors"
	"fmt"
	redisInfra "gipos/api/internal/core/infrastructure/redis"
	reportRepo "gipos/api/internal/reports/data/repositories"
	"gipos/api/internal/reports/domain/dto"
	"strconv"
	"strings"
	"time"
)

const reportCacheTTL = 10 * time.Second

// ReportUsecase handles business logic for reports and analytics.
type ReportUsecase struct {
	reportRepo *reportRepo.ReportRepository
}

func NewReportUsecase(reportRepo *reportRepo.ReportRepository) *ReportUsecase {
	return &ReportUsecase{reportRepo: reportRepo}
}

func (uc *ReportUsecase) GetSummary(tenantID string, query dto.ReportFilterQuery) (*dto.ReportSummaryResponse, error) {
	filters, err := uc.parseFilters(tenantID, query)
	if err != nil {
		return nil, err
	}

	cacheKey := uc.cacheKey("summary", filters, "", 0)
	if cached, ok := getCachedJSON[dto.ReportSummaryResponse](cacheKey); ok {
		return &cached, nil
	}

	// Keep summary tables warm so reads stay near real-time and deterministic.
	if err := uc.reportRepo.RefreshDateRange(nil, filters.TenantID, filters.OutletID, filters.StartDate, filters.EndDate); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	var row *reportRepo.ReportSummaryRow
	if filters.ProductID != nil || filters.CategoryID != nil {
		row, err = uc.reportRepo.GetSummaryFromRaw(filters)
	} else {
		row, err = uc.reportRepo.GetSummaryFromAggregates(filters)
	}
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	resp := &dto.ReportSummaryResponse{
		StartDate:         formatDate(filters.StartDate),
		EndDate:           formatDate(filters.EndDate),
		TotalRevenue:      row.TotalRevenue,
		TotalTransactions: row.TotalTransactions,
		TotalItemsSold:    row.TotalItemsSold,
		AverageOrderValue: row.AverageOrderValue,
	}
	if row.LastUpdatedAt != nil {
		lastUpdated := row.LastUpdatedAt.UTC().Format(time.RFC3339)
		resp.LastUpdatedAt = &lastUpdated
	}

	setCachedJSON(cacheKey, resp)

	return resp, nil
}

func (uc *ReportUsecase) GetSalesSeries(tenantID string, rangeType string, query dto.ReportFilterQuery) (*dto.ReportSalesResponse, error) {
	filters, err := uc.parseFilters(tenantID, query)
	if err != nil {
		return nil, err
	}

	normalizedRange := strings.TrimSpace(strings.ToLower(rangeType))
	if normalizedRange == "" {
		normalizedRange = "daily"
	}
	if normalizedRange != "hourly" && normalizedRange != "daily" && normalizedRange != "monthly" && normalizedRange != "yearly" {
		return nil, errors.New("INVALID_ENUM")
	}

	cacheKey := uc.cacheKey("sales", filters, normalizedRange, 0)
	if cached, ok := getCachedJSON[dto.ReportSalesResponse](cacheKey); ok {
		return &cached, nil
	}

	if normalizedRange != "hourly" {
		if err := uc.reportRepo.RefreshDateRange(nil, filters.TenantID, filters.OutletID, filters.StartDate, filters.EndDate); err != nil {
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
	}

	var rows []reportRepo.ReportSalesPointRow
	if filters.ProductID != nil || filters.CategoryID != nil || normalizedRange == "hourly" {
		rows, err = uc.reportRepo.GetSalesSeriesFromRaw(filters, normalizedRange)
	} else {
		rows, err = uc.reportRepo.GetSalesSeriesFromAggregates(filters, normalizedRange)
	}
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	points, err := buildSalesSeriesPoints(rows, filters.StartDate, filters.EndDate, normalizedRange)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	resp := &dto.ReportSalesResponse{
		Range:     normalizedRange,
		StartDate: formatDate(filters.StartDate),
		EndDate:   formatDate(filters.EndDate),
		Data:      points,
	}

	setCachedJSON(cacheKey, resp)

	return resp, nil
}

func (uc *ReportUsecase) GetTopProducts(tenantID string, query dto.ReportFilterQuery, limit int) (*dto.TopProductsResponse, error) {
	filters, err := uc.parseFilters(tenantID, query)
	if err != nil {
		return nil, err
	}

	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	cacheKey := uc.cacheKey("top-products", filters, "", limit)
	if cached, ok := getCachedJSON[dto.TopProductsResponse](cacheKey); ok {
		return &cached, nil
	}

	if err := uc.reportRepo.RefreshDateRange(nil, filters.TenantID, filters.OutletID, filters.StartDate, filters.EndDate); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	rows, err := uc.reportRepo.GetTopProducts(filters, limit)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	data := make([]dto.TopProductRow, 0, len(rows))
	for _, row := range rows {
		productID := strconv.FormatUint(uint64(row.ProductID), 10)
		var categoryID *string
		if row.CategoryID != nil {
			value := strconv.FormatUint(uint64(*row.CategoryID), 10)
			categoryID = &value
		}
		data = append(data, dto.TopProductRow{
			ProductID:    productID,
			ProductName:  row.ProductName,
			CategoryID:   categoryID,
			CategoryName: row.CategoryName,
			QuantitySold: row.QuantitySold,
			Revenue:      row.Revenue,
		})
	}

	resp := &dto.TopProductsResponse{
		StartDate: formatDate(filters.StartDate),
		EndDate:   formatDate(filters.EndDate),
		Limit:     limit,
		Data:      data,
	}

	setCachedJSON(cacheKey, resp)

	return resp, nil
}

func (uc *ReportUsecase) GetProductSales(tenantID string, query dto.ReportFilterQuery, search, sortBy, sortOrder string, page, perPage int) (*dto.ProductSalesReportResponse, int64, error) {
	filters, err := uc.parseFilters(tenantID, query)
	if err != nil {
		return nil, 0, err
	}

	normalizedSortBy := strings.TrimSpace(strings.ToLower(sortBy))
	switch normalizedSortBy {
	case "", "quantity_sold":
		normalizedSortBy = "quantity_sold"
	case "revenue", "product_name", "product_sku", "product_status":
		// Allowed sort fields.
	default:
		return nil, 0, errors.New("INVALID_QUERY_PARAM")
	}

	normalizedSortOrder := strings.TrimSpace(strings.ToLower(sortOrder))
	switch normalizedSortOrder {
	case "", "desc":
		normalizedSortOrder = "desc"
	case "asc":
		// Allowed sort order.
	default:
		return nil, 0, errors.New("INVALID_QUERY_PARAM")
	}

	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	rows, total, err := uc.reportRepo.GetProductSales(filters, search, normalizedSortBy, normalizedSortOrder, page, perPage)
	if err != nil {
		return nil, 0, errors.New("INTERNAL_SERVER_ERROR")
	}

	data := make([]dto.ProductSalesRow, 0, len(rows))
	for _, row := range rows {
		productID := strconv.FormatUint(uint64(row.ProductID), 10)
		var categoryID *string
		if row.CategoryID != nil {
			value := strconv.FormatUint(uint64(*row.CategoryID), 10)
			categoryID = &value
		}

		data = append(data, dto.ProductSalesRow{
			ProductID:     productID,
			ProductName:   row.ProductName,
			ProductSKU:    row.ProductSKU,
			ProductStatus: row.ProductStatus,
			CategoryID:    categoryID,
			CategoryName:  row.CategoryName,
			QuantitySold:  row.QuantitySold,
			Revenue:       row.Revenue,
		})
	}

	resp := &dto.ProductSalesReportResponse{
		StartDate: formatDate(filters.StartDate),
		EndDate:   formatDate(filters.EndDate),
		SortBy:    normalizedSortBy,
		SortOrder: normalizedSortOrder,
		Page:      page,
		PerPage:   perPage,
		Total:     total,
		Data:      data,
	}

	return resp, total, nil
}

func (uc *ReportUsecase) GetPaymentMethods(tenantID string, query dto.ReportFilterQuery) (*dto.PaymentMethodsResponse, error) {
	filters, err := uc.parseFilters(tenantID, query)
	if err != nil {
		return nil, err
	}

	cacheKey := uc.cacheKey("payment-methods", filters, "", 0)
	if cached, ok := getCachedJSON[dto.PaymentMethodsResponse](cacheKey); ok {
		return &cached, nil
	}

	if err := uc.reportRepo.RefreshDateRange(nil, filters.TenantID, filters.OutletID, filters.StartDate, filters.EndDate); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	var rows []reportRepo.ReportPaymentMethodRow
	if filters.ProductID != nil || filters.CategoryID != nil {
		rows, err = uc.reportRepo.GetPaymentMethodsFromRaw(filters)
	} else {
		rows, err = uc.reportRepo.GetPaymentMethodsFromAggregates(filters)
	}
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	totalRevenue := int64(0)
	for _, row := range rows {
		totalRevenue += row.TotalRevenue
	}

	data := make([]dto.PaymentMethodRow, 0, len(rows))
	for _, row := range rows {
		percentage := 0.0
		if totalRevenue > 0 {
			percentage = (float64(row.TotalRevenue) / float64(totalRevenue)) * 100
		}
		data = append(data, dto.PaymentMethodRow{
			Method:            row.Method,
			TotalTransactions: row.TotalTransactions,
			TotalRevenue:      row.TotalRevenue,
			Percentage:        percentage,
		})
	}

	resp := &dto.PaymentMethodsResponse{
		StartDate: formatDate(filters.StartDate),
		EndDate:   formatDate(filters.EndDate),
		Data:      data,
	}

	setCachedJSON(cacheKey, resp)

	return resp, nil
}

func (uc *ReportUsecase) GetConsistencyCheck(tenantID string, query dto.ReportFilterQuery, limit int) (*dto.ConsistencyCheckResponse, error) {
	filters, err := uc.parseFilters(tenantID, query)
	if err != nil {
		return nil, err
	}

	if limit <= 0 {
		limit = 20
	}
	if limit > 200 {
		limit = 200
	}

	cacheKey := uc.cacheKey("consistency-check", filters, "", limit)
	if cached, ok := getCachedJSON[dto.ConsistencyCheckResponse](cacheKey); ok {
		return &cached, nil
	}

	totalChecked, err := uc.reportRepo.CountCompletedSales(filters)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	rows, totalMismatch, err := uc.reportRepo.GetConsistencyIssues(filters, limit)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	data := make([]dto.ConsistencyIssueRow, 0, len(rows))
	for _, row := range rows {
		data = append(data, dto.ConsistencyIssueRow{
			SaleID:        strconv.FormatUint(uint64(row.SaleID), 10),
			InvoiceNumber: row.InvoiceNumber,
			CreatedAt:     row.CreatedAt.UTC().Format(time.RFC3339),
			SaleSubtotal:  row.SaleSubtotal,
			ItemsSubtotal: row.ItemsSubtotal,
			SaleTotal:     row.SaleTotal,
			ItemsTotal:    row.ItemsTotal,
		})
	}

	resp := &dto.ConsistencyCheckResponse{
		StartDate:     formatDate(filters.StartDate),
		EndDate:       formatDate(filters.EndDate),
		Limit:         limit,
		TotalChecked:  totalChecked,
		TotalMismatch: totalMismatch,
		Data:          data,
	}

	setCachedJSON(cacheKey, resp)

	return resp, nil
}

func (uc *ReportUsecase) cacheKey(metric string, filters reportRepo.ReportFilters, rangeType string, limit int) string {
	outletID := "all"
	if filters.OutletID != nil {
		outletID = strconv.FormatUint(uint64(*filters.OutletID), 10)
	}
	productID := "all"
	if filters.ProductID != nil {
		productID = strconv.FormatUint(uint64(*filters.ProductID), 10)
	}
	categoryID := "all"
	if filters.CategoryID != nil {
		categoryID = strconv.FormatUint(uint64(*filters.CategoryID), 10)
	}

	return fmt.Sprintf(
		"reports:tenant:%d:%s:start:%s:end:%s:outlet:%s:product:%s:category:%s:range:%s:limit:%d",
		filters.TenantID,
		metric,
		formatDate(filters.StartDate),
		formatDate(filters.EndDate),
		outletID,
		productID,
		categoryID,
		rangeType,
		limit,
	)
}

func getCachedJSON[T any](key string) (T, bool) {
	var result T
	if !redisInfra.IsReady() {
		return result, false
	}

	raw, err := redisInfra.Get(key)
	if err != nil {
		return result, false
	}

	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return result, false
	}

	return result, true
}

func setCachedJSON(key string, value interface{}) {
	if !redisInfra.IsReady() {
		return
	}

	encoded, err := json.Marshal(value)
	if err != nil {
		return
	}

	_ = redisInfra.Set(key, string(encoded), reportCacheTTL)
}

func (uc *ReportUsecase) parseFilters(tenantID string, query dto.ReportFilterQuery) (reportRepo.ReportFilters, error) {
	tenantIDUint, err := parseUintRequired(tenantID)
	if err != nil {
		return reportRepo.ReportFilters{}, errors.New("INVALID_TENANT_ID")
	}

	startDate, endDate, err := parseDateRange(query.StartDate, query.EndDate)
	if err != nil {
		return reportRepo.ReportFilters{}, errors.New("INVALID_DATE")
	}

	var outletID *uint
	if query.OutletID != nil && strings.TrimSpace(*query.OutletID) != "" {
		parsed, err := parseUintRequired(*query.OutletID)
		if err != nil {
			return reportRepo.ReportFilters{}, errors.New("INVALID_OUTLET_ID")
		}
		outletID = &parsed
	}

	var productID *uint
	if query.ProductID != nil && strings.TrimSpace(*query.ProductID) != "" {
		parsed, err := parseUintRequired(*query.ProductID)
		if err != nil {
			return reportRepo.ReportFilters{}, errors.New("INVALID_PRODUCT_ID")
		}
		productID = &parsed
	}

	var categoryID *uint
	if query.CategoryID != nil && strings.TrimSpace(*query.CategoryID) != "" {
		parsed, err := parseUintRequired(*query.CategoryID)
		if err != nil {
			return reportRepo.ReportFilters{}, errors.New("INVALID_ENUM")
		}
		categoryID = &parsed
	}

	return reportRepo.ReportFilters{
		TenantID:   tenantIDUint,
		StartDate:  startDate,
		EndDate:    endDate,
		OutletID:   outletID,
		ProductID:  productID,
		CategoryID: categoryID,
	}, nil
}

func parseDateRange(startDate, endDate *string) (time.Time, time.Time, error) {
	now := time.Now().UTC()
	defaultEnd := time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, int(time.Second-time.Nanosecond), time.UTC)
	defaultStart := defaultEnd.AddDate(0, 0, -29)
	defaultStart = time.Date(defaultStart.Year(), defaultStart.Month(), defaultStart.Day(), 0, 0, 0, 0, time.UTC)

	start := defaultStart
	end := defaultEnd

	if startDate != nil && strings.TrimSpace(*startDate) != "" {
		parsed, err := time.Parse("2006-01-02", strings.TrimSpace(*startDate))
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
		start = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 0, 0, 0, 0, time.UTC)
	}

	if endDate != nil && strings.TrimSpace(*endDate) != "" {
		parsed, err := time.Parse("2006-01-02", strings.TrimSpace(*endDate))
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
		end = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 23, 59, 59, int(time.Second-time.Nanosecond), time.UTC)
	}

	if start.After(end) {
		return time.Time{}, time.Time{}, fmt.Errorf("start_date after end_date")
	}

	return start, end, nil
}

func parseUintRequired(raw string) (uint, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return 0, fmt.Errorf("empty")
	}
	value, err := strconv.ParseUint(trimmed, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(value), nil
}

func formatDate(t time.Time) string {
	return t.UTC().Format("2006-01-02")
}

func formatPeriod(t time.Time, rangeType string) string {
	switch rangeType {
	case "hourly":
		return t.UTC().Format("2006-01-02 15:00")
	case "monthly":
		return t.UTC().Format("2006-01")
	case "yearly":
		return t.UTC().Format("2006")
	default:
		return t.UTC().Format("2006-01-02")
	}
}

func buildSalesSeriesPoints(rows []reportRepo.ReportSalesPointRow, startDate, endDate time.Time, rangeType string) ([]dto.SalesSeriesPoint, error) {
	expectedPeriods, err := buildExpectedPeriods(startDate, endDate, rangeType)
	if err != nil {
		return nil, err
	}

	pointByPeriod := make(map[string]dto.SalesSeriesPoint, len(rows))
	for _, row := range rows {
		periodKey := formatPeriod(row.Period, rangeType)
		existing := pointByPeriod[periodKey]
		existing.Period = periodKey
		existing.TotalRevenue += row.TotalRevenue
		existing.TotalTransactions += row.TotalTransactions
		existing.TotalItemsSold += row.TotalItemsSold
		pointByPeriod[periodKey] = existing
	}

	points := make([]dto.SalesSeriesPoint, 0, len(expectedPeriods))
	for _, period := range expectedPeriods {
		periodKey := formatPeriod(period, rangeType)
		point, exists := pointByPeriod[periodKey]
		if !exists {
			point = dto.SalesSeriesPoint{Period: periodKey}
		}
		if point.TotalTransactions > 0 {
			point.AverageOrderValue = point.TotalRevenue / point.TotalTransactions
		}
		points = append(points, point)
	}

	return points, nil
}

func buildExpectedPeriods(startDate, endDate time.Time, rangeType string) ([]time.Time, error) {
	startUTC := startDate.UTC()
	endUTC := endDate.UTC()

	periods := make([]time.Time, 0)
	switch rangeType {
	case "hourly":
		start := time.Date(startUTC.Year(), startUTC.Month(), startUTC.Day(), 0, 0, 0, 0, time.UTC)
		end := time.Date(endUTC.Year(), endUTC.Month(), endUTC.Day(), 23, 0, 0, 0, time.UTC)
		for cursor := start; !cursor.After(end); cursor = cursor.Add(time.Hour) {
			periods = append(periods, cursor)
		}
	case "daily":
		start := time.Date(startUTC.Year(), startUTC.Month(), startUTC.Day(), 0, 0, 0, 0, time.UTC)
		end := time.Date(endUTC.Year(), endUTC.Month(), endUTC.Day(), 0, 0, 0, 0, time.UTC)
		for cursor := start; !cursor.After(end); cursor = cursor.AddDate(0, 0, 1) {
			periods = append(periods, cursor)
		}
	case "monthly":
		start := time.Date(startUTC.Year(), startUTC.Month(), 1, 0, 0, 0, 0, time.UTC)
		end := time.Date(endUTC.Year(), endUTC.Month(), 1, 0, 0, 0, 0, time.UTC)
		for cursor := start; !cursor.After(end); cursor = cursor.AddDate(0, 1, 0) {
			periods = append(periods, cursor)
		}
	case "yearly":
		start := time.Date(startUTC.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
		end := time.Date(endUTC.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
		for cursor := start; !cursor.After(end); cursor = cursor.AddDate(1, 0, 0) {
			periods = append(periods, cursor)
		}
	default:
		return nil, fmt.Errorf("unsupported range type")
	}

	return periods, nil
}
