package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Message struct {
	gorm.Model
	Content string
}

var db *gorm.DB
var err error

type DeletionInfo struct {
	LastDeletionTime time.Time `json:"last_deletion_time"`
}

var deletionInfo DeletionInfo

func main() {
	db, err = gorm.Open(sqlite.Open("messages.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	db.AutoMigrate(&Message{})

	loadDeletionInfo()

	if time.Since(deletionInfo.LastDeletionTime) >= 24*time.Hour {
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
	if time.Since(deletionInfo.LastDeletionTime) >= 24*time.Hour {
		deleteAllMessages()
		saveDeletionInfo()
	}
	tmpl, err := template.ParseFiles("templates/home.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var messages []Message
	db.Find(&messages)

	tmpl.Execute(w, messages)
}

func submitHandler(w http.ResponseWriter, r *http.Request) {
	if time.Since(deletionInfo.LastDeletionTime) >= 24*time.Hour {
		deleteAllMessages()
		saveDeletionInfo()
	}

	content := r.FormValue("content")

	message := Message{Content: content}
	db.Create(&message)

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func deleteAllMessages() {
	db.Exec("DELETE FROM messages")
	log.Println("All messages deleted at", time.Now())
	deletionInfo.LastDeletionTime = time.Now()
}

func loadDeletionInfo() {
	file, err := os.ReadFile("deletion_info.json")
	if err != nil {
		if os.IsNotExist(err) {
			deletionInfo.LastDeletionTime = time.Now()
			saveDeletionInfo()
			return
		}
		log.Fatal(err)
	}

	err = json.Unmarshal(file, &deletionInfo)
	if err != nil {
		log.Fatal(err)
	}
}

func saveDeletionInfo() {
	file, err := json.Marshal(deletionInfo)
	if err != nil {
		log.Println("Error marshaling deletion info:", err)
		return
	}

	err = os.WriteFile("deletion_info.json", file, 0644)
	if err != nil {
		log.Println("Error saving deletion info:", err)
	}
}
