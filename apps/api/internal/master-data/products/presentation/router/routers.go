package router

import (
	categoryRepo "gipos/api/internal/master-data/category_product/data/repositories"
	outletRepo "gipos/api/internal/master-data/outlet/data/repositories"
	warehouseRepo "gipos/api/internal/master-data/warehouse/data/repositories"
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/middleware"
	productRepos "gipos/api/internal/master-data/products/data/repositories"
	"gipos/api/internal/master-data/products/domain/usecase"
	"gipos/api/internal/master-data/products/presentation/handler"
	stockService "gipos/api/internal/stock/domain/service"

	"github.com/gin-gonic/gin"
)

// SetupProductRoutes sets up product-related routes
func SetupProductRoutes(r *gin.RouterGroup) {
	// Initialize dependencies
	db := database.GetDB()
	productRepo := productRepos.NewProductRepository(db)
	productImageRepo := productRepos.NewProductImageRepository(db)
	productStockRepo := productRepos.NewProductStockRepository(db)
	categoryRepo := categoryRepo.NewCategoryRepository(db)
	outletRepo := outletRepo.NewOutletRepository(db)
	warehouseRepo := warehouseRepo.NewWarehouseRepository(db)
	stockSvc := stockService.NewStockService()
	
	productUsecase := usecase.NewProductUsecase(productRepo, categoryRepo, outletRepo)
	productImageUsecase := usecase.NewProductImageUsecase(productImageRepo, productRepo)
	productStockUsecase := usecase.NewProductStockUsecase(productStockRepo, productRepo, warehouseRepo, stockSvc, db)
	
	productHandler := handler.NewProductHandler(productUsecase)
	productImageHandler := handler.NewProductImageHandler(productImageUsecase)
	productStockHandler := handler.NewProductStockHandler(productStockUsecase)

	// Product routes (protected - require auth middleware)
	products := r.Group("/products")
	products.Use(middleware.AuthMiddleware())
	{
		// Product CRUD
		products.POST("", productHandler.CreateProduct)
		products.GET("", productHandler.ListProducts)
		products.GET("/:id", productHandler.GetProduct)
		products.GET("/sku/:sku", productHandler.GetProductBySKU)
		products.GET("/barcode/:barcode", productHandler.GetProductByBarcode)
		products.PUT("/:id", productHandler.UpdateProduct)
		products.DELETE("/:id", productHandler.DeleteProduct)

		// Product Images routes
		products.POST("/:id/images", productImageHandler.CreateProductImage)
		products.POST("/:id/images/bulk", productImageHandler.BulkCreateProductImages)
		products.GET("/:id/images", productImageHandler.GetProductImages)
		products.GET("/images/:id", productImageHandler.GetProductImage)
		products.PUT("/images/:id", productImageHandler.UpdateProductImage)
		products.DELETE("/images/:id", productImageHandler.DeleteProductImage)

		// Product Stocks routes
		products.POST("/:id/stocks", productStockHandler.CreateProductStock)
		products.POST("/:id/stocks/bulk", productStockHandler.BulkCreateProductStocks)
		products.GET("/:id/stocks", productStockHandler.GetProductStocks)
		products.GET("/:id/stocks/total", productStockHandler.GetProductTotalStock)
		products.GET("/stocks/:id", productStockHandler.GetProductStock)
		products.PUT("/stocks/:id", productStockHandler.UpdateProductStock)
		products.DELETE("/stocks/:id", productStockHandler.DeleteProductStock)
	}
}

