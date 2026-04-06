package database

import (
	"log"
	"os"

	authModels "gipos/api/internal/auth/data/models"
	"gipos/api/internal/core/shared/models"
	categoryModels "gipos/api/internal/master-data/category_product/data/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	productModels "gipos/api/internal/master-data/products/data/models"
	warehouseModels "gipos/api/internal/master-data/warehouse/data/models"
	salesModels "gipos/api/internal/sales/data/models"
	stockModels "gipos/api/internal/stock/data/models"
)

// AllModels returns a slice of pointers to all GORM models in the project.
// Keep this list as the single source of truth for schema tools (GORM AutoMigrate, seeders, etc.).
func AllModels() []interface{} {
	return []interface{}{
		// Core multi-tenant
		&models.Tenant{},
		&authModels.User{},

		// RBAC - Roles & Permissions
		&authModels.Permission{},
		&authModels.Role{},
		&authModels.RolePermission{},
		&authModels.UserRole{},

		// Master Data - Outlet
		&outletModels.Outlet{},

		// Master Data - Category Product
		&categoryModels.Category{},

		// Master Data - Warehouse
		&warehouseModels.Warehouse{},

		// Master Data - Products & Inventory
		&productModels.Product{},
		&productModels.ProductImage{},
		&productModels.ProductStock{},

		// Stock Management
		&stockModels.StockMovement{},

		// Sales & Transactions
		&salesModels.Shift{},
		&salesModels.Sale{},
		&salesModels.SaleItem{},
		&salesModels.Payment{},
	}
}

// AutoMigrate runs database migrations
func AutoMigrate() error {
	// Allow disabling GORM automigrate when using external migration tools (e.g., in production)
	if os.Getenv("SKIP_AUTO_MIGRATE") == "1" {
		log.Println("⚠️  SKIP_AUTO_MIGRATE=1, skipping GORM AutoMigrate")
		return nil
	}

	log.Println("🔄 Running database migrations...")

	models := AllModels()

	// Check if we should drop and recreate tables
	// Default behavior: drop tables in development environment
	// Can be controlled via DROP_TABLES_ON_MIGRATE env var:
	//   - "1" or "true" = always drop tables
	//   - "0" or "false" = never drop tables
	//   - unset = drop tables only in development
	shouldDropTables := false
	dropTablesEnv := os.Getenv("DROP_TABLES_ON_MIGRATE")
	
	if dropTablesEnv == "1" || dropTablesEnv == "true" {
		shouldDropTables = true
		log.Println("🗑️  DROP_TABLES_ON_MIGRATE is set, will drop all tables...")
	} else if dropTablesEnv == "0" || dropTablesEnv == "false" {
		shouldDropTables = false
		log.Println("ℹ️  DROP_TABLES_ON_MIGRATE=0, keeping existing tables...")
	} else {
		// Default: drop tables in development
		appEnv := os.Getenv("APP_ENV")
		if appEnv == "" {
			appEnv = os.Getenv("ENV")
		}
		if appEnv == "development" || appEnv == "dev" || appEnv == "" {
			shouldDropTables = true
			log.Println("🗑️  Development environment detected, dropping all tables for fresh start...")
		}
	}

	if shouldDropTables {
		log.Println("🗑️  Dropping all tables...")
		if err := DB.Migrator().DropTable(models...); err != nil {
			log.Printf("⚠️  Warning: Failed to drop some tables (may not exist): %v", err)
			// Continue anyway, tables might not exist yet
		} else {
			log.Println("✅ All tables dropped successfully")
		}
	}

	// Run AutoMigrate
	// GORM will handle schema creation and updates automatically
	// Foreign key constraints will be created based on model relationships
	log.Println("📋 Running AutoMigrate on all models...")
	if err := DB.AutoMigrate(models...); err != nil {
		log.Printf("❌ Migration failed: %v", err)
		return err
	}

	log.Println("✅ Database migrations completed successfully")
	return nil
}
