package database

import (
	"fmt"
	"gipos/api/internal/core/infrastructure/config"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect initializes database connection
func Connect() error {
	cfg := config.Get()
	dsn := cfg.GetDSN()

	var err error
	var logLevel logger.LogLevel

	if cfg.App.Debug {
		logLevel = logger.Info
		// Log DSN without password for debugging
		log.Printf("Connecting to database: host=%s port=%s user=%s dbname=%s",
			cfg.Database.Host, cfg.Database.Port, cfg.Database.User, cfg.Database.Name)
	} else {
		logLevel = logger.Error
	}

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		// DisableForeignKeyConstraintWhenMigrating: true, // We'll create constraints manually after cleanup
		DisableForeignKeyConstraintWhenMigrating: false, // Keep false for now, we handle cleanup before migration
	})

	if err != nil {
		log.Printf("❌ Database connection error details: %v", err)
		log.Printf("   Attempted DSN: host=%s port=%s user=%s dbname=%s sslmode=%s",
			cfg.Database.Host, cfg.Database.Port, cfg.Database.User, cfg.Database.Name, cfg.Database.SSLMode)
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test connection
	sqlDB, err := DB.DB()
	if err != nil {
		log.Printf("❌ Failed to get underlying sql.DB: %v", err)
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Printf("❌ Database ping failed: %v", err)
		return fmt.Errorf("database ping failed: %w", err)
	}

	log.Println("✅ Database connection verified (ping successful)")
	return nil
}

// Close closes database connection
func Close() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
