package redis

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"gipos/api/internal/core/infrastructure/config"

	"github.com/redis/go-redis/v9"
)

var (
	Client              *redis.Client
	ctx                 = context.Background()
	ErrRedisUnavailable = errors.New("redis client is not initialized")
)

// Connect initializes Redis connection
func Connect() error {
	cfg := config.Get()

	Client = redis.NewClient(&redis.Options{
		Addr:     cfg.GetRedisAddr(),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// Test connection
	_, err := Client.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Println("✅ Redis connected successfully")
	return nil
}

// GetClient returns the Redis client
func GetClient() *redis.Client {
	if Client == nil {
		panic("Redis client not initialized, call Connect() first")
	}
	return Client
}

// IsReady indicates whether redis client is initialized.
func IsReady() bool {
	return Client != nil
}

// Set stores a key-value pair with expiration
func Set(key string, value interface{}, expiration time.Duration) error {
	if Client == nil {
		return ErrRedisUnavailable
	}
	return Client.Set(ctx, key, value, expiration).Err()
}

// Get retrieves a value by key
func Get(key string) (string, error) {
	if Client == nil {
		return "", ErrRedisUnavailable
	}
	return Client.Get(ctx, key).Result()
}

// Delete removes a key
func Delete(key string) error {
	if Client == nil {
		return ErrRedisUnavailable
	}
	return Client.Del(ctx, key).Err()
}

// Exists checks if a key exists
func Exists(key string) (bool, error) {
	if Client == nil {
		return false, ErrRedisUnavailable
	}
	count, err := Client.Exists(ctx, key).Result()
	return count > 0, err
}

// DeleteByPrefix removes all keys matching prefix* pattern.
func DeleteByPrefix(prefix string) error {
	if Client == nil {
		return ErrRedisUnavailable
	}

	pattern := fmt.Sprintf("%s*", prefix)
	iter := Client.Scan(ctx, 0, pattern, 200).Iterator()
	keys := make([]string, 0, 200)

	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
		if len(keys) >= 200 {
			if err := Client.Del(ctx, keys...).Err(); err != nil {
				return err
			}
			keys = keys[:0]
		}
	}

	if err := iter.Err(); err != nil {
		return err
	}

	if len(keys) > 0 {
		if err := Client.Del(ctx, keys...).Err(); err != nil {
			return err
		}
	}

	return nil
}

// SetRefreshToken stores refresh token in Redis
func SetRefreshToken(userID string, refreshToken string, expiration time.Duration) error {
	key := fmt.Sprintf("refresh_token:%s", userID)
	return Set(key, refreshToken, expiration)
}

// GetRefreshToken retrieves refresh token from Redis
func GetRefreshToken(userID string) (string, error) {
	key := fmt.Sprintf("refresh_token:%s", userID)
	return Get(key)
}

// DeleteRefreshToken removes refresh token from Redis
func DeleteRefreshToken(userID string) error {
	key := fmt.Sprintf("refresh_token:%s", userID)
	return Delete(key)
}

// Close closes the Redis connection
func Close() error {
	if Client != nil {
		return Client.Close()
	}
	return nil
}
