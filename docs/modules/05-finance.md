# PRD: Modul Keuangan

**Modul ID**: MOD-005  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P1 (High)

---

## 📋 Ringkasan

Modul Keuangan menyediakan fungsi manajemen keuangan dasar untuk tracking pemasukan, pengeluaran, rekonsiliasi transaksi, dan laporan keuangan. Modul ini membantu bisnis mengelola arus kas dan mempersiapkan data untuk akuntansi.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Memberikan visibility arus kas real-time
- Memudahkan rekonsiliasi transaksi pembayaran
- Menyediakan laporan keuangan dasar (P&L, cash flow)
- Mempersiapkan data untuk integrasi software akuntansi

### Value Proposition
- **Real-time**: Arus kas update live
- **Akurat**: Rekonsiliasi otomatis dengan payment gateway
- **Lengkap**: Buku kas, P&L, cash flow dalam satu tempat
- **Terintegrasi**: Siap untuk export ke software akuntansi

---

## 👥 User Personas

### Primary User: Owner/Pemilik Bisnis
- **Kebutuhan**: Lihat arus kas, profit, rekonsiliasi
- **Skill Level**: Basic-Intermediate
- **Context**: Mobile atau desktop

### Secondary User: Accountant
- **Kebutuhan**: Detail transaksi, export untuk akuntansi, rekonsiliasi
- **Skill Level**: Advanced
- **Context**: Desktop, butuh detail dan export

---

## 🎨 User Stories

### Epic 1: Buku Kas
- **US-001**: Sebagai owner, saya ingin catat pemasukan (selain penjualan, contoh: top-up, pinjaman), agar buku kas lengkap
- **US-002**: Sebagai owner, saya ingin catat pengeluaran (pembelian, operasional, gaji), agar tahu semua expense
- **US-003**: Sebagai owner, saya ingin lihat saldo kas real-time, agar tahu berapa uang tersedia
- **US-004**: Sebagai owner, saya ingin lihat history pemasukan & pengeluaran dengan filter tanggal, agar track cash flow

### Epic 2: Rekonsiliasi Transaksi
- **US-005**: Sebagai accountant, saya ingin rekonsiliasi transaksi QRIS/e-wallet dengan statement dari bank/payment gateway, agar data akurat
- **US-006**: Sebagai sistem, saya ingin auto-match transaksi dari payment gateway dengan transaksi di sistem, agar rekonsiliasi otomatis
- **US-007**: Sebagai accountant, saya ingin flag transaksi yang belum match (unreconciled), agar bisa investigasi
- **US-008**: Sebagai accountant, saya ingin approve rekonsiliasi setelah verifikasi, agar data final

### Epic 3: Laporan Keuangan
- **US-009**: Sebagai owner, saya ingin lihat laporan laba rugi (P&L), agar tahu profitabilitas
- **US-010**: Sebagai owner, saya ingin lihat laporan cash flow, agar tahu arus kas masuk & keluar
- **US-011**: Sebagai owner, saya ingin lihat breakdown expense by kategori, agar tahu pengeluaran terbesar
- **US-012**: Sebagai accountant, saya ingin export laporan ke Excel/PDF, agar bisa analisis lebih lanjut

### Epic 4: Integrasi Akuntansi
- **US-013**: Sebagai accountant, saya ingin export data ke format yang kompatibel dengan Accurate/Jurnal.id, agar tidak perlu input manual
- **US-014**: Sebagai sistem, saya ingin mapping akun (chart of accounts), agar sesuai standar akuntansi
- **US-015**: Sebagai accountant, saya ingin sync data otomatis ke software akuntansi (jika ada API), agar efisien

---

## 🔧 Functional Requirements

### FR-001: Buku Kas (Cash Book)
- **FR-001.1**: Pencatatan Pemasukan
  - Tanggal & waktu
  - Kategori (penjualan, top-up, pinjaman, lainnya)
  - Jumlah (IDR)
  - Deskripsi/notes
  - Metode (tunai, transfer, QRIS, dll)
  - Attachment (bukti transfer, dll)

- **FR-001.2**: Pencatatan Pengeluaran
  - Tanggal & waktu
  - Kategori (pembelian, operasional, gaji, sewa, lainnya)
  - Jumlah (IDR)
  - Deskripsi/notes
  - Metode (tunai, transfer, kartu, dll)
  - Vendor/supplier (opsional)
  - Attachment (invoice, receipt)

