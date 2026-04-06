package router

import (
	authRouter "gipos/api/internal/auth/presentation/router"
	"gipos/api/internal/core/handlers"
	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/middleware"
	categoryRouter "gipos/api/internal/master-data/category_product/presentation/router"
	outletRouter "gipos/api/internal/master-data/outlet/presentation/router"
	productRouter "gipos/api/internal/master-data/products/presentation/router"
	warehouseRouter "gipos/api/internal/master-data/warehouse/presentation/router"
	salesRouter "gipos/api/internal/sales/presentation/router"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all routes
func SetupRoutes(router *gin.Engine) {
	// Health check endpoint (no versioning)
	router.GET("/health", handlers.HealthCheck)
	router.GET("/", handlers.HealthCheck)

	// Get database instance
	db := database.DB
	cfg := config.Get()

	// Initialize upload handler
	uploadHandler, err := handlers.NewUploadHandler(cfg)
	if err != nil {
		// Log error but continue - upload will fail gracefully
		gin.DefaultErrorWriter.Write([]byte("Warning: Failed to initialize upload handler: " + err.Error() + "\n"))
	}

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Health check
		v1.GET("/health", handlers.HealthCheck)

		// Auth routes
		authRouter.SetupAuthRoutes(v1)

		// Upload routes (require authentication)
		if uploadHandler != nil {
			upload := v1.Group("/upload")
			upload.Use(middleware.AuthMiddleware())
			{
				upload.POST("/image", uploadHandler.UploadImage)
				upload.DELETE("/image", uploadHandler.DeleteImage)
			}
		}

		// Master Data routes
		outletRouter.SetupOutletRoutes(v1)
		categoryRouter.SetupCategoryRoutes(v1)
		productRouter.SetupProductRoutes(v1)
		warehouseRouter.SetupWarehouseRoutes(v1, db)

		// Sales routes
		salesRouter.SetupSalesRoutes(v1)
	}
}

