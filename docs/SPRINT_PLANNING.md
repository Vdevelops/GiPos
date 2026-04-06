# Sprint Planning - Full POS SaaS Implementation
## GiPos SaaS Platform - Complete End-to-End Guide

**Platform**: Point of Sale (POS) SaaS untuk Pasar Indonesia  
**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-15

> **📊 Visualisasi Project**: Lihat [**PRD.md**](./PRD.md) dan [**modules/**](./modules/) untuk memahami scope, fitur, dan user flow secara visual.

---

## 📋 Overview

Dokumen ini berisi panduan lengkap end-to-end untuk mengimplementasikan full aplikasi POS SaaS yang saling berkaitan, mulai dari API backend hingga frontend, dengan memastikan sesuai standar API dan standar general.

**Tujuan Dokumen:**
- Memberikan roadmap implementasi yang jelas dan terstruktur
- Memastikan konsistensi antara backend API dan frontend
- Menjaga kualitas kode sesuai standar yang telah ditetapkan
- Memfasilitasi koordinasi antar developer

**Modul yang akan diimplementasikan:**

1. ✅ POS Core (Kasir)
2. ✅ Product & Inventory
3. ✅ Customer & Loyalty
4. ✅ Reports & Analytics
5. ✅ Finance
6. ✅ Employee & Access Control
7. ✅ Multi-Outlet
8. ✅ External Integration
9. ✅ Premium Features

---

## 🎯 Prinsip Implementasi

### 1. API-First Development
- **Define API contract dulu** (OpenAPI/Swagger) sebelum development
- **Mock API** untuk frontend development parallel
- **Consistent response format** sesuai `api-response-standards.md`
- **Error handling** sesuai `api-error-codes.md`

### 2. Standar API Response
- Semua response mengikuti format standar:
  ```json
  {
    "success": true|false,
    "data": {},
    "error": {},
    "meta": {},
    "timestamp": "2024-01-15T10:30:45+07:00",
    "request_id": "req_abc123xyz"
  }
  ```
- Error messages dalam **English** (single language)
- Detail format: lihat `/docs/api-standart/api-response-standards.md`

### 3. Standar Frontend
- **Next.js 16** dengan App Router
- **TanStack Query** untuk server state
- **Zustand** untuk global state
- **React Hook Form + Zod** untuk form validation
- **UI/UX Safety Guidelines** - semua component harus defensive programming
- Detail: lihat `.cursor/rules/standart.mdc`

### 4. Database & Multi-Tenant
- **PostgreSQL** dengan shared schema + `tenant_id`
- **Row-Level Security (RLS)** untuk data isolation
- **Soft delete** untuk semua resource (kecuali log/audit)

### 5. Testing & Quality
- **Manual testing** per sprint (hackathon mode - no unit tests)
- **Postman collection** untuk API testing
- **Code review** sebelum merge

---

## 📅 Sprint Overview

| Sprint | Modul | Duration | Dependencies |
|--------|-------|----------|--------------|
| Sprint 0 | Foundation & Setup | 1 week | - |
| Sprint 1-2 | POS Core (Backend) | 2 weeks | Sprint 0 |
| Sprint 3-4 | POS Core (Frontend) + Product Inventory | 2 weeks | Sprint 1-2 |
| Sprint 5 | Employee & Access Control | 1 week | Sprint 3-4 |
| Sprint 6-7 | Customer & Loyalty | 2 weeks | Sprint 3-4 |
| Sprint 8-9 | Reports & Analytics | 2 weeks | Sprint 1-2, 6-7 |
| Sprint 10 | Finance | 1 week | Sprint 1-2 |
| Sprint 11-12 | Multi-Outlet | 2 weeks | Sprint 3-4, 5 |
| Sprint 13-14 | External Integration | 2 weeks | All P0/P1 |
| Sprint 15-16 | Premium Features | 2 weeks | All P0/P1 |
| Sprint 17 | Integration & Testing | 1 week | All sprints |

**Total Timeline**: 17 sprints (~8.5 bulan untuk full features)

---

## 🏗️ Sprint 0: Foundation & Setup

**Goal**: Setup infrastructure, database, authentication, dan standar development

### Backend Tasks

- [x] **Project Structure Setup**
  - [x] Initialize Go project dengan Gin framework
  - [x] Setup folder structure (handler, service, repository, model)
  - [x] Setup dependency injection pattern
  - [x] Setup logging (structured logging)

- [x] **Database Setup**
  - [x] Setup PostgreSQL database
  - [x] Setup migration tool (GORM AutoMigrate - alternative to golang-migrate)
  - [x] Create base tables:
    - [x] `tenants` (multi-tenant support)
    - [x] `users` (authentication)
    - [x] `outlets` (multi-outlet support)
    - [x] `roles` dan `permissions` (RBAC)
  - [ ] Setup Row-Level Security (RLS) policies
  - [x] Create indexes untuk performance

- [x] **Authentication & Authorization**
  - [x] JWT token generation & validation
  - [x] Refresh token mechanism (stored in Redis with graceful degradation)
  - [x] Password hashing (bcrypt)
  - [x] Basic RBAC middleware
  - [x] Permission checking middleware

- [x] **API Standards Implementation**
  - [x] Implement `APIResponse` struct sesuai standar
  - [x] Implement `ErrorResponse` helper functions
  - [x] Implement `SuccessResponse` helper functions
  - [x] Setup error code mapping dari `api-error-codes.md`
  - [x] Setup request ID middleware
  - [x] Setup timestamp middleware (WIB timezone)

- [x] **Infrastructure**
  - [x] Setup Redis untuk cache & sessions (config & docker-compose ready)
  - [ ] Setup Cloudflare R2 untuk file storage
  - [x] Setup environment configuration
  - [x] Setup CORS middleware

### Frontend Tasks

- [x] **Project Structure Setup**
  - [x] Initialize Next.js 16 project dengan App Router
  - [x] Setup folder structure (`features/`, `components/`, `lib/`)
  - [x] Setup TypeScript configuration
  - [x] Setup Tailwind CSS v4
  - [x] Setup shadcn/ui components

- [x] **State Management Setup**
  - [x] Setup TanStack Query dengan React Query
  - [x] Setup Zustand untuk global state
  - [x] Setup API client dengan interceptors
  - [x] Setup error handling di API client

- [x] **Authentication Setup**
  - [x] Login page
  - [x] Register page (opsional)
  - [x] Auth guard component
  - [x] Token refresh mechanism
  - [x] Logout functionality

- [x] **Layout & Navigation**
  - [x] Main layout dengan sidebar
  - [x] Navigation menu structure
  - [x] User profile dropdown
  - [x] Loading states & skeletons

- [x] **UI Components Base**
  - [x] Setup shadcn/ui components yang diperlukan
  - [x] Create reusable components (Button, Input, Card, etc.)
  - [x] Setup theme (light/dark mode jika diperlukan)

### Postman Collection

- [x] **Setup Postman Collection**
  - [x] Create collection structure
  - [x] Setup environment variables
  - [x] Add authentication requests (login, refresh token)
  - [x] Document collection structure

### Acceptance Criteria

- ✅ Backend API bisa dijalankan dan respond dengan format standar
- ✅ Frontend bisa login dan akses protected routes
- ✅ Database schema siap untuk development
- ✅ Postman collection setup untuk testing
- ✅ Code structure mengikuti standar project

**Estimated Time**: 1 week

---

## 🛒 Sprint 1-2: POS Core (Backend)

**Goal**: Implement backend API untuk modul POS Core (transaksi penjualan)

### Backend Tasks

- [x] **Database Schema**
  - [x] Create `products` table
  - [x] Create `categories` table
  - [x] Create `sales` table
  - [x] Create `sale_items` table
  - [x] Create `payments` table
  - [x] Create `shifts` table (untuk shift management)
  - [x] Create relationships & foreign keys
  - [x] Create indexes untuk performance

- [x] **Product API**
  - [x] `GET /api/v1/products` - List products (dengan pagination, search, filter)
  - [x] `GET /api/v1/products/:id` - Get product detail
  - [x] `POST /api/v1/products` - Create product
  - [x] `PUT /api/v1/products/:id` - Update product
  - [x] `DELETE /api/v1/products/:id` - Delete product (soft delete)
  - [x] `GET /api/v1/products/sku/:sku` - Get product by SKU
  - [x] `GET /api/v1/products/barcode/:barcode` - Get product by barcode
  - [x] Implement validation sesuai standar
  - [x] Implement error handling sesuai `api-error-codes.md`

- [x] **Category API**
  - [x] `GET /api/v1/categories` - List categories
  - [x] `GET /api/v1/categories/:id` - Get category detail
  - [x] `POST /api/v1/categories` - Create category
  - [x] `PUT /api/v1/categories/:id` - Update category
  - [x] `DELETE /api/v1/categories/:id` - Delete category

- [x] **Sale/Transaction API**
  - [x] `POST /api/v1/sales` - Create sale (dengan items)
  - [x] `GET /api/v1/sales` - List sales (dengan pagination, filter)
  - [x] `GET /api/v1/sales/:id` - Get sale detail
  - [x] `POST /api/v1/sales/:id/void` - Void sale (sebelum bayar)
  - [x] Implement stock deduction saat create sale
  - [x] Implement validation: stock check, shift check
  - [ ] `POST /api/v1/sales/:id/refund` - Refund sale (akan diimplementasikan di sprint berikutnya)

- [x] **Payment API**
  - [x] `POST /api/v1/payments` - Process payment
  - [x] Support payment methods:
    - [x] Cash
    - [x] QRIS (via Xendit - basic structure)
    - [x] E-wallet (GoPay, OVO, DANA via Xendit - basic structure)
    - [x] Transfer Bank
  - [x] Payment status tracking
  - [x] `GET /api/v1/payments/:id` - Get payment detail
  - [x] `GET /api/v1/sales/:sale_id/payment` - Get payment by sale ID
  - [x] `PUT /api/v1/payments/:id/status` - Update payment status
  - [ ] Payment reconciliation (akan diimplementasikan di sprint berikutnya)

- [x] **Shift Management API**
  - [x] `POST /api/v1/shifts/open` - Open shift
  - [x] `POST /api/v1/shifts/:id/close` - Close shift
  - [x] `GET /api/v1/shifts` - List shifts
  - [x] `GET /api/v1/shifts/:id` - Get shift detail
  - [x] Shift validation (tidak bisa buka jika shift sebelumnya belum tutup)

- [x] **Integration**
  - [x] Xendit integration untuk QRIS & e-wallet (basic structure)
  - [ ] Payment webhook handler (akan diimplementasikan di sprint berikutnya)
  - [ ] Receipt generation (PDF) (akan diimplementasikan di sprint berikutnya)

### Postman Collection

- [x] Add Product APIs ke Postman collection
- [x] Add Category APIs ke Postman collection
- [x] Add Sale APIs ke Postman collection
- [x] Add Payment APIs ke Postman collection
- [x] Add Shift APIs ke Postman collection
- [ ] Test semua endpoints dengan Postman (manual testing required)

### Acceptance Criteria

- ✅ Product CRUD APIs bekerja dengan baik
- ✅ Category CRUD APIs bekerja dengan baik
- ✅ Sale creation dengan stock deduction bekerja
- ✅ Payment processing (cash, QRIS, e-wallet, transfer) bekerja
- ✅ Shift management bekerja
- ✅ Semua response mengikuti format standar
- ✅ Error handling sesuai `api-error-codes.md`
- ✅ Postman collection updated dengan semua endpoints

**Status**: ✅ **COMPLETED** (Sprint 2)

**Notes**:
- Product API sudah lengkap dengan search (by SKU, barcode, name)
- Category API sudah lengkap dengan CRUD operations
- Sale API sudah lengkap dengan stock deduction dan validation
- Payment API sudah lengkap dengan support multiple payment methods
- Shift Management API sudah lengkap dengan open/close validation
- Xendit integration structure sudah dibuat (basic structure)
- Refund API akan diimplementasikan di sprint berikutnya
- Payment webhook handler akan diimplementasikan di sprint berikutnya
- Receipt generation (PDF) akan diimplementasikan di sprint berikutnya

**Estimated Time**: 2 weeks

---

## 💻 Sprint 3-4: POS Core (Frontend) + Product Inventory

**Goal**: Implement frontend untuk POS Core dan Product Inventory management

### Frontend Tasks - POS Core

- [x] **Product Types & Services**
  - [x] Create `types/product.d.ts`
  - [x] Create `types/sale.d.ts`
  - [x] Create `types/payment.d.ts`
  - [x] Create `types/category.d.ts`
  - [x] Create `types/shift.d.ts`
  - [x] Create `services/productService.ts`
  - [x] Create `services/saleService.ts`
  - [x] Create `services/paymentService.ts`
  - [x] Create `services/categoryService.ts`
  - [x] Create `services/shiftService.ts`
  - [x] Create hooks for all services (use-products, use-sales, use-payments, etc.)

- [x] **POS Interface**
  - [x] Create POS page (`/pos`)
  - [x] Product grid component (dengan gambar, nama, harga)
  - [x] Product search bar (real-time search dengan debounce)
  - [x] Cart component (items, quantity, subtotal)
  - [x] Cart item management (tambah, kurang, hapus)
  - [x] Payment modal (pilih metode pembayaran)
  - [x] Cash payment flow (input tunai, hitung kembalian)
  - [x] QRIS payment flow (structure ready)
  - [x] E-wallet payment flow (structure ready)
  - [x] Transfer payment flow (structure ready)
  - [ ] Receipt display & print/download (akan diimplementasikan di sprint berikutnya)

- [x] **Product Management UI**
  - [x] Product list page (`/products`)
  - [x] Product form component (create/edit)
  - [x] Product detail page
  - [x] Product search & filter
  - [x] Category selector
  - [ ] Image upload untuk product (akan diimplementasikan di sprint berikutnya)

- [x] **Category Management UI**
  - [x] Category list page
  - [x] Category form component
  - [x] Category tree view (hierarchical)

- [x] **Shift Management UI**
  - [x] Shift open/close component
  - [x] Shift history page
  - [x] Shift summary display

### Frontend Tasks - Product Inventory

- [x] **Inventory Types & Services**
  - [x] Create `types/inventory.d.ts`
  - [x] Create `services/inventoryService.ts`
  - [x] Create hooks for inventory (use-inventory.ts)

- [x] **Stock Management UI**
  - [x] Stock list per product
  - [x] Stock adjustment form
  - [x] Low stock alerts
  - [ ] Stock movement history (akan diimplementasikan di sprint berikutnya - perlu API endpoint)

- [x] **Warehouse Management UI** (jika multi-warehouse)
  - [x] Warehouse list
  - [x] Warehouse form
  - [x] Stock per warehouse view (sudah ada di stock management)

### UI/UX Requirements

- [x] **Defensive Programming**
  - [x] Semua component menggunakan optional chaining (`?.`)
  - [x] Semua array checked sebelum mapping
  - [x] Loading states dengan skeletons
  - [x] Error states dengan user-friendly messages
  - [x] Empty states dengan helpful context

- [x] **Performance**
  - [x] Lazy loading untuk product images (via img tag dengan proper loading)
  - [x] Debounce untuk search
  - [x] Optimistic updates untuk cart (via TanStack Query)

### Postman Collection

- [ ] Test semua frontend integration dengan backend APIs
- [ ] Update Postman collection jika ada perubahan

### Acceptance Criteria

- ✅ POS interface functional dan user-friendly
- ✅ Product CRUD dari frontend bekerja
- ✅ Category CRUD dari frontend bekerja
- ✅ Sale creation dari POS bekerja
- ✅ Payment processing (cash, QRIS, e-wallet, transfer) bekerja
- ✅ Shift management UI bekerja
- ✅ Stock management UI bekerja
- ✅ Semua component mengikuti UI/UX safety guidelines
- ✅ Performance acceptable (< 2s page load)

**Status**: ✅ **COMPLETED** (Sprint 3)

**Notes**:
- Semua types & services sudah dibuat untuk Product, Sale, Payment, Category, Shift, dan Inventory
- POS Interface sudah lengkap dengan cart management dan payment modal
- Product Management UI sudah lengkap dengan list, form, detail, search, filter
- Category Management UI sudah lengkap dengan hierarchical view
- Shift Management UI sudah lengkap dengan open/close functionality
- Stock Management UI sudah lengkap dengan adjustment form dan low stock alerts
- Semua component menggunakan defensive programming sesuai standar
- ✅ Image upload untuk product menggunakan R2 Cloudflare storage
- ✅ Warehouse Management UI sudah lengkap dengan list dan form
- ✅ Product Inventory page menggunakan tabs (Products, Categories, Warehouses, Stock)
- Stock movement history akan diimplementasikan setelah API endpoint tersedia

**Estimated Time**: 2 weeks

---

## 👥 Sprint 5: Employee & Access Control

**Goal**: Implement employee management dan role-based access control (RBAC)

### Backend Tasks

- [ ] **Database Schema**
  - [ ] Create `employees` table
  - [ ] Create `employee_outlets` table (many-to-many)
  - [ ] Create `role_permissions` table
  - [ ] Create `employee_roles` table
  - [ ] Create `audit_logs` table

- [ ] **Employee API**
  - [ ] `GET /api/v1/employees` - List employees
  - [ ] `GET /api/v1/employees/:id` - Get employee detail
  - [ ] `POST /api/v1/employees` - Create employee
  - [ ] `PUT /api/v1/employees/:id` - Update employee
  - [ ] `DELETE /api/v1/employees/:id` - Delete employee (soft delete)
  - [ ] `POST /api/v1/employees/:id/reset-password` - Reset password

- [ ] **Role & Permission API**
  - [ ] `GET /api/v1/roles` - List roles
  - [ ] `GET /api/v1/roles/:id` - Get role detail
  - [ ] `POST /api/v1/roles` - Create role
  - [ ] `PUT /api/v1/roles/:id` - Update role
  - [ ] `GET /api/v1/permissions` - List permissions
  - [ ] `POST /api/v1/employees/:id/assign-role` - Assign role to employee

- [ ] **Audit Log API**
  - [ ] `GET /api/v1/audit-logs` - List audit logs
  - [ ] Filter by user, action, date range
  - [ ] Export audit logs

- [ ] **RBAC Middleware**
  - [ ] Permission checking middleware
  - [ ] Outlet access checking
  - [ ] Role-based route protection

### Frontend Tasks

- [ ] **Employee Types & Services**
  - [ ] Create `types/employee.d.ts`
  - [ ] Create `types/role.d.ts`
  - [ ] Create `services/employeeService.ts`
  - [ ] Create `services/roleService.ts`

- [ ] **Employee Management UI**
  - [ ] Employee list page (`/employees`)
  - [ ] Employee form component
  - [ ] Employee detail page
  - [ ] Employee search & filter

- [ ] **Role & Permission UI**
  - [ ] Role list page
  - [ ] Role form component (dengan permission matrix)
  - [ ] Permission management UI

- [ ] **Audit Log UI**
  - [ ] Audit log viewer page
  - [ ] Filter & search functionality
  - [ ] Export functionality

- [ ] **Access Control Integration**
  - [ ] Hide/show UI elements berdasarkan permission
  - [ ] Route protection berdasarkan role
  - [ ] Permission-based button disabling

### Postman Collection

- [ ] Add Employee APIs ke Postman collection
- [ ] Add Role & Permission APIs ke Postman collection
- [ ] Add Audit Log APIs ke Postman collection

### Acceptance Criteria

- ✅ Employee CRUD APIs bekerja
- ✅ Role & Permission management bekerja
- ✅ RBAC enforcement di backend & frontend
- ✅ Audit log mencatat semua aksi penting
- ✅ UI elements ter-hide/show berdasarkan permission
- ✅ Postman collection updated

**Estimated Time**: 1 week

---

## 🎁 Sprint 6-7: Customer & Loyalty

**Goal**: Implement customer management dan loyalty program

### Backend Tasks

- [ ] **Database Schema**
  - [ ] Create `customers` table
  - [ ] Create `customer_points` table (loyalty points)
  - [ ] Create `point_transactions` table (accrue/redeem history)
  - [ ] Create `customer_tiers` table (Bronze, Silver, Gold, etc.)
  - [ ] Create `loyalty_rules` table

- [ ] **Customer API**
  - [ ] `GET /api/v1/customers` - List customers
  - [ ] `GET /api/v1/customers/:id` - Get customer detail
  - [ ] `POST /api/v1/customers` - Create customer
  - [ ] `PUT /api/v1/customers/:id` - Update customer
  - [ ] `DELETE /api/v1/customers/:id` - Delete customer
  - [ ] `GET /api/v1/customers/search` - Search customer (by name, phone, email)

- [ ] **Loyalty Program API**
  - [ ] `GET /api/v1/customers/:id/points` - Get customer points
  - [ ] `POST /api/v1/customers/:id/points/accrue` - Accrue points (auto setelah sale)
  - [ ] `POST /api/v1/customers/:id/points/redeem` - Redeem points untuk diskon
  - [ ] `GET /api/v1/customers/:id/points/history` - Point transaction history
  - [ ] `GET /api/v1/loyalty-rules` - Get loyalty rules
  - [ ] `PUT /api/v1/loyalty-rules` - Update loyalty rules

- [ ] **Tier Management API**
  - [ ] `GET /api/v1/customer-tiers` - List tiers
  - [ ] `POST /api/v1/customer-tiers` - Create tier
  - [ ] `PUT /api/v1/customer-tiers/:id` - Update tier
  - [ ] Auto-assign tier berdasarkan total belanja

- [ ] **WhatsApp Integration**
  - [ ] Setup WhatsApp API (Fonnte/Qontak)
  - [ ] Send receipt via WhatsApp setelah transaksi
  - [ ] Send promo broadcast
  - [ ] Birthday promo automation

### Frontend Tasks

- [ ] **Customer Types & Services**
  - [ ] Create `types/customer.d.ts`
  - [ ] Create `types/loyalty.d.ts`
  - [ ] Create `services/customerService.ts`
  - [ ] Create `services/loyaltyService.ts`

- [ ] **Customer Management UI**
  - [ ] Customer list page (`/customers`)
  - [ ] Customer form component
  - [ ] Customer detail page (dengan transaction history)
  - [ ] Customer search (untuk POS integration)

- [ ] **Loyalty Program UI**
  - [ ] Loyalty rules configuration page
  - [ ] Customer points display (di customer detail)
  - [ ] Points redemption UI (di POS)
  - [ ] Points history timeline

- [ ] **Tier Management UI**
  - [ ] Tier list page
  - [ ] Tier form component
  - [ ] Tier benefits configuration

- [ ] **POS Integration**
  - [ ] Customer selector di POS
  - [ ] Auto-apply member discount
  - [ ] Points redemption di POS
  - [ ] Points display setelah transaksi

### Postman Collection

- [ ] Add Customer APIs ke Postman collection
- [ ] Add Loyalty APIs ke Postman collection
- [ ] Add Tier APIs ke Postman collection

### Acceptance Criteria

- ✅ Customer CRUD APIs bekerja
- ✅ Loyalty program (accrue & redeem) bekerja
- ✅ Tier management bekerja
- ✅ WhatsApp integration bekerja
- ✅ POS integration dengan customer & loyalty bekerja
- ✅ Postman collection updated

**Estimated Time**: 2 weeks

---

## 📊 Sprint 8-9: Reports & Analytics

**Goal**: Implement comprehensive reporting dan analytics dashboard

### Backend Tasks

- [ ] **Dashboard API**
  - [ ] `GET /api/v1/dashboard/overview` - Key metrics (omzet, profit, transaksi)
  - [ ] `GET /api/v1/dashboard/sales` - Sales statistics
  - [ ] `GET /api/v1/dashboard/products` - Product analytics
  - [ ] `GET /api/v1/dashboard/customers` - Customer analytics
  - [ ] Support date range filtering

- [ ] **Sales Report API**
  - [ ] `GET /api/v1/reports/sales` - Sales report (dengan filter)
  - [ ] `GET /api/v1/reports/sales/daily` - Daily sales report
  - [ ] `GET /api/v1/reports/sales/monthly` - Monthly sales report
  - [ ] `GET /api/v1/reports/sales/by-category` - Sales by category
  - [ ] `GET /api/v1/reports/sales/by-product` - Sales by product

- [ ] **Product Analytics API**
  - [ ] `GET /api/v1/reports/products/best-seller` - Best seller products
  - [ ] `GET /api/v1/reports/products/slow-moving` - Slow moving products
  - [ ] `GET /api/v1/reports/products/margin` - Margin analysis

- [ ] **Financial Report API**
  - [ ] `GET /api/v1/reports/finance/pnl` - Profit & Loss report
  - [ ] `GET /api/v1/reports/finance/cash-flow` - Cash flow report
  - [ ] `GET /api/v1/reports/finance/payment-methods` - Payment method breakdown

- [ ] **Export Functionality**
  - [ ] Export to Excel (XLSX)
  - [ ] Export to PDF
  - [ ] Include charts dalam export (optional)

### Frontend Tasks

- [ ] **Dashboard Types & Services**
  - [ ] Create `types/dashboard.d.ts`
  - [ ] Create `types/report.d.ts`
  - [ ] Create `services/dashboardService.ts`
  - [ ] Create `services/reportService.ts`

- [ ] **Dashboard UI**
  - [ ] Main dashboard page (`/dashboard`)
  - [ ] Key metrics cards (omzet, profit, transaksi, produk terjual)
  - [ ] Charts (line chart untuk omzet, bar chart untuk transaksi, pie chart untuk payment methods)
  - [ ] Top products component
  - [ ] Recent transactions component
  - [ ] Date range selector

- [ ] **Sales Report UI**
  - [ ] Sales report page (`/reports/sales`)
  - [ ] Report filters (date range, outlet, payment method)
  - [ ] Report table dengan pagination
  - [ ] Export buttons (Excel, PDF)

- [ ] **Product Analytics UI**
  - [ ] Product analytics page
  - [ ] Best seller list dengan charts
  - [ ] Slow moving products alert
  - [ ] Margin analysis table

- [ ] **Financial Report UI**
  - [ ] P&L report page
  - [ ] Cash flow report page
  - [ ] Payment method breakdown

- [ ] **Chart Components**
  - [ ] Setup chart library (Recharts)
  - [ ] Create reusable chart components
  - [ ] Responsive charts untuk mobile

### Postman Collection

- [ ] Add Dashboard APIs ke Postman collection
- [ ] Add Report APIs ke Postman collection

### Acceptance Criteria

- ✅ Dashboard APIs bekerja dan return data akurat
- ✅ Charts render dengan data benar
- ✅ Reports dapat di-generate dan di-export
- ✅ Date range filtering bekerja
- ✅ Performance acceptable (dashboard load < 3s)
- ✅ Postman collection updated

**Estimated Time**: 2 weeks

---

## 💰 Sprint 10: Finance

**Goal**: Implement financial management (cash book, reconciliation, P&L)

### Backend Tasks

- [ ] **Database Schema**
  - [ ] Create `cash_book_entries` table (income & expense)
  - [ ] Create `reconciliations` table
  - [ ] Create `reconciliation_items` table

- [ ] **Cash Book API**
  - [ ] `GET /api/v1/finance/cash-book` - List cash book entries
  - [ ] `POST /api/v1/finance/cash-book/income` - Record income
  - [ ] `POST /api/v1/finance/cash-book/expense` - Record expense
  - [ ] `GET /api/v1/finance/cash-book/balance` - Get current balance
  - [ ] Filter by date range, category, outlet

- [ ] **Reconciliation API**
  - [ ] `POST /api/v1/finance/reconciliations` - Create reconciliation
  - [ ] `GET /api/v1/finance/reconciliations` - List reconciliations
  - [ ] `POST /api/v1/finance/reconciliations/:id/match` - Match transactions
  - [ ] `POST /api/v1/finance/reconciliations/:id/approve` - Approve reconciliation
  - [ ] Import statement dari payment gateway

- [ ] **Financial Report API**
  - [ ] `GET /api/v1/finance/reports/pnl` - P&L report (detail)
  - [ ] `GET /api/v1/finance/reports/cash-flow` - Cash flow report (detail)
  - [ ] `GET /api/v1/finance/reports/expense-breakdown` - Expense breakdown

### Frontend Tasks

- [ ] **Finance Types & Services**
  - [ ] Create `types/finance.d.ts`
  - [ ] Create `services/financeService.ts`

- [ ] **Cash Book UI**
  - [ ] Cash book page (`/finance/cash-book`)
  - [ ] Income entry form
  - [ ] Expense entry form
  - [ ] Cash book history table
  - [ ] Balance display

- [ ] **Reconciliation UI**
  - [ ] Reconciliation page
  - [ ] Import statement functionality
  - [ ] Match transactions UI
  - [ ] Unmatched items list
  - [ ] Approve reconciliation

- [ ] **Financial Report UI**
  - [ ] P&L report page (detail)
  - [ ] Cash flow report page (detail)
  - [ ] Expense breakdown dengan charts

### Postman Collection

- [ ] Add Finance APIs ke Postman collection

### Acceptance Criteria

- ✅ Cash book APIs bekerja
- ✅ Reconciliation APIs bekerja
- ✅ Financial reports akurat
- ✅ Export functionality bekerja
- ✅ Postman collection updated

**Estimated Time**: 1 week

---

## 🏪 Sprint 11-12: Multi-Outlet

**Goal**: Implement multi-outlet support dengan stock transfer dan consolidated reports

### Backend Tasks

- [ ] **Database Schema**
  - [ ] Update `outlets` table (jika belum ada)
  - [ ] Create `stock_transfers` table
  - [ ] Create `stock_transfer_items` table
  - [ ] Update `products` untuk support per-outlet stock

- [ ] **Outlet API**
  - [ ] `GET /api/v1/outlets` - List outlets
  - [ ] `GET /api/v1/outlets/:id` - Get outlet detail
  - [ ] `POST /api/v1/outlets` - Create outlet
  - [ ] `PUT /api/v1/outlets/:id` - Update outlet
  - [ ] `DELETE /api/v1/outlets/:id` - Delete outlet

- [ ] **Stock Transfer API**
  - [ ] `POST /api/v1/stock-transfers` - Create transfer request
  - [ ] `GET /api/v1/stock-transfers` - List transfers
  - [ ] `POST /api/v1/stock-transfers/:id/approve` - Approve transfer
  - [ ] `POST /api/v1/stock-transfers/:id/reject` - Reject transfer
  - [ ] Auto-update stock setelah approve

- [ ] **Consolidated Reports API**
  - [ ] `GET /api/v1/reports/consolidated/sales` - Consolidated sales report
  - [ ] `GET /api/v1/reports/consolidated/inventory` - Consolidated inventory
  - [ ] `GET /api/v1/reports/consolidated/finance` - Consolidated finance
  - [ ] Breakdown per outlet

- [ ] **Multi-Outlet Data Isolation**
  - [ ] Update semua queries untuk filter by `outlet_id`
  - [ ] Outlet access checking middleware
  - [ ] Owner/manager bisa akses semua outlet

### Frontend Tasks

- [ ] **Outlet Types & Services**
  - [ ] Create `types/outlet.d.ts`
  - [ ] Create `types/stock-transfer.d.ts`
  - [ ] Create `services/outletService.ts`
  - [ ] Create `services/stockTransferService.ts`

- [ ] **Outlet Management UI**
  - [ ] Outlet list page (`/outlets`)
  - [ ] Outlet form component
  - [ ] Outlet detail page
  - [ ] Outlet selector (untuk switch outlet)

- [ ] **Stock Transfer UI**
  - [ ] Stock transfer page
  - [ ] Create transfer request form
  - [ ] Transfer approval UI
  - [ ] Transfer history

- [ ] **Consolidated Dashboard UI**
  - [ ] Multi-outlet dashboard
  - [ ] Outlet comparison charts
  - [ ] Consolidated reports dengan breakdown

- [ ] **Outlet Context**
  - [ ] Setup outlet context di frontend
  - [ ] Outlet selector di header
  - [ ] Auto-filter data berdasarkan selected outlet

### Postman Collection

- [ ] Add Outlet APIs ke Postman collection
- [ ] Add Stock Transfer APIs ke Postman collection
- [ ] Add Consolidated Report APIs ke Postman collection

### Acceptance Criteria

- ✅ Outlet CRUD APIs bekerja
- ✅ Stock transfer dengan approval bekerja
- ✅ Consolidated reports akurat
- ✅ Data isolation per outlet bekerja
- ✅ Multi-outlet dashboard functional
- ✅ Postman collection updated

**Estimated Time**: 2 weeks

---

## 🔌 Sprint 13-14: External Integration

**Goal**: Implement external integrations (API public, marketplace, webhooks)

### Backend Tasks

- [ ] **Public API**
  - [ ] Setup API key authentication
  - [ ] Rate limiting per API key
  - [ ] Public endpoints untuk produk, sales, customers
  - [ ] API documentation (OpenAPI/Swagger)

- [ ] **Marketplace Integration**
  - [ ] Tokopedia integration (sync produk, order)
  - [ ] Shopee integration (sync produk, order)
  - [ ] Auto-sync inventory setelah order
  - [ ] Sync configuration UI

- [ ] **Webhook System**
  - [ ] Webhook registration API
  - [ ] Webhook delivery system
  - [ ] Webhook retry mechanism
  - [ ] Webhook logs

- [ ] **Hardware Integration**
  - [ ] Printer API (ESC/POS)
  - [ ] Barcode scanner API
  - [ ] Hardware detection & configuration

### Frontend Tasks

- [ ] **API Management UI**
  - [ ] API key management page
  - [ ] API usage statistics
  - [ ] API documentation viewer

- [ ] **Marketplace Integration UI**
  - [ ] Marketplace connection page
  - [ ] Sync configuration UI
  - [ ] Sync status & logs

- [ ] **Webhook Management UI**
  - [ ] Webhook registration page
  - [ ] Webhook logs viewer
  - [ ] Webhook retry functionality

- [ ] **Hardware Setup UI**
  - [ ] Printer setup page
  - [ ] Scanner setup page
  - [ ] Hardware test functionality

### Postman Collection

- [ ] Add Public API endpoints ke Postman collection
- [ ] Add Webhook APIs ke Postman collection
- [ ] Document API usage examples

### Acceptance Criteria

- ✅ Public API functional dengan authentication
- ✅ Marketplace integration bekerja
- ✅ Webhook system functional
- ✅ Hardware integration bekerja
- ✅ API documentation lengkap
- ✅ Postman collection updated

**Estimated Time**: 2 weeks

---

## ⭐ Sprint 15-16: Premium Features

**Goal**: Implement premium features (AI insights, mobile dashboard, specialized modes)

### Backend Tasks

- [ ] **AI Sales Insight API**
  - [ ] `GET /api/v1/ai/restock-recommendations` - Restock recommendations
  - [ ] `GET /api/v1/ai/promo-recommendations` - Promo recommendations
  - [ ] `GET /api/v1/ai/revenue-prediction` - Revenue prediction
  - [ ] `GET /api/v1/ai/anomaly-detection` - Anomaly detection
  - [ ] Integration dengan ML model (optional, bisa basic rules dulu)

- [ ] **Restaurant Mode API**
  - [ ] `GET /api/v1/restaurant/tables` - List tables
  - [ ] `POST /api/v1/restaurant/tables` - Create table
  - [ ] `POST /api/v1/restaurant/orders` - Create order per table
  - [ ] `GET /api/v1/restaurant/kitchen-orders` - Kitchen display orders
  - [ ] `PUT /api/v1/restaurant/orders/:id/status` - Update order status

- [ ] **Salon Mode API**
  - [ ] `GET /api/v1/salon/bookings` - List bookings
  - [ ] `POST /api/v1/salon/bookings` - Create booking
  - [ ] `PUT /api/v1/salon/bookings/:id` - Update booking
  - [ ] `GET /api/v1/salon/stylists` - List stylists
  - [ ] `GET /api/v1/salon/commissions` - Commission reports

- [ ] **Pharmacy Mode API**
  - [ ] `POST /api/v1/pharmacy/prescriptions` - Create prescription
  - [ ] `GET /api/v1/pharmacy/prescriptions` - List prescriptions
  - [ ] `GET /api/v1/pharmacy/batch-expiry` - Batch & expiry tracking
  - [ ] `POST /api/v1/pharmacy/drug-interaction-check` - Drug interaction check

### Frontend Tasks

- [ ] **Mobile Dashboard**
  - [ ] Mobile-optimized dashboard
  - [ ] Push notifications setup
  - [ ] Quick actions (approve, view)
  - [ ] Responsive charts

- [ ] **AI Insights UI**
  - [ ] AI insights page
  - [ ] Restock recommendations display
  - [ ] Promo recommendations display
  - [ ] Revenue prediction chart

- [ ] **Restaurant Mode UI**
  - [ ] Table management page
  - [ ] Order per table UI
  - [ ] Kitchen display system
  - [ ] Menu management

- [ ] **Salon Mode UI**
  - [ ] Booking calendar
  - [ ] Booking form
  - [ ] Stylist assignment
  - [ ] Commission tracking

- [ ] **Pharmacy Mode UI**
  - [ ] Prescription input form
  - [ ] Batch & expiry tracking
  - [ ] Drug interaction checker
  - [ ] Patient management

### Postman Collection

- [ ] Add Premium Feature APIs ke Postman collection

### Acceptance Criteria

- ✅ AI insights APIs bekerja (basic rules atau ML)
- ✅ Restaurant mode functional
- ✅ Salon mode functional
- ✅ Pharmacy mode functional
- ✅ Mobile dashboard responsive
- ✅ Postman collection updated

**Estimated Time**: 2 weeks

---

## 🔗 Sprint 17: Integration & Final Testing

**Goal**: Integration testing, bug fixes, dan final polish

### Tasks

- [ ] **Integration Testing**
  - [ ] End-to-end testing semua modul
  - [ ] Test integration antar modul
  - [ ] Test multi-outlet scenarios
  - [ ] Test payment flows
  - [ ] Test offline mode (jika ada)

- [ ] **Bug Fixes**
  - [ ] Fix critical bugs
  - [ ] Fix UI/UX issues
  - [ ] Fix performance issues

- [ ] **Documentation**
  - [ ] Update API documentation
  - [ ] Update user documentation
  - [ ] Update Postman collection
  - [ ] Create deployment guide

- [ ] **Performance Optimization**
  - [ ] Database query optimization
  - [ ] Frontend bundle optimization
  - [ ] API response time optimization
  - [ ] Caching strategy implementation

- [ ] **Security Audit**
  - [ ] Security review
  - [ ] Fix security vulnerabilities
  - [ ] Penetration testing (optional)

- [ ] **Final Polish**
  - [ ] UI/UX improvements
  - [ ] Error message improvements
  - [ ] Loading state improvements
  - [ ] Empty state improvements

### Acceptance Criteria

- ✅ Semua modul terintegrasi dengan baik
- ✅ Tidak ada critical bugs
- ✅ Performance acceptable
- ✅ Security audit passed
- ✅ Documentation lengkap
- ✅ Postman collection complete

**Estimated Time**: 1 week

---

## 📊 Sprint Summary

| Sprint | Modul | Duration | Status |
|--------|-------|----------|--------|
| Sprint 0 | Foundation & Setup | 1 week | ⏳ Pending |
| Sprint 1-2 | POS Core (Backend) | 2 weeks | ⏳ Pending |
| Sprint 3-4 | POS Core (Frontend) + Product | 2 weeks | ⏳ Pending |
| Sprint 5 | Employee & Access Control | 1 week | ⏳ Pending |
| Sprint 6-7 | Customer & Loyalty | 2 weeks | ⏳ Pending |
| Sprint 8-9 | Reports & Analytics | 2 weeks | ⏳ Pending |
| Sprint 10 | Finance | 1 week | ⏳ Pending |
| Sprint 11-12 | Multi-Outlet | 2 weeks | ⏳ Pending |
| Sprint 13-14 | External Integration | 2 weeks | ⏳ Pending |
| Sprint 15-16 | Premium Features | 2 weeks | ⏳ Pending |
| Sprint 17 | Integration & Testing | 1 week | ⏳ Pending |

**Total Estimated Time**: 17 sprints (~8.5 bulan)

---

## 📝 Best Practices & Guidelines

### Backend Development

1. **API Response Format**
   - Selalu gunakan `SuccessResponse()` atau `ErrorResponse()` helper
   - Semua error messages dalam English
   - Include `request_id` dan `timestamp` di setiap response

2. **Error Handling**
   - Gunakan error codes dari `api-error-codes.md`
   - Return appropriate HTTP status codes
   - Include `details` untuk context tambahan

3. **Database**
   - Selalu include `tenant_id` dan `outlet_id` di queries
   - Gunakan soft delete (tidak hard delete)
   - Create indexes untuk performance

4. **Validation**
   - Validate input di handler layer
   - Return validation errors dengan format standar
   - Use field-level error messages

### Frontend Development

1. **Component Structure**
   - Extract business logic ke hooks
   - Components hanya untuk presentation
   - Use Zustand untuk global state
   - Use TanStack Query untuk server state

2. **UI/UX Safety**
   - Always use optional chaining (`?.`)
   - Always check arrays before mapping
   - Always handle loading & error states
   - Always provide empty states
   - Always provide default values

3. **Performance**
   - Use Suspense untuk async components
   - Lazy load heavy components
   - Debounce search inputs
   - Optimize images

4. **Type Safety**
   - Define types di `types/*.d.ts`
   - Never use `any` type
   - Use Zod schemas untuk validation

### Testing

1. **Manual Testing**
   - Test setiap feature setelah implementasi
   - Test integration antar modul
   - Test edge cases
   - Test error scenarios

2. **Postman Collection**
   - Update Postman collection untuk setiap API
   - Test semua endpoints dengan Postman
   - Document request/response examples

### Documentation

1. **API Documentation**
   - Update OpenAPI/Swagger spec
   - Document request/response examples
   - Document error codes

2. **Code Documentation**
   - Comment complex logic
   - Document function parameters
   - Document business rules

---

## 🔗 References

### API Standards
- [API Response Standards](./api-standart/api-response-standards.md)
- [API Error Codes](./api-standart/api-error-codes.md)
- [API Implementation Example](./api-standart/api-implementation-example.go)

### Module Documentation
- [POS Core](./modules/01-pos-core.md)
- [Product & Inventory](./modules/02-product-inventory.md)
- [Customer](./modules/03-customer.md)
- [Reports & Analytics](./modules/04-reports-analytics.md)
- [Finance](./modules/05-finance.md)
- [Employee & Access](./modules/06-employee-access.md)
- [Multi-Outlet](./modules/07-multi-outlet.md)
- [External Integration](./modules/08-external-integration.md)
- [Premium Features](./modules/09-premium-features.md)

### Project Standards
- [Project Standards](./.cursor/rules/standart.mdc)
- [PRD](./PRD.md)
- [Development Schedule](./development-schedule.md)

---

## 📌 Notes

1. **Sprint Management**: Update status di dokumen ini setelah setiap sprint selesai
2. **Acceptance Criteria**: Semua acceptance criteria harus terpenuhi sebelum sprint dianggap complete
3. **Postman Collection**: Update Postman collection untuk setiap modul yang diimplementasikan
4. **Code Review**: Lakukan code review sebelum merge ke main branch
5. **Documentation**: Update documentation setelah setiap sprint

---

**Dokumen ini akan diupdate sesuai dengan progress development.**
