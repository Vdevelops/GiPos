package handler

import (
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"
	financeDTO "gipos/api/internal/finance/domain/dto"
	financeUsecase "gipos/api/internal/finance/domain/usecase"

	"github.com/gin-gonic/gin"
)

type FinanceHandler struct {
	financeUsecase *financeUsecase.FinanceUsecase
}

func NewFinanceHandler(financeUsecase *financeUsecase.FinanceUsecase) *FinanceHandler {
	return &FinanceHandler{financeUsecase: financeUsecase}
}

func (h *FinanceHandler) SetOpeningBalance(c *gin.Context) {
	var req financeDTO.SetOpeningBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		errors.Unauthorized(c, "User ID is required")
		return
	}

	result, err := h.financeUsecase.SetOpeningBalance(tenantID.(string), userID.(string), &req)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, result, meta)
}

func (h *FinanceHandler) CreateGeneralExpense(c *gin.Context) {
	h.createExpense(c, true)
}

func (h *FinanceHandler) CreateFixedExpense(c *gin.Context) {
	h.createExpense(c, false)
}

func (h *FinanceHandler) GetSummary(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := financeDTO.FinanceSummaryQuery{}
	if startDate != "" {
		query.StartDate = &startDate
	}
	if endDate != "" {
		query.EndDate = &endDate
	}

	result, err := h.financeUsecase.GetSummary(tenantID.(string), query)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	filters := map[string]interface{}{}
	if startDate != "" {
		filters["start_date"] = startDate
	}
	if endDate != "" {
		filters["end_date"] = endDate
	}
	if len(filters) > 0 {
		meta.Filters = filters
	}
	response.Success(c, result, meta)
}

func (h *FinanceHandler) ListFixedExpenseComponents(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	result, err := h.financeUsecase.ListFixedExpenseComponents(tenantID.(string))
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, result, meta)
}

func (h *FinanceHandler) CreateFixedExpenseComponent(c *gin.Context) {
	var req financeDTO.CreateFixedExpenseComponentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		errors.Unauthorized(c, "User ID is required")
		return
	}

	result, err := h.financeUsecase.CreateFixedExpenseComponent(tenantID.(string), userID.(string), &req)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, result, meta)
}

func (h *FinanceHandler) UpdateFixedExpenseComponent(c *gin.Context) {
	var req financeDTO.UpdateFixedExpenseComponentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	componentID := c.Param("id")
	if componentID == "" {
		errors.ValidationError(c, []response.FieldError{{
			Field:   "id",
			Message: "id is required",
		}})
		return
	}

	result, err := h.financeUsecase.UpdateFixedExpenseComponent(tenantID.(string), componentID, &req)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, result, meta)
}

func (h *FinanceHandler) createExpense(c *gin.Context, isGeneral bool) {
	var req financeDTO.CreateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		errors.Unauthorized(c, "User ID is required")
		return
	}

	var (
		result *financeDTO.ExpenseRecordResponse
		err    error
	)

	if isGeneral {
		result, err = h.financeUsecase.CreateGeneralExpense(tenantID.(string), userID.(string), &req)
	} else {
		result, err = h.financeUsecase.CreateFixedExpense(tenantID.(string), userID.(string), &req)
	}

	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	meta.CreatedBy = userID.(string)
	response.SuccessCreated(c, result, meta)
}

func (h *FinanceHandler) UpdateExpenseItem(c *gin.Context) {
	var req financeDTO.UpdateExpenseItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fieldErrors := validators.ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return
	}

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	itemID := c.Param("id")
	if itemID == "" {
		errors.ValidationError(c, []response.FieldError{{
			Field:   "id",
			Message: "id is required",
		}})
		return
	}

	result, err := h.financeUsecase.UpdateExpenseItem(tenantID.(string), itemID, &req)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, result, meta)
}

func (h *FinanceHandler) DeleteExpenseItem(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	itemID := c.Param("id")
	if itemID == "" {
		errors.ValidationError(c, []response.FieldError{{
			Field:   "id",
			Message: "id is required",
		}})
		return
	}

	err := h.financeUsecase.DeleteExpenseItem(tenantID.(string), itemID)
	if err != nil {
		errors.Error(c, err.Error(), nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, nil, meta)
}
