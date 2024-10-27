package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID       uuid.UUID `gorm:"primaryKey;type:uuid"`
	Messages []Message `gorm:"foreignKey:UserID"`
}

type Message struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	UserID    uuid.UUID `gorm:"type:uuid"`
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
	err := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";").Error
	if err != nil {
		log.Fatal("Error enabling uuid-ossp extension:", err)
	}
	if err := db.AutoMigrate(&Message{}, &User{}); err != nil {
		log.Fatal("Error migrating database:", err)
	}
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(userMiddleware)
	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	r.Get("/", homeHandler)
	r.Post("/submit", submitHandler)
	log.Println("Server starting on http://localhost:3000")
	log.Fatal(http.ListenAndServe(":3000", r))
}

func userMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := r.Cookie("user_id")
		if err == http.ErrNoCookie {
			userID := uuid.New()
			cookie := &http.Cookie{
				Name:   "user_id",
				Value:  userID.String(),
				Path:   "/",
				MaxAge: 86400 * 30,
			}
			http.SetCookie(w, cookie)
			user := User{ID: userID}
			if err := db.Create(&user).Error; err != nil {
				log.Println("Error creating user:", err)
			}
		}
		next.ServeHTTP(w, r)
	})
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/home.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	cookie, err := r.Cookie("user_id")
	if err != nil {
		log.Println("Error parsing user_id:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	userID, err := uuid.Parse(cookie.Value)
	if err != nil {
		log.Println("Error parsing user_id:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	// Retrying because PostgreSQL databse needs to wake up
	maxRetries := 3
	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := deleteOldMessages(userID)
		if err == nil {
			break
		}
		if attempt == maxRetries {
			log.Printf("Error fetching messages after %d attempts: %v", maxRetries, err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		log.Printf("Attempt %d: Error fetching messages: %v. Retrying...", attempt, err)
		time.Sleep(time.Duration(attempt) * 200 * time.Millisecond)
	}
	var messages []Message
	err = db.Where("user_id = ?", userID).Find(&messages).Error
	if err != nil {
		log.Println("Error getting messages from db:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
	if err := tmpl.Execute(w, messages); err != nil {
		log.Println("Error executing template:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func deleteOldMessages(userID uuid.UUID) error {
	result := db.Where("created_at < ? AND user_id = ?", time.Now().Add(-18*time.Hour), userID).Delete(&Message{})

	if result.Error != nil {
		return result.Error
	}
	return nil
}

func submitHandler(w http.ResponseWriter, r *http.Request) {
	content := r.FormValue("content")
	cookie, _ := r.Cookie("user_id")
	userID, _ := uuid.Parse(cookie.Value)
	message := Message{Content: content, UserID: userID}
	if err := db.Create(&message).Error; err != nil {
		log.Println("Error creating message:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
