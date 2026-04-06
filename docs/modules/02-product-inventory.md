# PRD: Modul Produk & Inventori

**Modul ID**: MOD-002  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P0 (Critical)

---

## 📋 Ringkasan

Modul Produk & Inventori menyediakan fungsi lengkap untuk manajemen katalog produk, stok, dan inventori. Modul ini mendukung multi gudang, varian produk, tracking pergerakan stok, dan stock opname untuk memastikan akurasi inventori.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Memudahkan manajemen katalog produk yang terorganisir
- Memastikan stok selalu akurat dan up-to-date
- Memberikan visibility pergerakan stok
- Mencegah stockout dan overstock

### Value Proposition
- **Terorganisir**: Kategori, tag, dan filter untuk mudah menemukan produk
- **Akurat**: Real-time stock tracking dengan audit trail
- **Fleksibel**: Multi gudang, varian, dan satuan
- **Efisien**: Import/export Excel untuk bulk operations

---

## 👥 User Personas

### Primary User: Admin/Manager
- **Kebutuhan**: CRUD produk, manage stok, stock opname
- **Skill Level**: Intermediate
- **Context**: Desktop/web, butuh detail dan kontrol penuh

### Secondary User: Kasir
- **Kebutuhan**: Cari produk cepat, lihat stok tersedia
- **Skill Level**: Basic
- **Context**: Mobile/tablet, butuh cepat

---

## 🎨 User Stories

### Epic 1: Manajemen Produk
- **US-001**: Sebagai admin, saya ingin menambah produk baru dengan detail lengkap (nama, harga, stok, gambar), agar katalog lengkap
- **US-002**: Sebagai admin, saya ingin edit produk (harga, stok, deskripsi), agar data selalu update
- **US-003**: Sebagai admin, saya ingin hapus/nonaktifkan produk, agar katalog tidak berantakan
- **US-004**: Sebagai admin, saya ingin duplikasi produk, agar cepat buat produk serupa

### Epic 2: Kategori & Organisasi
- **US-005**: Sebagai admin, saya ingin buat kategori produk (hierarki), agar produk terorganisir
- **US-006**: Sebagai admin, saya ingin assign produk ke kategori, agar mudah dicari
- **US-007**: Sebagai admin, saya ingin filter produk by kategori, stok, harga, agar cepat temukan produk

### Epic 3: Varian & Satuan
- **US-008**: Sebagai admin, saya ingin buat varian produk (warna, ukuran), agar 1 produk punya multiple option
- **US-009**: Sebagai admin, saya ingin set satuan (pcs, kg, liter, pack), agar sesuai jenis produk
- **US-010**: Sebagai admin, saya ingin konversi satuan (1 pack = 12 pcs), agar fleksibel

### Epic 4: Stok & Multi Gudang
- **US-011**: Sebagai admin, saya ingin buat gudang/lokasi (utama, cabang A, cabang B), agar track stok per lokasi
- **US-012**: Sebagai admin, saya ingin lihat stok per produk per gudang, agar tahu distribusi stok
- **US-013**: Sebagai admin, saya ingin set stok minimum & maksimum, agar dapat notifikasi restock
- **US-014**: Sebagai admin, saya ingin transfer stok antar gudang, agar balance stok

### Epic 5: Stock Opname
- **US-015**: Sebagai admin, saya ingin buat stock opname (fisik count), agar verifikasi stok akurat
- **US-016**: Sebagai admin, saya ingin input hasil opname dan lihat selisih (selisih = fisik - sistem), agar tahu discrepancy
- **US-017**: Sebagai admin, saya ingin approve adjustment setelah opname, agar stok ter-update

### Epic 6: Tracking & History
- **US-018**: Sebagai admin, saya ingin lihat history pergerakan stok (masuk, keluar, transfer), agar audit trail jelas
- **US-019**: Sebagai admin, saya ingin lihat produk yang sering keluar (fast moving), agar tahu demand
- **US-020**: Sebagai admin, saya ingin lihat produk yang lama tidak bergerak (slow moving), agar bisa promo/clearance

### Epic 7: Import/Export
- **US-021**: Sebagai admin, saya ingin import produk dari Excel, agar bulk upload cepat
- **US-022**: Sebagai admin, saya ingin export produk ke Excel, agar backup atau edit offline
- **US-023**: Sebagai admin, saya ingin template Excel untuk import, agar format benar

---

## 🔧 Functional Requirements

### FR-001: CRUD Produk
- **FR-001.1**: Create produk
  - Nama produk (required, max 200 chars)
  - SKU/Barcode (unique, auto-generate atau manual)
  - Deskripsi (optional, rich text)
  - Harga jual (required, numeric)
  - Harga beli (optional, untuk margin calculation)
  - Gambar produk (multiple images, max 5)
  - Kategori (required, single atau multiple)
  - Status (aktif/nonaktif)
  - Taxable (PPN yes/no)

