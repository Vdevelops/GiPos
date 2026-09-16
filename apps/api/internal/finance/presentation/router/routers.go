package router

import (
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/middleware"
	financeRepo "gipos/api/internal/finance/data/repositories"
	financeUsecase "gipos/api/internal/finance/domain/usecase"
	financeHandler "gipos/api/internal/finance/presentation/handler"

	"github.com/gin-gonic/gin"
)

func SetupFinanceRoutes(r *gin.RouterGroup) {
	db := database.GetDB()
	repo := financeRepo.NewFinanceRepository(db)
	uc := financeUsecase.NewFinanceUsecase(repo)
	h := financeHandler.NewFinanceHandler(uc)

	finance := r.Group("/finance")
	finance.Use(middleware.AuthMiddleware())
	{
		finance.POST("/opening-balance", h.SetOpeningBalance)
		finance.POST("/expenses/general", h.CreateGeneralExpense)
		finance.POST("/expenses/fixed", h.CreateFixedExpense)
		finance.GET("/fixed-expense-components", h.ListFixedExpenseComponents)
		finance.POST("/fixed-expense-components", h.CreateFixedExpenseComponent)
		finance.PATCH("/fixed-expense-components/:id", h.UpdateFixedExpenseComponent)
		finance.DELETE("/fixed-expense-components/:id", h.DeleteFixedExpenseComponent)
		finance.PATCH("/expenses/items/:id", h.UpdateExpenseItem)
		finance.DELETE("/expenses/items/:id", h.DeleteExpenseItem)
		finance.GET("/summary", h.GetSummary)
	}
}
