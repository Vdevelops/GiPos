package router

import (
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/middleware"
	"gipos/api/internal/master-data/category_product/data/repositories"
	"gipos/api/internal/master-data/category_product/domain/usecase"
	"gipos/api/internal/master-data/category_product/presentation/handler"

	"github.com/gin-gonic/gin"
)

// SetupCategoryRoutes sets up category-related routes
func SetupCategoryRoutes(r *gin.RouterGroup) {
	// Initialize dependencies
	db := database.GetDB()
	categoryRepo := repositories.NewCategoryRepository(db)
	categoryUsecase := usecase.NewCategoryUsecase(categoryRepo)
	categoryHandler := handler.NewCategoryHandler(categoryUsecase)

	// Category routes (protected - require auth middleware)
	categories := r.Group("/categories")
	categories.Use(middleware.AuthMiddleware())
	{
		categories.POST("", categoryHandler.CreateCategory)
		categories.GET("", categoryHandler.ListCategories)
		categories.GET("/:id", categoryHandler.GetCategory)
		categories.PUT("/:id", categoryHandler.UpdateCategory)
		categories.DELETE("/:id", categoryHandler.DeleteCategory)
	}
}

