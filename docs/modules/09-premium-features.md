# PRD: Modul Tambahan (Premium Features)

**Modul ID**: MOD-009  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P2 (Medium)

---

## 📋 Ringkasan

Modul Tambahan (Premium Features) menyediakan fitur-fitur advanced yang dapat meningkatkan efisiensi operasional dan memberikan competitive advantage. Modul ini mencakup AI Sales Insight, Dashboard Mobile Owner, Mode Restoran, Mode Salon, dan Mode Apotek yang dirancang khusus untuk kebutuhan spesifik berbagai jenis bisnis.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Memberikan insights berbasis AI untuk pengambilan keputusan
- Menyediakan dashboard mobile untuk monitoring real-time
- Menyediakan mode khusus untuk berbagai jenis bisnis (restoran, salon, apotek)
- Meningkatkan efisiensi operasional dengan fitur khusus

### Value Proposition
- **AI-Powered**: Insights dan rekomendasi berbasis machine learning
- **Mobile-First**: Dashboard owner yang dapat diakses dari mana saja
- **Specialized**: Mode khusus untuk berbagai jenis bisnis
- **Actionable**: Rekomendasi yang dapat langsung ditindaklanjuti

---

## 👥 User Personas

### Primary User: Owner/Pemilik Bisnis
- **Kebutuhan**: Dashboard mobile, AI insights, monitoring real-time
- **Skill Level**: Basic-Intermediate
- **Context**: Mobile, butuh quick insights saat mobile

### Secondary User: Manager Restoran/Salon/Apotek
- **Kebutuhan**: Fitur khusus sesuai jenis bisnis (table management, booking, resep)
- **Skill Level**: Intermediate
- **Context**: Desktop/web atau mobile

---

## 🎨 User Stories

### Epic 1: Dashboard Mobile Owner
- **US-001**: Sebagai owner, saya ingin lihat dashboard mobile dengan key metrics (omzet, profit, transaksi), agar monitor bisnis dari HP
- **US-002**: Sebagai owner, saya ingin notifikasi push untuk event penting (omzet target tercapai, stok rendah), agar selalu update
- **US-003**: Sebagai owner, saya ingin lihat grafik omzet real-time di mobile, agar tahu performa bisnis saat ini
- **US-004**: Sebagai owner, saya ingin approve refund/diskon besar dari mobile, agar tidak perlu di depan komputer

### Epic 2: AI Sales Insight
- **US-005**: Sebagai owner, saya ingin dapat rekomendasi produk yang perlu restock berdasarkan AI, agar tidak kehabisan stok
- **US-006**: Sebagai owner, saya ingin dapat rekomendasi promo produk berdasarkan analisis AI, agar meningkatkan penjualan
- **US-007**: Sebagai owner, saya ingin prediksi omzet untuk periode mendatang berdasarkan AI, agar planning lebih akurat
- **US-008**: Sebagai owner, saya ingin deteksi anomali transaksi (fraud detection) oleh AI, agar keamanan terjaga

### Epic 3: Mode Restoran
- **US-009**: Sebagai manager restoran, saya ingin manage meja (table management), agar tahu meja mana yang kosong/terisi
- **US-010**: Sebagai kasir restoran, saya ingin pesanan per meja (order per table), agar bisa split bill per meja
- **US-011**: Sebagai manager restoran, saya ingin kitchen display system (KDS), agar dapur tahu pesanan yang masuk
- **US-012**: Sebagai manager restoran, saya ingin manage menu dengan kategori (appetizer, main, dessert), agar terorganisir

### Epic 4: Mode Salon
- **US-013**: Sebagai manager salon, saya ingin booking & jadwal pelanggan, agar tidak double booking
- **US-014**: Sebagai kasir salon, saya ingin assign layanan ke terapis (stylist assignment), agar tahu siapa yang handle
- **US-015**: Sebagai manager salon, saya ingin tracking komisi terapis per layanan, agar hitung bonus akurat
- **US-016**: Sebagai pelanggan, saya ingin booking online via link, agar mudah reservasi

### Epic 5: Mode Apotek
- **US-017**: Sebagai apoteker, saya ingin input resep dokter, agar tahu obat yang harus diberikan
- **US-018**: Sebagai apoteker, saya ingin tracking batch & expiry date obat, agar tidak jual obat expired
- **US-019**: Sebagai apoteker, saya ingin alert untuk obat yang akan expired, agar bisa promo atau return
- **US-020**: Sebagai apoteker, saya ingin validasi interaksi obat (drug interaction check), agar keamanan pasien

