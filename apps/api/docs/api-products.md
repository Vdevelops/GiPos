# API Documentation - Products

## GiPos SaaS Platform - Backend API

**Versi**: 1.0  
**Last Updated**: 2025-11-16

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
   - [Product CRUD](#product-crud)
     - [Create Product](#1-create-product)
     - [Get Product by ID](#2-get-product-by-id)
     - [Get Product by SKU](#3-get-product-by-sku)
     - [Get Product by Barcode](#4-get-product-by-barcode)
     - [Update Product](#5-update-product)
     - [Delete Product](#6-delete-product)
     - [List Products](#7-list-products)
   - [Product Images](#product-images)
     - [Create Product Image](#8-create-product-image)
     - [Bulk Create Product Images](#9-bulk-create-product-images)
     - [Get Product Images](#10-get-product-images)
     - [Get Product Image by ID](#11-get-product-image-by-id)
     - [Update Product Image](#12-update-product-image)
     - [Delete Product Image](#13-delete-product-image)
   - [Product Stocks](#product-stocks)
     - [Create Product Stock](#14-create-product-stock)
     - [Bulk Create Product Stocks](#15-bulk-create-product-stocks)
     - [Get Product Stocks](#16-get-product-stocks)
     - [Get Product Total Stock](#17-get-product-total-stock)
     - [Get Product Stock by ID](#18-get-product-stock-by-id)
     - [Update Product Stock](#19-update-product-stock)
     - [Delete Product Stock](#20-delete-product-stock)
5. [Data Models](#data-models)
6. [Error Codes](#error-codes)
7. [Examples](#examples)

---

## Overview

API Products digunakan untuk mengelola data produk/item dalam sistem multi-tenant. Setiap tenant dapat memiliki multiple products dengan dukungan untuk:

- **Product Images**: Multiple gambar per produk
- **Product Stocks**: Stok per gudang (warehouse) untuk setiap produk
- **Categories**: Kategorisasi produk
- **Outlets**: Scope produk per outlet atau tenant-level

**Base Path**: `/api/v1/products`

---

## Base URL

```
Production: https://api.gipos.id/api/v1/products
Development: http://localhost:8080/api/v1/products
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

## Product CRUD

### 1. Create Product

Membuat produk baru untuk tenant yang sedang login.

**Endpoint**: `POST /api/v1/products`

**Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Produk A",
  "sku": "SKU-001",
  "barcode": "1234567890123",
  "description": "Deskripsi produk A",
  "price": 50000,
  "cost": 30000,
  "category_id": "1",
  "taxable": true,
  "track_stock": true,
  "status": "active"
}
```

**Field Validation**:

| Field         | Type    | Required | Validation                     | Description                               |
| ------------- | ------- | -------- | ------------------------------ | ----------------------------------------- |
| `name`        | string  | Yes      | min:3, max:200                 | Nama produk                               |
| `sku`         | string  | Yes      | min:1, max:100                 | Stock Keeping Unit (unique per tenant)    |
| `barcode`     | string  | No       | max:100                        | Barcode (EAN, UPC, etc.)                  |
| `description` | string  | No       | -                              | Deskripsi produk                          |
| `price`       | integer | Yes      | min:1                          | Harga dalam sen (Rupiah \* 100)           |
| `cost`        | integer | No       | min:0                          | Cost dalam sen (untuk profit calculation) |
| `category_id` | string  | No       | -                              | ID kategori produk                        |
| `taxable`     | boolean | No       | -                              | Apakah produk kena pajak (default: true)  |
| `track_stock` | boolean | No       | -                              | Apakah tracking stok (default: true)      |
| `status`      | string  | No       | oneof:active,inactive,archived | Status produk (default: active)           |

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "1",
    "outlet_id": null,
    "category_id": "1",
    "category": {
      "id": "1",
      "name": "Elektronik"
    },
    "name": "Produk A",
    "sku": "SKU-001",
    "barcode": "1234567890123",
    "description": "Deskripsi produk A",
    "price": 50000,
    "cost": 30000,
    "taxable": true,
    "track_stock": true,
    "status": "active",
    "stocks": [],
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
        "field": "name",
        "code": "REQUIRED",
        "message": "Field name wajib diisi",
        "message_en": "Field name is required"
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

- **409 Conflict** - Duplicate SKU:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_VALUE",
    "message": "SKU sudah digunakan",
    "message_en": "SKU already exists"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

---

### 2. Get Product by ID

Mengambil detail produk berdasarkan ID.

**Endpoint**: `GET /api/v1/products/:id`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | ID produk   |

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "1",
    "outlet_id": null,
    "category_id": "1",
    "category": {
      "id": "1",
      "name": "Elektronik"
    },
    "name": "Produk A",
    "sku": "SKU-001",
    "barcode": "1234567890123",
    "description": "Deskripsi produk A",
    "price": 50000,
    "cost": 30000,
    "taxable": true,
    "track_stock": true,
    "status": "active",
    "images": [
      {
        "id": "1",
        "product_id": "1",
        "url": "https://example.com/image1.jpg",
        "thumbnail_url": "https://example.com/thumb1.jpg",
        "order": 0,
        "alt": "Produk A - Image 1",
        "created_at": "2025-11-16T15:30:45+07:00",
        "updated_at": "2025-11-16T15:30:45+07:00"
      }
    ],
    "stocks": [
      {
        "warehouse_id": "1",
        "warehouse": {
          "id": "1",
          "code": "WH-001",
          "name": "Gudang Utama"
        },
        "quantity": 100,
        "reserved": 10
      }
    ],
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
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produk tidak ditemukan",
    "message_en": "Product not found"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

---

### 3. Get Product by SKU

Mengambil detail produk berdasarkan SKU (case-insensitive).

**Endpoint**: `GET /api/v1/products/sku/:sku`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `sku`     | string | Yes      | SKU produk  |

**Success Response** (200 OK):

Sama dengan [Get Product by ID](#2-get-product-by-id).

**Error Responses**:

- **404 Not Found**:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produk tidak ditemukan",
    "message_en": "Product not found"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

---

### 4. Get Product by Barcode

Mengambil detail produk berdasarkan barcode.

**Endpoint**: `GET /api/v1/products/barcode/:barcode`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| `barcode` | string | Yes      | Barcode produk |

**Success Response** (200 OK):

Sama dengan [Get Product by ID](#2-get-product-by-id).

**Error Responses**:

- **404 Not Found**:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produk tidak ditemukan",
    "message_en": "Product not found"
  },
  "meta": {},
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

---

### 5. Update Product

Memperbarui data produk yang sudah ada.

**Endpoint**: `PUT /api/v1/products/:id`

**Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | ID produk   |

**Request Body** (semua field optional, hanya kirim field yang ingin diupdate):

```json
{
  "name": "Produk A - Updated",
  "price": 55000,
  "status": "active"
}
```

**Field Validation**:

| Field         | Type    | Required | Validation                     | Description       |
| ------------- | ------- | -------- | ------------------------------ | ----------------- |
| `name`        | string  | No       | min:3, max:200                 | Nama produk       |
| `barcode`     | string  | No       | max:100                        | Barcode           |
| `description` | string  | No       | -                              | Deskripsi produk  |
| `price`       | integer | No       | min:1                          | Harga dalam sen   |
| `cost`        | integer | No       | min:0                          | Cost dalam sen    |
| `category_id` | string  | No       | -                              | ID kategori       |
| `taxable`     | boolean | No       | -                              | Apakah kena pajak |
| `status`      | string  | No       | oneof:active,inactive,archived | Status produk     |

**Success Response** (200 OK):

Sama dengan [Get Product by ID](#2-get-product-by-id) dengan data yang sudah diupdate.

**Error Responses**:

- **404 Not Found**: `PRODUCT_NOT_FOUND`
- **400 Bad Request**: `VALIDATION_ERROR`

---

### 6. Delete Product

Menghapus produk (soft delete).

**Endpoint**: `DELETE /api/v1/products/:id`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | ID produk   |

**Success Response** (204 No Content):

Tidak ada response body.

**Error Responses**:

- **404 Not Found**: `PRODUCT_NOT_FOUND`

---

### 7. List Products

Mengambil daftar produk dengan pagination, filtering, dan sorting.

**Endpoint**: `GET /api/v1/products`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Query Parameters**:

| Parameter        | Type    | Required | Default    | Description                                                    |
| ---------------- | ------- | -------- | ---------- | -------------------------------------------------------------- |
| `page`           | integer | No       | 1          | Halaman yang diminta                                           |
| `per_page`       | integer | No       | 20         | Jumlah item per halaman (max: 100)                             |
| `search`         | string  | No       | -          | Pencarian berdasarkan name, SKU, atau barcode                  |
| `status`         | string  | No       | -          | Filter berdasarkan status (active, inactive, archived)         |
| `category_id`    | string  | No       | -          | Filter berdasarkan category ID                                 |
| `outlet_id`      | string  | No       | -          | Filter berdasarkan outlet ID                                   |
| `sort_by`        | string  | No       | created_at | Field untuk sorting (name, sku, price, created_at, updated_at) |
| `sort_order`     | string  | No       | desc       | Urutan sorting (asc, desc)                                     |
| `include_tenant` | boolean | No       | false      | Include produk tenant-level (tanpa outlet_id)                  |

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "outlet_id": null,
      "category_id": "1",
      "category": {
        "id": "1",
        "name": "Elektronik"
      },
      "name": "Produk A",
      "sku": "SKU-001",
      "barcode": "1234567890123",
      "description": "Deskripsi produk A",
      "price": 50000,
      "cost": 30000,
      "taxable": true,
      "track_stock": true,
      "status": "active",
      "created_at": "2025-11-16T15:30:45+07:00",
      "updated_at": "2025-11-16T15:30:45+07:00"
    }
  ],
  "meta": {
    "tenant_id": "1",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 50,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    },
    "filters": {
      "status": "active",
      "category_id": "1"
    },
    "sort": {
      "sort_by": "created_at",
      "sort_order": "desc"
    }
  },
  "timestamp": "2025-11-16T15:40:00+07:00",
  "request_id": "req_20251116154000_abc123"
}
```

**Example Requests**:

1. **Get all products (default pagination)**:

```
GET /api/v1/products
```

2. **Get products with pagination**:

```
GET /api/v1/products?page=2&per_page=10
```

3. **Search products**:

```
GET /api/v1/products?search=laptop
```

4. **Filter by status and category**:

```
GET /api/v1/products?status=active&category_id=1
```

5. **Combined filters with sorting**:

```
GET /api/v1/products?search=laptop&status=active&category_id=1&sort_by=price&sort_order=asc&page=1&per_page=20
```

---

## Product Images

### 8. Create Product Image

Menambahkan gambar untuk produk.

**Endpoint**: `POST /api/v1/products/:product_id/images`

**Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | string | Yes      | ID produk   |

**Request Body**:

```json
{
  "url": "https://example.com/image1.jpg",
  "thumbnail_url": "https://example.com/thumb1.jpg",
  "order": 0,
  "alt": "Produk A - Image 1",
  "size": 1024000,
  "width": 1920,
  "height": 1080,
  "mime_type": "image/jpeg"
}
```

**Field Validation**:

| Field           | Type    | Required | Validation   | Description                             |
| --------------- | ------- | -------- | ------------ | --------------------------------------- |
| `url`           | string  | Yes      | url, max:500 | URL gambar lengkap                      |
| `thumbnail_url` | string  | No       | url, max:500 | URL thumbnail                           |
| `order`         | integer | No       | -            | Urutan tampil (default: 0)              |
| `alt`           | string  | No       | max:200      | Alt text untuk accessibility            |
| `size`          | integer | No       | -            | Ukuran file dalam bytes                 |
| `width`         | integer | No       | -            | Lebar gambar dalam pixels               |
| `height`        | integer | No       | -            | Tinggi gambar dalam pixels              |
| `mime_type`     | string  | No       | max:50       | MIME type (image/jpeg, image/png, etc.) |

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "1",
    "product_id": "1",
    "url": "https://example.com/image1.jpg",
    "thumbnail_url": "https://example.com/thumb1.jpg",
    "order": 0,
    "alt": "Produk A - Image 1",
    "size": 1024000,
    "width": 1920,
    "height": 1080,
    "mime_type": "image/jpeg",
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

- **404 Not Found**: `PRODUCT_NOT_FOUND`
- **400 Bad Request**: `VALIDATION_ERROR`

---

### 9. Bulk Create Product Images

Menambahkan multiple gambar untuk produk sekaligus.

**Endpoint**: `POST /api/v1/products/:product_id/images/bulk`

**Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | string | Yes      | ID produk   |

**Request Body**:

```json
{
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "thumbnail_url": "https://example.com/thumb1.jpg",
      "order": 0,
      "alt": "Produk A - Image 1"
    },
    {
      "url": "https://example.com/image2.jpg",
      "thumbnail_url": "https://example.com/thumb2.jpg",
      "order": 1,
      "alt": "Produk A - Image 2"
    }
  ]
}
```

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "product_id": "1",
      "url": "https://example.com/image1.jpg",
      "thumbnail_url": "https://example.com/thumb1.jpg",
      "order": 0,
      "alt": "Produk A - Image 1",
      "created_at": "2025-11-16T15:30:45+07:00",
      "updated_at": "2025-11-16T15:30:45+07:00"
    },
    {
      "id": "2",
      "product_id": "1",
      "url": "https://example.com/image2.jpg",
      "thumbnail_url": "https://example.com/thumb2.jpg",
      "order": 1,
      "alt": "Produk A - Image 2",
      "created_at": "2025-11-16T15:30:45+07:00",
      "updated_at": "2025-11-16T15:30:45+07:00"
    }
  ],
  "meta": {
    "tenant_id": "1",
    "created_by": "1"
  },
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

**Error Responses**:

- **404 Not Found**: `PRODUCT_NOT_FOUND`
- **400 Bad Request**: `VALIDATION_ERROR`

---

### 10. Get Product Images

Mengambil semua gambar untuk produk tertentu.

**Endpoint**: `GET /api/v1/products/:product_id/images`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | string | Yes      | ID produk   |

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "product_id": "1",
      "url": "https://example.com/image1.jpg",
      "thumbnail_url": "https://example.com/thumb1.jpg",
      "order": 0,
      "alt": "Produk A - Image 1",
      "created_at": "2025-11-16T15:30:45+07:00",
      "updated_at": "2025-11-16T15:30:45+07:00"
    }
  ],
  "meta": {
    "tenant_id": "1"
  },
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

**Error Responses**:

- **404 Not Found**: `PRODUCT_NOT_FOUND`

---

### 11. Get Product Image by ID

Mengambil detail gambar produk berdasarkan ID.

**Endpoint**: `GET /api/v1/products/images/:id`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | ID gambar produk |

**Success Response** (200 OK):

Sama dengan response [Create Product Image](#8-create-product-image).

**Error Responses**:

- **404 Not Found**: `PRODUCT_IMAGE_NOT_FOUND`

---

### 12. Update Product Image

Memperbarui data gambar produk.

**Endpoint**: `PUT /api/v1/products/images/:id`

**Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | ID gambar produk |

**Request Body** (semua field optional):

```json
{
  "url": "https://example.com/image1-updated.jpg",
  "order": 1,
  "alt": "Produk A - Image 1 Updated"
}
```

**Success Response** (200 OK):

Sama dengan [Create Product Image](#8-create-product-image) dengan data yang sudah diupdate.

**Error Responses**:

- **404 Not Found**: `PRODUCT_IMAGE_NOT_FOUND`
- **400 Bad Request**: `VALIDATION_ERROR`

---

### 13. Delete Product Image

Menghapus gambar produk.

**Endpoint**: `DELETE /api/v1/products/images/:id`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | ID gambar produk |

**Success Response** (204 No Content):

Tidak ada response body.

**Error Responses**:

- **404 Not Found**: `PRODUCT_IMAGE_NOT_FOUND`

---

## Product Stocks

### 14. Create Product Stock

Menambahkan stok produk untuk gudang tertentu.

**Endpoint**: `POST /api/v1/products/:product_id/stocks`

**Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | string | Yes      | ID produk   |

**Request Body**:

```json
{
  "warehouse_id": "1",
  "quantity": 100,
  "reserved": 10,
  "min_stock": 20,
  "max_stock": 500
}
```

**Field Validation**:

| Field          | Type    | Required | Validation | Description                                  |
| -------------- | ------- | -------- | ---------- | -------------------------------------------- |
| `warehouse_id` | string  | Yes      | -          | ID gudang                                    |
| `quantity`     | integer | Yes      | min:0      | Jumlah stok saat ini                         |
| `reserved`     | integer | No       | min:0      | Jumlah stok yang di-reserve (default: 0)     |
| `min_stock`    | integer | No       | min:0      | Minimum stock level untuk alert (default: 0) |
| `max_stock`    | integer | No       | min:0      | Maximum stock level (default: 0)             |

**Business Rules**:

- `reserved` harus <= `quantity`
- Produk harus memiliki `track_stock = true`
- Tidak boleh ada duplicate stock untuk product + warehouse yang sama

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "1",
    "product_id": "1",
    "warehouse_id": "1",
    "warehouse": {
      "id": "1",
      "code": "WH-001",
      "name": "Gudang Utama"
    },
    "quantity": 100,
    "reserved": 10,
    "min_stock": 20,
    "max_stock": 500,
    "last_updated": "2025-11-16T15:30:45+07:00",
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

- **404 Not Found**: `PRODUCT_NOT_FOUND` atau `WAREHOUSE_NOT_FOUND`
- **400 Bad Request**: `VALIDATION_ERROR`, `INVALID_RESERVED_QUANTITY`, `PRODUCT_DOES_NOT_TRACK_STOCK`
- **409 Conflict**: `STOCK_ALREADY_EXISTS`

---

### 15. Bulk Create Product Stocks

Menambahkan multiple stok produk untuk berbagai gudang sekaligus.

**Endpoint**: `POST /api/v1/products/:product_id/stocks/bulk`

**Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | string | Yes      | ID produk   |

**Request Body**:

```json
{
  "stocks": [
    {
      "warehouse_id": "1",
      "quantity": 100,
      "reserved": 10,
      "min_stock": 20,
      "max_stock": 500
    },
    {
      "warehouse_id": "2",
      "quantity": 50,
      "reserved": 5,
      "min_stock": 10,
      "max_stock": 200
    }
  ]
}
```

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "product_id": "1",
      "warehouse_id": "1",
      "warehouse": {
        "id": "1",
        "code": "WH-001",
        "name": "Gudang Utama"
      },
      "quantity": 100,
      "reserved": 10,
      "min_stock": 20,
      "max_stock": 500,
      "created_at": "2025-11-16T15:30:45+07:00",
      "updated_at": "2025-11-16T15:30:45+07:00"
    },
    {
      "id": "2",
      "product_id": "1",
      "warehouse_id": "2",
      "warehouse": {
        "id": "2",
        "code": "WH-002",
        "name": "Gudang Cabang"
      },
      "quantity": 50,
      "reserved": 5,
      "min_stock": 10,
      "max_stock": 200,
      "created_at": "2025-11-16T15:30:45+07:00",
      "updated_at": "2025-11-16T15:30:45+07:00"
    }
  ],
  "meta": {
    "tenant_id": "1",
    "created_by": "1"
  },
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

**Error Responses**:

- **404 Not Found**: `PRODUCT_NOT_FOUND` atau `WAREHOUSE_NOT_FOUND`
- **400 Bad Request**: `VALIDATION_ERROR`, `INVALID_RESERVED_QUANTITY`, `PRODUCT_DOES_NOT_TRACK_STOCK`, `DUPLICATE_WAREHOUSE_IN_REQUEST`
- **409 Conflict**: `STOCK_ALREADY_EXISTS`

---

### 16. Get Product Stocks

Mengambil semua stok produk untuk berbagai gudang.

**Endpoint**: `GET /api/v1/products/:product_id/stocks`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | string | Yes      | ID produk   |

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "product_id": "1",
      "warehouse_id": "1",
      "warehouse": {
        "id": "1",
        "code": "WH-001",
        "name": "Gudang Utama"
      },
      "quantity": 100,
      "reserved": 10,
      "min_stock": 20,
      "max_stock": 500,
      "last_updated": "2025-11-16T15:30:45+07:00",
      "created_at": "2025-11-16T15:30:45+07:00",
      "updated_at": "2025-11-16T15:30:45+07:00"
    }
  ],
  "meta": {
    "tenant_id": "1"
  },
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

**Error Responses**:

- **404 Not Found**: `PRODUCT_NOT_FOUND`

---

### 17. Get Product Total Stock

Mengambil total stok produk di semua gudang.

**Endpoint**: `GET /api/v1/products/:product_id/stocks/total`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter    | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `product_id` | string | Yes      | ID produk   |

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "total_quantity": 150,
    "total_reserved": 15,
    "available": 135
  },
  "meta": {
    "tenant_id": "1"
  },
  "timestamp": "2025-11-16T15:30:45+07:00",
  "request_id": "req_20251116153045_abc123"
}
```

**Error Responses**:

- **404 Not Found**: `PRODUCT_NOT_FOUND`

---

### 18. Get Product Stock by ID

Mengambil detail stok produk berdasarkan ID.

**Endpoint**: `GET /api/v1/products/stocks/:id`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| `id`      | string | Yes      | ID stok produk |

**Success Response** (200 OK):

Sama dengan response [Create Product Stock](#14-create-product-stock).

**Error Responses**:

- **404 Not Found**: `PRODUCT_STOCK_NOT_FOUND`

---

### 19. Update Product Stock

Memperbarui data stok produk.

**Endpoint**: `PUT /api/v1/products/stocks/:id`

**Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**:

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| `id`      | string | Yes      | ID stok produk |

**Request Body** (semua field optional):

```json
{
  "quantity": 120,
  "reserved": 15,
  "min_stock": 25,
  "max_stock": 600
}
```

**Field Validation**:

| Field       | Type    | Required | Validation | Description                 |
| ----------- | ------- | -------- | ---------- | --------------------------- |
| `quantity`  | integer | No       | min:0      | Jumlah stok saat ini        |
| `reserved`  | integer | No       | min:0      | Jumlah stok yang di-reserve |
| `min_stock` | integer | No       | min:0      | Minimum stock level         |
| `max_stock` | integer | No       | min:0      | Maximum stock level         |

**Business Rules**:

- `reserved` harus <= `quantity`

**Success Response** (200 OK):

Sama dengan [Create Product Stock](#14-create-product-stock) dengan data yang sudah diupdate.

**Error Responses**:

- **404 Not Found**: `PRODUCT_STOCK_NOT_FOUND`
- **400 Bad Request**: `VALIDATION_ERROR`, `INVALID_RESERVED_QUANTITY`

---

### 20. Delete Product Stock

Menghapus stok produk.

**Endpoint**: `DELETE /api/v1/products/stocks/:id`

**Headers**:

```
Authorization: Bearer <access_token>
```

**Path Parameters**:

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| `id`      | string | Yes      | ID stok produk |

**Success Response** (204 No Content):

Tidak ada response body.

**Error Responses**:

- **404 Not Found**: `PRODUCT_STOCK_NOT_FOUND`

---

## Data Models

### ProductResponse

```typescript
interface ProductResponse {
  id: string; // Product ID
  outlet_id?: string; // Outlet ID (nullable)
  category_id?: string; // Category ID (nullable)
  category?: CategoryReference; // Category reference
  name: string; // Product name
  sku: string; // Stock Keeping Unit
  barcode?: string; // Barcode
  description?: string; // Product description
  price: number; // Price in sen (Rupiah * 100)
  cost?: number; // Cost in sen
  taxable: boolean; // Whether product is taxable
  track_stock: boolean; // Whether to track stock
  status: string; // Status: "active" | "inactive" | "archived"
  images?: ProductImageResponse[]; // Product images
  stocks?: ProductStockReference[]; // Product stocks
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}
```

### ProductImageResponse

```typescript
interface ProductImageResponse {
  id: string; // Image ID
  product_id: string; // Product ID
  url: string; // Full image URL
  thumbnail_url?: string; // Thumbnail URL
  order: number; // Display order
  alt?: string; // Alt text
  size?: number; // File size in bytes
  width?: number; // Image width in pixels
  height?: number; // Image height in pixels
  mime_type?: string; // MIME type
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}
```

### ProductStockResponse

```typescript
interface ProductStockResponse {
  id: string; // Stock ID
  product_id: string; // Product ID
  warehouse_id: string; // Warehouse ID
  warehouse?: WarehouseReference; // Warehouse reference
  quantity: number; // Current stock quantity
  reserved: number; // Reserved quantity
  min_stock: number; // Minimum stock level
  max_stock: number; // Maximum stock level
  last_updated?: string; // Last update timestamp
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}
```

### CategoryReference

```typescript
interface CategoryReference {
  id: string; // Category ID
  name: string; // Category name
}
```

### WarehouseReference

```typescript
interface WarehouseReference {
  id: string; // Warehouse ID
  code: string; // Warehouse code
  name: string; // Warehouse name
}
```

### CreateProductRequest

```typescript
interface CreateProductRequest {
  name: string; // Required, min:3, max:200
  sku: string; // Required, min:1, max:100
  barcode?: string; // max:100
  description?: string;
  price: number; // Required, min:1
  cost?: number; // min:0
  category_id?: string;
  taxable?: boolean; // default: true
  track_stock?: boolean; // default: true
  status?: string; // "active" | "inactive" | "archived" (default: "active")
}
```

### UpdateProductRequest

Semua field optional, hanya kirim field yang ingin diupdate:

```typescript
interface UpdateProductRequest {
  name?: string; // min:3, max:200
  barcode?: string; // max:100
  description?: string;
  price?: number; // min:1
  cost?: number; // min:0
  category_id?: string;
  taxable?: boolean;
  status?: string; // "active" | "inactive" | "archived"
}
```

### ProductImageRequest

```typescript
interface ProductImageRequest {
  url: string; // Required, url, max:500
  thumbnail_url?: string; // url, max:500
  order?: number; // Display order
  alt?: string; // max:200
  size?: number; // File size in bytes
  width?: number; // Image width in pixels
  height?: number; // Image height in pixels
  mime_type?: string; // max:50
}
```

### ProductStockRequest

```typescript
interface ProductStockRequest {
  warehouse_id: string; // Required
  quantity: number; // Required, min:0
  reserved?: number; // min:0 (default: 0)
  min_stock?: number; // min:0 (default: 0)
  max_stock?: number; // min:0 (default: 0)
}
```

---

## Error Codes

| Error Code                       | HTTP Status | Description                                             |
| -------------------------------- | ----------- | ------------------------------------------------------- |
| `VALIDATION_ERROR`               | 400         | Data yang dikirim tidak valid                           |
| `UNAUTHORIZED`                   | 401         | Token autentikasi tidak valid atau telah kedaluwarsa    |
| `FORBIDDEN`                      | 403         | Tidak memiliki akses ke resource ini                    |
| `PRODUCT_NOT_FOUND`              | 404         | Produk tidak ditemukan                                  |
| `PRODUCT_IMAGE_NOT_FOUND`        | 404         | Gambar produk tidak ditemukan                           |
| `PRODUCT_STOCK_NOT_FOUND`        | 404         | Stok produk tidak ditemukan                             |
| `WAREHOUSE_NOT_FOUND`            | 404         | Gudang tidak ditemukan                                  |
| `DUPLICATE_VALUE`                | 409         | SKU atau barcode sudah digunakan                        |
| `STOCK_ALREADY_EXISTS`           | 409         | Stok untuk product + warehouse sudah ada                |
| `PRODUCT_DOES_NOT_TRACK_STOCK`   | 400         | Produk tidak mengaktifkan tracking stok                 |
| `INVALID_RESERVED_QUANTITY`      | 400         | Reserved quantity tidak boleh lebih besar dari quantity |
| `DUPLICATE_WAREHOUSE_IN_REQUEST` | 400         | Duplicate warehouse dalam bulk create request           |
| `INTERNAL_SERVER_ERROR`          | 500         | Terjadi kesalahan pada server                           |

---

## Examples

### cURL Examples

#### 1. Create Product

```bash
curl -X POST https://api.gipos.id/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop ASUS ROG",
    "sku": "LAP-ASUS-ROG-001",
    "barcode": "1234567890123",
    "description": "Laptop gaming high performance",
    "price": 15000000,
    "cost": 12000000,
    "category_id": "1",
    "taxable": true,
    "track_stock": true,
    "status": "active"
  }'
```

#### 2. Get Product by ID

```bash
curl -X GET https://api.gipos.id/api/v1/products/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. List Products with Filters

```bash
curl -X GET "https://api.gipos.id/api/v1/products?status=active&category_id=1&sort_by=price&sort_order=asc&page=1&per_page=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Create Product Image

```bash
curl -X POST https://api.gipos.id/api/v1/products/1/images \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/product1.jpg",
    "thumbnail_url": "https://example.com/product1-thumb.jpg",
    "order": 0,
    "alt": "Laptop ASUS ROG - Main Image"
  }'
```

#### 5. Create Product Stock

```bash
curl -X POST https://api.gipos.id/api/v1/products/1/stocks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "warehouse_id": "1",
    "quantity": 50,
    "reserved": 5,
    "min_stock": 10,
    "max_stock": 200
  }'
```

#### 6. Get Product Total Stock

```bash
curl -X GET https://api.gipos.id/api/v1/products/1/stocks/total \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript/TypeScript Examples

#### Using Fetch API

```typescript
// Create Product
const createProduct = async (productData: CreateProductRequest) => {
  const response = await fetch("https://api.gipos.id/api/v1/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  const result = await response.json();
  return result;
};

// Get Product by ID
const getProduct = async (id: string) => {
  const response = await fetch(`https://api.gipos.id/api/v1/products/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();
  return result;
};

// List Products
const listProducts = async (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  category_id?: string;
  sort_by?: string;
  sort_order?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.per_page)
    queryParams.append("per_page", params.per_page.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.category_id)
    queryParams.append("category_id", params.category_id);
  if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

  const response = await fetch(
    `https://api.gipos.id/api/v1/products?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();
  return result;
};

// Create Product Image
const createProductImage = async (
  productId: string,
  imageData: ProductImageRequest
) => {
  const response = await fetch(
    `https://api.gipos.id/api/v1/products/${productId}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(imageData),
    }
  );

  const result = await response.json();
  return result;
};

// Create Product Stock
const createProductStock = async (
  productId: string,
  stockData: ProductStockRequest
) => {
  const response = await fetch(
    `https://api.gipos.id/api/v1/products/${productId}/stocks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stockData),
    }
  );

  const result = await response.json();
  return result;
};

// Get Product Total Stock
const getProductTotalStock = async (productId: string) => {
  const response = await fetch(
    `https://api.gipos.id/api/v1/products/${productId}/stocks/total`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();
  return result;
};
```

---

## Notes

1. **Multi-Tenant**: Semua endpoint secara otomatis ter-scope ke tenant yang sedang login berdasarkan token.

2. **SKU Uniqueness**: Field `sku` harus unik per tenant. Tidak boleh ada dua produk dengan SKU yang sama dalam satu tenant.

3. **Barcode Uniqueness**: Field `barcode` harus unik per tenant jika diisi. Barcode kosong (`""`) akan di-normalize menjadi `null`.

4. **Price & Cost**: Harga dan cost disimpan dalam **sen** (Rupiah \* 100). Contoh: Rp 50.000 disimpan sebagai `50000`.

5. **Track Stock**: Jika `track_stock = true`, produk dapat memiliki stok per gudang. Jika `false`, produk tidak dapat memiliki stok.

6. **Product Images**: Produk dapat memiliki multiple gambar. Urutan tampil ditentukan oleh field `order`.

7. **Product Stocks**: Stok produk disimpan per gudang. Satu produk dapat memiliki stok di multiple gudang. `reserved` quantity tidak boleh melebihi `quantity`.

8. **Soft Delete**: Delete produk menggunakan soft delete, data tidak benar-benar dihapus dari database.

9. **Status Values**: Status produk dapat berupa:

   - `active`: Produk aktif dan dapat dijual
   - `inactive`: Produk tidak aktif (tidak dapat dijual)
   - `archived`: Produk diarsipkan

10. **Sorting**: Field yang dapat digunakan untuk sorting:
    - `name`: Nama produk
    - `sku`: SKU produk
    - `price`: Harga produk
    - `created_at`: Tanggal dibuat
    - `updated_at`: Tanggal diupdate

---

**Last Updated**: 2025-11-16
