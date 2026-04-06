package router

import (
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/middleware"
	"gipos/api/internal/master-data/outlet/data/repositories"
	"gipos/api/internal/master-data/outlet/domain/usecase"
	"gipos/api/internal/master-data/outlet/presentation/handler"

	"github.com/gin-gonic/gin"
)

// SetupOutletRoutes sets up outlet-related routes
func SetupOutletRoutes(r *gin.RouterGroup) {
	// Initialize dependencies
	db := database.GetDB()
	outletRepo := repositories.NewOutletRepository(db)
	outletUsecase := usecase.NewOutletUsecase(outletRepo)
	outletHandler := handler.NewOutletHandler(outletUsecase)

	// Outlet routes (protected - require auth middleware)
	outlets := r.Group("/outlets")
	outlets.Use(middleware.AuthMiddleware())
	{
		outlets.POST("", outletHandler.CreateOutlet)
		outlets.GET("", outletHandler.ListOutlets)
		outlets.GET("/:id", outletHandler.GetOutlet)
		outlets.PUT("/:id", outletHandler.UpdateOutlet)
		outlets.DELETE("/:id", outletHandler.DeleteOutlet)
	}
}