- **FR-001.2**: Read/List produk
  - Grid view dengan gambar, nama, harga, stok
  - List view (table) dengan semua detail
  - Search by nama, SKU, barcode
  - Filter by kategori, status, stok
  - Sort by nama, harga, stok, tanggal

- **FR-001.3**: Update produk
  - Edit semua field (kecuali SKU jika sudah ada transaksi)
  - Bulk update (harga, kategori, status)
  - History perubahan (audit log)

- **FR-001.4**: Delete/Deactivate produk
  - Soft delete (nonaktifkan, tidak hapus dari DB)
  - Validasi: tidak bisa hapus jika ada transaksi
  - Archive produk lama

### FR-002: Kategori Produk
- **FR-002.1**: Hierarki kategori (parent-child)
  - Contoh: Elektronik > Handphone > Smartphone
  - Max depth: 3 level
- **FR-002.2**: Icon/gambar kategori
- **FR-002.3**: Sort order kategori
- **FR-002.4**: Filter produk by kategori

### FR-003: Varian Produk
- **FR-003.1**: Varian attributes (warna, ukuran, model)
- **FR-003.2**: Kombinasi varian (contoh: Merah-S, Merah-M, Biru-S)
- **FR-003.3**: Harga per varian (bisa berbeda)
- **FR-003.4**: Stok per varian
- **FR-003.5**: SKU per varian (auto atau manual)

### FR-004: Satuan & Konversi
- **FR-004.1**: Satuan dasar (pcs, kg, liter, meter, pack)
- **FR-004.2**: Satuan jual (bisa berbeda dari dasar)
- **FR-004.3**: Konversi satuan
  - Contoh: 1 pack = 12 pcs
  - Contoh: 1 kg = 1000 gram
- **FR-004.4**: Harga per satuan (auto-calculate)

### FR-005: Multi Gudang
- **FR-005.1**: Create gudang/lokasi
  - Nama gudang
  - Alamat
  - Status (aktif/nonaktif)
- **FR-005.2**: Stok per produk per gudang
- **FR-005.3**: Total stok (sum semua gudang)
- **FR-005.4**: Transfer stok antar gudang
  - From gudang → To gudang
  - Quantity
  - Reason/notes
  - Approval (jika perlu)

### FR-006: Stok Minimum & Maksimum
- **FR-006.1**: Set stok min & max per produk
- **FR-006.2**: Notifikasi saat stok <= minimum
  - Email/WhatsApp ke admin
  - Dashboard alert
- **FR-006.3**: Notifikasi saat stok >= maksimum (overstock)
- **FR-006.4**: Reorder point calculation

### FR-007: Stock Opname
- **FR-007.1**: Create stock opname session
  - Pilih gudang
  - Pilih kategori/produk (all atau filter)
  - Tanggal opname
- **FR-007.2**: Input stok fisik (per produk)
  - Barcode scan untuk cepat
  - Manual input
- **FR-007.3**: Calculate selisih
  - Selisih = Stok fisik - Stok sistem
  - Selisih positif (lebih) atau negatif (kurang)
- **FR-007.4**: Approve & adjust
  - Review selisih
  - Approve untuk update stok sistem
  - Reject untuk re-count
- **FR-007.5**: History opname (audit trail)

### FR-008: Stock Movement Tracking
- **FR-008.1**: Record semua pergerakan stok
  - Masuk: Pembelian, retur, adjustment (+)
  - Keluar: Penjualan, retur ke supplier, adjustment (-)
  - Transfer: Antar gudang
- **FR-008.2**: History per produk
  - Timeline pergerakan
  - Filter by date range, type, gudang
- **FR-008.3**: Stock card (kartu stok)
  - Saldo awal
  - Masuk
  - Keluar
  - Saldo akhir

### FR-009: Import/Export
- **FR-009.1**: Export produk ke Excel
  - Format: Nama, SKU, Barcode, Harga, Stok, Kategori, dll
  - Filter export (by kategori, status)
- **FR-009.2**: Import produk dari Excel
  - Template download
  - Validasi data (required fields, format)
  - Preview sebelum import
  - Error handling (skip invalid rows atau stop)
- **FR-009.3**: Bulk update via Excel
  - Update harga, stok, kategori

---

## 🎨 UI/UX Requirements

### Product List Screen
```
┌─────────────────────────────────────────┐
│ [Search] [Filter] [Sort] [+ New]       │
├─────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │ Img  │ │ Img  │ │ Img  │             │
│ │ Name │ │ Name │ │ Name │             │
│ │ SKU  │ │ SKU  │ │ SKU  │             │
│ │ Rp   │ │ Rp   │ │ Rp   │             │
│ │ Stok │ │ Stok │ │ Stok │             │
│ └──────┘ └──────┘ └──────┘             │
│                                          │
│ [Load More / Pagination]                │
└─────────────────────────────────────────┘
```

