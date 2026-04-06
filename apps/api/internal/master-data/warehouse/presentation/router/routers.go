package router

import (
	"gipos/api/internal/core/middleware"
	"gipos/api/internal/master-data/warehouse/data/repositories"
	"gipos/api/internal/master-data/warehouse/domain/usecase"
	"gipos/api/internal/master-data/warehouse/presentation/handler"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

// SetupWarehouseRoutes configures warehouse routes
func SetupWarehouseRoutes(r *gin.RouterGroup, db *gorm.DB) {
	// Initialize dependencies
	warehouseRepo := repositories.NewWarehouseRepository(db)
	warehouseUsecase := usecase.NewWarehouseUsecase(warehouseRepo)
	warehouseHandler := handler.NewWarehouseHandler(warehouseUsecase)

	// Warehouse routes (require authentication)
	warehouses := r.Group("/warehouses")
	warehouses.Use(middleware.AuthMiddleware())
	{
		warehouses.POST("", warehouseHandler.CreateWarehouse)
		warehouses.GET("", warehouseHandler.ListWarehouses)
		warehouses.GET("/:id", warehouseHandler.GetWarehouse)
		warehouses.PUT("/:id", warehouseHandler.UpdateWarehouse)
		warehouses.DELETE("/:id", warehouseHandler.DeleteWarehouse)
	}
}
