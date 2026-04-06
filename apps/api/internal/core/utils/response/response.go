package response

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Timezone WIB (UTC+7)
var timezoneWIB = time.FixedZone("WIB", 7*60*60)

// Supported locales
const (
	LocaleID = "id" // Bahasa Indonesia
	LocaleEN = "en" // English
)

// DefaultLocale is the default locale if not specified
const DefaultLocale = LocaleID

// APIResponse represents the standard API response structure
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     *APIError   `json:"error,omitempty"`
	Meta      *Meta       `json:"meta,omitempty"`
	Timestamp string      `json:"timestamp"`
	RequestID string      `json:"request_id"`
}

// APIError represents error information with bilingual support
type APIError struct {
	Code        string                 `json:"code"`
	Message      string                 `json:"message"`      // Primary message (based on locale)
	MessageEn    string                 `json:"message_en"` // English message (always included)
	Details      map[string]interface{} `json:"details,omitempty"`
	FieldErrors  []FieldError           `json:"field_errors,omitempty"`
	StackTrace   string                 `json:"stack_trace,omitempty"` // Only in dev/staging
}

// FieldError represents validation error for a specific field with bilingual support
type FieldError struct {
	Field      string                 `json:"field"`
	Code       string                 `json:"code"`
	Message    string                 `json:"message"`      // Primary message (based on locale)
	MessageEn  string                 `json:"message_en"`  // English message (always included)
	Constraint map[string]interface{} `json:"constraint,omitempty"`
}

// Meta represents metadata in response
type Meta struct {
	Pagination *PaginationMeta        `json:"pagination,omitempty"`
	Filters    map[string]interface{} `json:"filters,omitempty"`
	Sort       *SortMeta              `json:"sort,omitempty"`
	TenantID   string                 `json:"tenant_id,omitempty"`
	OutletID   string                 `json:"outlet_id,omitempty"`
	CreatedBy  string                 `json:"created_by,omitempty"`
	UpdatedBy  string                 `json:"updated_by,omitempty"`
	DeletedBy  string                 `json:"deleted_by,omitempty"`
	Changes    map[string]ChangeValue `json:"changes,omitempty"`
	Additional map[string]interface{} `json:"additional,omitempty"`
}

// ChangeValue represents old and new value for audit
type ChangeValue struct {
	Old interface{} `json:"old"`
	New interface{} `json:"new"`
}

// PaginationMeta represents pagination information
type PaginationMeta struct {
	Page       int  `json:"page"`
	PerPage    int  `json:"per_page"`
	Total      int  `json:"total"`
	TotalPages int  `json:"total_pages"`
	HasNext    bool `json:"has_next"`
	HasPrev    bool `json:"has_prev"`
	NextPage   *int `json:"next_page,omitempty"`
	PrevPage   *int `json:"prev_page,omitempty"`
}

// SortMeta represents sorting information
type SortMeta struct {
	Field string `json:"field"`
	Order string `json:"order"` // "asc" or "desc"
}

// GetLocale extracts locale from context or header, defaults to Indonesian
func GetLocale(c *gin.Context) string {
	// Try to get from context first (set by middleware)
	if locale, exists := c.Get("locale"); exists {
		if loc, ok := locale.(string); ok && (loc == LocaleID || loc == LocaleEN) {
			return loc
		}
	}

	// Try to get from Accept-Language header
	acceptLang := c.GetHeader("Accept-Language")
	if acceptLang != "" {
		// Parse Accept-Language header (e.g., "en-US,en;q=0.9,id;q=0.8")
		langs := strings.Split(acceptLang, ",")
		for _, lang := range langs {
			lang = strings.TrimSpace(strings.Split(lang, ";")[0])
			if lang == "en" || strings.HasPrefix(lang, "en-") {
				return LocaleEN
			}
			if lang == "id" || strings.HasPrefix(lang, "id-") {
				return LocaleID
			}
		}
	}

	// Try to get from X-Locale header
	if locale := c.GetHeader("X-Locale"); locale != "" {
		if locale == LocaleEN || locale == LocaleID {
			return locale
		}
	}

	return DefaultLocale
}

