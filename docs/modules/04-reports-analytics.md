# PRD: Modul Laporan & Analitik

**Modul ID**: MOD-004  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P1 (High)

---

## 📋 Ringkasan

Modul Laporan & Analitik menyediakan dashboard interaktif dan berbagai laporan untuk membantu owner dan manager memahami performa bisnis, membuat keputusan data-driven, dan mengoptimalkan operasional. Modul ini mencakup laporan penjualan, analitik produk, analitik keuangan, dan kinerja karyawan.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Memberikan visibility real-time tentang performa bisnis
- Membantu identifikasi tren dan peluang
- Memudahkan pengambilan keputusan berbasis data
- Meningkatkan efisiensi operasional

### Value Proposition
- **Real-time**: Dashboard update live
- **Comprehensive**: Laporan lengkap untuk semua aspek bisnis
- **Actionable**: Insights yang bisa langsung ditindaklanjuti
- **Visual**: Grafik dan chart yang mudah dipahami

---

## 👥 User Personas

### Primary User: Owner/Pemilik Bisnis
- **Kebutuhan**: Overview performa bisnis, omzet, profit, tren
- **Skill Level**: Basic-Intermediate
- **Context**: Mobile atau desktop, butuh quick insights

### Secondary User: Manager/Supervisor
- **Kebutuhan**: Detail laporan, analitik produk, kinerja tim
- **Skill Level**: Intermediate
- **Context**: Desktop, butuh detail dan export

---

## 🎨 User Stories

### Epic 1: Dashboard Overview
- **US-001**: Sebagai owner, saya ingin lihat dashboard dengan key metrics (omzet hari ini, profit, transaksi), agar tahu performa bisnis real-time
- **US-002**: Sebagai owner, saya ingin lihat grafik omzet harian/mingguan/bulanan, agar tahu tren penjualan
- **US-003**: Sebagai owner, saya ingin lihat produk terlaris hari ini, agar tahu apa yang laku
- **US-004**: Sebagai owner, saya ingin lihat perbandingan performa hari ini vs kemarin/minggu lalu, agar tahu apakah bisnis naik atau turun

### Epic 2: Laporan Penjualan
- **US-005**: Sebagai manager, saya ingin lihat laporan penjualan harian dengan detail transaksi, agar tahu breakdown penjualan
- **US-006**: Sebagai manager, saya ingin filter laporan by tanggal, kasir, metode pembayaran, agar analisis lebih detail
- **US-007**: Sebagai manager, saya ingin export laporan penjualan ke Excel/PDF, agar bisa share atau analisis lebih lanjut
- **US-008**: Sebagai manager, saya ingin lihat laporan penjualan per kategori produk, agar tahu kategori mana yang paling laku

### Epic 3: Analitik Produk
- **US-009**: Sebagai manager, saya ingin lihat produk terlaris (best seller) dengan quantity & revenue, agar tahu produk unggulan
- **US-010**: Sebagai manager, saya ingin lihat produk yang tidak laku (slow moving), agar bisa strategi promo atau clearance
- **US-011**: Sebagai manager, saya ingin lihat margin profit per produk, agar tahu produk mana yang paling profitable
- **US-012**: Sebagai manager, saya ingin lihat produk yang sering out of stock, agar bisa adjust inventory

### Epic 4: Analitik Keuangan
- **US-013**: Sebagai owner, saya ingin lihat laporan laba rugi (P&L), agar tahu profitabilitas bisnis
- **US-014**: Sebagai owner, saya ingin lihat cash flow (pemasukan vs pengeluaran), agar tahu arus kas
- **US-015**: Sebagai owner, saya ingin lihat breakdown metode pembayaran (tunai vs digital), agar tahu preferensi pelanggan
- **US-016**: Sebagai owner, saya ingin lihat perbandingan revenue vs cost, agar tahu margin bisnis

### Epic 5: Analitik Karyawan
- **US-017**: Sebagai manager, saya ingin lihat performa kasir (jumlah transaksi, total omzet per kasir), agar tahu siapa yang produktif
- **US-018**: Sebagai manager, saya ingin lihat error rate per kasir (refund, void), agar identifikasi masalah
- **US-019**: Sebagai manager, saya ingin lihat shift performance (pagi vs siang vs malam), agar tahu waktu peak

### Epic 6: Laporan Custom
- **US-020**: Sebagai manager, saya ingin buat laporan custom dengan filter & kolom yang saya pilih, agar sesuai kebutuhan
- **US-021**: Sebagai manager, saya ingin save laporan custom sebagai template, agar bisa pakai lagi
- **US-022**: Sebagai manager, saya ingin schedule laporan (auto-email setiap hari/minggu), agar dapat laporan rutin

---

## 🔧 Functional Requirements

