package repositories

import (
	"gipos/api/internal/sales/data/models"

	"gorm.io/gorm"
)

// PaymentRepository handles payment data access
type PaymentRepository struct {
	db *gorm.DB
}

// NewPaymentRepository creates a new payment repository
func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

// Create creates a new payment
func (r *PaymentRepository) Create(payment *models.Payment) error {
	return r.db.Create(payment).Error
}

// GetByID retrieves a payment by ID
func (r *PaymentRepository) GetByID(tenantID, id uint) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.Where("id = ? AND tenant_id = ? AND deleted_at IS NULL", id, tenantID).
		Preload("Sale").
		First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// GetBySaleID retrieves a payment by sale ID
func (r *PaymentRepository) GetBySaleID(tenantID, saleID uint) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.Where("sale_id = ? AND tenant_id = ? AND deleted_at IS NULL", saleID, tenantID).
		Preload("Sale").
		First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// GetByGatewayID retrieves a payment by gateway ID
func (r *PaymentRepository) GetByGatewayID(tenantID uint, gatewayID string) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.Where("gateway_id = ? AND tenant_id = ? AND deleted_at IS NULL", gatewayID, tenantID).
		Preload("Sale").
		First(&payment).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}

// Update updates a payment
func (r *PaymentRepository) Update(payment *models.Payment) error {
	return r.db.Omit("Sale").Save(payment).Error
}

// Delete soft deletes a payment
func (r *PaymentRepository) Delete(tenantID, id uint) error {
	return r.db.Where("tenant_id = ?", tenantID).Delete(&models.Payment{}, "id = ?", id).Error
}
