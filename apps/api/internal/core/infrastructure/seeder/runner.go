package seeder

import (
	authSeeders "gipos/api/internal/auth/data/seeders"
	"gipos/api/internal/core/infrastructure/database"
	categorySeeders "gipos/api/internal/master-data/category_product/data/seeders"
	outletSeeders "gipos/api/internal/master-data/outlet/data/seeders"
	productSeeders "gipos/api/internal/master-data/products/data/seeders"
	warehouseSeeders "gipos/api/internal/master-data/warehouse/data/seeders"
	// salesSeeders "gipos/api/internal/sales/data/seeders"
	stockSeeders "gipos/api/internal/stock/data/seeders"

	"gorm.io/gorm"
)

// RunSeeders runs all seeders in the correct order
func RunSeeders(db *gorm.DB) {
	authSeeders.RunSeeders(db)
	outletSeeders.RunSeeders(db)
	warehouseSeeders.RunSeeders(db)
	categorySeeders.RunSeeders(db)
	productSeeders.RunSeeders(db)
	// salesSeeders.RunSeeders(db)
	stockSeeders.RunSeeders(db)
}

// RunAllSeeders is a convenience function that uses the default database connection
func RunAllSeeders() {
	RunSeeders(database.GetDB())
}
