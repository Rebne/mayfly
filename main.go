package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Message struct {
	gorm.Model
	Content string
}

type DeletionInfo struct {
	gorm.Model
	LastDeletionTime time.Time
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

	if err := db.AutoMigrate(&Message{}, &DeletionInfo{}); err != nil {
		log.Fatal("Error migrating database:", err)
	}

	var deletionInfo DeletionInfo
	if err := db.First(&deletionInfo).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			deletionInfo = DeletionInfo{LastDeletionTime: time.Now()}
			if err := db.Create(&deletionInfo).Error; err != nil {
				log.Fatal("Error creating DeletionInfo:", err)
			}
		} else {
			log.Fatal("Error fetching DeletionInfo:", err)
		}
	}

	if time.Since(deletionInfo.LastDeletionTime) >= 12*time.Hour {
		deleteAllMessages()
	}

	r := chi.NewRouter()

	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	r.Get("/", homeHandler)
	r.Post("/submit", submitHandler)

	log.Println("Server starting on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	var deletionInfo DeletionInfo
	if err := db.First(&deletionInfo).Error; err != nil {
		log.Println("Error fetching DeletionInfo:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if time.Since(deletionInfo.LastDeletionTime) >= 12*time.Hour {
		deleteAllMessages()
	}

	tmpl, err := template.ParseFiles("templates/home.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var messages []Message
	if err := db.Order("created_at DESC").Find(&messages).Error; err != nil {
		log.Println("Error fetching messages:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if err := tmpl.Execute(w, messages); err != nil {
		log.Println("Error executing template:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func submitHandler(w http.ResponseWriter, r *http.Request) {
	var deletionInfo DeletionInfo
	if err := db.First(&deletionInfo).Error; err != nil {
		log.Println("Error fetching DeletionInfo:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if time.Since(deletionInfo.LastDeletionTime) >= 12*time.Hour {
		deleteAllMessages()
	}

	content := r.FormValue("content")

	message := Message{Content: content}
	if err := db.Create(&message).Error; err != nil {
		log.Println("Error creating message:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func deleteAllMessages() {
	if err := db.Exec("TRUNCATE TABLE messages").Error; err != nil {
		log.Println("Error deleting messages:", err)
		return
	}
	log.Println("All messages deleted at", time.Now())

	var deletionInfo DeletionInfo
	if err := db.First(&deletionInfo).Error; err != nil {
		log.Println("Error fetching DeletionInfo:", err)
		return
	}
	deletionInfo.LastDeletionTime = time.Now()
	if err := db.Save(&deletionInfo).Error; err != nil {
		log.Println("Error updating DeletionInfo:", err)
	}
}
