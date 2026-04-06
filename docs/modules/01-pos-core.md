# PRD: Modul Kasir (POS Core)

**Modul ID**: MOD-001  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P0 (Critical)

---

## 📋 Ringkasan

Modul Kasir (POS Core) adalah modul inti dari platform GiPos yang menyediakan interface kasir untuk melakukan transaksi penjualan dengan cepat dan efisien. Modul ini dirancang untuk digunakan oleh kasir di berbagai jenis bisnis (retail, F&B, salon, dll) dengan dukungan multi metode pembayaran dan mode offline.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Menyediakan interface kasir yang cepat dan mudah digunakan
- Mendukung berbagai metode pembayaran lokal Indonesia
- Memungkinkan operasi offline dengan sinkronisasi otomatis
- Mengoptimalkan waktu transaksi untuk meningkatkan throughput

### Value Proposition
- **Cepat**: Transaksi selesai dalam < 30 detik
- **Mudah**: Minimal training, intuitif untuk semua level
- **Fleksibel**: Multi metode pembayaran (tunai, QRIS, e-wallet)

---

## 👥 User Personas

### Primary User: Kasir
- **Kebutuhan**: Interface cepat, mudah digunakan, tidak mudah error
- **Skill Level**: Basic (bisa menggunakan smartphone/tablet)
- **Context**: Berdiri, sibuk, butuh cepat

### Secondary User: Supervisor/Manager
- **Kebutuhan**: Monitor transaksi real-time, approve refund/diskon besar
- **Skill Level**: Intermediate
- **Context**: Mobile atau desktop, butuh overview

---

## 🎨 User Stories

### Epic 1: Transaksi Penjualan Dasar
- **US-001**: Sebagai kasir, saya ingin menambahkan produk ke keranjang dengan scan barcode atau pencarian, agar transaksi cepat
- **US-002**: Sebagai kasir, saya ingin melihat total harga real-time saat menambah produk, agar tahu jumlah yang harus dibayar
- **US-003**: Sebagai kasir, saya ingin mengubah quantity produk di keranjang, agar bisa menyesuaikan jumlah pembelian
- **US-004**: Sebagai kasir, saya ingin menghapus produk dari keranjang, agar bisa membatalkan item yang salah

### Epic 2: Pembayaran
- **US-005**: Sebagai kasir, saya ingin memilih metode pembayaran (tunai, QRIS, e-wallet), agar sesuai dengan preferensi pelanggan
- **US-006**: Sebagai kasir, saya ingin melihat QRIS code untuk pembayaran, agar pelanggan bisa scan dan bayar
- **US-007**: Sebagai kasir, saya ingin input jumlah tunai yang diterima dan melihat kembalian otomatis, agar tidak salah hitung
- **US-008**: Sebagai kasir, saya ingin konfirmasi pembayaran setelah pelanggan transfer/scan QRIS, agar transaksi tercatat

### Epic 3: Diskon & Promo
- **US-009**: Sebagai kasir, saya ingin apply diskon persentase atau nominal, agar bisa memberikan promo
- **US-010**: Sebagai kasir, saya ingin apply kode promo pelanggan, agar member dapat benefit
- **US-011**: Sebagai supervisor, saya ingin approve diskon besar (> 20%), agar ada kontrol

### Epic 4: Nota & Receipt
- **US-012**: Sebagai kasir, saya ingin print nota fisik (thermal printer), agar pelanggan dapat bukti transaksi
- **US-013**: Sebagai kasir, saya ingin kirim nota digital via email/WhatsApp, agar paperless
- **US-014**: Sebagai pelanggan, saya ingin terima nota digital otomatis setelah transaksi, agar tidak perlu minta

### Epic 5: Mode Offline
- **US-015**: Sebagai kasir, saya ingin tetap bisa transaksi saat internet putus, agar operasional tidak terganggu
- **US-016**: Sebagai sistem, saya ingin sync otomatis transaksi offline saat online kembali, agar data konsisten

### Epic 6: Split Bill (F&B)
- **US-017**: Sebagai kasir restoran, saya ingin split bill per meja, agar bisa bagi tagihan antar pelanggan
- **US-018**: Sebagai kasir restoran, saya ingin bayar sebagian (deposit), agar fleksibel untuk restoran

---

## 🔧 Functional Requirements

