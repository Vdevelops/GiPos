package handlers

import (
	"gipos/api/internal/core/infrastructure/config"
	"gipos/api/internal/core/infrastructure/storage"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"

	"github.com/gin-gonic/gin"
)

// UploadHandler handles file upload requests
type UploadHandler struct {
	uploadService *storage.UploadService
}

// NewUploadHandler creates a new upload handler
func NewUploadHandler(cfg *config.Config) (*UploadHandler, error) {
	uploadService, err := storage.NewUploadService(cfg)
	if err != nil {
		return nil, err
	}

	return &UploadHandler{
		uploadService: uploadService,
	}, nil
}

// UploadImage handles POST /api/v1/upload/image
func (h *UploadHandler) UploadImage(c *gin.Context) {
	// Get folder from query parameter (default: "products")
	folder := c.DefaultQuery("folder", "products")

	// Get file from form
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		errors.ValidationError(c, []response.FieldError{
			{
				Field:     "file",
				Code:      "REQUIRED",
				Message:   "File wajib diisi",
				MessageEn: "File is required",
			},
		})
		return
	}
	defer file.Close()

	// Upload file
	url, err := h.uploadService.UploadImage(c.Request.Context(), file, header, folder)
	if err != nil {
		errors.Error(c, "UPLOAD_FAILED", map[string]interface{}{
			"message": err.Error(),
		}, nil)
		return
	}

	meta := response.GetMetaFromContext(c)
	response.SuccessCreated(c, map[string]interface{}{
		"url":    url,
		"folder": folder,
	}, meta)
}

// DeleteImage handles DELETE /api/v1/upload/image
func (h *UploadHandler) DeleteImage(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		errors.ValidationError(c, []response.FieldError{
			{
				Field:     "url",
				Code:      "REQUIRED",
				Message:   "URL wajib diisi",
				MessageEn: "URL is required",
			},
		})
		return
	}

	// Delete file
	err := h.uploadService.DeleteImage(c.Request.Context(), req.URL)
	if err != nil {
		errors.Error(c, "DELETE_FAILED", map[string]interface{}{
			"message": err.Error(),
		}, nil)
		return
	}

	response.SuccessNoContent(c)
}
