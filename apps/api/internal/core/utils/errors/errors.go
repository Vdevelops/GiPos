package errors

import (
	"net/http"
	"time"

	"gipos/api/internal/core/utils/response"

	"github.com/gin-gonic/gin"
)

// ErrorInfo contains HTTP status and default message for error codes
type ErrorInfo struct {
	HTTPStatus int
	Message    string
	MessageEn  string
}

// ErrorCodeMap maps error codes to their HTTP status and messages
// Complete mapping based on api-error-codes.md documentation
var ErrorCodeMap = map[string]ErrorInfo{
	// Validation Errors
	"VALIDATION_ERROR": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Data yang dikirim tidak valid",
		MessageEn:  "Invalid request data",
	},
	"REQUIRED": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Field wajib diisi",
		MessageEn:  "Field is required",
	},
	"INVALID_TYPE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Tipe data tidak valid",
		MessageEn:  "Invalid data type",
	},
	"INVALID_FORMAT": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Format tidak valid",
		MessageEn:  "Invalid format",
	},
	"INVALID_LENGTH": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Panjang tidak valid",
		MessageEn:  "Invalid length",
	},
	"MIN_VALUE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Nilai kurang dari minimum",
		MessageEn:  "Value is less than minimum",
	},
	"MAX_VALUE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Nilai lebih dari maksimum",
		MessageEn:  "Value exceeds maximum",
	},
	"INVALID_ENUM": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Nilai tidak ada di enum",
		MessageEn:  "Value is not in enum",
	},
	"INVALID_DATE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Format tanggal tidak valid",
		MessageEn:  "Invalid date format",
	},
	"INVALID_TIME": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Format waktu tidak valid",
		MessageEn:  "Invalid time format",
	},
	"INVALID_PHONE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Format nomor HP tidak valid",
		MessageEn:  "Invalid phone number format",
	},
	"INVALID_EMAIL": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Format email tidak valid",
		MessageEn:  "Invalid email format",
	},
	"INVALID_URL": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Format URL tidak valid",
		MessageEn:  "Invalid URL format",
	},
	"INVALID_JSON": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Format JSON tidak valid",
		MessageEn:  "Invalid JSON format",
	},
	"DUPLICATE_VALUE": {
		HTTPStatus: http.StatusConflict,
		Message:    "Nilai duplikat",
		MessageEn:  "Duplicate value",
	},
	"DUPLICATE_SKU": {
		HTTPStatus: http.StatusConflict,
		Message:    "SKU sudah digunakan. Silakan gunakan SKU lain",
		MessageEn:  "SKU already exists. Please use a different SKU",
	},
	"DUPLICATE_BARCODE": {
		HTTPStatus: http.StatusConflict,
		Message:    "Barcode sudah digunakan. Silakan gunakan barcode lain",
		MessageEn:  "Barcode already exists. Please use a different barcode",
	},
	"MISSING_REQUIRED_FIELD": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Field wajib tidak ada",
		MessageEn:  "Missing required field",
	},
	"INVALID_REQUEST_BODY": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Request body tidak valid",
		MessageEn:  "Invalid request body",
	},
	"INVALID_QUERY_PARAM": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Query parameter tidak valid",
		MessageEn:  "Invalid query parameter",
	},
	"INVALID_PATH_PARAM": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Path parameter tidak valid",
		MessageEn:  "Invalid path parameter",
	},
	"UNSUPPORTED_MEDIA_TYPE": {
		HTTPStatus: http.StatusUnsupportedMediaType,
		Message:    "Content-Type tidak didukung",
		MessageEn:  "Unsupported media type",
	},

	// Authentication & Authorization
	"UNAUTHORIZED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Token autentikasi tidak valid atau telah kedaluwarsa",
		MessageEn:  "Authentication token is invalid or expired",
	},
	"TOKEN_EXPIRED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Token telah kedaluwarsa",
		MessageEn:  "Token has expired",
	},
	"TOKEN_INVALID": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Token tidak valid",
		MessageEn:  "Invalid token",
	},
	"TOKEN_MISSING": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Token tidak ditemukan di header",
		MessageEn:  "Token not found in header",
	},
	"INVALID_CREDENTIALS": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Email atau password salah",
		MessageEn:  "Invalid email or password",
	},
	"ACCOUNT_DISABLED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Akun dinonaktifkan",
		MessageEn:  "Account is disabled",
	},
	"ACCOUNT_LOCKED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Akun terkunci (terlalu banyak percobaan login)",
		MessageEn:  "Account is locked (too many login attempts)",
	},
	"SESSION_EXPIRED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Session telah kedaluwarsa",
		MessageEn:  "Session has expired",
	},
	"REFRESH_TOKEN_INVALID": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Refresh token tidak valid",
		MessageEn:  "Invalid refresh token",
	},
	"REFRESH_TOKEN_EXPIRED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Refresh token telah kedaluwarsa",
		MessageEn:  "Refresh token has expired",
	},
	"FORBIDDEN": {
		HTTPStatus: http.StatusForbidden,
		Message:    "Tidak memiliki izin untuk mengakses resource ini",
		MessageEn:  "You do not have permission to access this resource",
	},
	"PERMISSION_DENIED": {
		HTTPStatus: http.StatusForbidden,
		Message:    "Permission tidak cukup",
		MessageEn:  "Insufficient permissions",
	},
	"ROLE_INSUFFICIENT": {
		HTTPStatus: http.StatusForbidden,
		Message:    "Role tidak memiliki akses",
		MessageEn:  "Role does not have access",
	},
	"OUTLET_ACCESS_DENIED": {
		HTTPStatus: http.StatusForbidden,
		Message:    "Tidak memiliki akses ke outlet ini",
		MessageEn:  "No access to this outlet",
	},
	"RESOURCE_OWNERSHIP_REQUIRED": {
		HTTPStatus: http.StatusForbidden,
		Message:    "Hanya pemilik resource yang bisa mengakses",
		MessageEn:  "Only resource owner can access",
	},

	// Resource Errors
	"NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Resource tidak ditemukan",
		MessageEn:  "Resource not found",
	},
	"METHOD_NOT_ALLOWED": {
		HTTPStatus: http.StatusMethodNotAllowed,
		Message:    "Method tidak diizinkan untuk endpoint ini",
		MessageEn:  "Method is not allowed for this endpoint",
	},
	"PRODUCT_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Produk tidak ditemukan",
		MessageEn:  "Product not found",
	},
	"CUSTOMER_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Pelanggan tidak ditemukan",
		MessageEn:  "Customer not found",
	},
	"SALE_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Transaksi tidak ditemukan",
		MessageEn:  "Sale not found",
	},
	"PAYMENT_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Pembayaran tidak ditemukan",
		MessageEn:  "Payment not found",
	},
	"USER_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "User tidak ditemukan",
		MessageEn:  "User not found",
	},
	"OUTLET_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Outlet tidak ditemukan",
		MessageEn:  "Outlet not found",
	},
	"CATEGORY_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Kategori tidak ditemukan",
		MessageEn:  "Category not found",
	},
	"WAREHOUSE_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Gudang tidak ditemukan",
		MessageEn:  "Warehouse not found",
	},
	"SHIFT_NOT_FOUND": {
		HTTPStatus: http.StatusNotFound,
		Message:    "Shift tidak ditemukan",
		MessageEn:  "Shift not found",
	},
	"CONFLICT": {
		HTTPStatus: http.StatusConflict,
		Message:    "Konflik dengan state saat ini",
		MessageEn:  "Conflict with current state",
	},
	"RESOURCE_ALREADY_EXISTS": {
		HTTPStatus: http.StatusConflict,
		Message:    "Resource sudah ada",
		MessageEn:  "Resource already exists",
	},
	"RESOURCE_IN_USE": {
		HTTPStatus: http.StatusConflict,
		Message:    "Resource sedang digunakan",
		MessageEn:  "Resource is in use",
	},
	"CANNOT_DELETE": {
		HTTPStatus: http.StatusConflict,
		Message:    "Resource tidak bisa dihapus (ada dependency)",
		MessageEn:  "Cannot delete resource (has dependencies)",
	},
	"PRODUCT_HAS_STOCK": {
		HTTPStatus: http.StatusConflict,
		Message:    "Produk tidak bisa dihapus karena masih memiliki stok",
		MessageEn:  "Product cannot be deleted because it still has stock",
	},
	"PRODUCT_HAS_SALES": {
		HTTPStatus: http.StatusConflict,
		Message:    "Produk tidak bisa dihapus karena sudah pernah digunakan dalam transaksi",
		MessageEn:  "Product cannot be deleted because it has been used in transactions",
	},
	"INVALID_COST_PRICE": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Harga pokok (cost) tidak boleh lebih besar dari harga jual (price)",
		MessageEn:  "Cost cannot be greater than price",
	},

	// Business Logic Errors - Stock & Inventory
	"INSUFFICIENT_STOCK": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Stok produk tidak mencukupi",
		MessageEn:  "Insufficient product stock",
	},
	"STOCK_NEGATIVE": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Stok tidak boleh negatif",
		MessageEn:  "Stock cannot be negative",
	},
	"STOCK_LOCKED": {
		HTTPStatus: http.StatusConflict,
		Message:    "Stok sedang dikunci (stock opname)",
		MessageEn:  "Stock is locked (stock opname in progress)",
	},
	"WAREHOUSE_MISMATCH": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Gudang tidak sesuai",
		MessageEn:  "Warehouse mismatch",
	},
	"STOCK_TRANSFER_INVALID": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Transfer stok tidak valid",
		MessageEn:  "Invalid stock transfer",
	},

	// Business Logic Errors - Sales & Transactions
	"CART_EMPTY": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Keranjang kosong",
		MessageEn:  "Cart is empty",
	},
	"SALE_ALREADY_COMPLETED": {
		HTTPStatus: http.StatusConflict,
		Message:    "Transaksi sudah selesai",
		MessageEn:  "Sale is already completed",
	},
	"SALE_ALREADY_REFUNDED": {
		HTTPStatus: http.StatusConflict,
		Message:    "Transaksi sudah direfund",
		MessageEn:  "Sale is already refunded",
	},
	"SALE_CANNOT_REFUND": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Transaksi tidak bisa direfund",
		MessageEn:  "Sale cannot be refunded",
	},
	"REFUND_AMOUNT_EXCEEDED": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Jumlah refund melebihi total transaksi",
		MessageEn:  "Refund amount exceeds transaction total",
	},
	"DISCOUNT_EXCEEDED_LIMIT": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Diskon melebihi batas maksimum",
		MessageEn:  "Discount exceeds maximum limit",
	},
	"DISCOUNT_REQUIRES_APPROVAL": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Diskon besar memerlukan approval",
		MessageEn:  "Large discount requires approval",
	},
	"VOID_NOT_ALLOWED": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Void tidak diizinkan (sudah dibayar)",
		MessageEn:  "Void not allowed (already paid)",
	},

	// Business Logic Errors - Shift Management
	"SHIFT_NOT_OPEN": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Shift belum dibuka. Silakan buka shift terlebih dahulu",
		MessageEn:  "Shift is not open. Please open shift first",
	},
	"SHIFT_ALREADY_OPEN": {
		HTTPStatus: http.StatusConflict,
		Message:    "Shift sudah dibuka",
		MessageEn:  "Shift is already open",
	},
	"SHIFT_ALREADY_CLOSED": {
		HTTPStatus: http.StatusConflict,
		Message:    "Shift sudah ditutup",
		MessageEn:  "Shift is already closed",
	},
	"SHIFT_CANNOT_CLOSE": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Shift tidak bisa ditutup (ada transaksi pending)",
		MessageEn:  "Shift cannot be closed (has pending transactions)",
	},
	"SHIFT_BALANCE_MISMATCH": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Saldo shift tidak sesuai",
		MessageEn:  "Shift balance mismatch",
	},
	"SHIFT_REQUIRES_APPROVAL": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Tutup shift memerlukan approval",
		MessageEn:  "Closing shift requires approval",
	},

	// Business Logic Errors - Customer & Loyalty
	"CUSTOMER_ALREADY_EXISTS": {
		HTTPStatus: http.StatusConflict,
		Message:    "Pelanggan sudah terdaftar",
		MessageEn:  "Customer already exists",
	},
	"INSUFFICIENT_POINTS": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Poin tidak mencukupi",
		MessageEn:  "Insufficient points",
	},
	"POINTS_EXPIRED": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Poin telah kedaluwarsa",
		MessageEn:  "Points have expired",
	},
	"LOYALTY_RULE_INVALID": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Aturan loyalty tidak valid",
		MessageEn:  "Invalid loyalty rule",
	},

	// Business Logic Errors - Multi-Outlet
	"OUTLET_NOT_ACCESSIBLE": {
		HTTPStatus: http.StatusForbidden,
		Message:    "Outlet tidak dapat diakses",
		MessageEn:  "Outlet is not accessible",
	},
	"STOCK_TRANSFER_PENDING": {
		HTTPStatus: http.StatusConflict,
		Message:    "Transfer stok masih pending",
		MessageEn:  "Stock transfer is pending",
	},
	"STOCK_TRANSFER_ALREADY_APPROVED": {
		HTTPStatus: http.StatusConflict,
		Message:    "Transfer stok sudah disetujui",
		MessageEn:  "Stock transfer is already approved",
	},
	"STOCK_TRANSFER_ALREADY_REJECTED": {
		HTTPStatus: http.StatusConflict,
		Message:    "Transfer stok sudah ditolak",
		MessageEn:  "Stock transfer is already rejected",
	},

	// Payment Errors
	"PAYMENT_FAILED": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Pembayaran gagal",
		MessageEn:  "Payment failed",
	},
	"PAYMENT_TIMEOUT": {
		HTTPStatus: http.StatusRequestTimeout,
		Message:    "Pembayaran timeout",
		MessageEn:  "Payment timeout",
	},
	"PAYMENT_CANCELLED": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Pembayaran dibatalkan",
		MessageEn:  "Payment cancelled",
	},
	"PAYMENT_ALREADY_PROCESSED": {
		HTTPStatus: http.StatusConflict,
		Message:    "Pembayaran sudah diproses",
		MessageEn:  "Payment already processed",
	},
	"PAYMENT_METHOD_NOT_AVAILABLE": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Metode pembayaran tidak tersedia",
		MessageEn:  "Payment method not available",
	},
	"PAYMENT_GATEWAY_ERROR": {
		HTTPStatus: http.StatusBadGateway,
		Message:    "Error dari payment gateway",
		MessageEn:  "Error from payment gateway",
	},
	"INSUFFICIENT_BALANCE": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Saldo tidak mencukupi",
		MessageEn:  "Insufficient balance",
	},
	"INVALID_PAYMENT_AMOUNT": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Jumlah pembayaran tidak valid",
		MessageEn:  "Invalid payment amount",
	},
	"PAYMENT_METHOD_MISMATCH": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Metode pembayaran tidak sesuai dengan transaksi",
		MessageEn:  "Payment method does not match transaction",
	},
	"ITEMS_TOTAL_MISMATCH": {
		HTTPStatus: http.StatusConflict,
		Message:    "Total transaksi tidak konsisten dengan detail item",
		MessageEn:  "Sale total is inconsistent with item details",
	},
	"E_WALLET_TYPE_REQUIRED": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Tipe e-wallet wajib diisi",
		MessageEn:  "E-wallet type is required",
	},
	"QRIS_EXPIRED": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "QRIS code telah kedaluwarsa",
		MessageEn:  "QRIS code has expired",
	},
	"QRIS_ALREADY_USED": {
		HTTPStatus: http.StatusConflict,
		Message:    "QRIS code sudah digunakan",
		MessageEn:  "QRIS code already used",
	},
	"SHIFT_OUTLET_MISMATCH": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Shift tidak sesuai dengan outlet",
		MessageEn:  "Shift does not match outlet",
	},
	"PRODUCT_NOT_ACTIVE": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Produk tidak aktif",
		MessageEn:  "Product is not active",
	},
	"INVALID_QUANTITY": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "Jumlah tidak valid",
		MessageEn:  "Invalid quantity",
	},
	"INVALID_SALE_ID": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "ID transaksi tidak valid",
		MessageEn:  "Invalid sale ID",
	},
	"INVALID_PAYMENT_ID": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "ID pembayaran tidak valid",
		MessageEn:  "Invalid payment ID",
	},
	"INVALID_SHIFT_ID": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "ID shift tidak valid",
		MessageEn:  "Invalid shift ID",
	},
	"INVALID_TENANT_ID": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "ID tenant tidak valid",
		MessageEn:  "Invalid tenant ID",
	},
	"INVALID_USER_ID": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "ID user tidak valid",
		MessageEn:  "Invalid user ID",
	},
	"INVALID_OUTLET_ID": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "ID outlet tidak valid",
		MessageEn:  "Invalid outlet ID",
	},
	"INVALID_PRODUCT_ID": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "ID produk tidak valid",
		MessageEn:  "Invalid product ID",
	},
	"INVALID_CUSTOMER_ID": {
		HTTPStatus: http.StatusBadRequest,
		Message:    "ID pelanggan tidak valid",
		MessageEn:  "Invalid customer ID",
	},

	// System Errors
	"INTERNAL_SERVER_ERROR": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Terjadi kesalahan pada server. Tim kami telah diberitahu",
		MessageEn:  "An internal server error occurred. Our team has been notified",
	},
	"SERVICE_UNAVAILABLE": {
		HTTPStatus: http.StatusServiceUnavailable,
		Message:    "Layanan sedang dalam maintenance. Silakan coba lagi nanti",
		MessageEn:  "Service is under maintenance. Please try again later",
	},
	"DATABASE_ERROR": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Error pada database",
		MessageEn:  "Database error",
	},
	"CACHE_ERROR": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Error pada cache",
		MessageEn:  "Cache error",
	},
	"STORAGE_ERROR": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Error pada storage",
		MessageEn:  "Storage error",
	},
	"QUEUE_ERROR": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Error pada message queue",
		MessageEn:  "Message queue error",
	},
	"TIMEOUT": {
		HTTPStatus: http.StatusGatewayTimeout,
		Message:    "Request timeout",
		MessageEn:  "Request timeout",
	},
	"RATE_LIMIT_EXCEEDED": {
		HTTPStatus: http.StatusTooManyRequests,
		Message:    "Terlalu banyak request. Silakan coba lagi nanti",
		MessageEn:  "Too many requests. Please try again later",
	},
	"MAINTENANCE_MODE": {
		HTTPStatus: http.StatusServiceUnavailable,
		Message:    "Sistem sedang maintenance",
		MessageEn:  "System is in maintenance mode",
	},

	// Integration Errors - Payment Gateway
	"XENDIT_ERROR": {
		HTTPStatus: http.StatusBadGateway,
		Message:    "Error dari Xendit API",
		MessageEn:  "Error from Xendit API",
	},
	"MIDTRANS_ERROR": {
		HTTPStatus: http.StatusBadGateway,
		Message:    "Error dari Midtrans API",
		MessageEn:  "Error from Midtrans API",
	},
	"PAYMENT_GATEWAY_TIMEOUT": {
		HTTPStatus: http.StatusGatewayTimeout,
		Message:    "Timeout dari payment gateway",
		MessageEn:  "Timeout from payment gateway",
	},
	"PAYMENT_GATEWAY_UNAVAILABLE": {
		HTTPStatus: http.StatusServiceUnavailable,
		Message:    "Payment gateway tidak tersedia",
		MessageEn:  "Payment gateway unavailable",
	},

	// Integration Errors - WhatsApp
	"WHATSAPP_ERROR": {
		HTTPStatus: http.StatusBadGateway,
		Message:    "Error dari WhatsApp API",
		MessageEn:  "Error from WhatsApp API",
	},
	"WHATSAPP_RATE_LIMIT": {
		HTTPStatus: http.StatusTooManyRequests,
		Message:    "Rate limit WhatsApp API",
		MessageEn:  "WhatsApp API rate limit",
	},
	"WHATSAPP_UNAVAILABLE": {
		HTTPStatus: http.StatusServiceUnavailable,
		Message:    "WhatsApp service tidak tersedia",
		MessageEn:  "WhatsApp service unavailable",
	},

	// Integration Errors - Marketplace
	"MARKETPLACE_ERROR": {
		HTTPStatus: http.StatusBadGateway,
		Message:    "Error dari marketplace API",
		MessageEn:  "Error from marketplace API",
	},
	"MARKETPLACE_SYNC_FAILED": {
		HTTPStatus: http.StatusUnprocessableEntity,
		Message:    "Sync ke marketplace gagal",
		MessageEn:  "Marketplace sync failed",
	},
	"MARKETPLACE_AUTH_FAILED": {
		HTTPStatus: http.StatusUnauthorized,
		Message:    "Autentikasi marketplace gagal",
		MessageEn:  "Marketplace authentication failed",
	},

	// Integration Errors - Hardware
	"PRINTER_ERROR": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Error pada printer",
		MessageEn:  "Printer error",
	},
	"PRINTER_NOT_CONNECTED": {
		HTTPStatus: http.StatusServiceUnavailable,
		Message:    "Printer tidak terhubung",
		MessageEn:  "Printer not connected",
	},
	"SCANNER_ERROR": {
		HTTPStatus: http.StatusInternalServerError,
		Message:    "Error pada barcode scanner",
		MessageEn:  "Barcode scanner error",
	},
	"SCANNER_NOT_CONNECTED": {
		HTTPStatus: http.StatusServiceUnavailable,
		Message:    "Scanner tidak terhubung",
		MessageEn:  "Scanner not connected",
	},
}

