package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

// R2Storage handles file uploads to Cloudflare R2
type R2Storage struct {
	client     *s3.Client
	bucket     string
	publicURL  string
	basePath   string
}

// R2Config holds R2 configuration
type R2Config struct {
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicURL       string
	BasePath        string
}

// NewR2Storage creates a new R2 storage instance
func NewR2Storage(config R2Config) (*R2Storage, error) {
	// Create AWS config for R2 (R2 is S3-compatible)
	cfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithEndpointResolverWithOptions(aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:           config.Endpoint,
					SigningRegion: "auto",
				}, nil
			})),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			config.AccessKeyID,
			config.SecretAccessKey,
			"",
		)),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load R2 config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	return &R2Storage{
		client:    client,
		bucket:    config.Bucket,
		publicURL: config.PublicURL,
		basePath:  config.BasePath,
	}, nil
}

// UploadFile uploads a file to R2 and returns the public URL
func (s *R2Storage) UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader, folder string) (string, error) {
	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	
	// Build object key (path in bucket)
	var objectKey string
	if s.basePath != "" {
		objectKey = fmt.Sprintf("%s/%s/%s", s.basePath, folder, filename)
	} else {
		objectKey = fmt.Sprintf("%s/%s", folder, filename)
	}

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	// Upload to R2
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(objectKey),
		Body:          bytes.NewReader(fileBytes),
		ContentType:   aws.String(header.Header.Get("Content-Type")),
		ContentLength: aws.Int64(int64(len(fileBytes))),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload to R2: %w", err)
	}

	// Return public URL
	if s.publicURL != "" {
		// Remove trailing slash from public URL
		publicURL := strings.TrimSuffix(s.publicURL, "/")
		return fmt.Sprintf("%s/%s", publicURL, objectKey), nil
	}

	// Fallback: construct URL from endpoint
	return fmt.Sprintf("%s/%s", s.bucket, objectKey), nil
}

// DeleteFile deletes a file from R2
func (s *R2Storage) DeleteFile(ctx context.Context, fileURL string) error {
	// Extract object key from URL
	objectKey := s.extractObjectKey(fileURL)

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return fmt.Errorf("failed to delete from R2: %w", err)
	}

	return nil
}

// extractObjectKey extracts the object key from a public URL
func (s *R2Storage) extractObjectKey(url string) string {
	// Remove public URL prefix
	if s.publicURL != "" {
		publicURL := strings.TrimSuffix(s.publicURL, "/")
		if strings.HasPrefix(url, publicURL) {
			return strings.TrimPrefix(url, publicURL+"/")
		}
	}

	// If URL contains bucket name, extract after it
	if strings.Contains(url, s.bucket) {
		parts := strings.SplitN(url, s.bucket+"/", 2)
		if len(parts) > 1 {
			return parts[1]
		}
	}

	// Return as-is if can't extract
	return url
}

// Storage interface for different storage types
type Storage interface {
	UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader, folder string) (string, error)
	DeleteFile(ctx context.Context, fileURL string) error
}

// NewStorage creates a storage instance based on configuration
func NewStorage(storageType string, r2Config R2Config) (Storage, error) {
	switch storageType {
	case "r2":
		return NewR2Storage(r2Config)
	case "local":
		// TODO: Implement local storage if needed
		return nil, fmt.Errorf("local storage not implemented yet")
	default:
		return nil, fmt.Errorf("unsupported storage type: %s", storageType)
	}
}
