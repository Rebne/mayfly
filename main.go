package main

import (
	"html/template"
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

	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	r.Get("/", homeHandler)
	r.Post("/submit", submitHandler)

	log.Println("Server starting on http://localhost:3000")
	log.Fatal(http.ListenAndServe(":3000", r))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/home.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var messages []Message
	if err := db.Where("created_at > ?", time.Now().Add(-12*time.Hour)).Order("created_at DESC").Find(&messages).Error; err != nil {
		log.Println("Error fetching messages:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if err := tmpl.Execute(w, messages); err != nil {
		log.Println("Error executing template:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}

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

	http.Redirect(w, r, "/", http.StatusSeeOther)
}
