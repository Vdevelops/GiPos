# PRD: Modul Multi-Cabang / Multi-Outlet

**Modul ID**: MOD-007  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P1 (High)

---

## 📋 Ringkasan

Modul Multi-Cabang / Multi-Outlet menyediakan fungsi manajemen untuk bisnis yang memiliki lebih dari satu outlet atau cabang. Modul ini memungkinkan owner mengelola multiple outlet, transfer stok antar cabang, monitoring penjualan per outlet, dan laporan konsolidasi untuk seluruh jaringan bisnis.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Mengelola multiple outlet dalam satu platform
- Memudahkan transfer stok antar cabang
- Memberikan visibility penjualan per outlet
- Menyediakan laporan konsolidasi untuk seluruh jaringan

### Value Proposition
- **Terpusat**: Kelola semua outlet dari satu dashboard
- **Fleksibel**: Setiap outlet bisa operasi independen
- **Efisien**: Transfer stok antar cabang dengan mudah
- **Insightful**: Laporan konsolidasi untuk decision making

---

## 👥 User Personas

### Primary User: Owner/Pemilik Bisnis (Multi-Outlet)
- **Kebutuhan**: Monitor semua outlet, transfer stok, laporan konsolidasi
- **Skill Level**: Intermediate-Advanced
- **Context**: Desktop/web, butuh overview dan kontrol

### Secondary User: Manager Outlet
- **Kebutuhan**: Kelola outlet sendiri, request transfer stok, lihat laporan outlet
- **Skill Level**: Intermediate
- **Context**: Desktop/web atau mobile

### Tertiary User: Admin Pusat
- **Kebutuhan**: Setup outlet baru, manage settings global, approve transfer
- **Skill Level**: Advanced
- **Context**: Desktop/web

---

## 🎨 User Stories

### Epic 1: Manajemen Outlet
- **US-001**: Sebagai owner, saya ingin tambah outlet baru (nama, alamat, kontak), agar cabang baru bisa operasi
- **US-002**: Sebagai owner, saya ingin edit data outlet (alamat, kontak, settings), agar informasi selalu update
- **US-003**: Sebagai owner, saya ingin nonaktifkan outlet yang tutup, agar tidak muncul di sistem
- **US-004**: Sebagai owner, saya ingin lihat list semua outlet dengan status dan performa, agar overview jaringan

### Epic 2: Transfer Stok Antar Outlet
- **US-005**: Sebagai manager outlet A, saya ingin request transfer stok ke outlet B, agar balance stok antar cabang
- **US-006**: Sebagai manager outlet B, saya ingin approve transfer stok dari outlet A, agar stok masuk tercatat
- **US-007**: Sebagai owner, saya ingin lihat history transfer stok antar outlet, agar track pergerakan barang
- **US-008**: Sebagai sistem, saya ingin update stok otomatis setelah transfer approved, agar data akurat

### Epic 3: Monitoring Per Outlet
- **US-009**: Sebagai owner, saya ingin lihat dashboard per outlet (omzet, transaksi, produk terlaris), agar tahu performa masing-masing
- **US-010**: Sebagai owner, saya ingin compare performa antar outlet (grafik), agar tahu outlet mana yang paling baik
- **US-011**: Sebagai owner, saya ingin lihat real-time penjualan per outlet, agar monitor live
- **US-012**: Sebagai manager outlet, saya ingin lihat laporan outlet sendiri, agar tahu performa cabang

### Epic 4: Laporan Konsolidasi
- **US-013**: Sebagai owner, saya ingin lihat laporan konsolidasi semua outlet (total omzet, profit), agar overview bisnis
- **US-014**: Sebagai owner, saya ingin breakdown laporan per outlet dalam satu laporan, agar detail per cabang
- **US-015**: Sebagai owner, saya ingin export laporan konsolidasi ke Excel/PDF, agar share atau analisis
- **US-016**: Sebagai owner, saya ingin filter laporan konsolidasi by tanggal, outlet, kategori, agar analisis lebih detail

### Epic 5: Settings & Konfigurasi
- **US-017**: Sebagai owner, saya ingin set settings global (applied ke semua outlet), agar konsistensi
- **US-018**: Sebagai owner, saya ingin set settings per outlet (harga, diskon, dll), agar fleksibel per cabang
- **US-019**: Sebagai owner, saya ingin assign karyawan ke outlet tertentu, agar akses terbatas per cabang
- **US-020**: Sebagai owner, saya ingin set gudang per outlet, agar stok terpisah per cabang

---

## 🔧 Functional Requirements

### FR-001: CRUD Outlet
- **FR-001.1**: Create Outlet
  - Nama outlet (required, unique per tenant)
  - Alamat lengkap (required)
  - Nomor telepon (required)
  - Email (optional)
  - Kode outlet (auto-generate atau manual, untuk referensi)
  - Status (aktif/nonaktif)
  - Timezone (untuk waktu lokal)
  - Settings outlet (harga, diskon, pajak)
  - Logo outlet (optional, untuk nota)

