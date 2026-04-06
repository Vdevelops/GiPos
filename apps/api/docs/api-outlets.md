# API Documentation - Outlets

## GiPos SaaS Platform - Backend API

**Versi**: 1.0  
**Last Updated**: 2025-11-16

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
   - [Create Outlet](#1-create-outlet)
   - [Get Outlet by ID](#2-get-outlet-by-id)
   - [Update Outlet](#3-update-outlet)
   - [Delete Outlet](#4-delete-outlet)
   - [List Outlets](#5-list-outlets)
5. [Data Models](#data-models)
6. [Error Codes](#error-codes)
7. [Examples](#examples)

---

## Overview

API Outlets digunakan untuk mengelola data outlet/cabang dalam sistem multi-tenant. Setiap tenant dapat memiliki multiple outlets.

**Base Path**: `/api/v1/outlets`

---

## Base URL

```
Production: https://api.gipos.id/api/v1/outlets
Development: http://localhost:8080/api/v1/outlets
```

---

## Authentication

Semua endpoint memerlukan authentication token di header:

```
Authorization: Bearer <access_token>
```

Token diperoleh dari endpoint `/api/v1/auth/login`.

---

## Endpoints

### 1. Create Outlet

Membuat outlet baru untuk tenant yang sedang login.

**Endpoint**: `POST /api/v1/outlets`

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "code": "OUTLET-001",
  "name": "Outlet Pusat",
  "address": "Jl. Merdeka No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "postal_code": "10110",
  "phone": "021-12345678",
  "email": "pusat@gipos.id",
  "status": "active",
  "is_main": true,
  "timezone": "Asia/Jakarta",
  "logo_url": "https://example.com/logo.png",
  "settings": "{\"currency\":\"IDR\",\"tax_rate\":0.11}"
}
```

**Field Validation**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `code` | string | Yes | min:1, max:50 | Kode unik outlet |
| `name` | string | Yes | min:3, max:200 | Nama outlet |
| `address` | string | No | - | Alamat lengkap |
| `city` | string | No | max:100 | Kota |
| `province` | string | No | max:100 | Provinsi |
| `postal_code` | string | No | max:10 | Kode pos |
| `phone` | string | No | max:20 | Nomor telepon |
| `email` | string | No | email | Email outlet |
| `status` | string | No | oneof:active,inactive | Status outlet (default: active) |
| `is_main` | boolean | No | - | Apakah outlet utama (default: false) |
| `timezone` | string | No | max:50 | Timezone (default: Asia/Jakarta) |
| `logo_url` | string | No | url, max:500 | URL logo outlet |
| `settings` | string | No | - | JSON string untuk konfigurasi |

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "1",
    "code": "OUTLET-001",
    "name": "Outlet Pusat",
    "address": "Jl. Merdeka No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "10110",
    "phone": "021-12345678",
    "email": "pusat@gipos.id",
    "status": "active",
    "is_main": true,
    "timezone": "Asia/Jakarta",
    "logo_url": "https://example.com/logo.png",
    "settings": "{\"currency\":\"IDR\",\"tax_rate\":0.11}",
    "created_at": "2025-11-16T15:30:45+07:00",
    "updated_at": "2025-11-16T15:30:45+07:00"
  },
  "meta": {
    "tenant_id": "1",
    "created_by": "1"
  },
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

**Error Responses**:

- **400 Bad Request** - Validation Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid",
    "message_en": "Invalid request data",
    "field_errors": [
      {
        "field": "code",
        "code": "REQUIRED",
        "message": "Field code wajib diisi",
        "message_en": "Field code is required"
      },
      {
        "field": "email",
        "code": "INVALID_TYPE",
        "message": "Field email harus berupa email yang valid",
        "message_en": "Field email must be a valid email address"
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

- **401 Unauthorized** - Token Missing/Invalid:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token autentikasi tidak valid atau telah kedaluwarsa",
    "message_en": "Authentication token is invalid or expired"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

- **409 Conflict** - Duplicate Code:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_VALUE",
    "message": "Kode outlet sudah digunakan",
    "message_en": "Outlet code already exists"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

---

### 2. Get Outlet by ID

Mengambil detail outlet berdasarkan ID.

**Endpoint**: `GET /api/v1/outlets/:id`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | ID outlet |

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "1",
    "code": "OUTLET-001",
    "name": "Outlet Pusat",
    "address": "Jl. Merdeka No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "10110",
    "phone": "021-12345678",
    "email": "pusat@gipos.id",
    "status": "active",
    "is_main": true,
    "timezone": "Asia/Jakarta",
    "logo_url": "https://example.com/logo.png",
    "settings": "{\"currency\":\"IDR\",\"tax_rate\":0.11}",
    "created_at": "2025-11-16T15:30:45+07:00",
    "updated_at": "2025-11-16T15:30:45+07:00"
  },
  "meta": {
    "tenant_id": "1"
  },
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

**Error Responses**:

- **404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "OUTLET_NOT_FOUND",
    "message": "Outlet tidak ditemukan",
    "message_en": "Outlet not found"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

---

### 3. Update Outlet

Memperbarui data outlet yang sudah ada.

**Endpoint**: `PUT /api/v1/outlets/:id`

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | ID outlet |

**Request Body** (semua field optional, hanya kirim field yang ingin diupdate):

```json
{
  "name": "Outlet Pusat - Updated",
  "address": "Jl. Merdeka No. 456",
  "status": "active",
  "is_main": false
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "1",
    "code": "OUTLET-001",
    "name": "Outlet Pusat - Updated",
    "address": "Jl. Merdeka No. 456",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "10110",
    "phone": "021-12345678",
    "email": "pusat@gipos.id",
    "status": "active",
    "is_main": false,
    "timezone": "Asia/Jakarta",
    "logo_url": "https://example.com/logo.png",
    "settings": "{\"currency\":\"IDR\",\"tax_rate\":0.11}",
    "created_at": "2025-11-16T15:30:45+07:00",
    "updated_at": "2025-11-16T15:35:20+07:00"
  },
  "meta": {
    "tenant_id": "1",
    "updated_by": "1"
  },
  "timestamp": "2025-11-16T15:35:20+07:00",
  "request_id": "req_20251116153520_abc123"
}
```

**Error Responses**:

- **404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "OUTLET_NOT_FOUND",
    "message": "Outlet tidak ditemukan",
    "message_en": "Outlet not found"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:35:20+07:00",
  "request_id": "req_20251116153520_abc123"
}
```

- **409 Conflict** - Duplicate Code:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_VALUE",
    "message": "Kode outlet sudah digunakan",
    "message_en": "Outlet code already exists"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:35:20+07:00",
  "request_id": "req_20251116153520_abc123"
}
```

---

### 4. Delete Outlet

Menghapus outlet (soft delete).

**Endpoint**: `DELETE /api/v1/outlets/:id`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | ID outlet |

**Success Response** (204 No Content):

Tidak ada response body.

**Error Responses**:

- **404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "OUTLET_NOT_FOUND",
    "message": "Outlet tidak ditemukan",
    "message_en": "Outlet not found"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:40:00+07:00",
  "request_id": "req_20251116154000_abc123"
}
```

---

### 5. List Outlets

Mengambil daftar outlets dengan pagination dan filtering.

**Endpoint**: `GET /api/v1/outlets`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Halaman yang diminta |
| `per_page` | integer | No | 20 | Jumlah item per halaman (max: 100) |
| `search` | string | No | - | Pencarian berdasarkan name, code, atau city |
| `status` | string | No | - | Filter berdasarkan status (active, inactive) |

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "OUTLET-001",
      "name": "Outlet Pusat",
      "address": "Jl. Merdeka No. 123",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "postal_code": "10110",
      "phone": "021-12345678",
      "email": "pusat@gipos.id",
      "status": "active",
      "is_main": true,
      "timezone": "Asia/Jakarta",
      "logo_url": "https://example.com/logo.png",
      "settings": "{\"currency\":\"IDR\",\"tax_rate\":0.11}",
      "created_at": "2025-11-16T15:30:45+07:00",
      "updated_at": "2025-11-16T15:30:45+07:00"
    },
    {
      "id": "2",
      "code": "OUTLET-002",
      "name": "Outlet Cabang A",
      "address": "Jl. Sudirman No. 456",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "postal_code": "10220",
      "phone": "021-87654321",
      "email": "cabang-a@gipos.id",
      "status": "active",
      "is_main": false,
      "timezone": "Asia/Jakarta",
      "logo_url": null,
      "settings": null,
      "created_at": "2025-11-16T15:31:00+07:00",
      "updated_at": "2025-11-16T15:31:00+07:00"
    }
  ],
  "meta": {
    "tenant_id": "1",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 2,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    },
    "filters": {
      "status": "active"
    }
  },
  "timestamp": "2025-11-16T15:40:00+07:00",
  "request_id": "req_20251116154000_abc123"
}
```

**Example Requests**:

1. **Get all outlets (default pagination)**:
```
GET /api/v1/outlets
```

2. **Get outlets with pagination**:
```
GET /api/v1/outlets?page=2&per_page=10
```

3. **Search outlets**:
```
GET /api/v1/outlets?search=pusat
```

4. **Filter by status**:
```
GET /api/v1/outlets?status=active
```

5. **Combined filters**:
```
GET /api/v1/outlets?search=jakarta&status=active&page=1&per_page=20
```

---

## Data Models

### OutletResponse

```typescript
interface OutletResponse {
  id: string;                    // Outlet ID
  code: string;                  // Kode unik outlet
  name: string;                  // Nama outlet
  address?: string;              // Alamat lengkap
  city?: string;                 // Kota
  province?: string;             // Provinsi
  postal_code?: string;          // Kode pos
  phone?: string;                // Nomor telepon
  email?: string;                // Email outlet
  status: string;                // Status: "active" | "inactive"
  is_main: boolean;             // Apakah outlet utama
  timezone: string;            // Timezone (default: Asia/Jakarta)
  logo_url?: string;            // URL logo outlet
  settings?: string;             // JSON string untuk konfigurasi
  created_at: string;           // ISO 8601 datetime
  updated_at: string;           // ISO 8601 datetime
}
```

### CreateOutletRequest

```typescript
interface CreateOutletRequest {
  code: string;                  // Required, min:1, max:50
  name: string;                  // Required, min:3, max:200
  address?: string;
  city?: string;                 // max:100
  province?: string;             // max:100
  postal_code?: string;          // max:10
  phone?: string;                // max:20
  email?: string;                // email format
  status?: string;               // "active" | "inactive" (default: "active")
  is_main?: boolean;             // default: false
  timezone?: string;             // max:50 (default: "Asia/Jakarta")
  logo_url?: string;             // url format, max:500
  settings?: string;             // JSON string
}
```

### UpdateOutletRequest

Semua field optional, hanya kirim field yang ingin diupdate:

```typescript
interface UpdateOutletRequest {
  code?: string;                 // min:1, max:50
  name?: string;                 // min:3, max:200
  address?: string;
  city?: string;                 // max:100
  province?: string;             // max:100
  postal_code?: string;          // max:10
  phone?: string;                // max:20
  email?: string;                // email format
  status?: string;               // "active" | "inactive"
  is_main?: boolean;
  timezone?: string;             // max:50
  logo_url?: string;             // url format, max:500
  settings?: string;              // JSON string
}
```

---

## Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Data yang dikirim tidak valid |
| `UNAUTHORIZED` | 401 | Token autentikasi tidak valid atau telah kedaluwarsa |
| `FORBIDDEN` | 403 | Tidak memiliki akses ke resource ini |
| `OUTLET_NOT_FOUND` | 404 | Outlet tidak ditemukan |
| `DUPLICATE_VALUE` | 409 | Kode outlet sudah digunakan |
| `INTERNAL_SERVER_ERROR` | 500 | Terjadi kesalahan pada server |

---

## Examples

### cURL Examples

#### 1. Create Outlet

```bash
curl -X POST https://api.gipos.id/api/v1/outlets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "OUTLET-001",
    "name": "Outlet Pusat",
    "address": "Jl. Merdeka No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "10110",
    "phone": "021-12345678",
    "email": "pusat@gipos.id",
    "status": "active",
    "is_main": true,
    "timezone": "Asia/Jakarta"
  }'