---

## 🔧 Functional Requirements

### FR-001: Dashboard Mobile Owner
- **FR-001.1**: Key Metrics Cards
  - Omzet hari ini (vs kemarin, % change)
  - Profit hari ini
  - Jumlah transaksi hari ini
  - Rata-rata nilai transaksi
  - Produk terjual hari ini
  - Pelanggan baru hari ini
  - Quick actions (approve, view detail)

- **FR-001.2**: Real-time Charts
  - Grafik omzet (line chart) - harian, mingguan, bulanan
  - Grafik transaksi (bar chart)
  - Top 5 produk terlaris
  - Metode pembayaran breakdown

- **FR-001.3**: Push Notifications
  - Notifikasi omzet target tercapai
  - Notifikasi stok rendah
  - Notifikasi refund/diskon besar perlu approval
  - Notifikasi transaksi besar
  - Customizable notification preferences

- **FR-001.4**: Quick Actions
  - Approve refund dari mobile
  - Approve diskon besar dari mobile
  - View detail transaksi
  - Contact support

- **FR-001.5**: Multi-Outlet View
  - Switch antar outlet
  - Konsolidasi semua outlet
  - Per-outlet metrics

### FR-002: AI Sales Insight
- **FR-002.1**: Restock Recommendation
  - Analisis produk yang sering out of stock
  - Prediksi demand berdasarkan historical data
  - Rekomendasi quantity restock
  - Confidence score untuk rekomendasi
  - Alert untuk produk yang perlu restock segera

- **FR-002.2**: Promo Recommendation
  - Analisis produk slow moving
  - Rekomendasi diskon persentase optimal
  - Prediksi impact promo terhadap penjualan
  - Seasonal trend analysis
  - Competitor price analysis (jika ada data)

- **FR-002.3**: Revenue Prediction
  - Prediksi omzet untuk periode mendatang (hari, minggu, bulan)
  - Confidence interval
  - Faktor yang mempengaruhi (seasonal, trend, event)
  - Comparison dengan actual (untuk improve model)

- **FR-002.4**: Anomaly Detection
  - Deteksi transaksi mencurigakan (fraud detection)
  - Deteksi perubahan pola penjualan yang tidak normal
  - Alert untuk outlier
  - Pattern recognition untuk transaksi berulang

- **FR-002.5**: Customer Insights
  - Customer segmentation berbasis AI
  - Prediksi churn (pelanggan yang akan berhenti)
  - Rekomendasi produk untuk pelanggan (personalized)
  - Lifetime value prediction

### FR-003: Mode Restoran
- **FR-003.1**: Table Management
  - Create/edit meja (nomor, kapasitas, lokasi)
  - Status meja (kosong, terisi, reserved, cleaning)
  - Visual floor plan (optional)
  - Assign meja ke transaksi
  - History penggunaan meja

- **FR-003.2**: Order per Table
  - Create order per meja
  - Multiple order per meja (jika ada tambahan)
  - Split bill per meja (bagi tagihan)
  - Merge bill (gabung beberapa meja)
  - Hold order (tunda pembayaran)

- **FR-003.3**: Kitchen Display System (KDS)
  - Display pesanan di dapur (real-time)
  - Status pesanan (pending, cooking, ready, served)
  - Update status dari dapur
  - Timer untuk estimasi waktu masak
  - Priority order (urgent)

