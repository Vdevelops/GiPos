# Authentication & Authorization

Modul Authentication & Authorization mengelola autentikasi pengguna, registrasi, dan manajemen token JWT.

## 📋 Overview

Modul ini menyediakan:
- Login dengan email dan password
- Registrasi user baru
- Refresh token untuk memperpanjang sesi
- Get current user profile
- Manajemen user (list, get by ID)

## 🔗 Endpoints

### Public Endpoints

#### 1. Login
**POST** `/api/v1/auth/login`

Login dengan email dan password untuk mendapatkan access token dan refresh token.

**Request Body:**
```json
{
  "email": "admin@gipos.id",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "tenant_id": "uuid",
      "email": "admin@gipos.id",
      "name": "System Admin",
      "phone": "081234567890",
      "role": "system_admin",
      "status": "active",
      "outlet_id": null,
      "last_login_at": "2025-11-15T14:00:00+07:00",
      "created_at": "2025-11-15T14:00:00+07:00",
      "updated_at": "2025-11-15T14:00:00+07:00"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "token_type": "Bearer"
  },
  "meta": {
    "tenant_id": "uuid",
    "request_id": "req_xxx"
  }
}
```

**Error Responses:**
- `400` - Validation Error (email/password tidak valid)
- `401` - INVALID_CREDENTIALS (email atau password salah)
- `401` - ACCOUNT_DISABLED (akun dinonaktifkan)

---

#### 2. Register
**POST** `/api/v1/auth/register`

Mendaftarkan user baru. Memerlukan tenant_id (dari context atau request).

**Request Body:**
```json
{
  "email": "newuser@gipos.id",
  "password": "password123",
  "name": "New User",
  "phone": "081234567890",
  "role": "cashier",
  "outlet_id": "uuid-optional"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "email": "newuser@gipos.id",
    "name": "New User",
    "phone": "081234567890",
    "role": "cashier",
    "status": "active",
    "outlet_id": null,
    "created_at": "2025-11-15T14:00:00+07:00",
    "updated_at": "2025-11-15T14:00:00+07:00"
  },
  "meta": {
    "tenant_id": "uuid",
    "created_by": "uuid"
  }
}
```

**Error Responses:**
- `400` - Validation Error
- `409` - RESOURCE_ALREADY_EXISTS (email sudah terdaftar)
- `400` - VALIDATION_ERROR (tenant_id required)

---

#### 3. Refresh Token
**POST** `/api/v1/auth/refresh`

Memperbarui access token menggunakan refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "token_type": "Bearer"
  }
}
```

**Error Responses:**
- `400` - Validation Error
- `401` - INVALID_TOKEN (refresh token tidak valid atau expired)

---

### Protected Endpoints

Semua endpoint di bawah ini memerlukan Bearer Token di header.

#### 4. Get Current User
**GET** `/api/v1/auth/me`

Mendapatkan informasi user yang sedang login.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "email": "admin@gipos.id",
    "name": "System Admin",
    "phone": "081234567890",
    "role": "system_admin",
    "status": "active",
    "outlet_id": null,
    "last_login_at": "2025-11-15T14:00:00+07:00",
    "created_at": "2025-11-15T14:00:00+07:00",
    "updated_at": "2025-11-15T14:00:00+07:00"
  }
}
```

**Error Responses:**
- `401` - UNAUTHORIZED (token tidak valid)

---

#### 5. List Users
**GET** `/api/v1/users`

Mendapatkan daftar semua users dalam tenant yang sama.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional, default: 10) - Jumlah data per halaman
- `offset` (optional, default: 0) - Offset untuk pagination
- `outlet_id` (optional) - Filter by outlet ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "tenant_id": "uuid",
        "email": "admin@gipos.id",
        "name": "System Admin",
        "role": "system_admin",
        "status": "active"
      }
    ],
    "pagination": {
      "total": 10,
      "limit": 10,
      "offset": 0,
      "has_more": false
    }
  }
}
```

---

#### 6. Get User by ID
**GET** `/api/v1/users/:id`

Mendapatkan detail user berdasarkan ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "email": "admin@gipos.id",
    "name": "System Admin",
    "phone": "081234567890",
    "role": "system_admin",
    "status": "active",
    "outlet_id": null,
    "last_login_at": "2025-11-15T14:00:00+07:00",
    "created_at": "2025-11-15T14:00:00+07:00",
    "updated_at": "2025-11-15T14:00:00+07:00"
  }
}
```

**Error Responses:**
- `404` - RESOURCE_NOT_FOUND (user tidak ditemukan)
- `401` - UNAUTHORIZED

---

## 🔑 User Roles

Sistem mendukung beberapa role:

- `system_admin` - Administrator sistem (full access)
- `tenant_owner` - Pemilik tenant (manage tenant)
- `manager` - Manager outlet (manage outlet)
- `cashier` - Kasir (transaksi saja)
- `accountant` - Akuntan (laporan keuangan)
- `supervisor` - Supervisor (monitor & approve)

## 🔐 Token Configuration

- **Access Token Expiry**: 24 jam (default)
- **Refresh Token Expiry**: 7 hari (default)
- **Token Type**: Bearer

## 📝 Notes

1. Password harus minimal 6 karakter
2. Email harus format valid
3. User dengan status `inactive` tidak bisa login
4. Token disimpan di header `Authorization: Bearer <token>`
5. Refresh token digunakan untuk mendapatkan access token baru tanpa login ulang

## 🧪 Example Usage

### cURL Examples

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gipos.id",
    "password": "password123"
  }'

# Get Current User
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"

# Refresh Token
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<refresh_token>"
  }'
```

---

**Last Updated**: November 2025