### Product Detail/Form
```
┌─────────────────────────────────────────┐
│  Edit Produk                           │
│  ─────────────────────────────────────  │
│  Nama Produk*: [________________]       │
│  SKU: [AUTO-001] [Manual]              │
│  Barcode: [________________]           │
│  Kategori*: [Dropdown ▼]              │
│  Harga Jual*: Rp [________]             │
│  Harga Beli: Rp [________]             │
│  Stok: [________] (Gudang: [Dropdown])  │
│  Deskripsi: [Text Area]                │
│  Gambar: [Upload] [Preview]            │
│  Status: [○] Aktif [ ] Nonaktif        │
│                                          │
│  [Batal]              [Simpan]          │
└─────────────────────────────────────────┘
```

### Stock Opname Screen
```
┌─────────────────────────────────────────┐
│  Stock Opname - Gudang Utama           │
│  ─────────────────────────────────────  │
│  [Scan Barcode] atau [Pilih Produk]    │
│                                          │
│  Produk: [Nama]                         │
│  Stok Sistem: 50                        │
│  Stok Fisik: [____] ← Input            │
│  Selisih: +5                            │
│                                          │
│  [Simpan] [Next]                        │
│                                          │
│  Progress: 15/100 produk                │
│  [Selesai & Approve]                    │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: Data Validation
- SKU/Barcode harus unique
- Harga harus > 0
- Stok tidak boleh negatif (kecuali dengan approval)
- Validasi format barcode (EAN-13, Code 128, dll)

### SEC-002: Authorization
- Hanya admin/manager yang bisa create/edit/delete produk
- Kasir hanya bisa read (view produk & stok)
- Stock opname butuh approval supervisor

### SEC-003: Audit Trail
- Log semua perubahan (who, what, when)
- History stok pergerakan (untuk audit)
- Stock opname records (untuk compliance)

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Load product list (1000 produk): < 2 detik
- Search produk: < 500ms
- Save produk: < 1 detik
- Import Excel (1000 rows): < 10 detik

### PERF-002: Scalability
- Support hingga 10.000 produk per outlet
- Support hingga 10 gudang per outlet
- Concurrent users: 20 admin per outlet

---

## 🧪 Acceptance Criteria

### AC-001: Create Produk
- ✅ Form validation (required fields)
- ✅ SKU auto-generate atau manual
- ✅ Upload gambar (max 5, max 2MB each)
- ✅ Produk tersimpan dan muncul di list
- ✅ Stok default = 0

### AC-002: Stock Opname
- ✅ Bisa pilih gudang dan produk
- ✅ Input stok fisik
- ✅ Calculate selisih otomatis
- ✅ Approve update stok sistem
- ✅ History tersimpan

### AC-003: Import Excel
- ✅ Download template
- ✅ Upload Excel dengan validasi
- ✅ Preview data sebelum import
- ✅ Error report untuk invalid rows
- ✅ Produk ter-import ke sistem

---

## 🔗 Integrations

### INT-001: Barcode Scanner
- USB barcode scanner
- Bluetooth barcode scanner
- Camera barcode scanner (mobile)

### INT-002: Excel
- Export to Excel (XLSX)
- Import from Excel (XLSX)
- Template generation

### INT-003: Image Storage
- Cloudflare R2 untuk gambar produk
- Image optimization (resize, compress)
- CDN untuk fast loading

---

## 📈 Success Metrics

### Business Metrics
- **Product Catalog Size**: Rata-rata produk per outlet
- **Stock Accuracy**: % selisih stok (target < 2%)
- **Stockout Rate**: % produk yang pernah stockout

### User Metrics
- **Time to Add Product**: Target < 2 menit
- **Import Success Rate**: > 95%
- **User Satisfaction**: > 4.5/5

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic CRUD produk
- Kategori sederhana
- Single gudang
- Basic stok tracking

### Phase 2: Enhanced (Week 5-8)
- Multi gudang
- Varian produk
- Stock opname
- Import/export Excel

### Phase 3: Advanced (Week 9-12)
- Stock movement tracking detail
- Reorder point & notifications
- Advanced reporting
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- Produk dengan banyak varian (performance)
- Stock opname saat ada transaksi aktif
- Import duplicate SKU
- Stok negatif (backorder)

### Future Enhancements
- Barcode generator (jika produk belum punya barcode)
- Product bundling (paket produk)
- Serial number tracking (untuk produk mahal)
- Batch/expiry date tracking (untuk F&B, apotek)

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

