package main

import (
	"log"

	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/database"
	categoryModels "gipos/api/internal/master-data/category_product/data/models"
	outletModels "gipos/api/internal/master-data/outlet/data/models"
	productModels "gipos/api/internal/master-data/products/data/models"

	"gorm.io/gorm"
)

// fixIDs updates all records that have zero ID.
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
	if err := db.Where("id = 0 AND deleted_at IS NULL").Find(&outlets).Error; err != nil {
		log.Printf("⚠️  Error querying outlets: %v", err)
	} else {
		log.Printf("📋 Found %d outlets with zero ID", len(outlets))
		fixedCount := 0
		nextID, err := getNextID(db, "outlets")
		if err != nil {
			log.Printf("⚠️  Failed to compute next outlet ID: %v", err)
			nextID = 1
		}
		for i := range outlets {
			if outlets[i].ID == 0 {
				newID := nextID
				nextID++
				if err := db.Model(&outlets[i]).Update("id", newID).Error; err != nil {
					log.Printf("❌ Failed to update outlet %s: %v", outlets[i].Code, err)
				} else {
					log.Printf("✅ Fixed outlet: %s - New ID: %d", outlets[i].Code, newID)
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
	if err := db.Where("id = 0 AND deleted_at IS NULL").Find(&categories).Error; err != nil {
		log.Printf("⚠️  Error querying categories: %v", err)
	} else {
		log.Printf("📋 Found %d categories with zero ID", len(categories))
		fixedCount := 0
		nextID, err := getNextID(db, "categories")
		if err != nil {
			log.Printf("⚠️  Failed to compute next category ID: %v", err)
			nextID = 1
		}
		for i := range categories {
			if categories[i].ID == 0 {
				newID := nextID
				nextID++
				if err := db.Model(&categories[i]).Update("id", newID).Error; err != nil {
					log.Printf("❌ Failed to update category %s: %v", categories[i].Name, err)
				} else {
					log.Printf("✅ Fixed category: %s - New ID: %d", categories[i].Name, newID)
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
	if err := db.Where("id = 0 AND deleted_at IS NULL").Find(&products).Error; err != nil {
		log.Printf("⚠️  Error querying products: %v", err)
	} else {
		log.Printf("📋 Found %d products with zero ID", len(products))
		fixedCount := 0
		nextID, err := getNextID(db, "products")
		if err != nil {
			log.Printf("⚠️  Failed to compute next product ID: %v", err)
			nextID = 1
		}
		for i := range products {
			if products[i].ID == 0 {
				newID := nextID
				nextID++
				if err := db.Model(&products[i]).Update("id", newID).Error; err != nil {
					log.Printf("❌ Failed to update product %s: %v", products[i].SKU, err)
				} else {
					log.Printf("✅ Fixed product: %s - New ID: %d", products[i].SKU, newID)
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

func getNextID(db *gorm.DB, tableName string) (uint, error) {
	var maxID uint
	if err := db.Table(tableName).Select("COALESCE(MAX(id), 0)").Scan(&maxID).Error; err != nil {
		return 0, err
	}

	return maxID + 1, nil
}