### FR-001: Dashboard Overview
- **FR-001.1**: Key Metrics Cards
  - Omzet hari ini (vs kemarin, % change)
  - Profit hari ini
  - Jumlah transaksi hari ini
  - Rata-rata nilai transaksi
  - Produk terjual hari ini
  - Pelanggan baru hari ini

- **FR-001.2**: Charts & Graphs
  - Grafik omzet (line chart) - harian, mingguan, bulanan
  - Grafik transaksi (bar chart)
  - Pie chart metode pembayaran
  - Top 5 produk terlaris (bar chart)

- **FR-001.3**: Real-time Updates
  - Auto-refresh setiap 30 detik (optional)
  - Manual refresh button
  - Last updated timestamp

- **FR-001.4**: Date Range Selector
  - Hari ini
  - Kemarin
  - 7 hari terakhir
  - 30 hari terakhir
  - Bulan ini
  - Custom range

### FR-002: Laporan Penjualan
- **FR-002.1**: Laporan Penjualan Harian
  - List transaksi dengan detail (tanggal, waktu, kasir, produk, total)
  - Summary (total omzet, jumlah transaksi, rata-rata)
  - Filter by: tanggal, kasir, metode pembayaran, outlet
  - Sort by: tanggal, total

- **FR-002.2**: Laporan Penjualan per Kategori
  - Breakdown omzet per kategori produk
  - Quantity terjual per kategori
  - Chart (bar/pie)

- **FR-002.3**: Laporan Penjualan per Produk
  - List produk dengan quantity terjual, revenue, margin
  - Sort by: quantity, revenue, margin
  - Filter by: kategori, tanggal

- **FR-002.4**: Export Laporan
  - Export to Excel (XLSX)
  - Export to PDF
  - Include charts (optional)

### FR-003: Analitik Produk
- **FR-003.1**: Produk Terlaris (Best Seller)
  - Top N produk (default 10)
  - Metrics: quantity terjual, revenue, margin
  - Period: hari, minggu, bulan, custom
  - Chart: bar chart

- **FR-003.2**: Produk Tidak Laku (Slow Moving)
  - Produk dengan 0 atau sedikit penjualan
  - Period: tidak terjual dalam X hari
  - Alert untuk clearance/promo

- **FR-003.3**: Margin Analysis
  - Margin per produk (harga jual - harga beli)
  - Margin percentage
  - Sort by: margin, revenue
  - Chart: scatter plot (revenue vs margin)

- **FR-003.4**: Stock Analysis
  - Produk yang sering out of stock
  - Reorder recommendation
  - Overstock alert

### FR-004: Analitik Keuangan
- **FR-004.1**: Laporan Laba Rugi (P&L)
  - Revenue (penjualan)
  - COGS (Cost of Goods Sold)
  - Gross Profit
  - Operating Expenses (opsional)
  - Net Profit
  - Period: bulanan, tahunan
  - Comparison: bulan ini vs bulan lalu

- **FR-004.2**: Cash Flow
  - Pemasukan (penjualan, top-up, dll)
  - Pengeluaran (pembelian, operasional, dll)
  - Net cash flow
  - Chart: line chart over time

- **FR-004.3**: Metode Pembayaran Analysis
  - Breakdown by: tunai, QRIS, e-wallet, transfer, kartu
  - Percentage & amount
  - Trend over time
  - Chart: pie chart, line chart

- **FR-004.4**: Revenue vs Cost
  - Revenue trend
  - Cost trend
  - Margin trend
  - Chart: dual-axis line chart

### FR-005: Analitik Karyawan
- **FR-005.1**: Performa Kasir
  - Jumlah transaksi per kasir
  - Total omzet per kasir
  - Rata-rata nilai transaksi
  - Period: hari, minggu, bulan
  - Sort by: transaksi, omzet

- **FR-005.2**: Error Rate
  - Jumlah refund per kasir
  - Jumlah void per kasir
  - Error percentage
  - Alert untuk kasir dengan error tinggi

- **FR-005.3**: Shift Performance
  - Omzet per shift (pagi, siang, malam)
  - Transaksi per shift
  - Peak hours identification
  - Chart: bar chart

### FR-006: Laporan Custom
- **FR-006.1**: Builder Laporan
  - Pilih data source (penjualan, produk, dll)
  - Pilih kolom yang ditampilkan
  - Set filter
  - Set sort
  - Set grouping

- **FR-006.2**: Save Template
  - Save laporan custom sebagai template
  - Nama template
  - Share dengan user lain (opsional)

- **FR-006.3**: Scheduled Reports
  - Schedule laporan (harian, mingguan, bulanan)
  - Auto-email ke recipient
  - Format: Excel atau PDF

---

## 🎨 UI/UX Requirements

