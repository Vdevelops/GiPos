# PRD: Modul Integrasi Eksternal

**Modul ID**: MOD-008  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P2 (Medium)

---

## 📋 Ringkasan

Modul Integrasi Eksternal menyediakan API publik, integrasi dengan marketplace (Tokopedia, Shopee), integrasi pembayaran (Xendit, Midtrans), dan integrasi dengan hardware (printer, barcode scanner). Modul ini memungkinkan platform GiPos terhubung dengan ekosistem eksternal dan memberikan fleksibilitas untuk developer dan integrator.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Menyediakan API publik untuk integrasi pihak ketiga
- Mengintegrasikan dengan marketplace untuk sync inventory
- Mengintegrasikan dengan payment gateway untuk pembayaran
- Mengintegrasikan dengan hardware untuk operasional

### Value Proposition
- **Terbuka**: API dokumentasi lengkap untuk developer
- **Terintegrasi**: Sync otomatis dengan marketplace
- **Fleksibel**: Support berbagai payment gateway
- **Kompatibel**: Support berbagai hardware POS

---

## 👥 User Personas

### Primary User: Developer/Integrator
- **Kebutuhan**: API dokumentasi, webhook, integrasi custom
- **Skill Level**: Advanced
- **Context**: Desktop, butuh dokumentasi teknis

### Secondary User: Owner/Pemilik Bisnis
- **Kebutuhan**: Connect ke marketplace, setup payment gateway
- **Skill Level**: Basic-Intermediate
- **Context**: Web dashboard, butuh setup wizard

### Tertiary User: Kasir
- **Kebutuhan**: Gunakan hardware (printer, scanner) tanpa setup kompleks
- **Skill Level**: Basic
- **Context**: Mobile/tablet, butuh plug & play

---

## 🎨 User Stories

### Epic 1: API Publik
- **US-001**: Sebagai developer, saya ingin akses API untuk create/read/update produk, agar integrasi dengan sistem lain
- **US-002**: Sebagai developer, saya ingin akses API untuk create transaksi, agar integrasi dengan aplikasi custom
- **US-003**: Sebagai developer, saya ingin webhook untuk notifikasi event (transaksi, stok update), agar real-time sync
- **US-004**: Sebagai developer, saya ingin dokumentasi API yang lengkap dengan contoh, agar mudah integrasi

### Epic 2: Integrasi Marketplace
- **US-005**: Sebagai owner, saya ingin sync produk ke Tokopedia/Shopee, agar inventory ter-update otomatis
- **US-006**: Sebagai owner, saya ingin sync order dari marketplace ke POS, agar semua order terpusat
- **US-007**: Sebagai owner, saya ingin auto-update stok setelah order dari marketplace, agar tidak oversell
- **US-008**: Sebagai owner, saya ingin kirim nota/invoice ke marketplace setelah order, agar pelanggan dapat bukti

### Epic 3: Integrasi Payment Gateway
- **US-009**: Sebagai owner, saya ingin connect ke Xendit untuk QRIS & e-wallet, agar payment lokal
- **US-010**: Sebagai owner, saya ingin connect ke Midtrans sebagai backup, agar redundancy
- **US-011**: Sebagai sistem, saya ingin auto-reconcile payment dari gateway, agar data akurat
- **US-012**: Sebagai owner, saya ingin webhook untuk payment status update, agar real-time confirmation

### Epic 4: Integrasi Hardware
- **US-013**: Sebagai kasir, saya ingin connect printer Bluetooth untuk print receipt, agar operasional lancar
- **US-014**: Sebagai kasir, saya ingin connect barcode scanner untuk scan produk, agar cepat
- **US-015**: Sebagai owner, saya ingin setup hardware sekali, agar semua kasir bisa pakai
- **US-016**: Sebagai sistem, saya ingin auto-detect hardware yang terhubung, agar mudah setup

