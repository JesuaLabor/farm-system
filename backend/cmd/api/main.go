package main

import (
	"log"
	"less-farmer/config"
	"less-farmer/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file, using system env vars")
	}

	config.ConnectDB()
	config.MigrateDB()

	r := gin.Default()
	config.SetupCORS(r)
	routes.RegisterRoutes(r)

	port := config.GetEnv("PORT", "8080")
	log.Printf("🌾 LESS-Farmer API running on :%s", port)
	r.Run(":" + port)
}
