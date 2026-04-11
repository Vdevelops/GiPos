package seeders

import (
	"errors"
	"log"

	"gipos/api/internal/auth/data/models"
	"gipos/api/internal/auth/domain/usecase"
	sharedModels "gipos/api/internal/core/shared/models"

	"gorm.io/gorm"
)

const (
	defaultTenantEmail = "admin@gipos.id"
	legacyTenantEmail  = "admin@example.com"
	adminEmail         = "admin@gipos.id"
	ownerEmail         = "owner@gipos.id"
	managerEmail       = "manager@gipos.id"
	cashierEmail       = "cashier@gipos.id"
)

type seededUser struct {
	Email    string
	Password string
	Name     string
	Phone    string
	Role     string
	Status   string
}

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

	// Create default tenant first (if not exists)
	var tenant sharedModels.Tenant
	if err := s.db.Where("email = ?", defaultTenantEmail).First(&tenant).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Backward compatibility for previously seeded tenant email.
			legacyErr := s.db.Where("email = ?", legacyTenantEmail).First(&tenant).Error
			if legacyErr == nil {
				if err := s.db.Model(&tenant).Update("email", defaultTenantEmail).Error; err != nil {
					return err
				}
				tenant.Email = defaultTenantEmail
				log.Printf("🔄 Migrated tenant email from %s to %s", legacyTenantEmail, defaultTenantEmail)
			} else if errors.Is(legacyErr, gorm.ErrRecordNotFound) {
				tenant = sharedModels.Tenant{
					BaseModel: sharedModels.BaseModel{},
					Name:      "GiPos Demo Tenant",
					Email:     defaultTenantEmail,
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
				return legacyErr
			}
		} else {
			return err
		}
	} else {
		log.Printf("✅ Using existing tenant: %d", tenant.ID)
	}

	users := []seededUser{
		{
			Email:    adminEmail,
			Password: "admin",
			Name:     "System Admin",
			Phone:    "081234567890",
			Role:     "system_admin",
			Status:   "active",
		},
		{
			Email:    ownerEmail,
			Password: "password123",
			Name:     "Tenant Owner",
			Phone:    "081234567891",
			Role:     "tenant_owner",
			Status:   "active",
		},
		{
			Email:    managerEmail,
			Password: "password123",
			Name:     "Manager",
			Phone:    "081234567892",
			Role:     "manager",
			Status:   "active",
		},
		{
			Email:    cashierEmail,
			Password: "password123",
			Name:     "Cashier",
			Phone:    "081234567893",
			Role:     "cashier",
			Status:   "active",
		},
	}

	for _, seeded := range users {
		var existing models.User
		err := s.db.Where("tenant_id = ? AND email = ?", tenant.ID, seeded.Email).First(&existing).Error
		if err == nil {
			log.Printf("↪️  User already exists, skip create: %s", seeded.Email)
			continue
		}

		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("❌ Failed checking user %s: %v", seeded.Email, err)
			continue
		}

		hashedPassword, hashErr := usecase.HashPassword(seeded.Password)
		if hashErr != nil {
			log.Printf("❌ Failed hashing password for %s: %v", seeded.Email, hashErr)
			continue
		}

		newUser := models.User{
			TenantModel: sharedModels.TenantModel{
				BaseModel: sharedModels.BaseModel{},
				TenantID:  tenant.ID,
			},
			Email:    seeded.Email,
			Password: hashedPassword,
			Name:     seeded.Name,
			Phone:    seeded.Phone,
			Role:     seeded.Role,
			Status:   seeded.Status,
		}

		if createErr := s.db.Create(&newUser).Error; createErr != nil {
			log.Printf("❌ Failed to create user %s: %v", seeded.Email, createErr)
			continue
		}

		log.Printf("✅ Created user: %s (%s) - ID: %d", newUser.Email, newUser.Role, newUser.ID)
	}

	log.Println("✅ User seeding completed")
	return nil
}