### Epic 5: Webhook & Events
- **US-017**: Sebagai developer, saya ingin subscribe webhook untuk event tertentu, agar dapat notifikasi real-time
- **US-018**: Sebagai developer, saya ingin retry mechanism untuk webhook yang gagal, agar reliability
- **US-019**: Sebagai developer, saya ingin webhook signature verification, agar security terjaga
- **US-020**: Sebagai owner, saya ingin lihat webhook logs untuk debugging, agar troubleshoot mudah

---

## 🔧 Functional Requirements

### FR-001: API Publik (REST API)
- **FR-001.1**: Authentication
  - API Key authentication
  - OAuth 2.0 (optional, untuk enterprise)
  - Rate limiting per API key
  - IP whitelist (optional)

- **FR-001.2**: Endpoints - Produk
  - `GET /api/v1/products` - List produk
  - `GET /api/v1/products/{id}` - Detail produk
  - `POST /api/v1/products` - Create produk
  - `PUT /api/v1/products/{id}` - Update produk
  - `DELETE /api/v1/products/{id}` - Delete produk
  - Filter, search, pagination

- **FR-001.3**: Endpoints - Transaksi
  - `GET /api/v1/sales` - List transaksi
  - `GET /api/v1/sales/{id}` - Detail transaksi
  - `POST /api/v1/sales` - Create transaksi
  - Filter by date, outlet, status

- **FR-001.4**: Endpoints - Pelanggan
  - `GET /api/v1/customers` - List pelanggan
  - `GET /api/v1/customers/{id}` - Detail pelanggan
  - `POST /api/v1/customers` - Create pelanggan
  - `PUT /api/v1/customers/{id}` - Update pelanggan

- **FR-001.5**: Endpoints - Stok
  - `GET /api/v1/inventory` - List stok
  - `GET /api/v1/inventory/{product_id}` - Stok per produk
  - `PUT /api/v1/inventory/{product_id}` - Update stok

- **FR-001.6**: Response Format
  - JSON format
  - Consistent error response
  - Pagination metadata
  - Versioning (v1, v2)

### FR-002: Integrasi Marketplace
- **FR-002.1**: Tokopedia Integration
  - Connect Tokopedia account (OAuth)
  - Sync produk (nama, harga, stok, gambar)
  - Sync order (auto-import order ke POS)
  - Update stok setelah order
  - Auto-generate invoice untuk order

- **FR-002.2**: Shopee Integration
  - Connect Shopee account (API key)
  - Sync produk
  - Sync order
  - Update stok
  - Auto-generate invoice

- **FR-002.3**: Shopify Integration (Optional)
  - Connect Shopify store
  - Sync produk
  - Sync order
  - Update stok

- **FR-002.4**: Sync Configuration
  - Set sync frequency (real-time, hourly, daily)
  - Map field (nama, harga, kategori)
  - Conflict resolution (marketplace vs POS)
  - Sync logs & error handling

### FR-003: Integrasi Payment Gateway
- **FR-003.1**: Xendit Integration
  - Connect Xendit account (API key)
  - QRIS payment
  - E-wallet (GoPay, OVO, DANA, LinkAja)
  - Virtual account
  - Recurring payment (subscription)
  - Webhook untuk payment status

- **FR-003.2**: Midtrans Integration
  - Connect Midtrans account (API key)
  - QRIS payment
  - E-wallet
  - Credit card (optional)
  - Webhook untuk payment status

- **FR-003.3**: Stripe Integration (Optional, International)
  - Connect Stripe account
  - Credit card payment
  - Recurring payment
  - Webhook untuk payment status

- **FR-003.4**: Payment Reconciliation
  - Auto-reconcile dari payment gateway
  - Match transaksi dengan payment
  - Flag unreconciled payments
  - Manual reconciliation

### FR-004: Integrasi Hardware
- **FR-004.1**: Printer Integration
  - Bluetooth thermal printer
  - USB thermal printer
  - Network printer (optional)
  - ESC/POS command support
  - Print receipt, invoice
  - Test print

