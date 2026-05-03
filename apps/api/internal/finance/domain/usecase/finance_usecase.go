package usecase

import (
	"errors"
	sharedModels "gipos/api/internal/core/shared/models"
	financeModels "gipos/api/internal/finance/data/models"
	financeRepo "gipos/api/internal/finance/data/repositories"
	"gipos/api/internal/finance/domain/dto"
	"sort"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

var defaultFixedExpenseComponents = []struct {
	Name   string
	Amount int64
}{
	{Name: "PAM", Amount: 19083},
	{Name: "LISTRIK", Amount: 20000},
	{Name: "INET", Amount: 10267},
	{Name: "PENGEMBALIAN", Amount: 16667},
	{Name: "SALARY MBAK IDA & NOVI", Amount: 333333},
	{Name: "SALARY TIM", Amount: 400000},
	{Name: "SALARY THR", Amount: 19444},
}

type FinanceUsecase struct {
	financeRepo *financeRepo.FinanceRepository
}

func NewFinanceUsecase(financeRepo *financeRepo.FinanceRepository) *FinanceUsecase {
	return &FinanceUsecase{financeRepo: financeRepo}
}

func (uc *FinanceUsecase) SetOpeningBalance(tenantID, userID string, req *dto.SetOpeningBalanceRequest) (*dto.OpeningBalanceResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	if _, err := uc.financeRepo.GetOpeningBalance(tenantIDUint); err == nil {
		return nil, errors.New("DUPLICATE_VALUE")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	effectiveDate, err := parseDatePtr(req.EffectiveDate)
	if err != nil {
		return nil, errors.New("INVALID_DATE")
	}

	opening := &financeModels.OpeningBalance{
		TenantModel: sharedModels.TenantModel{TenantID: tenantIDUint},
		EffectiveDate: effectiveDate,
		Amount: req.Amount,
	}

	if userID != "" {
		userIDUint, parseErr := stringToUint(userID)
		if parseErr == nil {
			opening.CreatedBy = &userIDUint
		}
	}

	if err := uc.financeRepo.CreateOpeningBalance(opening); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return nil, errors.New("DUPLICATE_VALUE")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return &dto.OpeningBalanceResponse{
		ID: uintToString(opening.ID),
		EffectiveDate: formatDate(opening.EffectiveDate),
		Amount: opening.Amount,
		CreatedAt: opening.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: opening.UpdatedAt.UTC().Format(time.RFC3339),
	}, nil
}

func (uc *FinanceUsecase) CreateGeneralExpense(tenantID, userID string, req *dto.CreateExpenseRequest) (*dto.ExpenseRecordResponse, error) {
	return uc.createExpense(tenantID, userID, financeModels.ExpenseKindGeneral, req)
}

func (uc *FinanceUsecase) CreateFixedExpense(tenantID, userID string, req *dto.CreateExpenseRequest) (*dto.ExpenseRecordResponse, error) {
	return uc.createExpense(tenantID, userID, financeModels.ExpenseKindFixed, req)
}

func (uc *FinanceUsecase) ListFixedExpenseComponents(tenantID string) ([]dto.FixedExpenseComponentResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	components, err := uc.ensureAndListFixedExpenseComponents(tenantIDUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return toFixedComponentResponses(components), nil
}

func (uc *FinanceUsecase) CreateFixedExpenseComponent(tenantID, userID string, req *dto.CreateFixedExpenseComponentRequest) (*dto.FixedExpenseComponentResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" || req.Amount < 0 {
		return nil, errors.New("VALIDATION_ERROR")
	}

	components, err := uc.ensureAndListFixedExpenseComponents(tenantIDUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	sortOrder := len(components) + 1
	component := &financeModels.FixedExpenseComponent{
		TenantModel: sharedModels.TenantModel{TenantID: tenantIDUint},
		Name:      name,
		Amount:    req.Amount,
		SortOrder: sortOrder,
	}

	if userID != "" {
		userIDUint, parseErr := stringToUint(userID)
		if parseErr == nil {
			component.CreatedBy = &userIDUint
		}
	}

	if err := uc.financeRepo.CreateFixedExpenseComponent(component); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	resp := toFixedComponentResponse(*component)
	return &resp, nil
}

func (uc *FinanceUsecase) UpdateFixedExpenseComponent(tenantID, componentID string, req *dto.UpdateFixedExpenseComponentRequest) (*dto.FixedExpenseComponentResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	componentIDUint, err := stringToUint(componentID)
	if err != nil {
		return nil, errors.New("INVALID_ID")
	}

	component, err := uc.financeRepo.GetFixedExpenseComponentByID(tenantIDUint, componentIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("NOT_FOUND")
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	if req.Name != nil {
		name := strings.TrimSpace(*req.Name)
		if name == "" {
			return nil, errors.New("VALIDATION_ERROR")
		}
		component.Name = name
	}

	if req.Amount != nil {
		if *req.Amount < 0 {
			return nil, errors.New("VALIDATION_ERROR")
		}
		component.Amount = *req.Amount
	}

	if err := uc.financeRepo.SaveFixedExpenseComponent(component); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	resp := toFixedComponentResponse(*component)
	return &resp, nil
}

func (uc *FinanceUsecase) DeleteFixedExpenseComponent(tenantID, componentID string) error {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}

	componentIDUint, err := stringToUint(componentID)
	if err != nil {
		return errors.New("INVALID_ID")
	}

	component, err := uc.financeRepo.GetFixedExpenseComponentByID(tenantIDUint, componentIDUint)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("NOT_FOUND")
		}
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	if component == nil {
		return errors.New("NOT_FOUND")
	}

	if err := uc.financeRepo.DeleteFixedExpenseComponent(tenantIDUint, componentIDUint); err != nil {
		return errors.New("INTERNAL_SERVER_ERROR")
	}

	return nil
}

func (uc *FinanceUsecase) GetSummary(tenantID string, query dto.FinanceSummaryQuery) (*dto.FinanceSummaryResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	startDate, endDate, err := parseDateRange(query.StartDate, query.EndDate)
	if err != nil {
		return nil, errors.New("INVALID_DATE")
	}

	opening, err := uc.financeRepo.GetOpeningBalance(tenantIDUint)
	hasOpeningBalance := true
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			hasOpeningBalance = false
		} else {
			return nil, errors.New("INTERNAL_SERVER_ERROR")
		}
	}

	calcStartDate := startDate
	if hasOpeningBalance {
		effectiveDate := dateOnly(opening.EffectiveDate)
		if effectiveDate.Before(startDate) {
			calcStartDate = effectiveDate
		}
	}

	entries, err := uc.financeRepo.ListExpenseEntriesWithItems(tenantIDUint, calcStartDate, endDate)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	fixedComponents, err := uc.ensureAndListFixedExpenseComponents(tenantIDUint)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	revenues, err := uc.financeRepo.GetDailyRevenueByDateRange(tenantIDUint, calcStartDate, endDate)
	if err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	revenueMap := map[string]financeRepo.DailyRevenueRow{}
	for _, row := range revenues {
		revenueMap[formatDate(row.Date)] = row
	}

	generalByDate := map[string][]dto.ExpenseRecordResponse{}
	for _, entry := range entries {
		if entry.Kind != financeModels.ExpenseKindGeneral {
			continue
		}

		// Skip entries with no items (orphaned/empty entries should not contribute to total)
		if len(entry.ExpenseItems) == 0 {
			continue
		}

		entryResp := toExpenseResponse(entry)
		dateKey := formatDate(entry.EntryDate)
		generalByDate[dateKey] = append(generalByDate[dateKey], entryResp)
	}

	fixedLineItems := make([]dto.ExpenseLineItemResponse, 0, len(fixedComponents))
	fixedTotalPerDay := int64(0)
	fixedComponentResponses := make([]dto.FixedExpenseComponentResponse, 0, len(fixedComponents))
	for _, component := range fixedComponents {
		fixedLineItems = append(fixedLineItems, dto.ExpenseLineItemResponse{
			ID: uintToString(component.ID),
			Name: component.Name,
			Amount: component.Amount,
		})
		fixedComponentResponses = append(fixedComponentResponses, toFixedComponentResponse(component))
		fixedTotalPerDay += component.Amount
	}

	runningOpeningBalance := int64(0)
	if hasOpeningBalance {
		runningOpeningBalance = opening.Amount
	}

	totalRevenue := int64(0)
	totalGeneralExpense := int64(0)
	totalFixedExpense := int64(0)
	daySummaries := make([]dto.FinanceDaySummary, 0)

	for datePointer := calcStartDate; !datePointer.After(endDate); datePointer = datePointer.AddDate(0, 0, 1) {
		dateKey := formatDate(datePointer)

		if hasOpeningBalance {
			effectiveDate := dateOnly(opening.EffectiveDate)
			if datePointer.Before(effectiveDate) {
				runningOpeningBalance = 0
			}
			if datePointer.Equal(effectiveDate) {
				runningOpeningBalance = opening.Amount
			}
		}

		revenue := revenueMap[dateKey]
		generalRecords := generalByDate[dateKey]
		fixedRecords := []dto.ExpenseRecordResponse{}
		if len(fixedLineItems) > 0 {
			fixedRecords = []dto.ExpenseRecordResponse{
				{
					ID:        "fixed-components",
					Kind:      financeModels.ExpenseKindFixed,
					EntryDate: dateKey,
					Total:     fixedTotalPerDay,
					LineItems: fixedLineItems,
				},
			}
		}

		generalTotal := sumExpenseRecords(generalRecords)
		fixedTotal := fixedTotalPerDay
		warungBalance := revenue.Revenue - generalTotal
		nextOpeningBalance := runningOpeningBalance + warungBalance
		endingBalance := warungBalance - fixedTotal
		isEndingBalanceMinus := endingBalance < 0

		if !datePointer.Before(startDate) {
			daySummaries = append(daySummaries, dto.FinanceDaySummary{
				Date: dateKey,
				OpeningBalance: runningOpeningBalance,
				SalesCash: revenue.Cash,
				SalesQRIS: revenue.QRIS,
				TotalRevenue: revenue.Revenue,
				GeneralExpenses: generalRecords,
				GeneralExpenseTotal: generalTotal,
				FixedExpenses: fixedRecords,
				FixedExpenseTotal: fixedTotal,
				WarungBalance: warungBalance,
				EndingBalance: endingBalance,
				IsEndingBalanceMinus: isEndingBalanceMinus,
				NextOpeningBalance: nextOpeningBalance,
			})

			totalRevenue += revenue.Revenue
			totalGeneralExpense += generalTotal
			totalFixedExpense += fixedTotal
		}

		runningOpeningBalance = nextOpeningBalance
	}

	sort.Slice(daySummaries, func(i, j int) bool {
		return daySummaries[i].Date < daySummaries[j].Date
	})

	endingBalance := int64(0)
	openingBalance := int64(0)
	if len(daySummaries) > 0 {
		openingBalance = daySummaries[0].OpeningBalance
		endingBalance = daySummaries[len(daySummaries)-1].EndingBalance
	} else {
		openingBalance = runningOpeningBalance
		endingBalance = 0
	}

	return &dto.FinanceSummaryResponse{
		StartDate: formatDate(startDate),
		EndDate: formatDate(endDate),
		HasOpeningBalance: hasOpeningBalance,
		OpeningBalance: openingBalance,
		TotalRevenue: totalRevenue,
		TotalGeneralExpense: totalGeneralExpense,
		TotalFixedExpense: totalFixedExpense,
		EndingBalance: endingBalance,
		FixedComponents: fixedComponentResponses,
		Days: daySummaries,
	}, nil
}

