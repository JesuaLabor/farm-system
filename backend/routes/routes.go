package routes

import (
	"less-farmer/controllers"
	"less-farmer/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// ── Public ───────────────────────────────────────────
	auth := api.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	// ── Protected ────────────────────────────────────────
	p := api.Group("/")
	p.Use(middleware.AuthMiddleware())
	{
		p.GET("me", controllers.GetMe)

		// Products
		products := p.Group("/products")
		{
			products.GET("/", controllers.GetProducts)
			products.GET("/:id", controllers.GetProduct)
			products.GET("/my", middleware.RoleMiddleware("farmer"), controllers.GetMyProducts)
			products.POST("/", middleware.RoleMiddleware("farmer"), controllers.CreateProduct)
			products.PATCH("/:id", middleware.RoleMiddleware("farmer"), controllers.UpdateProduct)
			products.DELETE("/:id", middleware.RoleMiddleware("farmer"), controllers.DeleteProduct)
		}

		// TODO: Add routes for Orders, MarketPrices, AidPrograms,
		//       AidApplications, HarvestLogs, FinancialRecords,
		//       Forum, and Notifications in subsequent phases
	}
}
