package seeders

import (
	"errors"
	"log"

	"gipos/api/internal/auth/data/models"
	"gipos/api/internal/auth/domain/usecase"
	sharedModels "gipos/api/internal/core/shared/models"

	"gorm.io/gorm"
)

// RunSeeders runs all auth seeders
func RunSeeders(db *gorm.DB) {
	seeder := &UserSeeder{db: db}
	if err := seeder.Seed(); err != nil {
		log.Printf("❌ Auth seeder failed: %v", err)
	}
}

// UserSeeder handles user seeding
type UserSeeder struct {
	db *gorm.DB
}

// Seed seeds initial users and tenant
func (s *UserSeeder) Seed() error {
	log.Println("🌱 Seeding users...")

	// Check if users already exist
	var count int64
	s.db.Model(&models.User{}).Count(&count)
	if count > 0 {
		log.Println("⚠️  Users already exist, skipping seed")
		return nil
	}

	// Create default tenant first (if not exists)
	var tenant sharedModels.Tenant
	if err := s.db.Where("email = ?", "admin@gipos.id").First(&tenant).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			tenant = sharedModels.Tenant{
				BaseModel: sharedModels.BaseModel{},
				Name:      "GiPos Demo Tenant",
				Email:     "admin@gipos.id",
				Phone:     "081234567890",
				Status:    "active",
				Plan:      "free",
				Settings:  "{}", // Empty JSON object for JSONB field
			}
			if err := s.db.Create(&tenant).Error; err != nil {
				return err
			}
			log.Printf("✅ Created default tenant: %d", tenant.ID)
		} else {
			return err
		}
	} else {
		log.Printf("✅ Using existing tenant: %d", tenant.ID)
	}

	// Default password for all seeded users
	defaultPassword := "password123"
	hashedPassword, err := usecase.HashPassword(defaultPassword)
	if err != nil {
		return err
	}

	// Seed users
	users := []models.User{
		{
			TenantModel: sharedModels.TenantModel{
				BaseModel: sharedModels.BaseModel{},
				TenantID:  tenant.ID,
			},
			Email:    "admin@gipos.id",
			Password: hashedPassword,
			Name:     "System Admin",
			Phone:    "081234567890",
			Role:     "system_admin",
			Status:   "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				BaseModel: sharedModels.BaseModel{},
				TenantID:  tenant.ID,
			},
			Email:    "owner@gipos.id",
			Password: hashedPassword,
			Name:     "Tenant Owner",
			Phone:    "081234567891",
			Role:     "tenant_owner",
			Status:   "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				BaseModel: sharedModels.BaseModel{},
				TenantID:  tenant.ID,
			},
			Email:    "manager@gipos.id",
			Password: hashedPassword,
			Name:     "Manager",
			Phone:    "081234567892",
			Role:     "manager",
			Status:   "active",
		},
		{
			TenantModel: sharedModels.TenantModel{
				BaseModel: sharedModels.BaseModel{},
				TenantID:  tenant.ID,
			},
			Email:    "cashier@gipos.id",
			Password: hashedPassword,
			Name:     "Cashier",
			Phone:    "081234567893",
			Role:     "cashier",
			Status:   "active",
		},
	}

	for i := range users {
		if err := s.db.Create(&users[i]).Error; err != nil {
			log.Printf("❌ Failed to create user %s: %v", users[i].Email, err)
			continue
		}
		log.Printf("✅ Created user: %s (%s) - ID: %d", users[i].Email, users[i].Role, users[i].ID)
	}

	log.Println("✅ User seeding completed")
	return nil
}
