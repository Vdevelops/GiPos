package validators

import (
	"fmt"
	"gipos/api/internal/core/utils/errors"
	"gipos/api/internal/core/utils/response"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// ParseValidationErrors converts validator errors to FieldError slice with bilingual support
func ParseValidationErrors(c *gin.Context, err error) []response.FieldError {
	locale := response.GetLocale(c)
	var fieldErrors []response.FieldError

	// Parse validator errors
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fieldError := range validationErrors {
			fieldErr := response.FieldError{
				Field:     getFieldName(fieldError.Field()),
				Code:      getErrorCode(fieldError.Tag()),
				Message:   getLocalizedMessage(fieldError.Tag(), fieldError.Param(), locale),
				MessageEn: getEnglishMessage(fieldError.Tag(), fieldError.Param()),
			}

			// Add constraint if applicable
			if fieldError.Param() != "" {
				fieldErr.Constraint = map[string]interface{}{
					"value": fieldError.Param(),
				}
			}

			fieldErrors = append(fieldErrors, fieldErr)
		}
	} else {
		// If not validator error, create generic error
		fieldErrors = append(fieldErrors, response.FieldError{
			Field:     "general",
			Code:      "VALIDATION_ERROR",
			Message:   "Data tidak valid: " + err.Error(),
			MessageEn: "Invalid data: " + err.Error(),
		})
	}

	return fieldErrors
}

// getFieldName converts struct field name to JSON field name
func getFieldName(field string) string {
	// Convert PascalCase to snake_case
	result := ""
	for i, char := range field {
		if i > 0 && char >= 'A' && char <= 'Z' {
			result += "_"
		}
		result += strings.ToLower(string(char))
	}
	return result
}

// getErrorCode maps validator tag to error code
func getErrorCode(tag string) string {
	codeMap := map[string]string{
		"required": "REQUIRED",
		"min":      "MIN_VALUE",
		"max":      "MAX_VALUE",
		"email":    "INVALID_EMAIL",
		"url":      "INVALID_URL",
		"numeric":  "INVALID_TYPE",
		"alpha":    "INVALID_FORMAT",
		"alphanum": "INVALID_FORMAT",
		"len":      "INVALID_LENGTH",
		"gte":      "MIN_VALUE",
		"lte":      "MAX_VALUE",
		"gt":       "MIN_VALUE",
		"lt":       "MIN_VALUE",
		"oneof":    "INVALID_ENUM",
	}

	if code, ok := codeMap[tag]; ok {
		return code
	}
	return "INVALID_FORMAT"
}

// getLocalizedMessage returns localized error message
func getLocalizedMessage(tag, param, locale string) string {
	messages := map[string]map[string]string{
		"required": {
			"id": "Field wajib diisi",
			"en": "Field is required",
		},
		"min": {
			"id": fmt.Sprintf("Nilai minimal adalah %s", param),
			"en": fmt.Sprintf("Minimum value is %s", param),
		},
		"max": {
			"id": fmt.Sprintf("Nilai maksimal adalah %s", param),
			"en": fmt.Sprintf("Maximum value is %s", param),
		},
		"email": {
			"id": "Format email tidak valid",
			"en": "Invalid email format",
		},
		"url": {
			"id": "Format URL tidak valid",
			"en": "Invalid URL format",
		},
		"numeric": {
			"id": "Harus berupa angka",
			"en": "Must be numeric",
		},
		"len": {
			"id": fmt.Sprintf("Panjang harus %s karakter", param),
			"en": fmt.Sprintf("Length must be %s characters", param),
		},
		"gte": {
			"id": fmt.Sprintf("Nilai harus lebih besar atau sama dengan %s", param),
			"en": fmt.Sprintf("Value must be greater than or equal to %s", param),
		},
		"lte": {
			"id": fmt.Sprintf("Nilai harus lebih kecil atau sama dengan %s", param),
			"en": fmt.Sprintf("Value must be less than or equal to %s", param),
		},
		"oneof": {
			"id": fmt.Sprintf("Nilai harus salah satu dari: %s", param),
			"en": fmt.Sprintf("Value must be one of: %s", param),
		},
	}

	if msgMap, ok := messages[tag]; ok {
		if msg, ok := msgMap[locale]; ok {
			return msg
		}
		if msg, ok := msgMap["id"]; ok {
			return msg
		}
	}

	return "Data tidak valid"
}

// getEnglishMessage returns English error message
func getEnglishMessage(tag, param string) string {
	return getLocalizedMessage(tag, param, "en")
}

// ValidateRequest validates request and returns field errors if invalid
func ValidateRequest(c *gin.Context, req interface{}) bool {
	if err := c.ShouldBindJSON(req); err != nil {
		fieldErrors := ParseValidationErrors(c, err)
		errors.ValidationError(c, fieldErrors)
		return false
	}
	return true
}


