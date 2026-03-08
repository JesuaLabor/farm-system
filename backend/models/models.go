package models

import (
	"time"

	"gorm.io/gorm"
)

// ─── User ────────────────────────────────────────────────
type User struct {
	gorm.Model
	Name         string `gorm:"not null" json:"name"`
	Email        string `gorm:"uniqueIndex;not null" json:"email"`
	Password     string `gorm:"not null" json:"-"`
	Role         string `gorm:"type:enum('farmer','buyer','lgu_officer','expert','admin');not null" json:"role"`
	Barangay     string `json:"barangay"`
	Municipality string `json:"municipality"`
	Phone        string `json:"phone"`
	ProfilePhoto string `json:"profile_photo"`
}

// ─── Farmer Profile ──────────────────────────────────────
type FarmerProfile struct {
	gorm.Model
	UserID          uint    `gorm:"uniqueIndex;not null" json:"user_id"`
	FarmName        string  `json:"farm_name"`
	LandAreaHectar  float64 `json:"land_area_hectares"`
	CropsGrown      string  `json:"crops_grown"` // JSON array stored as string
	Latitude        float64 `json:"latitude"`
	Longitude       float64 `json:"longitude"`
	FarmDescription string  `json:"farm_description"`

	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// ─── Product (Marketplace Listing) ───────────────────────
type Product struct {
	gorm.Model
	FarmerID    uint    `gorm:"not null" json:"farmer_id"`
	Name        string  `gorm:"not null" json:"name"`
	Category    string  `gorm:"not null" json:"category"` // vegetables, fruits, grains, livestock
	Quantity    float64 `gorm:"not null" json:"quantity"`
	Unit        string  `gorm:"not null" json:"unit"` // kg, piece, bundle
	PricePerUnit float64 `gorm:"not null" json:"price_per_unit"`
	Description string  `json:"description"`
	Photos      string  `json:"photos"` // JSON array of photo URLs
	HarvestDate *time.Time `json:"harvest_date"`
	Status      string  `gorm:"type:enum('active','sold','expired');default:'active'" json:"status"`

	Farmer User `gorm:"foreignKey:FarmerID" json:"farmer,omitempty"`
}

// ─── Order ────────────────────────────────────────────────
type Order struct {
	gorm.Model
	ProductID  uint    `gorm:"not null" json:"product_id"`
	BuyerID    uint    `gorm:"not null" json:"buyer_id"`
	Quantity   float64 `gorm:"not null" json:"quantity"`
	TotalPrice float64 `gorm:"not null" json:"total_price"`
	Status     string  `gorm:"type:enum('pending','accepted','rejected','completed','cancelled');default:'pending'" json:"status"`
	Message    string  `json:"message"`

	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Buyer   User    `gorm:"foreignKey:BuyerID" json:"buyer,omitempty"`
}

// ─── Market Price ─────────────────────────────────────────
type MarketPrice struct {
	gorm.Model
	CropName     string    `gorm:"not null" json:"crop_name"`
	PricePerKg   float64   `gorm:"not null" json:"price_per_kg"`
	Unit         string    `gorm:"default:'kg'" json:"unit"`
	Source       string    `json:"source"`
	RecordedDate time.Time `gorm:"not null" json:"recorded_date"`
	RecordedBy   uint      `json:"recorded_by"`

	Recorder User `gorm:"foreignKey:RecordedBy" json:"recorder,omitempty"`
}

// ─── Aid Program ──────────────────────────────────────────
type AidProgram struct {
	gorm.Model
	Name         string     `gorm:"not null" json:"name"`
	Description  string     `json:"description"`
	Budget       float64    `json:"budget"`
	Requirements string     `json:"requirements"` // JSON array
	Deadline     *time.Time `json:"deadline"`
	Status       string     `gorm:"type:enum('active','closed','draft');default:'active'" json:"status"`
	CreatedBy    uint       `json:"created_by"`

	Creator User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

// ─── Aid Application ──────────────────────────────────────
type AidApplication struct {
	gorm.Model
	ProgramID  uint   `gorm:"not null" json:"program_id"`
	FarmerID   uint   `gorm:"not null" json:"farmer_id"`
	Documents  string `json:"documents"` // JSON array of document URLs
	Status     string `gorm:"type:enum('pending','under_review','approved','rejected');default:'pending'" json:"status"`
	Remarks    string `json:"remarks"`
	ReviewedBy *uint  `json:"reviewed_by"`

	Program  AidProgram `gorm:"foreignKey:ProgramID" json:"program,omitempty"`
	Farmer   User       `gorm:"foreignKey:FarmerID" json:"farmer,omitempty"`
	Reviewer User       `gorm:"foreignKey:ReviewedBy" json:"reviewer,omitempty"`
}

// ─── Harvest Log ──────────────────────────────────────────
type HarvestLog struct {
	gorm.Model
	FarmerID    uint      `gorm:"not null" json:"farmer_id"`
	Crop        string    `gorm:"not null" json:"crop"`
	Quantity    float64   `gorm:"not null" json:"quantity"`
	Unit        string    `gorm:"not null" json:"unit"`
	HarvestDate time.Time `gorm:"not null" json:"harvest_date"`
	Notes       string    `json:"notes"`

	Farmer User `gorm:"foreignKey:FarmerID" json:"farmer,omitempty"`
}

// ─── Financial Record ─────────────────────────────────────
type FinancialRecord struct {
	gorm.Model
	FarmerID    uint      `gorm:"not null" json:"farmer_id"`
	Type        string    `gorm:"type:enum('income','expense');not null" json:"type"`
	Amount      float64   `gorm:"not null" json:"amount"`
	Category    string    `gorm:"not null" json:"category"`
	Description string    `json:"description"`
	Date        time.Time `gorm:"not null" json:"date"`

	Farmer User `gorm:"foreignKey:FarmerID" json:"farmer,omitempty"`
}

// ─── Forum Post ───────────────────────────────────────────
type ForumPost struct {
	gorm.Model
	AuthorID uint   `gorm:"not null" json:"author_id"`
	Title    string `gorm:"not null" json:"title"`
	Content  string `gorm:"not null" json:"content"`
	Category string `gorm:"not null" json:"category"` // pest-disease, best-practices, weather, market, general
	Tags     string `json:"tags"`                     // JSON array
	Views    int    `gorm:"default:0" json:"views"`

	Author  User        `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Replies []ForumReply `gorm:"foreignKey:PostID" json:"replies,omitempty"`
}

// ─── Forum Reply ──────────────────────────────────────────
type ForumReply struct {
	gorm.Model
	PostID         uint   `gorm:"not null" json:"post_id"`
	AuthorID       uint   `gorm:"not null" json:"author_id"`
	Content        string `gorm:"not null" json:"content"`
	IsExpertAnswer bool   `gorm:"default:false" json:"is_expert_answer"`

	Author User `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}

// ─── Notification ─────────────────────────────────────────
type Notification struct {
	gorm.Model
	UserID  uint   `gorm:"not null" json:"user_id"`
	Type    string `json:"type"` // order, aid, price, forum
	Title   string `gorm:"not null" json:"title"`
	Message string `gorm:"not null" json:"message"`
	Link    string `json:"link"`
	IsRead  bool   `gorm:"default:false" json:"is_read"`

	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
