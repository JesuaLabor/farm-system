package config

import (
	"fmt"
	"log"
	"less-farmer/models"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		GetEnv("DB_USER", "root"),
		GetEnv("DB_PASSWORD", ""),
		GetEnv("DB_HOST", "localhost"),
		GetEnv("DB_PORT", "3306"),
		GetEnv("DB_NAME", "less_farmer"),
	)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}
	DB = db
	log.Println("✅ Database connected")
}

func MigrateDB() {
	DB.AutoMigrate(
		&models.User{},
		&models.FarmerProfile{},
		&models.Product{},
		&models.Order{},
		&models.MarketPrice{},
		&models.AidProgram{},
		&models.AidApplication{},
		&models.HarvestLog{},
		&models.FinancialRecord{},
		&models.ForumPost{},
		&models.ForumReply{},
		&models.Notification{},
	)
	log.Println("✅ Database migrated")
}

func SetupCORS(r *gin.Engine) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", os.Getenv("FRONTEND_URL")},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
}

func GetEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