### FR-001: Interface Kasir
- **FR-001.1**: Tampilkan grid produk dengan gambar, nama, harga
- **FR-001.2**: Search bar untuk pencarian produk (nama, barcode, SKU)
- **FR-001.3**: Scan barcode via kamera atau barcode scanner hardware
- **FR-001.4**: Keranjang (cart) di sisi kanan/bawah dengan item, quantity, subtotal
- **FR-001.5**: Tombol "Bayar" yang prominent dan mudah diakses

### FR-002: Manajemen Keranjang
- **FR-002.1**: Tambah produk ke keranjang (tap atau scan)
- **FR-002.2**: Update quantity produk (+, -, input manual)
- **FR-002.3**: Hapus item dari keranjang
- **FR-002.4**: Clear all (kosongkan keranjang)
- **FR-002.5**: Hitung total real-time (subtotal, diskon, pajak, total akhir)

### FR-003: Metode Pembayaran
- **FR-003.1**: **Tunai**
  - Input jumlah tunai diterima
  - Hitung kembalian otomatis
  - Validasi: tunai >= total
- **FR-003.2**: **QRIS**
  - Generate QRIS code (via Xendit/Midtrans)
  - Tampilkan QR code di screen
  - Polling status pembayaran (auto atau manual confirm)
  - Timeout 5 menit jika belum bayar
- **FR-003.3**: **E-Wallet** (GoPay, OVO, ShopeePay, DANA)
  - Pilih e-wallet provider
  - Generate payment link atau QR
  - Polling status
- **FR-003.4**: **Transfer Bank**
  - Pilih bank (BCA, Mandiri, BNI, BRI, dll)
  - Input nomor rekening (opsional)
  - Manual confirm setelah cek rekening
- **FR-003.5**: **Kartu Debit/Kredit**
  - Integrasi dengan EDC (jika ada)
  - Atau manual input (untuk rekonsiliasi)

### FR-004: Diskon & Pajak
- **FR-004.1**: Diskon persentase (contoh: 10%)
- **FR-004.2**: Diskon nominal (contoh: Rp 5.000)
- **FR-004.3**: Diskon per item atau seluruh transaksi
- **FR-004.4**: Pajak PPN (10%) - toggle on/off
- **FR-004.5**: Kode promo (validasi, apply otomatis)

### FR-005: Nota & Receipt
- **FR-005.1**: Print thermal receipt (Bluetooth/USB printer)
- **FR-005.2**: Format nota: header (nama toko, alamat), item list, total, metode bayar, tanggal/waktu
- **FR-005.3**: Kirim email (jika ada email pelanggan)
- **FR-005.4**: Kirim WhatsApp (jika ada nomor HP pelanggan)
- **FR-005.5**: Download PDF nota

### FR-006: Mode Offline
- **FR-006.1**: Deteksi koneksi internet (online/offline indicator)
- **FR-006.2**: Simpan transaksi offline ke local storage (Hive/Sqflite)
- **FR-006.3**: Queue transaksi untuk sync saat online
- **FR-006.4**: Auto-sync saat online kembali (background sync)
- **FR-006.5**: Conflict resolution (jika ada duplikasi)

### FR-007: Split Bill (F&B)
- **FR-007.1**: Pilih item untuk split (beberapa item bisa di-split)
- **FR-007.2**: Bagi total per orang/group
- **FR-007.3**: Bayar per bagian (multiple payment untuk 1 transaksi)
- **FR-007.4**: Mark transaksi "settled" jika semua bagian sudah bayar

### FR-008: Refund & Void
- **FR-008.1**: Void transaksi (sebelum bayar)
- **FR-008.2**: Refund (setelah bayar) - butuh approval supervisor jika > threshold
- **FR-008.3**: Refund partial (beberapa item saja)
- **FR-008.4**: Log refund untuk audit

---

## 🎨 UI/UX Requirements

### Layout Kasir
```
┌─────────────────────────────────────────┐
│  [Search Bar]          [Cart Icon: 3]   │
├─────────────────────────────────────────┤
│                                          │
│  [Product Grid - Scrollable]             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │Img │ │Img │ │Img │ │Img │           │
│  │Name│ │Name│ │Name│ │Name│           │
│  │Rp  │ │Rp  │ │Rp  │ │Rp  │           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                          │
├─────────────────────────────────────────┤
│  [Cart Summary - Fixed Bottom]          │
│  Items: 3 | Subtotal: Rp 150.000       │
│  [Bayar Sekarang]                       │
└─────────────────────────────────────────┘
```

