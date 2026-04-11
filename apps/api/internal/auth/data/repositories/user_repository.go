package repositories

import (
	"strings"
	"time"

	"gipos/api/internal/auth/data/models"
	"gorm.io/gorm"
)

// UserRepository handles user data access
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmailAndTenant retrieves a user by email and tenant ID
func (r *UserRepository) GetByEmailAndTenant(email string, tenantID uint) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ? AND tenant_id = ?", email, tenantID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByIdentifier retrieves user by email, email prefix (username), or exact name.
func (r *UserRepository) GetByIdentifier(identifier string) (*models.User, error) {
	var user models.User

	normalized := strings.TrimSpace(strings.ToLower(identifier))
	if normalized == "" {
		return nil, gorm.ErrRecordNotFound
	}

	err := r.db.
		Where("LOWER(email) = ?", normalized).
		Or("LOWER(email) LIKE ?", normalized+"@%").
		Or("LOWER(name) = ?", normalized).
		Order("id ASC").
		First(&user).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// GetByIdentifierAndTenant retrieves user by identifier in a specific tenant.
func (r *UserRepository) GetByIdentifierAndTenant(identifier string, tenantID uint) (*models.User, error) {
	var user models.User

	normalized := strings.TrimSpace(strings.ToLower(identifier))
	if normalized == "" {
		return nil, gorm.ErrRecordNotFound
	}

	err := r.db.
		Where("tenant_id = ?", tenantID).
		Where(r.db.
			Where("LOWER(email) = ?", normalized).
			Or("LOWER(email) LIKE ?", normalized+"@%").
			Or("LOWER(name) = ?", normalized)).
		Order("id ASC").
		First(&user).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Update updates a user
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// Delete soft deletes a user
func (r *UserRepository) Delete(id uint) error {
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}

// List retrieves a list of users with pagination
func (r *UserRepository) List(tenantID uint, outletID *uint, limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := r.db.Model(&models.User{}).Where("tenant_id = ?", tenantID)

	if outletID != nil && *outletID > 0 {
		query = query.Where("outlet_id = ?", *outletID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Limit(limit).Offset(offset).Find(&users).Error
	return users, total, err
}

// UpdateLastLogin updates the last login timestamp
func (r *UserRepository) UpdateLastLogin(userID uint) error {
	now := time.Now()
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("last_login_at", now).Error
}