- **FR-001.3**: Saldo Kas
  - Saldo awal (per periode)
  - Total pemasukan
  - Total pengeluaran
  - Saldo akhir (real-time)
  - Per gudang/outlet (jika multi-outlet)

- **FR-001.4**: History & Filter
  - List semua transaksi (pemasukan & pengeluaran)
  - Filter by: tanggal, kategori, metode, outlet
  - Sort by: tanggal, jumlah
  - Search by: deskripsi, vendor

### FR-002: Rekonsiliasi Transaksi
- **FR-002.1**: Import Statement
  - Upload statement dari bank (Excel/CSV)
  - Import dari payment gateway API (Xendit, Midtrans)
  - Format: tanggal, deskripsi, jumlah, referensi

- **FR-002.2**: Auto-Matching
  - Match transaksi sistem dengan statement
  - Criteria: tanggal, jumlah, referensi (transaction ID)
  - Confidence score (high, medium, low)
  - Flag matched vs unmatched

- **FR-002.3**: Manual Rekonsiliasi
  - Pilih transaksi sistem
  - Pilih transaksi statement
  - Manual match
  - Add notes

- **FR-002.4**: Unreconciled Items
  - List transaksi yang belum match
  - Filter by: tanggal, metode pembayaran
  - Investigate & resolve
  - Mark as reconciled

- **FR-002.5**: Rekonsiliasi Report
  - Summary: matched, unmatched, total
  - Period: harian, mingguan, bulanan
  - Export untuk audit

### FR-003: Laporan Keuangan
- **FR-003.1**: Laporan Laba Rugi (P&L)
  - Revenue (penjualan)
  - COGS (Cost of Goods Sold)
  - Gross Profit
  - Operating Expenses
    - Gaji
    - Sewa
    - Utilities
    - Marketing
    - Lainnya
  - Net Profit
  - Period: bulanan, tahunan
  - Comparison: bulan ini vs bulan lalu, tahun ini vs tahun lalu

- **FR-003.2**: Laporan Cash Flow
  - Operating Activities
    - Cash from sales
    - Cash paid for expenses
  - Investing Activities (opsional)
  - Financing Activities (opsional)
  - Net Cash Flow
  - Beginning & Ending Cash Balance
  - Period: bulanan, tahunan
  - Chart: line chart

- **FR-003.3**: Expense Breakdown
  - Breakdown by kategori
  - Percentage per kategori
  - Trend over time
  - Chart: pie chart, bar chart

- **FR-003.4**: Revenue vs Expense
  - Revenue trend
  - Expense trend
  - Profit margin trend
  - Chart: dual-axis line chart

### FR-004: Integrasi Akuntansi
- **FR-004.1**: Chart of Accounts
  - Define akun (aset, liabilitas, ekuitas, pendapatan, beban)
  - Mapping transaksi ke akun
  - Hierarki akun (parent-child)

- **FR-004.2**: Export untuk Akuntansi
  - Format: Excel (template Accurate/Jurnal)
  - Format: CSV (generic)
  - Include: tanggal, akun, debit, kredit, deskripsi
  - Period: bulanan, tahunan

- **FR-004.3**: API Integration (Future)
  - Integrasi dengan Accurate Online API
  - Integrasi dengan Jurnal.id API
  - Auto-sync transaksi
  - Bi-directional sync (opsional)

---

## 🎨 UI/UX Requirements

### Cash Book Screen
```
┌─────────────────────────────────────────┐
│  Buku Kas                               │
│  ─────────────────────────────────────  │
│  Saldo: Rp 15.000.000                   │
│  ─────────────────────────────────────  │
│  [+ Pemasukan] [+ Pengeluaran]          │
│                                          │
│  [Filter] [Search]                      │
│                                          │
│  [Table: History]                        │
│  Tanggal | Tipe | Kategori | Jumlah    │
│  01 Jan  | +    | Penjualan| Rp 2.5M   │
│  01 Jan  | -    | Gaji     | Rp 5M     │
│  ...                                    │
│                                          │
│  [Pagination]                            │
└─────────────────────────────────────────┘
```