func (uc *FinanceUsecase) ensureAndListFixedExpenseComponents(tenantID uint) ([]financeModels.FixedExpenseComponent, error) {
	components, err := uc.financeRepo.ListFixedExpenseComponents(tenantID)
	if err != nil {
		return nil, err
	}

	if len(components) > 0 {
		return components, nil
	}

	seedComponents := make([]financeModels.FixedExpenseComponent, 0, len(defaultFixedExpenseComponents))
	for index, item := range defaultFixedExpenseComponents {
		seedComponents = append(seedComponents, financeModels.FixedExpenseComponent{
			TenantModel: sharedModels.TenantModel{TenantID: tenantID},
			Name:      item.Name,
			Amount:    item.Amount,
			SortOrder: index + 1,
		})
	}

	if err := uc.financeRepo.CreateFixedExpenseComponents(seedComponents); err != nil {
		return nil, err
	}

	return uc.financeRepo.ListFixedExpenseComponents(tenantID)
}

func (uc *FinanceUsecase) createExpense(tenantID, userID, kind string, req *dto.CreateExpenseRequest) (*dto.ExpenseRecordResponse, error) {
	tenantIDUint, err := stringToUint(tenantID)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	entryDate, err := parseDatePtr(req.EntryDate)
	if err != nil {
		return nil, errors.New("INVALID_DATE")
	}

	items := make([]financeModels.ExpenseItem, 0, len(req.Items))
	totalAmount := int64(0)
	for _, item := range req.Items {
		itemName := strings.TrimSpace(item.Name)
		if itemName == "" || item.Amount <= 0 {
			return nil, errors.New("VALIDATION_ERROR")
		}

		totalAmount += item.Amount
		items = append(items, financeModels.ExpenseItem{
			TenantModel: sharedModels.TenantModel{TenantID: tenantIDUint},
			Name: itemName,
			Amount: item.Amount,
		})
	}

	if totalAmount <= 0 {
		return nil, errors.New("VALIDATION_ERROR")
	}

	entry := &financeModels.ExpenseEntry{
		TenantModel: sharedModels.TenantModel{TenantID: tenantIDUint},
		EntryDate: entryDate,
		Kind: kind,
		TotalAmount: totalAmount,
		Notes: strings.TrimSpace(req.Notes),
	}

	if userID != "" {
		userIDUint, parseErr := stringToUint(userID)
		if parseErr == nil {
			entry.CreatedBy = &userIDUint
		}
	}

	if err := uc.financeRepo.CreateExpenseEntryWithItems(entry, items); err != nil {
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	entry.ExpenseItems = items
	resp := toExpenseResponse(*entry)
	return &resp, nil
}

func toExpenseResponse(entry financeModels.ExpenseEntry) dto.ExpenseRecordResponse {
	lineItems := make([]dto.ExpenseLineItemResponse, 0, len(entry.ExpenseItems))
	totalAmount := int64(0)
	for _, item := range entry.ExpenseItems {
		lineItems = append(lineItems, dto.ExpenseLineItemResponse{
			ID: uintToString(item.ID),
			Name: item.Name,
			Amount: item.Amount,
		})
		totalAmount += item.Amount
	}

	if totalAmount == 0 {
		totalAmount = entry.TotalAmount
	}

	return dto.ExpenseRecordResponse{
		ID: uintToString(entry.ID),
		Kind: entry.Kind,
		EntryDate: formatDate(entry.EntryDate),
		Total: totalAmount,
		Notes: entry.Notes,
		CreatedAt: entry.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: entry.UpdatedAt.UTC().Format(time.RFC3339),
		LineItems: lineItems,
	}
}

func sumExpenseRecords(records []dto.ExpenseRecordResponse) int64 {
	total := int64(0)
	for _, record := range records {
		total += record.Total
	}
	return total
}

func toFixedComponentResponse(component financeModels.FixedExpenseComponent) dto.FixedExpenseComponentResponse {
	return dto.FixedExpenseComponentResponse{
		ID:        strconv.FormatUint(uint64(component.ID), 10),
		Name:      component.Name,
		Amount:    component.Amount,
		CreatedAt: component.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: component.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func (uc *FinanceUsecase) UpdateExpenseItem(tenantID, itemID string, req *dto.UpdateExpenseItemRequest) (*dto.ExpenseLineItemResponse, error) {
	tenantIDUint, err := strconv.ParseUint(tenantID, 10, 32)
	if err != nil {
		return nil, errors.New("INVALID_TENANT_ID")
	}

	itemIDUint, err := strconv.ParseUint(itemID, 10, 32)
	if err != nil {
		return nil, errors.New("INVALID_ID")
	}

	var response *dto.ExpenseLineItemResponse
	err = uc.financeRepo.Transaction(func(tx *gorm.DB) error {
		item, err := uc.financeRepo.GetExpenseItemByID(tx, uint(tenantIDUint), uint(itemIDUint))
		if err != nil {
			return gorm.ErrRecordNotFound
		}

		if req.Name != nil {
			name := strings.TrimSpace(*req.Name)
			if name == "" {
				return errors.New("INVALID_NAME")
			}
			item.Name = name
		}
		if req.Amount != nil {
			if *req.Amount <= 0 {
				return errors.New("INVALID_AMOUNT")
			}
			item.Amount = *req.Amount
		}

		if err := uc.financeRepo.SaveExpenseItem(tx, item); err != nil {
			return err
		}

		items, err := uc.financeRepo.ListExpenseItemsByEntryID(tx, uint(tenantIDUint), item.EntryID)
		if err != nil {
			return err
		}

		entry, err := uc.financeRepo.GetExpenseEntryByID(tx, uint(tenantIDUint), item.EntryID)
		if err != nil {
			return err
		}

		totalAmount := int64(0)
		for _, expenseItem := range items {
			totalAmount += expenseItem.Amount
		}
		entry.TotalAmount = totalAmount
		if err := uc.financeRepo.SaveExpenseEntry(tx, entry); err != nil {
			return err
		}

		response = &dto.ExpenseLineItemResponse{
			ID:     strconv.FormatUint(uint64(item.ID), 10),
			Name:   item.Name,
			Amount: item.Amount,
		}
		return nil
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("NOT_FOUND")
		}
		if err.Error() == "INVALID_NAME" || err.Error() == "INVALID_AMOUNT" {
			return nil, err
		}
		return nil, errors.New("INTERNAL_SERVER_ERROR")
	}

	return response, nil
}

func (uc *FinanceUsecase) DeleteExpenseItem(tenantID, itemID string) error {
	tenantIDUint, err := strconv.ParseUint(tenantID, 10, 32)
	if err != nil {
		return errors.New("INVALID_TENANT_ID")
	}

	itemIDUint, err := strconv.ParseUint(itemID, 10, 32)
	if err != nil {
		return errors.New("INVALID_ID")
	}

	return uc.financeRepo.Transaction(func(tx *gorm.DB) error {
		item, err := uc.financeRepo.GetExpenseItemByID(tx, uint(tenantIDUint), uint(itemIDUint))
		if err != nil {
			return gorm.ErrRecordNotFound
		}

		if err := uc.financeRepo.DeleteExpenseItem(tx, uint(tenantIDUint), uint(itemIDUint)); err != nil {
			return err
		}

		items, err := uc.financeRepo.ListExpenseItemsByEntryID(tx, uint(tenantIDUint), item.EntryID)
		if err != nil {
			return err
		}

		if len(items) == 0 {
			if err := uc.financeRepo.DeleteExpenseEntry(tx, uint(tenantIDUint), item.EntryID); err != nil {
				return err
			}
			return nil
		}

		entry, err := uc.financeRepo.GetExpenseEntryByID(tx, uint(tenantIDUint), item.EntryID)
		if err != nil {
			return err
		}

		totalAmount := int64(0)
		for _, expenseItem := range items {
			totalAmount += expenseItem.Amount
		}
		entry.TotalAmount = totalAmount
		if err := uc.financeRepo.SaveExpenseEntry(tx, entry); err != nil {
			return err
		}

		return nil
	})
}

func toFixedComponentResponses(components []financeModels.FixedExpenseComponent) []dto.FixedExpenseComponentResponse {
	responses := make([]dto.FixedExpenseComponentResponse, 0, len(components))
	for _, component := range components {
		responses = append(responses, toFixedComponentResponse(component))
	}
	return responses
}

func parseDateRange(startDate, endDate *string) (time.Time, time.Time, error) {
	if startDate == nil && endDate == nil {
		now := time.Now().UTC()
		today := dateOnly(now)
		return today, today, nil
	}

	if startDate != nil && endDate == nil {
		parsed, err := parseDate(*startDate)
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
		return parsed, parsed, nil
	}

	if startDate == nil && endDate != nil {
		parsed, err := parseDate(*endDate)
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
		return parsed, parsed, nil
	}

	start, err := parseDate(*startDate)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}

	end, err := parseDate(*endDate)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}

	if end.Before(start) {
		return time.Time{}, time.Time{}, errors.New("INVALID_DATE")
	}

	return start, end, nil
}

func parseDatePtr(date *string) (time.Time, error) {
	if date == nil || strings.TrimSpace(*date) == "" {
		return dateOnly(time.Now().UTC()), nil
	}

	return parseDate(*date)
}

func parseDate(raw string) (time.Time, error) {
	parsed, err := time.Parse("2006-01-02", strings.TrimSpace(raw))
	if err != nil {
		return time.Time{}, err
	}

	return dateOnly(parsed.UTC()), nil
}

func dateOnly(date time.Time) time.Time {
	return time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
}

func formatDate(date time.Time) string {
	return date.UTC().Format("2006-01-02")
}

func stringToUint(value string) (uint, error) {
	if strings.TrimSpace(value) == "" {
		return 0, errors.New("empty id")
	}

	parsed, err := strconv.ParseUint(value, 10, 32)
	if err != nil {
		return 0, err
	}

	return uint(parsed), nil
}

func uintToString(value uint) string {
	return strconv.FormatUint(uint64(value), 10)
}