```

#### 2. Get Outlet by ID

```bash
curl -X GET https://api.gipos.id/api/v1/outlets/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. Update Outlet

```bash
curl -X PUT https://api.gipos.id/api/v1/outlets/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Outlet Pusat - Updated",
    "status": "active"
  }'
```

#### 4. Delete Outlet

```bash
curl -X DELETE https://api.gipos.id/api/v1/outlets/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 5. List Outlets

```bash
curl -X GET "https://api.gipos.id/api/v1/outlets?page=1&per_page=20&status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript/TypeScript Examples

#### Using Fetch API

```typescript
// Create Outlet
const createOutlet = async (outletData: CreateOutletRequest) => {
  const response = await fetch('https://api.gipos.id/api/v1/outlets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(outletData)
  });
  
  const result = await response.json();
  return result;
};

// Get Outlet by ID
const getOutlet = async (id: string) => {
  const response = await fetch(`https://api.gipos.id/api/v1/outlets/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const result = await response.json();
  return result;
};

// Update Outlet
const updateOutlet = async (id: string, outletData: UpdateOutletRequest) => {
  const response = await fetch(`https://api.gipos.id/api/v1/outlets/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(outletData)
  });
  
  const result = await response.json();
  return result;
};

// Delete Outlet
const deleteOutlet = async (id: string) => {
  const response = await fetch(`https://api.gipos.id/api/v1/outlets/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.status === 204) {
    return { success: true };
  }
  
  const result = await response.json();
  return result;
};