- **FR-001.2**: Read/List Outlet
  - Grid/List view dengan nama, alamat, status, performa
  - Search by nama, alamat, kode
  - Filter by status, region
  - Sort by nama, performa

- **FR-001.3**: Update Outlet
  - Edit semua field
  - Change settings (harga, diskon)
  - Upload logo
  - Bulk update (status)

- **FR-001.4**: Delete/Deactivate Outlet
  - Soft delete (nonaktifkan)
  - Validasi: tidak bisa hapus jika ada transaksi
  - Archive outlet lama

### FR-002: Transfer Stok Antar Outlet
- **FR-002.1**: Create Transfer Request
  - From outlet (source)
  - To outlet (destination)
  - Produk & quantity
  - Reason/notes
  - Requested by (manager/karyawan)
  - Status (pending, approved, rejected, completed)

- **FR-002.2**: Approve Transfer
  - Approve oleh manager outlet tujuan atau owner
  - Validasi: stok cukup di outlet sumber
  - Auto-deduct stok dari outlet sumber
  - Auto-add stok ke outlet tujuan
  - Update status menjadi "completed"

- **FR-002.3**: Reject Transfer
  - Reject dengan alasan
  - Notifikasi ke requester
  - Status menjadi "rejected"

- **FR-002.4**: Transfer History
  - List semua transfer (pending, approved, rejected, completed)
  - Filter by: tanggal, outlet, produk, status
  - Detail: from, to, produk, quantity, requester, approver
  - Export untuk audit

- **FR-002.5**: Transfer Validation
  - Validasi: stok cukup sebelum approve
  - Validasi: tidak bisa transfer ke outlet sendiri
  - Lock stok saat transfer pending (optional, prevent double transfer)

### FR-003: Monitoring Per Outlet
- **FR-003.1**: Dashboard Per Outlet
  - Key metrics: omzet hari ini, transaksi, profit
  - Grafik omzet (harian, mingguan, bulanan)
  - Top produk terlaris
  - Metode pembayaran breakdown
  - Real-time updates

- **FR-003.2**: Compare Outlets
  - Side-by-side comparison
  - Grafik perbandingan omzet
  - Ranking outlet (by omzet, profit, growth)
  - Period: hari, minggu, bulan

- **FR-003.3**: Real-time Monitoring
  - Live penjualan per outlet
  - Active kasir per outlet
  - Pending transfers
  - Alerts (stok rendah, error)

### FR-004: Laporan Konsolidasi
- **FR-004.1**: Konsolidasi Penjualan
  - Total omzet semua outlet
  - Breakdown per outlet
  - Breakdown per kategori produk
  - Breakdown per metode pembayaran
  - Period: harian, mingguan, bulanan, tahunan

- **FR-004.2**: Konsolidasi Stok
  - Total stok semua outlet (per produk)
  - Breakdown per outlet
  - Stok minimum alert (aggregate)
  - Transfer summary

- **FR-004.3**: Konsolidasi Keuangan
  - Total profit semua outlet
  - Breakdown per outlet
  - Cash flow konsolidasi
  - P&L konsolidasi

- **FR-004.4**: Export Laporan
  - Export to Excel (dengan breakdown per outlet)
  - Export to PDF
  - Include charts (optional)

### FR-005: Settings & Konfigurasi
- **FR-005.1**: Global Settings
  - Settings yang applied ke semua outlet
  - Contoh: currency, date format, tax rate default
  - Override per outlet (optional)

- **FR-005.2**: Per-Outlet Settings
  - Harga produk (bisa berbeda per outlet)
  - Diskon (bisa berbeda per outlet)
  - Pajak (bisa berbeda per outlet)
  - Payment methods (bisa berbeda per outlet)
  - Operating hours

- **FR-005.3**: Karyawan Assignment
  - Assign karyawan ke outlet tertentu
  - Multi-assignment (karyawan bisa akses beberapa outlet)
  - Manager outlet (full access ke outlet tertentu)

- **FR-005.4**: Gudang Per Outlet
  - Set gudang default per outlet
  - Stok terpisah per outlet
  - Transfer antar gudang (dalam outlet atau antar outlet)

---

## 🎨 UI/UX Requirements