- **FR-004.2**: Barcode Scanner Integration
  - USB barcode scanner
  - Bluetooth barcode scanner
  - Camera barcode scanner (mobile)
  - Auto-detect scanner
  - Support multiple barcode format (EAN-13, Code 128, QR)

- **FR-004.3**: Cash Drawer Integration
  - Trigger via printer (ESC/POS)
  - Auto-open saat transaksi tunai
  - Manual open button

- **FR-004.4**: Hardware Management
  - List connected devices
  - Test connection
  - Configure settings
  - Multi-device support (multiple printer, scanner)

### FR-005: Webhook & Events
- **FR-005.1**: Webhook Events
  - `sale.created` - Transaksi baru
  - `sale.completed` - Transaksi selesai
  - `sale.refunded` - Refund transaksi
  - `product.created` - Produk baru
  - `product.updated` - Produk di-update
  - `inventory.updated` - Stok di-update
  - `payment.completed` - Pembayaran selesai
  - `payment.failed` - Pembayaran gagal

- **FR-005.2**: Webhook Configuration
  - Register webhook URL
  - Select events to subscribe
  - Set retry policy (max retries, backoff)
  - Webhook secret (signature verification)

- **FR-005.3**: Webhook Delivery
  - HTTP POST dengan JSON payload
  - Signature header (HMAC SHA256)
  - Retry dengan exponential backoff
  - Delivery logs (success, failed, retry)

- **FR-005.4**: Webhook Logs
  - View webhook delivery history
  - Filter by event, status, date
  - Retry failed webhook
  - Export logs

### FR-006: API Documentation
- **FR-006.1**: API Reference
  - OpenAPI/Swagger specification
  - Interactive API docs (Swagger UI)
  - Endpoint documentation dengan contoh
  - Authentication guide

- **FR-006.2**: SDK & Libraries
  - JavaScript/TypeScript SDK (optional)
  - Python SDK (optional)
  - Code examples
  - Integration guides

- **FR-006.3**: Rate Limits & Quotas
  - Rate limit documentation
  - Quota per plan (Basic, Pro, Business, Enterprise)
  - Error handling guide

---

## 🎨 UI/UX Requirements

### API Dashboard Screen
```
┌─────────────────────────────────────────┐
│  API Integration                        │
│  ─────────────────────────────────────  │
│  API Key: [****************] [Copy]     │
│  [Regenerate] [View Documentation]      │
│                                          │
│  Rate Limits:                           │
│  Requests: 1,000 / 10,000 per day      │
│                                          │
│  Webhooks:                              │
│  [Add Webhook]                          │
│  URL | Events | Status | Last Delivery │
│  ...                                    │
└─────────────────────────────────────────┘
```

### Marketplace Integration Screen
```
┌─────────────────────────────────────────┐
│  Marketplace Integration                │
│  ─────────────────────────────────────  │
│  ┌──────────────┐ ┌──────────────┐    │
│  │ Tokopedia    │ │ Shopee        │    │
│  │ [Connect]    │ │ [Connect]     │    │
│  │ Status: ✓    │ │ Status: ✗     │    │
│  └──────────────┘ └──────────────┘    │
│                                          │
│  Sync Settings:                         │
│  Frequency: [Real-time ▼]              │
│  [Sync Now] [View Logs]                │
└─────────────────────────────────────────┘
```

### Payment Gateway Screen
```
┌─────────────────────────────────────────┐
│  Payment Gateway                        │
│  ─────────────────────────────────────  │
│  ┌──────────────┐ ┌──────────────┐    │
│  │ Xendit       │ │ Midtrans     │    │
│  │ [Configure]  │ │ [Configure]  │    │
│  │ Status: ✓    │ │ Status: ✗     │    │
│  └──────────────┘ └──────────────┘    │
│                                          │
│  Active Gateway: Xendit                 │
│  [Test Connection] [View Logs]         │
└─────────────────────────────────────────┘
```

