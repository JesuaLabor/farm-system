package controllers

import (
	"less-farmer/config"
	"less-farmer/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProducts(c *gin.Context) {
	var products []models.Product
	query := config.DB.Preload("Farmer").Where("status = ?", "active")
	if cat := c.Query("category"); cat != "" {
		query = query.Where("category = ?", cat)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}
	query.Order("created_at desc").Find(&products)
	c.JSON(http.StatusOK, products)
}

func GetProduct(c *gin.Context) {
	var product models.Product
	if err := config.DB.Preload("Farmer").First(&product, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(http.StatusOK, product)
}

func CreateProduct(c *gin.Context) {
	farmerID, _ := c.Get("userID")
	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	input.FarmerID = farmerID.(uint)
	config.DB.Create(&input)
	c.JSON(http.StatusCreated, input)
}

func GetMyProducts(c *gin.Context) {
	farmerID, _ := c.Get("userID")
	var products []models.Product
	config.DB.Where("farmer_id = ?", farmerID).Order("created_at desc").Find(&products)
	c.JSON(http.StatusOK, products)
}

func UpdateProduct(c *gin.Context) {
	farmerID, _ := c.Get("userID")
	var product models.Product
	if err := config.DB.Where("id = ? AND farmer_id = ?", c.Param("id"), farmerID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	c.ShouldBindJSON(&product)
	config.DB.Save(&product)
	c.JSON(http.StatusOK, product)
}

func DeleteProduct(c *gin.Context) {
	farmerID, _ := c.Get("userID")
	config.DB.Where("id = ? AND farmer_id = ?", c.Param("id"), farmerID).Delete(&models.Product{})
	c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
}
