package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/database"
	"gipos/api/internal/core/infrastructure/redis"
	approuter "gipos/api/internal/core/infrastructure/router"
	"gipos/api/internal/core/infrastructure/seeder"
	"gipos/api/internal/core/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Set log output to stderr for better visibility in Docker
	log.SetOutput(os.Stderr)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	log.Println("")
	log.Println("========================================")
	log.Println("🚀 GiPos API - Starting Application")
	log.Println("========================================")
	log.Println("")

	// Load configuration
	log.Println("⚙️  Loading configuration...")
	cfg, err := config.Load()
	if err != nil {
		log.Printf("❌ ERROR: Failed to load config: %v", err)
		log.Println("💡 Tip: Check your .env file or environment variables")
		os.Exit(1)
	}
	log.Printf("✅ Configuration loaded: %s", cfg.App.Name)

	// Set Gin mode
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Connect to database
	log.Println("📊 Connecting to database...")
	log.Printf("   Host: %s:%s", cfg.Database.Host, cfg.Database.Port)
	log.Printf("   Database: %s", cfg.Database.Name)
	if err := database.Connect(); err != nil {
		log.Printf("❌ ERROR: Failed to connect to database: %v", err)
		log.Println("💡 Tip: Check if PostgreSQL is running and credentials are correct")
		os.Exit(1)
	}
	log.Println("✅ Database connected successfully")
	
	// Connect to Redis
	log.Println("🔴 Connecting to Redis...")
	log.Printf("   Host: %s", cfg.GetRedisAddr())
	if err := redis.Connect(); err != nil {
		log.Printf("⚠️  WARNING: Failed to connect to Redis: %v", err)
		log.Println("💡 Tip: Redis is optional but recommended for refresh token storage")
		// Continue without Redis - refresh tokens will work but won't be stored
	} else {
		log.Println("✅ Redis connected successfully")
		defer func() {
			log.Println("🔴 Closing Redis connection...")
			redis.Close()
		}()
	}
	
	// Run migrations
	log.Println("🔄 Running database migrations...")
	if err := database.AutoMigrate(); err != nil {
		log.Printf("❌ ERROR: Failed to run migrations: %v", err)
		log.Println("💡 Tip: Check database permissions and schema")
		os.Exit(1)
	}
	log.Println("✅ Migrations completed successfully")
	
	// Run seeders (only in development or if AUTO_SEED is enabled)
	if cfg.App.Env == "development" || os.Getenv("AUTO_SEED") == "true" {
		log.Println("🌱 Running database seeders...")
		seeder.RunAllSeeders()
		log.Println("✅ Seeders completed")
	}
	
	defer func() {
		log.Println("📊 Closing database connection...")
		database.Close()
	}()

	// Initialize Gin router
	router := gin.New()

	// Apply global middleware
	router.Use(middleware.RecoveryMiddleware())
	router.Use(middleware.RequestIDMiddleware())
	router.Use(middleware.LocaleMiddleware())
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.MetaMiddleware())

	// Setup routes
	log.Println("🛣️  Setting up routes...")
	if err := func() (setupErr error) {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("❌ PANIC: Route setup failed: %v", r)
				setupErr = fmt.Errorf("route setup panic: %v", r)
			}
		}()
		approuter.SetupRoutes(router)
		return nil
	}(); err != nil {
		log.Printf("❌ ERROR: Failed to setup routes: %v", err)
		os.Exit(1)
	}
	log.Println("✅ Routes configured successfully")

	// Create HTTP server
	srv := &http.Server{
		Addr:         cfg.GetServerAddr(),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	// Start server in goroutine
	go func() {
		// Give a small delay to ensure all initialization is complete
		time.Sleep(100 * time.Millisecond)
		
		log.Println("")
		log.Println("========================================")
		log.Printf("🚀 GiPos API Server Starting...")
		log.Println("========================================")
		log.Printf("📍 Server Address: %s", srv.Addr)
		log.Printf("🌍 Environment: %s", cfg.App.Env)
		log.Printf("📦 Version: %s", cfg.App.Version)
		log.Printf("🔗 Health Check: http://%s/health", srv.Addr)
		log.Printf("🔗 API Base URL: http://%s/api/v1", srv.Addr)
		log.Println("========================================")
		log.Println("✅ Server is running and ready to accept connections")
		log.Println("========================================")
		log.Println("")
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("❌ ERROR: Server failed to start: %v", err)
			log.Println("💡 Tip: Check if port 8080 is available")
			os.Exit(1)
		}
	}()
	
	// Small delay to ensure server starts before we continue
	time.Sleep(200 * time.Millisecond)

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("⚠️  WARNING: Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

