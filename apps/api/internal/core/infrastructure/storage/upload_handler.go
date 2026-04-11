package storage

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"gipos/api/internal/core/infrastructure/config"
)

// UploadService handles file uploads
type UploadService struct {
	storage Storage
}

// NewUploadService creates a new upload service
func NewUploadService(cfg *config.Config) (*UploadService, error) {
	r2Config := R2Config{
		Endpoint:        cfg.Storage.R2Endpoint,
		AccessKeyID:     cfg.Storage.R2AccessKeyID,
		SecretAccessKey: cfg.Storage.R2SecretKey,
		Bucket:          cfg.Storage.R2Bucket,
		PublicURL:       cfg.Storage.R2PublicURL,
		BasePath:        cfg.Storage.StorageBasePath,
	}

	publicBaseURL := strings.TrimSpace(os.Getenv("UPLOAD_PUBLIC_BASE_URL"))
	if publicBaseURL == "" {
		host := cfg.Server.Host
		if host == "" || host == "0.0.0.0" {
			host = "localhost"
		}
		publicBaseURL = fmt.Sprintf("http://%s:%s", host, cfg.Server.Port)
	}

	localConfig := LocalConfig{
		UploadPath:    cfg.Upload.Path,
		PublicBaseURL: publicBaseURL,
	}

	storage, err := NewStorage(cfg.Storage.Type, r2Config, localConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	return &UploadService{
		storage: storage,
	}, nil
}

// UploadImage uploads an image file and returns the public URL
func (s *UploadService) UploadImage(ctx context.Context, file multipart.File, header *multipart.FileHeader, folder string) (string, error) {
	// Validate file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	allowed := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			allowed = true
			break
		}
	}
	if !allowed {
		return "", fmt.Errorf("invalid file type: %s. Allowed types: jpg, jpeg, png, gif, webp", ext)
	}

	// Validate file size (max 5MB for images)
	maxSize := int64(5 * 1024 * 1024) // 5MB
	if header.Size > maxSize {
		return "", fmt.Errorf("file size exceeds maximum allowed size of 5MB")
	}

	// Upload file
	url, err := s.storage.UploadFile(ctx, file, header, folder)
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	return url, nil
}

// DeleteImage deletes an image file
func (s *UploadService) DeleteImage(ctx context.Context, fileURL string) error {
	return s.storage.DeleteFile(ctx, fileURL)
}
