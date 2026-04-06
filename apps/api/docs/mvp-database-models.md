# MVP Database Models Documentation
## GiPos SaaS Platform - Phase 1 MVP

**Versi**: 1.0  
**Status**: Draft  
**Last Updated**: 2025

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Model Architecture](#model-architecture)
3. [Core Models](#core-models)
4. [Master Data Models](#master-data-models)
5. [Sales Models](#sales-models)
6. [Finance Models](#finance-models)
7. [Indexing Strategy](#indexing-strategy)
8. [Relationships](#relationships)
9. [System Flow](#system-flow)
10. [Best Practices](#best-practices)

---

## Overview

Dokumen ini menjelaskan struktur database model untuk **Phase 1 MVP** yang mencakup:
- **POS Core**: Transaksi penjualan dasar
- **Product Inventory**: Manajemen produk dan stok
- **Employee Access**: Manajemen user dan shift

### Model Summary

| Category | Models | Count |
|----------|--------|-------|
| **Core** | Tenant, User | 2 |
| **Master Data** | Outlet, Category, Product, ProductImage, Warehouse, ProductStock, StockMovement | 7 |
| **Sales** | Shift, Sale, SaleItem | 3 |
| **Finance** | Payment | 1 |
| **Total** | | **13** |

---

## Model Architecture

### Base Models

Semua model menggunakan base models dari `core/shared/models`:

#### BaseModel
```go
type BaseModel struct {
    ID        string    // UUID primary key
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt // Soft delete
}
```

#### TenantModel
```go
type TenantModel struct {
    BaseModel
    TenantID string // Multi-tenant support
}
```

### Multi-Tenant Strategy

- **Shared Schema**: Semua tenant dalam satu database
- **Row-Level Security**: Filter berdasarkan `tenant_id` di semua query
- **Composite Indexes**: Index pada `(tenant_id, field)` untuk performa optimal

---

## Core Models

### 1. Tenant

**File**: `internal/core/shared/models/tenant.go`

**Purpose**: Representasi organisasi/bisnis dalam sistem multi-tenant

**Key Fields**:
- `Code`: Kode unik tenant
- `Email`: Email unik untuk login
- `Plan`: Paket langganan (free, basic, pro, business, enterprise)
- `Status`: Status tenant (active, suspended, cancelled)

**Indexes**:
- `code`: Unique index
- `email`: Unique index
- `status`: Index untuk filtering
- `plan`: Index untuk filtering

**Relationships**:
- Has many: Users, Outlets, Products, Sales, dll

---

### 2. User

**File**: `internal/auth/data/models/user.go`

**Purpose**: User/employee dalam sistem

**Key Fields**:
- `Email`: Email unik per tenant
- `Password`: Password hash (never returned in JSON)
- `Role`: system_admin, tenant_owner, manager, cashier, accountant, supervisor
- `Status`: active, inactive, suspended
- `OutletID`: Nullable, untuk user yang terikat ke outlet tertentu

**Indexes**:
- `idx_user_tenant_email`: Composite (tenant_id, email) - Unique per tenant
- `idx_user_tenant_outlet`: Composite (tenant_id, outlet_id)
- `name`: Index untuk search
- `phone`: Index untuk search
- `role`: Index untuk filtering
- `status`: Index untuk filtering

**Relationships**:
- Belongs to: Tenant
- Belongs to: Outlet (optional)
- Has many: Sales (as cashier), Shifts

---

## Master Data Models

### 3. Outlet

**File**: `internal/master-data/outlet/data/models/outlet.go`

**Purpose**: Representasi outlet/cabang fisik

**Key Fields**:
- `Code`: Kode unik per tenant
- `Name`: Nama outlet
- `IsMain`: Flag outlet utama
- `Status`: active, inactive

**Indexes**:
- `idx_outlet_tenant_code`: Composite (tenant_id, code) - Unique per tenant
- `idx_outlet_tenant_name`: Composite (tenant_id, name)
- `idx_outlet_status`: Index untuk filtering
- `idx_outlet_main`: Index untuk mencari outlet utama

**Relationships**:
- Belongs to: Tenant
- Has many: Users, Products, Sales, Shifts, Warehouses

---

### 4. Category

**File**: `internal/master-data/products/data/models/category.go`

**Purpose**: Kategori produk

**Key Fields**:
- `Name`: Nama kategori
- `Slug`: URL-friendly slug
- `ParentID`: Untuk nested categories (nullable)
- `SortOrder`: Untuk ordering

**Indexes**:
- `idx_category_tenant_name`: Composite (tenant_id, name)
- `idx_category_tenant_outlet`: Composite (tenant_id, outlet_id)
- `idx_category_slug`: Index untuk URL lookup
- `idx_category_parent`: Index untuk parent relationship
- `idx_category_sort`: Index untuk ordering
- `idx_category_status`: Index untuk filtering

**Relationships**:
- Belongs to: Tenant, Outlet (optional)
- Belongs to: Category (parent, optional)
- Has many: Products, Categories (children)

---

### 5. Product

**File**: `internal/master-data/products/data/models/product.go`

**Purpose**: Produk/item dalam sistem

**Key Fields**:
- `SKU`: Stock Keeping Unit (unique per tenant)
- `Barcode`: Barcode (EAN, UPC, etc.)
- `Price`: Harga dalam sen (Rupiah * 100)
- `Cost`: Harga pokok dalam sen
- `TrackStock`: Flag untuk tracking stok
- `Taxable`: Flag untuk PPN

**Indexes**:
- `idx_product_tenant_outlet`: Composite (tenant_id, outlet_id)
- `idx_product_category`: Index untuk filtering by category
- `idx_product_sku`: Index untuk SKU lookup (unique per tenant)
- `idx_product_barcode`: Index untuk barcode scanning
- `idx_product_name`: Index untuk search
- `idx_product_status`: Index untuk filtering

**Relationships**:
- Belongs to: Tenant, Outlet (optional), Category (optional)
- Has many: ProductImages, ProductStocks, SaleItems

---

### 6. ProductImage

**File**: `internal/master-data/products/data/models/product_image.go`

**Purpose**: Gambar produk

**Key Fields**:
- `ProductID`: Foreign key ke Product
- `URL`: Full image URL
- `ThumbnailURL`: Thumbnail URL
- `Order`: Display order

**Indexes**:
- `idx_product_image_product`: Index untuk product lookup
- `idx_product_image_order`: Index untuk ordering

**Relationships**:
- Belongs to: Tenant, Product

---

### 7. Warehouse

**File**: `internal/master-data/products/data/models/warehouse.go`

**Purpose**: Gudang/lokasi penyimpanan

**Key Fields**:
- `Code`: Kode unik per tenant
- `Name`: Nama gudang
- `Type`: main, secondary, virtual
- `IsDefault`: Flag gudang default untuk outlet

**Indexes**:
- `idx_warehouse_tenant_code`: Composite (tenant_id, code) - Unique per tenant
- `idx_warehouse_tenant_outlet`: Composite (tenant_id, outlet_id)
- `idx_warehouse_name`: Index untuk search
- `idx_warehouse_status`: Index untuk filtering
- `idx_warehouse_default`: Index untuk mencari default warehouse

**Relationships**:
- Belongs to: Tenant, Outlet (optional)
- Has many: ProductStocks, StockMovements

---

### 8. ProductStock

**File**: `internal/master-data/products/data/models/product_stock.go`

**Purpose**: Stok produk per gudang

**Key Fields**:
- `ProductID`: Foreign key ke Product
- `WarehouseID`: Foreign key ke Warehouse
- `Quantity`: Jumlah stok saat ini
- `Reserved`: Jumlah stok yang di-reserve (untuk pending sales)
- `MinStock`: Minimum stock level (untuk alerts)
- `MaxStock`: Maximum stock level

**Indexes**:
- `idx_product_stock_product`: Index untuk product lookup
- `idx_product_stock_warehouse`: Index untuk warehouse lookup
- Composite unique: (tenant_id, product_id, warehouse_id) - One record per product per warehouse

**Relationships**:
- Belongs to: Tenant, Product, Warehouse

---

### 9. StockMovement

**File**: `internal/master-data/products/data/models/stock_movement.go`

**Purpose**: Tracking pergerakan stok

**Key Fields**:
- `ProductID`: Foreign key ke Product
- `WarehouseID`: Foreign key ke Warehouse
- `Type`: in, out, adjust
- `Quantity`: Jumlah (positive untuk in, negative untuk out)
- `BalanceBefore`: Stok sebelum movement
- `BalanceAfter`: Stok setelah movement
- `ReferenceType`: sale, purchase, adjustment, transfer, opname, manual
- `ReferenceID`: ID dari reference (sale_id, etc.)

**Indexes**:
- `idx_stock_movement_product`: Index untuk product lookup
- `idx_stock_movement_warehouse`: Index untuk warehouse lookup
- `idx_stock_movement_type`: Index untuk filtering by type
- `idx_stock_movement_ref`: Composite (reference_type, reference_id)
- `idx_stock_movement_date`: Index untuk date range queries

**Relationships**:
- Belongs to: Tenant, Product, Warehouse

---

## Sales Models

### 10. Shift

**File**: `internal/sales/data/models/shift.go`

**Purpose**: Shift kasir

**Key Fields**:
- `OutletID`: Foreign key ke Outlet
- `UserID`: Foreign key ke User (cashier)
- `ShiftNumber`: Nomor shift unik
- `Status`: open, closed
- `OpeningCash`: Uang kas awal (dalam sen)
- `ClosingCash`: Uang kas akhir (dalam sen)
- `TotalSales`: Total penjualan (dalam sen)
- `TotalTransactions`: Jumlah transaksi

**Indexes**:
- `idx_shift_tenant_outlet`: Composite (tenant_id, outlet_id)
- `idx_shift_user`: Index untuk user lookup
- `idx_shift_number`: Index untuk shift number lookup
- `idx_shift_status`: Index untuk filtering
- `idx_shift_opening_time`: Index untuk date range queries
- `idx_shift_closing_time`: Index untuk date range queries

**Relationships**:
- Belongs to: Tenant, Outlet, User
- Has many: Sales

---

### 11. Sale

**File**: `internal/sales/data/models/sale.go`

**Purpose**: Transaksi penjualan

**Key Fields**:
- `OutletID`: Foreign key ke Outlet
- `ShiftID`: Foreign key ke Shift (nullable)
- `InvoiceNumber`: Nomor invoice unik
- `CustomerID`: Foreign key ke Customer (nullable)
- `CashierID`: Foreign key ke User (cashier)
- `Subtotal`: Subtotal sebelum diskon dan pajak (dalam sen)
- `DiscountAmount`: Total diskon (dalam sen)
- `TaxAmount`: Total pajak PPN (dalam sen)
- `Total`: Total akhir (dalam sen)
- `PaymentMethod`: cash, qris, e_wallet, transfer, card
- `PaymentStatus`: pending, completed, failed, refunded
- `Status`: pending, completed, cancelled, refunded

**Indexes**:
- `idx_sale_tenant_outlet`: Composite (tenant_id, outlet_id)
- `idx_sale_shift`: Index untuk shift lookup
- `idx_sale_invoice`: Index untuk invoice number lookup (unique)
- `idx_sale_customer`: Index untuk customer lookup
- `idx_sale_cashier`: Index untuk cashier lookup
- `idx_sale_total`: Index untuk amount filtering
- `idx_sale_payment_method`: Index untuk payment method filtering
- `idx_sale_payment_status`: Index untuk payment status filtering
- `idx_sale_status`: Index untuk status filtering
- `idx_sale_completed_at`: Index untuk date range queries
- `idx_sale_paid_at`: Index untuk date range queries

**Relationships**:
- Belongs to: Tenant, Outlet, Shift (optional), User (cashier), Customer (optional)
- Has many: SaleItems
- Has one: Payment (via SaleID)

---

### 12. SaleItem

**File**: `internal/sales/data/models/sale_item.go`

**Purpose**: Item dalam transaksi penjualan

**Key Fields**:
- `SaleID`: Foreign key ke Sale
- `ProductID`: Foreign key ke Product
- `ProductName`: Snapshot nama produk saat transaksi
- `ProductSKU`: Snapshot SKU saat transaksi
- `Quantity`: Jumlah item
- `UnitPrice`: Harga per unit saat transaksi (dalam sen)
- `DiscountAmount`: Diskon untuk item ini (dalam sen)
- `TaxAmount`: Pajak untuk item ini (dalam sen)
- `Subtotal`: Subtotal sebelum diskon dan pajak (dalam sen)
- `Total`: Total akhir untuk item ini (dalam sen)

**Indexes**:
- `idx_sale_item_sale`: Index untuk sale lookup
- `idx_sale_item_product`: Index untuk product lookup

**Relationships**:
- Belongs to: Tenant, Sale, Product

---

## Finance Models

### 13. Payment

**File**: `internal/finance/data/models/payment.go`

**Purpose**: Transaksi pembayaran

**Key Fields**:
- `SaleID`: Foreign key ke Sale
- `Method`: cash, qris, e_wallet, transfer, card
- `Amount`: Jumlah pembayaran (dalam sen)
- `Status`: pending, completed, failed, cancelled, refunded
- `Gateway`: xendit, midtrans, etc.
- `GatewayID`: ID transaksi dari payment gateway
- `QRCodeURL`: URL QR code (untuk QRIS)
- `QRISExpiredAt`: Waktu expired QRIS
- `EWalletType`: gopay, ovo, shopee_pay, dana
- `PaymentLink`: URL payment link

**Indexes**:
- `idx_payment_sale`: Index untuk sale lookup
- `idx_payment_method`: Index untuk payment method filtering
- `idx_payment_status`: Index untuk status filtering
- `idx_payment_amount`: Index untuk amount filtering
- `idx_payment_gateway_id`: Index untuk gateway ID lookup
- `idx_payment_paid_at`: Index untuk date range queries

**Relationships**:
- Belongs to: Tenant, Sale

---

## Indexing Strategy

### Composite Indexes

Composite indexes digunakan untuk:
1. **Multi-tenant filtering**: `(tenant_id, field)` untuk filter per tenant
2. **Unique constraints**: `(tenant_id, code)` untuk unique per tenant
3. **Common queries**: `(tenant_id, outlet_id, status)` untuk filtering

### Single Column Indexes

Single column indexes digunakan untuk:
1. **Foreign keys**: Semua foreign key di-index
2. **Search fields**: name, email, phone, barcode, SKU
3. **Status fields**: status, payment_status, dll
4. **Date fields**: created_at, completed_at, paid_at untuk date range queries

### Index Naming Convention

- Composite indexes: `idx_{table}_{field1}_{field2}`
- Single indexes: `idx_{table}_{field}`

---

## Relationships

### Entity Relationship Diagram

```
Tenant
  ├── Users (1:N)
  ├── Outlets (1:N)
  └── Categories (1:N)

Outlet
  ├── Users (1:N)
  ├── Products (1:N)
  ├── Warehouses (1:N)
  ├── Shifts (1:N)
  └── Sales (1:N)

User
  ├── Shifts (1:N)
  └── Sales (1:N, as cashier)

Category
  ├── Products (1:N)
  └── Categories (1:N, parent-child)

Product
  ├── ProductImages (1:N)
  ├── ProductStocks (1:N)
  ├── StockMovements (1:N)
  └── SaleItems (1:N)

Warehouse
  ├── ProductStocks (1:N)
  └── StockMovements (1:N)

Shift
  └── Sales (1:N)

Sale
  ├── SaleItems (1:N)
  └── Payment (1:1)

SaleItem
  └── Product (N:1)
```

### Foreign Key Constraints

**Important**: GORM tidak otomatis membuat foreign key constraints. Untuk production, disarankan:
1. Tambahkan foreign key constraints via migration
2. Atau gunakan database-level constraints

**Example Migration**:
```sql
ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE SET NULL;

ALTER TABLE sales 
ADD CONSTRAINT fk_sales_outlet 
FOREIGN KEY (outlet_id) REFERENCES outlets(id) 
ON DELETE RESTRICT;
```

---

## System Flow

### 1. Sale Transaction Flow

```
1. Cashier opens Shift
   └── Shift created with status "open"

2. Cashier creates Sale
   └── Sale created with status "pending"
   └── SaleItems added to Sale

3. For each SaleItem:
   └── Check ProductStock availability
   └── Reserve stock (if track_stock = true)
   └── Create StockMovement (type: "out", reference: sale)

4. Customer pays
   └── Payment created with status "pending"
   └── If QRIS: Generate QR code
   └── If Cash: Mark as completed immediately

5. Payment completed
   └── Payment status → "completed"
   └── Sale status → "completed"
   └── Sale paid_at updated
   └── StockMovement finalized
   └── ProductStock quantity updated

6. Cashier closes Shift
   └── Shift status → "closed"
   └── Calculate totals
   └── Update Shift statistics
```

### 2. Stock Management Flow

```
1. Product created
   └── ProductStock created for default warehouse (quantity: 0)

2. Stock adjustment
   └── Create StockMovement (type: "adjust")
   └── Update ProductStock quantity
   └── Update balance_before and balance_after

3. Sale transaction
   └── Create StockMovement (type: "out", reference: sale)
   └── Update ProductStock quantity (decrease)

4. Purchase/Transfer in
   └── Create StockMovement (type: "in", reference: purchase/transfer)
   └── Update ProductStock quantity (increase)
```

### 3. Shift Management Flow

```
1. Cashier opens shift
   └── Check if previous shift is closed
   └── Create Shift with opening_cash
   └── Shift status → "open"

2. During shift
   └── Sales linked to Shift
   └── Shift statistics updated in real-time

3. Cashier closes shift
   └── Calculate expected_cash (opening_cash + cash_sales)
   └── Input closing_cash
   └── Calculate difference
   └── Shift status → "closed"
```

---

## Best Practices

### 1. Multi-Tenant Queries

**Always filter by tenant_id**:
```go
// ✅ Good
db.Where("tenant_id = ?", tenantID).Find(&products)

// ❌ Bad - Missing tenant filter
db.Find(&products)
```

### 2. Currency Handling

**Store as integer (sen)**:
- Store: `50000` (Rp 50.000)
- Display: Format dengan titik pemisah ribuan
- Calculation: Semua perhitungan dalam sen

### 3. Soft Delete

**Use soft delete for important data**:
- Sales, Payments: Soft delete (can restore)
- Products, Categories: Soft delete (can restore)
- StockMovements: Hard delete (audit trail)

### 4. Audit Trail

**Track who created/updated**:
- `created_by`: User ID yang membuat
- `updated_by`: User ID yang update
- `created_at`, `updated_at`: Timestamps

### 5. Stock Movement

**Always create StockMovement before updating ProductStock**:
1. Create StockMovement dengan balance_before
2. Update ProductStock quantity
3. Update StockMovement dengan balance_after

### 6. Invoice Number Generation

**Generate unique invoice numbers**:
- Format: `INV-{YYYYMMDD}-{OUTLET_CODE}-{SEQUENCE}`
- Example: `INV-20240115-001-0001`
- Ensure uniqueness per tenant

### 7. Index Usage

**Query optimization**:
- Use indexed fields in WHERE clauses
- Use composite indexes for multi-column filters
- Avoid full table scans

### 8. Data Integrity

**Validation**:
- Check stock availability before sale
- Validate payment amount matches sale total
- Ensure shift is open before creating sale
- Validate user has access to outlet

---

## Migration Order

**Important**: Migrate models in this order to avoid foreign key errors:

1. Core: Tenant
2. Auth: User
3. Master Data: Outlet
4. Master Data: Category, Warehouse
5. Master Data: Product
6. Master Data: ProductImage, ProductStock
7. Sales: Shift
8. Sales: Sale
9. Sales: SaleItem
10. Finance: Payment
11. Master Data: StockMovement (last, references many tables)

---

## Next Steps (Phase 2+)

Model yang akan ditambahkan di phase berikutnya:
- **Customer**: Customer management
- **LoyaltyPointHistory**: Loyalty program tracking
- **PromoCode**: Promo code management
- **StockOpname**: Stock opname/audit
- **StockTransfer**: Transfer stok antar outlet
- **CashBook**: Cash book entries
- **Reconciliation**: Payment reconciliation

---

**Dokumen ini akan diupdate sesuai dengan perkembangan development dan feedback dari team.**

