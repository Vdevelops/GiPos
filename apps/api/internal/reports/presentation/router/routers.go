package router

import (
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/middleware"
	reportRepo "gipos/api/internal/reports/data/repositories"
	reportUsecase "gipos/api/internal/reports/domain/usecase"
	reportHandler "gipos/api/internal/reports/presentation/handler"

	"github.com/gin-gonic/gin"
)

// SetupReportsRoutes sets up reports routes.
func SetupReportsRoutes(r *gin.RouterGroup) {
	db := database.GetDB()
	repo := reportRepo.NewReportRepository(db)
	uc := reportUsecase.NewReportUsecase(repo)
	h := reportHandler.NewReportHandler(uc)

	reports := r.Group("/reports")
	reports.Use(middleware.AuthMiddleware())
	{
		reports.GET("/summary", h.GetSummary)
		reports.GET("/sales", h.GetSales)
		reports.GET("/top-products", h.GetTopProducts)
		reports.GET("/product-sales", h.GetProductSales)
		reports.GET("/payment-methods", h.GetPaymentMethods)
		reports.GET("/consistency-check", h.GetConsistencyCheck)
	}
}