### Payment Screen
```
┌─────────────────────────────────────────┐
│  Total: Rp 150.000                      │
│  ─────────────────────────────────────  │
│  Pilih Metode Pembayaran:               │
│  ┌──────────┐ ┌──────────┐              │
│  │  Tunai   │ │  QRIS    │              │
│  └──────────┘ └──────────┘              │
│  ┌──────────┐ ┌──────────┐              │
│  │ E-Wallet │ │ Transfer │              │
│  └──────────┘ └──────────┘              │
│                                          │
│  [Batal]              [Lanjutkan]       │
└─────────────────────────────────────────┘
```

### Design Principles
- **Large Touch Targets**: Minimal 44x44px untuk mobile
- **High Contrast**: Text mudah dibaca di berbagai kondisi cahaya
- **Minimal Clicks**: Maksimal 3 tap untuk complete transaction
- **Visual Feedback**: Loading states, success/error messages
- **Offline Indicator**: Badge/icon jelas saat offline

---

## 🔒 Security & Compliance

### SEC-001: Data Protection
- Transaksi disimpan encrypted di local storage (offline mode)
- Token payment tidak disimpan di device
- PII (Personal Identifiable Information) di-mask jika perlu

### SEC-002: Authorization
- Kasir hanya bisa create transaksi (tidak bisa edit/delete setelah settled)
- Refund butuh approval supervisor (role-based)
- Log semua aksi untuk audit trail

### SEC-003: Payment Security
- Payment gateway integration (Xendit/Midtrans) - PCI-DSS compliant
- Tidak store card details
- QRIS timeout untuk prevent fraud

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Load produk list: < 1 detik
- Scan barcode response: < 500ms
- Generate QRIS: < 2 detik
- Print receipt: < 3 detik

### PERF-002: Offline Capability
- Transaksi offline: 100% functional (tanpa internet)
- Sync batch: Maksimal 100 transaksi per batch
- Conflict resolution: < 5 detik per transaksi

### PERF-003: Scalability
- Support hingga 1000 produk per outlet
- Support hingga 100 transaksi per menit per outlet
- Concurrent users: 10 kasir per outlet

---

## 🧪 Acceptance Criteria

### AC-001: Transaksi Tunai
- ✅ Kasir bisa scan/tap produk
- ✅ Quantity bisa diubah
- ✅ Input tunai, kembalian otomatis
- ✅ Nota ter-print/kirim digital
- ✅ Transaksi tersimpan di database

### AC-002: Transaksi QRIS
- ✅ QRIS code ter-generate
- ✅ QR code tampil di screen
- ✅ Status update real-time (pending → paid)
- ✅ Nota otomatis kirim setelah paid
- ✅ Timeout handling (5 menit)

### AC-003: Mode Offline
- ✅ Transaksi bisa dilakukan offline
- ✅ Data tersimpan local
- ✅ Auto-sync saat online
- ✅ No data loss
- ✅ Conflict resolved

---

## 🔗 Integrations

### INT-001: Payment Gateways
- **Xendit**: QRIS, E-wallet, Subscriptions
- **Midtrans**: QRIS, E-wallet (backup)
- **Stripe**: Kartu (optional, international)

### INT-002: Printers
- Bluetooth thermal printer (ESC/POS)
- USB thermal printer
- Network printer (optional)

### INT-003: Hardware
- Barcode scanner (USB, Bluetooth, Camera)
- Cash drawer (via printer trigger)

### INT-004: Notifications
- WhatsApp API (Fonnte, Qontak)
- Email (SMTP/SendGrid)

---

## 📈 Success Metrics

### Business Metrics
- **Transaction Volume**: Jumlah transaksi per hari per outlet
- **Average Transaction Value**: Rata-rata nilai transaksi
- **Payment Method Distribution**: % tunai vs digital

### User Metrics
- **Time per Transaction**: Target < 30 detik
- **Error Rate**: < 1% transaksi error
- **User Satisfaction**: > 4.5/5 untuk kasir

### Technical Metrics
- **Uptime**: 99.9% availability
- **Offline Sync Success Rate**: > 99%
- **Payment Success Rate**: > 98%

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic POS interface
- Tunai & QRIS payment
- Print receipt
- Online only

### Phase 2: Enhanced (Week 5-8)
- Offline mode
- E-wallet integration
- Email/WhatsApp nota
- Diskon & promo

### Phase 3: Advanced (Week 9-12)
- Split bill
- Refund & void
- Advanced reporting
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- Pelanggan cancel di tengah transaksi
- Internet putus saat generate QRIS
- Printer error saat print
- Duplicate payment (double tap)

### Future Enhancements
- Voice command untuk kasir
- AI product recommendation
- Customer face recognition (loyalty auto-apply)
- Multi-currency support

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

