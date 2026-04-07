package router

import (
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/middleware"
	outletRepo "gipos/api/internal/master-data/outlet/data/repositories"
	productRepo "gipos/api/internal/master-data/products/data/repositories"
	productStockRepo "gipos/api/internal/master-data/products/data/repositories"
	reportRepo "gipos/api/internal/reports/data/repositories"
	"gipos/api/internal/sales/data/repositories"
	"gipos/api/internal/sales/domain/usecase"
	"gipos/api/internal/sales/presentation/handler"
	stockService "gipos/api/internal/stock/domain/service"

	"github.com/gin-gonic/gin"
)

// SetupSalesRoutes sets up sales-related routes
func SetupSalesRoutes(r *gin.RouterGroup) {
	// Initialize dependencies
	db := database.GetDB()
	saleRepo := repositories.NewSaleRepository(db)
	saleItemRepo := repositories.NewSaleItemRepository(db)
	paymentRepo := repositories.NewPaymentRepository(db)
	shiftRepo := repositories.NewShiftRepository(db)
	productRepo := productRepo.NewProductRepository(db)
	productStockRepo := productStockRepo.NewProductStockRepository(db)
	outletRepo := outletRepo.NewOutletRepository(db)
	reportsRepo := reportRepo.NewReportRepository(db)
	stockSvc := stockService.NewStockService()

	saleUsecase := usecase.NewSaleUsecase(saleRepo, saleItemRepo, productRepo, productStockRepo, outletRepo, shiftRepo, stockSvc, db)
	paymentUsecase := usecase.NewPaymentUsecase(paymentRepo, saleRepo, reportsRepo, db)
	shiftUsecase := usecase.NewShiftUsecase(shiftRepo, saleRepo, outletRepo)

	saleHandler := handler.NewSaleHandler(saleUsecase)
	paymentHandler := handler.NewPaymentHandler(paymentUsecase)
	shiftHandler := handler.NewShiftHandler(shiftUsecase)

	// Sales routes (protected - require auth middleware)
	sales := r.Group("/sales")
	sales.Use(middleware.AuthMiddleware())
	{
		sales.POST("", saleHandler.CreateSale)
		sales.GET("", saleHandler.ListSales)
		sales.GET("/:id", saleHandler.GetSale)
		sales.POST("/:id/void", saleHandler.VoidSale)
		sales.GET("/:id/payment", paymentHandler.GetPaymentBySaleID)
	}

	// Payment routes (protected - require auth middleware)
	payments := r.Group("/payments")
	payments.Use(middleware.AuthMiddleware())
	{
		payments.POST("", paymentHandler.ProcessPayment)
		payments.GET("/:id", paymentHandler.GetPayment)
		payments.PUT("/:id/status", paymentHandler.UpdatePaymentStatus)
	}

	// Shift routes (protected - require auth middleware)
	shifts := r.Group("/shifts")
	shifts.Use(middleware.AuthMiddleware())
	{
		shifts.POST("/open", shiftHandler.OpenShift)
		shifts.POST("/:id/close", shiftHandler.CloseShift)
		shifts.GET("", shiftHandler.ListShifts)
		shifts.GET("/:id", shiftHandler.GetShift)
	}
}