### Dashboard Screen
```
┌─────────────────────────────────────────┐
│  Dashboard - Hari Ini                   │
│  ─────────────────────────────────────  │
│  ┌──────────┐ ┌──────────┐            │
│  │ Omzet    │ │ Profit   │            │
│  │ Rp 2.5M  │ │ Rp 500K   │            │
│  │ +15% ↑   │ │ +20% ↑   │            │
│  └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐            │
│  │ Transaksi│ │ Produk   │            │
│  │   125    │ │   45     │            │
│  │ +10% ↑   │ │ +5% ↑    │            │
│  └──────────┘ └──────────┘            │
│                                          │
│  [Grafik Omzet - Line Chart]            │
│  [Top 5 Produk - Bar Chart]            │
│  [Metode Pembayaran - Pie Chart]        │
└─────────────────────────────────────────┘
```

### Sales Report Screen
```
┌─────────────────────────────────────────┐
│  Laporan Penjualan                      │
│  ─────────────────────────────────────  │
│  [Date Range] [Filter] [Export]         │
│                                          │
│  Summary:                               │
│  Total Omzet: Rp 25.000.000             │
│  Transaksi: 1.250                       │
│  Rata-rata: Rp 20.000                   │
│                                          │
│  [Table: Detail Transaksi]              │
│  Tanggal | Kasir | Produk | Total      │
│  ...                                    │
│                                          │
│  [Pagination]                            │
└─────────────────────────────────────────┘
```

### Product Analytics Screen
```
┌─────────────────────────────────────────┐
│  Analitik Produk                        │
│  ─────────────────────────────────────  │
│  [Period] [Filter]                      │
│                                          │
│  Top 10 Produk Terlaris:                │
│  [Bar Chart]                             │
│                                          │
│  [Table: Detail]                         │
│  Produk | Qty | Revenue | Margin        │
│  ...                                    │
│                                          │
│  Slow Moving Products:                  │
│  [Alert List]                            │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: Data Access
- Role-based access (owner lihat semua, manager lihat terbatas)
- Audit log untuk akses laporan sensitive
- Export data butuh approval (untuk data besar)

### SEC-002: Data Privacy
- Mask PII jika perlu (untuk laporan yang di-share)
- Anonymize data untuk analytics (opsional)

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Load dashboard: < 3 detik
- Generate laporan (1000 transaksi): < 5 detik
- Export Excel (1000 rows): < 10 detik
- Export PDF: < 15 detik

### PERF-002: Scalability
- Support hingga 1 juta transaksi per outlet
- Real-time dashboard untuk 100 concurrent users
- Scheduled reports: 100 reports per hari

---

## 🧪 Acceptance Criteria

### AC-001: Dashboard
- ✅ Key metrics ter-update real-time
- ✅ Charts render dengan data benar
- ✅ Date range selector berfungsi
- ✅ Mobile responsive

### AC-002: Sales Report
- ✅ Filter & sort berfungsi
- ✅ Export Excel/PDF sukses
- ✅ Data akurat sesuai transaksi
- ✅ Summary calculation benar

### AC-003: Product Analytics
- ✅ Best seller list akurat
- ✅ Slow moving detection benar
- ✅ Margin calculation tepat
- ✅ Charts visual jelas

---

## 🔗 Integrations

### INT-001: Chart Libraries
- **Recharts**: React chart library
- **Chart.js**: Alternative
- **D3.js**: Advanced visualizations (optional)

### INT-002: Export
- **ExcelJS**: Excel export
- **PDFKit**: PDF export
- **Puppeteer**: PDF dengan charts (optional)

### INT-003: Email
- **SendGrid**: Email scheduled reports
- **SMTP**: Alternative

---

## 📈 Success Metrics

### Business Metrics
- **Report Usage**: % user yang akses laporan per bulan
- **Dashboard Engagement**: Rata-rata waktu di dashboard
- **Export Frequency**: Jumlah export per bulan

### User Metrics
- **Time to Insight**: Waktu untuk dapat insight dari dashboard
- **Report Accuracy**: % laporan yang akurat (validated)
- **User Satisfaction**: > 4.5/5

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic dashboard (key metrics, simple charts)
- Laporan penjualan harian
- Export Excel

### Phase 2: Enhanced (Week 5-8)
- Product analytics
- Financial reports (P&L, cash flow)
- Employee analytics
- Export PDF

### Phase 3: Advanced (Week 9-12)
- Custom report builder
- Scheduled reports
- Advanced visualizations
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- Data kosong (no transactions)
- Large dataset (performance)
- Timezone handling
- Currency formatting (IDR)

### Future Enhancements
- Predictive analytics (AI/ML)
- Benchmarking (compare dengan industry)
- Automated insights & recommendations
- Mobile app untuk dashboard

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