// GetRequestID extracts request ID from context or generates new one
func GetRequestID(c *gin.Context) string {
	if requestID, exists := c.Get("request_id"); exists {
		if id, ok := requestID.(string); ok {
			return id
		}
	}
	// Generate new request ID if not exists
	return GenerateRequestID()
}

// GenerateRequestID generates a unique request ID
func GenerateRequestID() string {
	return "req_" + time.Now().Format("20060102150405") + "_" + uuid.New().String()[:8]
}

// GetMetaFromContext extracts meta information from context
func GetMetaFromContext(c *gin.Context) *Meta {
	meta := &Meta{}

	if tenantID, exists := c.Get("tenant_id"); exists {
		if id, ok := tenantID.(string); ok {
			meta.TenantID = id
		}
	}

	if outletID, exists := c.Get("outlet_id"); exists {
		if id, ok := outletID.(string); ok {
			meta.OutletID = id
		}
	}

	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.CreatedBy = id
		}
	}

	return meta
}

// Success creates a success response
func Success(c *gin.Context, data interface{}, meta *Meta) {
	response := &APIResponse{
		Success:   true,
		Data:      data,
		Meta:      meta,
		Timestamp: time.Now().In(timezoneWIB).Format(time.RFC3339),
		RequestID: GetRequestID(c),
	}

	c.JSON(http.StatusOK, response)
}

// SuccessCreated creates a success response for created resource
func SuccessCreated(c *gin.Context, data interface{}, meta *Meta) {
	response := &APIResponse{
		Success:   true,
		Data:      data,
		Meta:      meta,
		Timestamp: time.Now().In(timezoneWIB).Format(time.RFC3339),
		RequestID: GetRequestID(c),
	}

	c.JSON(http.StatusCreated, response)
}

// SuccessNoContent creates a success response with no content
func SuccessNoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// FormatDateTime formats time to WIB timezone string
func FormatDateTime(t time.Time) string {
	return t.In(timezoneWIB).Format(time.RFC3339)
}

// FormatDate formats time to date only string
func FormatDate(t time.Time) string {
	return t.In(timezoneWIB).Format("2006-01-02")
}

// FormatTime formats time to time only string
func FormatTime(t time.Time) string {
	return t.In(timezoneWIB).Format("15:04:05")
}

// NewPaginationMeta creates pagination metadata
func NewPaginationMeta(page, perPage, total int) *PaginationMeta {
	totalPages := (total + perPage - 1) / perPage
	hasNext := page < totalPages
	hasPrev := page > 1

	var nextPage *int
	var prevPage *int

	if hasNext {
		next := page + 1
		nextPage = &next
	}

	if hasPrev {
		prev := page - 1
		prevPage = &prev
	}

	return &PaginationMeta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    hasNext,
		HasPrev:    hasPrev,
		NextPage:   nextPage,
		PrevPage:   prevPage,
	}
}

// ParsePaginationParams parses pagination parameters from request
func ParsePaginationParams(c *gin.Context) (page, perPage int) {
	page = 1
	perPage = 20

	if pageStr := c.Query("page"); pageStr != "" {
		if p := parseInt(pageStr); p > 0 {
			page = p
		}
	}

	if perPageStr := c.Query("per_page"); perPageStr != "" {
		if pp := parseInt(perPageStr); pp > 0 && pp <= 100 {
			perPage = pp
		}
	}

	return page, perPage
}

// parseInt parses string to int (simplified version)
func parseInt(s string) int {
	result := 0
	for _, char := range s {
		if char >= '0' && char <= '9' {
			result = result*10 + int(char-'0')
		} else {
			return 0
		}
	}
	return result
}

// GetCurrentTime returns current time in WIB timezone
func GetCurrentTime() time.Time {
	return time.Now().In(timezoneWIB)
}

// GetTimezone returns WIB timezone
func GetTimezone() *time.Location {
	return timezoneWIB
}


