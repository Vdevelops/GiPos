package handler

import (
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"gipos/api/internal/core/utils/validators"
	"gipos/api/internal/sales/domain/dto"
	"gipos/api/internal/sales/domain/usecase"

	"github.com/gin-gonic/gin"
)

// PaymentHandler handles HTTP requests for payments
type PaymentHandler struct {
	paymentUsecase *usecase.PaymentUsecase
}

// NewPaymentHandler creates a new payment handler
func NewPaymentHandler(paymentUsecase *usecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{
		paymentUsecase: paymentUsecase,
	}
}

// ProcessPayment handles POST /api/v1/payments
func (h *PaymentHandler) ProcessPayment(c *gin.Context) {
	var req dto.ProcessPaymentRequest
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

	paymentResponse, err := h.paymentUsecase.ProcessPayment(tenantID.(string), &req)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.SuccessCreated(c, paymentResponse, meta)
}

// GetPayment handles GET /api/v1/payments/:id
func (h *PaymentHandler) GetPayment(c *gin.Context) {
	id := c.Param("id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	paymentResponse, err := h.paymentUsecase.GetPaymentByID(tenantID.(string), id)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, paymentResponse, meta)
}

// GetPaymentBySaleID handles GET /api/v1/sales/:sale_id/payment
func (h *PaymentHandler) GetPaymentBySaleID(c *gin.Context) {
	saleID := c.Param("sale_id")

	tenantID, exists := c.Get("tenant_id")
	if !exists {
		errors.Unauthorized(c, "Tenant ID is required")
		return
	}

	paymentResponse, err := h.paymentUsecase.GetPaymentBySaleID(tenantID.(string), saleID)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, paymentResponse, meta)
}

// UpdatePaymentStatus handles PUT /api/v1/payments/:id/status
func (h *PaymentHandler) UpdatePaymentStatus(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdatePaymentRequest
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

	paymentResponse, err := h.paymentUsecase.UpdatePaymentStatus(tenantID.(string), id, &req)
	if err != nil {
		errorCode := err.Error()
		errors.Error(c, errorCode, nil, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	meta.TenantID = tenantID.(string)
	response.Success(c, paymentResponse, meta)
}