### Reconciliation Screen
```
┌─────────────────────────────────────────┐
│  Rekonsiliasi - Januari 2024            │
│  ─────────────────────────────────────  │
│  [Import Statement]                      │
│                                          │
│  Summary:                               │
│  Matched: 950 transaksi                 │
│  Unmatched: 5 transaksi                 │
│                                          │
│  Unmatched Items:                        │
│  [Table: Unmatched]                      │
│  Tanggal | Sistem | Statement | Action │
│  ...                                    │
│  [Match] [Flag]                          │
│                                          │
│  [Approve Reconciliation]                │
└─────────────────────────────────────────┘
```

### P&L Report Screen
```
┌─────────────────────────────────────────┐
│  Laporan Laba Rugi - Januari 2024       │
│  ─────────────────────────────────────  │
│  Revenue:              Rp 50.000.000   │
│  COGS:                 Rp 30.000.000   │
│  ─────────────────────────────────────  │
│  Gross Profit:          Rp 20.000.000   │
│                                          │
│  Operating Expenses:                   │
│  - Gaji:                Rp 10.000.000   │
│  - Sewa:                Rp 5.000.000    │
│  - Utilities:           Rp 2.000.000   │
│  - Marketing:           Rp 1.000.000    │
│  ─────────────────────────────────────  │
│  Net Profit:            Rp 2.000.000    │
│                                          │
│  [Export Excel] [Export PDF]            │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: Data Access
- Role-based access (owner & accountant full access)
- Audit log untuk perubahan data keuangan
- Approval untuk rekonsiliasi (2-level approval)

### SEC-002: Data Integrity
- Validasi: saldo tidak boleh negatif (dengan approval)
- Lock period (tidak bisa edit transaksi lama setelah tutup buku)
- Backup data keuangan (daily)

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Load cash book (1000 transaksi): < 2 detik
- Generate P&L report: < 3 detik
- Rekonsiliasi (1000 transaksi): < 10 detik
- Export Excel: < 5 detik

### PERF-002: Scalability
- Support hingga 10.000 transaksi per bulan per outlet
- Concurrent users: 10 accountant per outlet

---

## 🧪 Acceptance Criteria

### AC-001: Cash Book
- ✅ Pemasukan & pengeluaran tersimpan
- ✅ Saldo ter-update real-time
- ✅ Filter & search berfungsi
- ✅ History lengkap

### AC-002: Rekonsiliasi
- ✅ Import statement sukses
- ✅ Auto-match transaksi
- ✅ Manual match berfungsi
- ✅ Report akurat

### AC-003: P&L Report
- ✅ Calculation benar (revenue - COGS - expenses)
- ✅ Export Excel/PDF sukses
- ✅ Comparison period berfungsi

---

## 🔗 Integrations

### INT-001: Payment Gateways
- **Xendit**: Import transaction statement
- **Midtrans**: Import transaction statement
- **Bank APIs**: (Future) Direct integration

### INT-002: Accounting Software
- **Accurate Online**: Export format
- **Jurnal.id**: Export format
- **MYOB**: Export format (optional)

### INT-003: File Upload
- Excel/CSV parser untuk statement
- Validation & error handling

---

## 📈 Success Metrics

### Business Metrics
- **Reconciliation Accuracy**: % transaksi yang ter-rekonsiliasi
- **Time to Reconcile**: Rata-rata waktu rekonsiliasi per bulan
- **Export Usage**: Frekuensi export ke software akuntansi

### User Metrics
- **Time to Record Transaction**: Target < 1 menit
- **Report Accuracy**: > 99%
- **User Satisfaction**: > 4.5/5

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic cash book (pemasukan & pengeluaran)
- Saldo real-time
- Basic P&L report

### Phase 2: Enhanced (Week 5-8)
- Rekonsiliasi manual
- Import statement
- Cash flow report
- Export Excel

### Phase 3: Advanced (Week 9-12)
- Auto-rekonsiliasi
- Chart of accounts
- Integrasi accounting software
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- Transaksi duplikat di statement
- Transaksi di sistem tapi tidak di statement (pending)
- Currency conversion (jika multi-currency)
- Period closing & opening balance

### Future Enhancements
- Budget vs Actual
- Forecasting (cash flow projection)
- Multi-currency support
- Tax calculation & reporting

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

