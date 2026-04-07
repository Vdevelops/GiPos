package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	App       AppConfig
	Database  DatabaseConfig
	Redis     RedisConfig
	JWT       JWTConfig
	Server    ServerConfig
	CORS      CORSConfig
	RateLimit RateLimitConfig
	Upload    UploadConfig
	Storage   StorageConfig
}

// AppConfig holds application configuration
type AppConfig struct {
	Name     string
	Env      string
	Version  string
	Debug    bool
	Timezone *time.Location
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Host         string
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	Timezone string
}

// RedisConfig holds Redis configuration
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret             string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
}

// CORSConfig holds CORS configuration
type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	Enabled  bool
	Requests int
	Window   time.Duration
}

// UploadConfig holds file upload configuration
type UploadConfig struct {
	MaxSize int64
	Path    string
}

// StorageConfig holds storage configuration
type StorageConfig struct {
	Type            string
	R2Endpoint      string
	R2AccessKeyID   string
	R2SecretKey     string
	R2Bucket        string
	R2PublicURL     string
	StorageBasePath string
}

var cfg *Config

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if exists (for local development)
	_ = godotenv.Load()

	timezone, err := time.LoadLocation(getEnv("TZ", "Asia/Jakarta"))
	if err != nil {
		timezone = time.FixedZone("WIB", 7*60*60)
	}

	cfg = &Config{
		App: AppConfig{
			Name:     getEnv("APP_NAME", "GiPos API"),
			Env:      getEnv("APP_ENV", "development"),
			Version:  getEnv("APP_VERSION", "1.0.0"),
			Debug:    getEnv("APP_ENV", "development") == "development",
			Timezone: timezone,
		},
		Server: ServerConfig{
			Host:         getEnv("APP_HOST", "0.0.0.0"),
			Port:         getEnv("APP_PORT", "8080"),
			ReadTimeout:  parseDuration(getEnv("SERVER_READ_TIMEOUT", "15s")),
			WriteTimeout: parseDuration(getEnv("SERVER_WRITE_TIMEOUT", "15s")),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "gipos"),
			Password: getEnv("DB_PASSWORD", "gipos_password"),
			Name:     getEnv("DB_NAME", "gipos_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
			Timezone: getEnv("DB_TIMEZONE", "Asia/Jakarta"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       parseInt(getEnv("REDIS_DB", "0")),
		},
		JWT: JWTConfig{
			Secret:             getEnv("JWT_SECRET", "change-me-in-production"),
			AccessTokenExpiry:  parseDurationWithDefault(getEnv("JWT_ACCESS_TOKEN_EXPIRY", "24h"), 24*time.Hour),
			RefreshTokenExpiry: parseDurationWithDefault(getEnv("JWT_REFRESH_TOKEN_EXPIRY", "24h"), 24*time.Hour),
		},
		CORS: CORSConfig{
			AllowedOrigins: parseStringSlice(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),
			AllowedMethods: parseStringSlice(getEnv("CORS_ALLOWED_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS")),
			AllowedHeaders: parseStringSlice(getEnv("CORS_ALLOWED_HEADERS", "Content-Type,Authorization,X-Locale,X-Request-ID")),
		},
		RateLimit: RateLimitConfig{
			Enabled:  getEnv("RATE_LIMIT_ENABLED", "true") == "true",
			Requests: parseInt(getEnv("RATE_LIMIT_REQUESTS", "100")),
			Window:   parseDuration(getEnv("RATE_LIMIT_WINDOW", "1m")),
		},
		Upload: UploadConfig{
			MaxSize: int64(parseInt(getEnv("MAX_UPLOAD_SIZE", "10485760"))), // 10MB default
			Path:    getEnv("UPLOAD_PATH", "./uploads"),
		},
		Storage: StorageConfig{
			Type:            getEnv("STORAGE_TYPE", "local"),
			R2Endpoint:      getEnv("R2_ENDPOINT", ""),
			R2AccessKeyID:   getEnv("R2_ACCESS_KEY_ID", ""),
			R2SecretKey:     getEnv("R2_SECRET_ACCESS_KEY", ""),
			R2Bucket:        getEnv("R2_BUCKET", ""),
			R2PublicURL:     getEnv("R2_PUBLIC_URL", ""),
			StorageBasePath: getEnv("STORAGE_BASE_URL", "uploads"),
		},
	}

	return cfg, nil
}

// Get returns the global config instance
func Get() *Config {
	if cfg == nil {
		panic("config not loaded, call Load() first")
	}
	return cfg
}

// GetDSN returns database connection string
func (c *Config) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.Name,
		c.Database.SSLMode,
		c.Database.Timezone,
	)
}

// GetRedisAddr returns Redis address
func (c *Config) GetRedisAddr() string {
	return fmt.Sprintf("%s:%s", c.Redis.Host, c.Redis.Port)
}

// GetServerAddr returns server address
func (c *Config) GetServerAddr() string {
	return fmt.Sprintf("%s:%s", c.Server.Host, c.Server.Port)
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return i
}

func parseDuration(s string) time.Duration {
	return parseDurationWithDefault(s, 15*time.Second)
}

func parseDurationWithDefault(s string, fallback time.Duration) time.Duration {
	normalized := strings.TrimSpace(strings.ToLower(s))
	if normalized == "" {
		return fallback
	}

	if strings.HasSuffix(normalized, "d") {
		daysPart := strings.TrimSuffix(normalized, "d")
		days, err := strconv.Atoi(daysPart)
		if err != nil || days <= 0 {
			return fallback
		}
		return time.Duration(days) * 24 * time.Hour
	}

	d, err := time.ParseDuration(normalized)
	if err != nil {
		return fallback
	}
	return d
}

func parseStringSlice(s string) []string {
	if s == "" {
		return []string{}
	}
	// Simple split by comma
	parts := strings.Split(s, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