// Error creates an error response with bilingual support
func Error(c *gin.Context, code string, details map[string]interface{}, fieldErrors []response.FieldError) {
	errorInfo, exists := ErrorCodeMap[code]
	if !exists {
		errorInfo = ErrorCodeMap["INTERNAL_SERVER_ERROR"]
		code = "INTERNAL_SERVER_ERROR"
	}

	// Get locale for primary message
	locale := response.GetLocale(c)

	// Select primary message based on locale
	var primaryMessage string
	if locale == response.LocaleEN {
		primaryMessage = errorInfo.MessageEn
	} else {
		primaryMessage = errorInfo.Message
	}

	apiError := &response.APIError{
		Code:        code,
		Message:     primaryMessage,
		MessageEn:   errorInfo.MessageEn, // Always include English
		Details:     details,
		FieldErrors: fieldErrors,
	}

	responseObj := &response.APIResponse{
		Success:   false,
		Error:     apiError,
		Timestamp: response.FormatDateTime(response.GetCurrentTime()),
		RequestID: response.GetRequestID(c),
	}

	// Add meta if available (tenant_id, outlet_id, etc.)
	if meta := response.GetMetaFromContext(c); meta != nil {
		responseObj.Meta = meta
	}

	c.JSON(errorInfo.HTTPStatus, responseObj)
}