// List Outlets
const listOutlets = async (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  
  const response = await fetch(
    `https://api.gipos.id/api/v1/outlets?${queryParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  const result = await response.json();
  return result;
};
```

---

## Notes

1. **Multi-Tenant**: Semua endpoint secara otomatis ter-scope ke tenant yang sedang login berdasarkan token.

2. **Code Uniqueness**: Field `code` harus unik per tenant. Tidak boleh ada dua outlet dengan code yang sama dalam satu tenant.

3. **Main Outlet**: Hanya satu outlet yang bisa menjadi main outlet (`is_main: true`) per tenant. Jika mengupdate outlet lain menjadi main, outlet yang sebelumnya main akan otomatis menjadi non-main.

4. **Soft Delete**: Delete outlet menggunakan soft delete, data tidak benar-benar dihapus dari database.

5. **Settings Field**: Field `settings` adalah JSON string yang dapat digunakan untuk menyimpan konfigurasi khusus outlet. Contoh: `{"currency":"IDR","tax_rate":0.11,"working_hours":{"open":"08:00","close":"22:00"}}`

6. **Timezone**: Default timezone adalah `Asia/Jakarta`. Timezone harus mengikuti format IANA timezone database (contoh: `Asia/Jakarta`, `UTC`, `America/New_York`).

---

**Last Updated**: 2025-11-16

