package router

import (
	"gipos/api/internal/auth/data/repositories"
	"gipos/api/internal/auth/domain/usecase"
	"gipos/api/internal/auth/presentation/handler"
	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes sets up authentication-related routes
func SetupAuthRoutes(r *gin.RouterGroup) {
	// Initialize dependencies
	db := database.GetDB()
	cfg := config.Get()
	userRepo := repositories.NewUserRepository(db)
	authUsecase := usecase.NewAuthUsecase(userRepo, cfg)
	userUsecase := usecase.NewUserUsecase(userRepo)
	authHandler := handler.NewAuthHandler(authUsecase, userUsecase)
	userHandler := handler.NewUserHandler(userUsecase)

	// Auth routes (public)
	auth := r.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/register", authHandler.Register)
		auth.POST("/refresh", authHandler.RefreshToken)
		
		// Protected routes (require auth middleware)
		authProtected := auth.Group("")
		authProtected.Use(middleware.AuthMiddleware())
		{
			authProtected.GET("/me", authHandler.Me)
		}
	}

	// User routes (protected - require auth middleware)
	users := r.Group("/users")
	users.Use(middleware.AuthMiddleware())
	{
		users.GET("", userHandler.ListUsers)
		users.GET("/:id", userHandler.GetUser)
	}
}