// ValidationError creates a validation error response with bilingual support
func ValidationError(c *gin.Context, fieldErrors []response.FieldError) {
	Error(c, "VALIDATION_ERROR", nil, fieldErrors)
}

// NotFound creates a not found error response
func NotFound(c *gin.Context, resource string, resourceID string) {
	details := map[string]interface{}{
		"resource":    resource,
		"resource_id": resourceID,
	}
	Error(c, "NOT_FOUND", details, nil)
}

// Unauthorized creates an unauthorized error response
func Unauthorized(c *gin.Context, reason string) {
	details := map[string]interface{}{}
	if reason != "" {
		details["reason"] = reason
	}
	Error(c, "UNAUTHORIZED", details, nil)
}

// Forbidden creates a forbidden error response
func Forbidden(c *gin.Context, requiredPermission string, userPermissions []string) {
	details := map[string]interface{}{
		"required_permission": requiredPermission,
		"user_permissions":    userPermissions,
	}
	Error(c, "FORBIDDEN", details, nil)
}

// Conflict creates a conflict error response
func Conflict(c *gin.Context, details map[string]interface{}) {
	if details == nil {
		details = make(map[string]interface{})
	}
	Error(c, "CONFLICT", details, nil)
}

// InternalServerError creates an internal server error response
func InternalServerError(c *gin.Context, errorID string) {
	details := map[string]interface{}{
		"error_id": errorID,
	}
	Error(c, "INTERNAL_SERVER_ERROR", details, nil)
}

// RateLimit creates a rate limit error response
func RateLimit(c *gin.Context, limit int, remaining int, resetAt time.Time) {
	details := map[string]interface{}{
		"limit":     limit,
		"remaining": remaining,
		"reset_at":  resetAt.In(response.GetTimezone()).Format(time.RFC3339),
	}
	Error(c, "RATE_LIMIT_EXCEEDED", details, nil)
}