### Outlet List Screen
```
┌─────────────────────────────────────────┐
│ [Search] [Filter] [+ New Outlet]       │
├─────────────────────────────────────────┤
│ ┌──────────────────────────────────┐   │
│ │ Outlet A - Cabang Pusat            │   │
│ │ Alamat: Jl. Merdeka No. 123        │   │
│ │ Status: Aktif | Omzet: Rp 5M/hari  │   │
│ │ [Detail] [Settings] [Transfer]     │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ Outlet B - Cabang Mall            │   │
│ │ Alamat: Mall Grand, Lt. 2         │   │
│ │ Status: Aktif | Omzet: Rp 8M/hari │   │
│ │ [Detail] [Settings] [Transfer]   │   │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Transfer Stok Screen
```
┌─────────────────────────────────────────┐
│  Transfer Stok                          │
│  ─────────────────────────────────────  │
│  Dari Outlet: [Outlet A ▼]             │
│  Ke Outlet: [Outlet B ▼]                │
│                                          │
│  Produk: [Pilih Produk ▼]              │
│  Quantity: [____]                       │
│  Stok Tersedia: 50                      │
│  Alasan: [Text Area]                    │
│                                          │
│  [Request Transfer]                     │
│                                          │
│  Pending Transfers:                      │
│  [Table: Transfer List]                  │
│  From | To | Produk | Qty | Status     │
│  ...                                    │
│  [Approve] [Reject]                     │
└─────────────────────────────────────────┘
```

### Konsolidasi Dashboard
```
┌─────────────────────────────────────────┐
│  Dashboard Konsolidasi                  │
│  ─────────────────────────────────────  │
│  Total Omzet Hari Ini: Rp 25.000.000   │
│  ─────────────────────────────────────  │
│  Breakdown per Outlet:                  │
│  Outlet A: Rp 10M (40%)                 │
│  Outlet B: Rp 8M (32%)                  │
│  Outlet C: Rp 7M (28%)                  │
│                                          │
│  [Grafik Omzet - Line Chart]            │
│  [Perbandingan Outlet - Bar Chart]      │
│                                          │
│  [Export Excel] [Export PDF]            │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: Data Isolation
- Outlet data terisolasi (kasir hanya lihat outlet sendiri)
- Owner/manager bisa akses semua outlet (berdasarkan permission)
- Transfer butuh approval (prevent fraud)

### SEC-002: Authorization
- Role-based access per outlet
- Manager outlet hanya bisa akses outlet sendiri
- Owner bisa akses semua outlet

### SEC-003: Audit Trail
- Log semua transfer stok
- Log perubahan settings outlet
- Log akses cross-outlet

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Load outlet list (50 outlet): < 2 detik
- Load dashboard per outlet: < 2 detik
- Generate konsolidasi report (10 outlet): < 5 detik
- Transfer stok: < 1 detik

### PERF-002: Scalability
- Support hingga 100 outlet per tenant
- Support hingga 1000 transfer per hari
- Concurrent users: 50 per outlet

---

## 🧪 Acceptance Criteria

### AC-001: Transfer Stok
- ✅ Request transfer sukses
- ✅ Approve transfer update stok otomatis
- ✅ Validasi stok cukup sebelum approve
- ✅ History transfer tersimpan

### AC-002: Laporan Konsolidasi
- ✅ Total omzet akurat (sum semua outlet)
- ✅ Breakdown per outlet benar
- ✅ Export Excel/PDF sukses
- ✅ Filter & date range berfungsi

### AC-003: Settings
- ✅ Global settings applied ke semua outlet
- ✅ Per-outlet settings override global
- ✅ Settings tersimpan dan ter-apply

---

## 🔗 Integrations

### INT-001: Inventory Module
- Integrasi dengan modul produk & inventori
- Stok per outlet
- Transfer stok

### INT-002: Reports Module
- Integrasi dengan modul laporan
- Konsolidasi reports
- Per-outlet reports

---

## 📈 Success Metrics

### Business Metrics
- **Multi-Outlet Adoption**: % tenant yang pakai multi-outlet
- **Transfer Frequency**: Rata-rata transfer per bulan
- **Outlet Performance Variance**: Standar deviasi omzet antar outlet

### User Metrics
- **Time to Add Outlet**: Target < 5 menit
- **Time to Transfer Stock**: Target < 2 menit
- **User Satisfaction**: > 4.5/5

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic CRUD outlet
- Transfer stok manual (dengan approval)
- Basic dashboard per outlet
- Konsolidasi laporan sederhana

### Phase 2: Enhanced (Week 5-8)
- Advanced transfer (bulk, template)
- Compare outlets
- Per-outlet settings
- Export konsolidasi

### Phase 3: Advanced (Week 9-12)
- Real-time monitoring
- Advanced analytics (outlet performance)
- Auto-transfer rules (opsional)
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- Transfer stok saat ada transaksi aktif
- Outlet dengan timezone berbeda
- Settings conflict (global vs per-outlet)
- Transfer rejected setelah stok ter-deduct

### Future Enhancements
- Franchise mode (outlet independen dengan brand)
- White-label per outlet
- Multi-currency support (jika outlet di negara berbeda)
- Advanced routing (transfer via gudang pusat)

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