- **FR-003.4**: Menu Management
  - Kategori menu (appetizer, main course, dessert, beverage)
  - Variant menu (spicy level, size, topping)
  - Availability menu (out of stock, seasonal)
  - Menu recommendation (chef's special)
  - Combo menu (paket)

- **FR-003.5**: Service Charge & Tax
  - Service charge (persentase)
  - Pajak restoran (jika ada)
  - Auto-calculate di bill

### FR-004: Mode Salon
- **FR-004.1**: Booking & Schedule
  - Calendar view untuk jadwal
  - Create booking (pelanggan, layanan, terapis, waktu)
  - Edit/cancel booking
  - Reminder booking (SMS/WhatsApp)
  - Walk-in customer (tanpa booking)

- **FR-004.2**: Service Management
  - List layanan (haircut, coloring, treatment, dll)
  - Durasi layanan
  - Harga layanan
  - Package layanan (multiple services)

- **FR-004.3**: Stylist/Therapist Assignment
  - Assign terapis ke booking
  - Availability terapis
  - Skill terapis (layanan yang bisa handle)
  - Performance tracking per terapis

- **FR-004.4**: Commission Tracking
  - Set komisi per layanan per terapis
  - Auto-calculate komisi setelah transaksi
  - Report komisi per periode
  - Export untuk payroll

- **FR-004.5**: Online Booking
  - Public booking link
  - Customer bisa booking sendiri
  - Auto-confirm atau manual approve
  - Integration dengan website/social media

### FR-005: Mode Apotek
- **FR-005.1**: Prescription Management
  - Input resep dokter
  - List obat di resep
  - Validasi stok obat
  - Print label resep
  - History resep per pasien

- **FR-005.2**: Batch & Expiry Tracking
  - Input batch number per obat
  - Input expiry date per batch
  - Auto-alert untuk obat yang akan expired (30 hari, 7 hari)
  - FIFO (First In First Out) untuk penjualan
  - Report obat expired

- **FR-005.3**: Drug Interaction Check
  - Database interaksi obat
  - Check interaksi saat input resep
  - Alert jika ada interaksi berbahaya
  - Suggestion alternatif obat

- **FR-005.4**: Regulatory Compliance
  - Tracking obat keras (harus dengan resep)
  - Validasi resep untuk obat tertentu
  - Log penjualan obat keras (untuk audit)
  - Expiry tracking untuk compliance

- **FR-005.5**: Patient Management
  - Data pasien (nama, alamat, alergi)
  - History pembelian obat
  - Alergi tracking
  - Reminder untuk obat rutin

---

## 🎨 UI/UX Requirements

### Mobile Dashboard Screen
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
│                                          │
│  Pending Approvals: 2                   │
│  [View]                                  │
└─────────────────────────────────────────┘
```

### AI Insight Screen
```
┌─────────────────────────────────────────┐
│  AI Sales Insight                       │
│  ─────────────────────────────────────  │
│  Restock Recommendations:              │
│  ┌──────────────────────────────────┐   │
│  │ Produk A - Stok: 5                │   │
│  │ Rekomendasi: Restock 50 pcs       │   │
│  │ Confidence: 85%                   │   │
│  │ [Restock Now]                     │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Promo Recommendations:                  │
│  ┌──────────────────────────────────┐   │
│  │ Produk B - Slow Moving           │   │
│  │ Rekomendasi: Diskon 15%          │   │
│  │ Prediksi Impact: +20% penjualan  │   │
│  │ [Apply Promo]                     │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Revenue Prediction:                   │
│  Prediksi Omzet Bulan Depan:            │
│  Rp 75.000.000 (± 10%)                  │
│  [View Details]                         │
└─────────────────────────────────────────┘
```

### Restaurant Table Management Screen
```
┌─────────────────────────────────────────┐
│  Table Management                       │
│  ─────────────────────────────────────  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  │ 01 │ │ 02 │ │ 03 │ │ 04 │         │
│  │ ✓  │ │ ✗  │ │ ✓  │ │ ⚠  │         │
│  └────┘ └────┘ └────┘ └────┘         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  │ 05 │ │ 06 │ │ 07 │ │ 08 │         │
│  │ ✓  │ │ ✓  │ │ ✗  │ │ ✓  │         │
│  └────┘ └────┘ └────┘ └────┘         │
│                                          │
│  Legend:                                │
│  ✓ Kosong  ✗ Terisi  ⚠ Reserved        │
│                                          │
│  [New Order] [View All Tables]          │
└─────────────────────────────────────────┘
```

### Salon Booking Screen
```
┌─────────────────────────────────────────┐
│  Booking Calendar                       │
│  ─────────────────────────────────────  │
│  [← Jan 2024 →]                         │
│                                          │
│  Mon 15    Tue 16    Wed 17            │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ 09:00│  │ 09:00│  │ 09:00│         │
│  │ Budi │  │      │  │ Siti │         │
│  └──────┘  └──────┘  └──────┘         │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ 10:00│  │ 10:00│  │ 10:00│         │
│  │      │  │ Andi │  │      │         │
│  └──────┘  └──────┘  └──────┘         │
│                                          │
│  [New Booking] [View Schedule]          │
└─────────────────────────────────────────┘
```

### Pharmacy Prescription Screen
```
┌─────────────────────────────────────────┐
│  Input Resep                            │
│  ─────────────────────────────────────  │
│  Nama Pasien: [________________]        │
│  Dokter: [________________]             │
│  Tanggal: [01 Jan 2024]                │
│                                          │
│  Obat:                                   │
│  [Pilih Obat ▼]                         │
│  Quantity: [____]                       │
│  Batch: [AUTO-001]                      │
│  Expiry: [01 Dec 2025]                  │
│  [Tambah Obat]                          │
│                                          │
│  [Check Interaction] [Simpan Resep]     │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: Data Privacy
- AI model training dengan anonymized data
- Patient data encryption (untuk apotek)
- GDPR-like compliance untuk data pelanggan

### SEC-002: AI Model Security
- Model versioning
- A/B testing untuk model baru
- Fallback jika AI service down

### SEC-003: Regulatory Compliance
- Obat keras tracking (apotek)
- Prescription validation
- Audit trail untuk compliance

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Load mobile dashboard: < 2 detik
- AI recommendation: < 3 detik
- Table management update: < 500ms
- Booking calendar load: < 1 detik

### PERF-002: Scalability
- Support hingga 100 meja per restoran
- Support hingga 50 booking per hari per salon
- AI model inference: 1000 requests per menit

---

## 🧪 Acceptance Criteria

### AC-001: Mobile Dashboard
- ✅ Key metrics ter-update real-time
- ✅ Push notifications berfungsi
- ✅ Quick actions (approve) sukses
- ✅ Multi-outlet switch berfungsi

### AC-002: AI Sales Insight
- ✅ Restock recommendation akurat (> 80% confidence)
- ✅ Promo recommendation meningkatkan penjualan
- ✅ Revenue prediction error < 15%
- ✅ Anomaly detection mendeteksi fraud

### AC-003: Mode Restoran
- ✅ Table management berfungsi
- ✅ Order per meja tersimpan
- ✅ KDS update real-time
- ✅ Split bill akurat

### AC-004: Mode Salon
- ✅ Booking tidak double booking
- ✅ Stylist assignment berfungsi
- ✅ Commission calculation akurat
- ✅ Online booking terintegrasi

### AC-005: Mode Apotek
- ✅ Prescription input & validasi berfungsi
- ✅ Expiry alert tepat waktu
- ✅ Drug interaction check akurat
- ✅ Batch tracking konsisten

---

## 🔗 Integrations

### INT-001: AI/ML Services
- **OpenAI API**: Untuk natural language processing (optional)
- **Custom ML Model**: Untuk sales prediction, anomaly detection
- **TensorFlow/PyTorch**: Model training & inference

### INT-002: Push Notifications
- **Firebase Cloud Messaging (FCM)**: Mobile push notifications
- **OneSignal**: Alternative push service

### INT-003: Third-Party Services
- **Google Calendar API**: Untuk booking integration (optional)
- **WhatsApp API**: Reminder booking

---

## 📈 Success Metrics

### Business Metrics
- **AI Recommendation Adoption**: % owner yang pakai AI insights
- **Mobile Dashboard Usage**: % owner yang akses mobile dashboard
- **Mode-Specific Adoption**: % tenant yang aktif pakai mode khusus

### User Metrics
- **AI Accuracy**: % rekomendasi yang diikuti dan sukses
- **Mobile Engagement**: Rata-rata waktu di mobile dashboard
- **User Satisfaction**: > 4.5/5

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic mobile dashboard (key metrics, charts)
- Basic AI restock recommendation
- Basic table management (restoran)

### Phase 2: Enhanced (Week 5-8)
- Full AI insights (promo, prediction, anomaly)
- Complete mode restoran (KDS, menu management)
- Mode salon (booking, stylist assignment)

### Phase 3: Advanced (Week 9-12)
- Mode apotek (prescription, batch tracking)
- Advanced AI features (customer insights)
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- AI model accuracy vs interpretability trade-off
- Offline mode untuk mobile dashboard
- Double booking prevention (salon)
- Drug interaction database update (apotek)

### Future Enhancements
- Voice command untuk mobile dashboard
- Computer vision untuk inventory counting
- Predictive maintenance untuk hardware
- Integration dengan delivery apps (GoFood, GrabFood)

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

