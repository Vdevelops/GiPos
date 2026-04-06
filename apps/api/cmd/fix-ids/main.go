package main

import (
	"log"

	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/database"
	categoryModels "gipos/api/internal/master-data/category_product/data/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	productModels "gipos/api/internal/master-data/products/data/models"

	"github.com/google/uuid"
)

// fixIDs updates all records that have empty ID
func main() {
	log.Println("🔧 Starting ID fix script...")

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

	db := database.GetDB()

	// Fix Outlets
	log.Println("")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	log.Println("🔧 Fixing Outlet IDs...")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	var outlets []outletModels.Outlet
	// Query outlets with empty or null ID (PostgreSQL)
	// Use raw SQL to handle empty string and NULL properly
	if err := db.Where("(id = '' OR id IS NULL) AND deleted_at IS NULL").Find(&outlets).Error; err != nil {
		log.Printf("⚠️  Error querying outlets: %v", err)
	} else {
		log.Printf("📋 Found %d outlets without ID", len(outlets))
		fixedCount := 0
		for i := range outlets {
			if outlets[i].ID == "" {
				newID := uuid.New().String()
				if err := db.Model(&outlets[i]).Update("id", newID).Error; err != nil {
					log.Printf("❌ Failed to update outlet %s: %v", outlets[i].Code, err)
				} else {
					log.Printf("✅ Fixed outlet: %s - New ID: %s", outlets[i].Code, newID)
					fixedCount++
				}
			}
		}
		log.Printf("✅ Fixed %d outlet(s)", fixedCount)
	}

	// Fix Categories
	log.Println("")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	log.Println("🔧 Fixing Category IDs...")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	var categories []categoryModels.Category
	// Query categories with empty or null ID
	if err := db.Where("(id = '' OR id IS NULL) AND deleted_at IS NULL").Find(&categories).Error; err != nil {
		log.Printf("⚠️  Error querying categories: %v", err)
	} else {
		log.Printf("📋 Found %d categories without ID", len(categories))
		fixedCount := 0
		for i := range categories {
			if categories[i].ID == "" {
				newID := uuid.New().String()
				if err := db.Model(&categories[i]).Update("id", newID).Error; err != nil {
					log.Printf("❌ Failed to update category %s: %v", categories[i].Name, err)
				} else {
					log.Printf("✅ Fixed category: %s - New ID: %s", categories[i].Name, newID)
					fixedCount++
				}
			}
		}
		log.Printf("✅ Fixed %d category(ies)", fixedCount)
	}

	// Fix Products
	log.Println("")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	log.Println("🔧 Fixing Product IDs...")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	var products []productModels.Product
	// Query products with empty or null ID
	if err := db.Where("(id = '' OR id IS NULL) AND deleted_at IS NULL").Find(&products).Error; err != nil {
		log.Printf("⚠️  Error querying products: %v", err)
	} else {
		log.Printf("📋 Found %d products without ID", len(products))
		fixedCount := 0
		for i := range products {
			if products[i].ID == "" {
				newID := uuid.New().String()
				if err := db.Model(&products[i]).Update("id", newID).Error; err != nil {
					log.Printf("❌ Failed to update product %s: %v", products[i].SKU, err)
				} else {
					log.Printf("✅ Fixed product: %s - New ID: %s", products[i].SKU, newID)
					fixedCount++
				}
			}
		}
		log.Printf("✅ Fixed %d product(s)", fixedCount)
	}

	log.Println("")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	log.Println("✅ ID fix completed")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	log.Println("")
}
