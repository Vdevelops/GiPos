package main

import (
	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/infrastructure/seeder"
	"log"
)

// seed is a database seeding tool
// This will populate the database with initial/default data
func main() {
	log.Println("🌱 Starting database seeding...")

	// Load configuration
	log.Println("⚙️  Loading configuration...")
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}
	log.Printf("✅ Configuration loaded: %s", cfg.App.Name)

	// Connect to database
	log.Println("📊 Connecting to database...")
	if err := database.Connect(); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	log.Println("✅ Database connected successfully")
	defer func() {
		log.Println("📊 Closing database connection...")
		database.Close()
	}()

	// Run migrations first
	log.Println("🔄 Running migrations...")
	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("❌ Failed to run migrations: %v", err)
	}
	log.Println("✅ Migrations completed")

	// Run all seeders
	log.Println("🌱 Running all seeders...")
	seeder.RunAllSeeders()

	log.Println("")
	log.Println("========================================")
	log.Println("✅ Database Seeding Process Completed")
	log.Println("========================================")
	log.Println("")
	log.Println("📝 Default credentials:")
	log.Println("   - admin@gipos.id / password123 (System Admin)")
	log.Println("   - owner@gipos.id / password123 (Tenant Owner)")
	log.Println("   - manager@gipos.id / password123 (Manager)")
	log.Println("   - cashier@gipos.id / password123 (Cashier)")
	log.Println("")
}

// seedRoles seeds default roles
// func seedRoles() {
// 	log.Println("📝 Seeding roles...")
// 	// Implementation will be added later
// }

// seedPermissions seeds default permissions
// func seedPermissions() {
// 	log.Println("📝 Seeding permissions...")
// 	// Implementation will be added later
// }

// seedCategories seeds default categories
// func seedCategories() {
// 	log.Println("📝 Seeding categories...")
// 	// Implementation will be added later
// }
