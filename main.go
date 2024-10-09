package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Message struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	Content   string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

var db *gorm.DB
var err error

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	if err := db.AutoMigrate(&Message{}); err != nil {
		log.Fatal("Error migrating database:", err)
	}

	r := chi.NewRouter()

	r.Use(middleware.Logger)

	r.Handle("/*", http.StripPrefix("/", http.FileServer(http.Dir("./dist"))))

	r.Get("/", spaHandler)
	r.Post("/api/notes", getNotesHandler)
	r.Post("/api/add", submitHandler)

	log.Println("Server starting on http://localhost:3000")
	log.Fatal(http.ListenAndServe(":3000", r))
}

func spaHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./dist/index.html")
}

func getNotesHandler(w http.ResponseWriter, r *http.Request) {
	var messages []Message
	if err := db.Where("created_at > ?", time.Now().Add(-12*time.Hour)).Order("created_at DESC").Find(&messages).Error; err != nil {
		log.Println("Error fetching messages:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(messages)

	deleteOldMessages()
}

func deleteOldMessages() {
	result := db.Where("created_at < ?", time.Now().Add(-12*time.Hour)).Delete(&Message{})
	if result.Error != nil {
		log.Println("Error deleting old messages:", result.Error)
	}
}

func submitHandler(w http.ResponseWriter, r *http.Request) {
	content := r.FormValue("content")

	message := Message{Content: content}
	if err := db.Create(&message).Error; err != nil {
		log.Println("Error creating message:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}
