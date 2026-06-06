package controllers

import (
	"less-farmer/config"
	"less-farmer/middleware"
	"less-farmer/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Name         string `json:"name" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Password     string `json:"password" binding:"required,min=6"`
	Role         string `json:"role" binding:"required,oneof=farmer buyer lgu_officer expert admin"`
	Barangay     string `json:"barangay"`
	Municipality string `json:"municipality"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	user := models.User{
		Name: input.Name, Email: input.Email,
		Password: string(hashed), Role: input.Role,
		Barangay: input.Barangay, Municipality: input.Municipality,
	}
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Registered successfully", "user": gin.H{
		"id": user.ID, "name": user.Name, "email": user.Email, "role": user.Role,
	}})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	claims := middleware.Claims{
		UserID: user.ID, Email: user.Email, Role: user.Role, Name: user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString([]byte(config.GetEnv("JWT_SECRET", "secret")))
	c.JSON(http.StatusOK, gin.H{
		"token": tokenStr,
		"user":  gin.H{"id": user.ID, "name": user.Name, "email": user.Email, "role": user.Role, "barangay": user.Barangay, "municipality": user.Municipality},
	})
}

func GetMe(c *gin.Context) {
	userID, _ := c.Get("userID")
	var user models.User
	config.DB.First(&user, userID)
	c.JSON(http.StatusOK, gin.H{
		"id": user.ID, "name": user.Name, "email": user.Email,
		"role": user.Role, "barangay": user.Barangay, "municipality": user.Municipality,
	})
}