### Hardware Setup Screen
```
┌─────────────────────────────────────────┐
│  Hardware Setup                         │
│  ─────────────────────────────────────  │
│  Printer:                               │
│  [Scan for Devices]                     │
│  ┌──────────────────────────────────┐   │
│  │ Bluetooth Printer - Epson TM-T20 │   │
│  │ Status: Connected                │   │
│  │ [Test Print] [Disconnect]        │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Barcode Scanner:                       │
│  ┌──────────────────────────────────┐   │
│  │ USB Scanner - Symbol LS2208      │   │
│  │ Status: Connected                │   │
│  │ [Test Scan] [Disconnect]         │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: API Security
- API key authentication (secure storage)
- Rate limiting (prevent abuse)
- IP whitelist (optional, enterprise)
- HTTPS only
- CORS configuration

### SEC-002: Webhook Security
- Webhook signature (HMAC SHA256)
- Secret key per webhook
- Verify signature sebelum process
- Rate limiting untuk webhook endpoint

### SEC-003: Data Privacy
- Mask sensitive data di API response
- PII encryption
- Audit log untuk API access
- Compliance dengan regulasi data

---

## 📊 Performance Requirements

### PERF-001: Response Time
- API response time: < 500ms (p95)
- Webhook delivery: < 2 detik
- Marketplace sync: < 5 detik per batch
- Hardware connection: < 1 detik

### PERF-002: Scalability
- Support hingga 10.000 API requests per hari per tenant
- Support hingga 100 webhook subscriptions per tenant
- Concurrent API requests: 100 per tenant

---

## 🧪 Acceptance Criteria

### AC-001: API Publik
- ✅ API key authentication berfungsi
- ✅ Endpoints return data benar
- ✅ Rate limiting enforced
- ✅ Dokumentasi lengkap

### AC-002: Marketplace Integration
- ✅ Connect ke Tokopedia/Shopee sukses
- ✅ Sync produk otomatis
- ✅ Sync order otomatis
- ✅ Update stok setelah order

### AC-003: Payment Gateway
- ✅ Connect ke Xendit/Midtrans sukses
- ✅ Payment processing berfungsi
- ✅ Webhook untuk status update
- ✅ Reconciliation otomatis

### AC-004: Hardware
- ✅ Printer terdeteksi dan terhubung
- ✅ Print receipt sukses
- ✅ Barcode scanner terdeteksi
- ✅ Scan produk berfungsi

---

## 🔗 Integrations

### INT-001: Marketplace APIs
- **Tokopedia**: Open API
- **Shopee**: Partner API
- **Shopify**: Admin API

### INT-002: Payment Gateway APIs
- **Xendit**: Payment API, Subscriptions API
- **Midtrans**: Core API, Snap API
- **Stripe**: Payment API, Billing API

### INT-003: Hardware Protocols
- **ESC/POS**: Thermal printer protocol
- **USB HID**: Barcode scanner protocol
- **Bluetooth**: Wireless devices

---

## 📈 Success Metrics

### Business Metrics
- **API Usage**: Jumlah API calls per bulan
- **Integration Adoption**: % tenant yang pakai integrasi
- **Webhook Delivery Rate**: % webhook yang sukses

### User Metrics
- **Time to Connect Marketplace**: Target < 5 menit
- **API Documentation Usage**: % developer yang akses docs
- **User Satisfaction**: > 4.5/5

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic REST API (produk, transaksi)
- Xendit integration (QRIS, e-wallet)
- Basic printer integration
- API documentation

### Phase 2: Enhanced (Week 5-8)
- Marketplace integration (Tokopedia, Shopee)
- Webhook system
- Midtrans integration (backup)
- Advanced API features

### Phase 3: Advanced (Week 9-12)
- SDK development (optional)
- Advanced webhook features
- Hardware auto-detection
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- API rate limit exceeded
- Webhook delivery failure
- Marketplace API downtime
- Hardware disconnection saat operasi

### Future Enhancements
- GraphQL API (optional)
- WebSocket untuk real-time updates
- More marketplace integrations (Lazada, Bukalapak)
- IoT device integration

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

