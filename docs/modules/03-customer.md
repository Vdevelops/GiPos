# PRD: Modul Pelanggan

**Modul ID**: MOD-003  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P1 (High)

---

## 📋 Ringkasan

Modul Pelanggan menyediakan fungsi CRM (Customer Relationship Management) dasar untuk mengelola data pelanggan, riwayat transaksi, program loyalty (poin), dan notifikasi otomatis via WhatsApp. Modul ini membantu bisnis membangun hubungan jangka panjang dengan pelanggan.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Membangun database pelanggan yang terorganisir
- Meningkatkan retensi pelanggan melalui loyalty program
- Memudahkan komunikasi dengan pelanggan (promo, notifikasi)
- Memberikan insights tentang perilaku pelanggan

### Value Proposition
- **Loyalty Program**: Poin reward untuk meningkatkan repeat purchase
- **Personalized**: Diskon khusus member, promo birthday
- **Komunikasi**: Notifikasi WhatsApp otomatis
- **Insights**: Riwayat transaksi untuk memahami preferensi pelanggan

---

## 👥 User Personas

### Primary User: Admin/Manager
- **Kebutuhan**: Manage data pelanggan, set loyalty rules, kirim promo
- **Skill Level**: Intermediate
- **Context**: Desktop/web

### Secondary User: Kasir
- **Kebutuhan**: Cari pelanggan, apply poin/diskon member
- **Skill Level**: Basic
- **Context**: Mobile/tablet, butuh cepat

---

## 🎨 User Stories

### Epic 1: Manajemen Data Pelanggan
- **US-001**: Sebagai admin, saya ingin menambah pelanggan baru (nama, HP, email), agar database lengkap
- **US-002**: Sebagai admin, saya ingin edit data pelanggan, agar informasi selalu update
- **US-003**: Sebagai kasir, saya ingin cari pelanggan cepat (nama, HP, member ID), agar apply diskon/poin
- **US-004**: Sebagai admin, saya ingin lihat riwayat transaksi pelanggan, agar tahu purchase behavior

### Epic 2: Loyalty Program (Poin)
- **US-005**: Sebagai admin, saya ingin set rules poin (contoh: 1 transaksi = 10 poin, 100 poin = diskon 10%), agar reward system jelas
- **US-006**: Sebagai sistem, saya ingin auto-accrue poin setelah transaksi, agar pelanggan dapat reward
- **US-007**: Sebagai kasir, saya ingin apply poin untuk diskon (redeem poin), agar pelanggan bisa pakai reward
- **US-008**: Sebagai pelanggan, saya ingin lihat saldo poin saya, agar tahu berapa poin tersedia

### Epic 3: Diskon Member
- **US-009**: Sebagai admin, saya ingin set diskon khusus member (contoh: 10% untuk semua member), agar member dapat benefit
- **US-010**: Sebagai kasir, saya ingin apply diskon member otomatis saat pilih pelanggan member, agar tidak perlu input manual
- **US-011**: Sebagai admin, saya ingin tier member (Bronze, Silver, Gold) dengan diskon berbeda, agar reward bertingkat

### Epic 4: Notifikasi Otomatis
- **US-012**: Sebagai sistem, saya ingin kirim notifikasi WhatsApp setelah transaksi (nota digital), agar pelanggan dapat bukti
- **US-013**: Sebagai sistem, saya ingin kirim promo/pengumuman ke semua pelanggan atau segment tertentu, agar marketing efektif
- **US-014**: Sebagai sistem, saya ingin kirim notifikasi ulang tahun dengan promo khusus, agar personal touch
- **US-015**: Sebagai pelanggan, saya ingin terima notifikasi stok produk favorit kembali, agar tidak kehabisan

### Epic 5: Segmentasi & Analytics
- **US-016**: Sebagai admin, saya ingin lihat pelanggan VIP (paling sering beli), agar bisa kasih treatment khusus
- **US-017**: Sebagai admin, saya ingin lihat pelanggan yang lama tidak beli (churned), agar bisa re-engagement campaign
- **US-018**: Sebagai admin, saya ingin segmentasi pelanggan (by total belanja, frekuensi, kategori favorit), agar targeted marketing

---

## 🔧 Functional Requirements

### FR-001: CRUD Pelanggan
- **FR-001.1**: Create pelanggan
  - Nama (required)
  - Nomor HP (required, unique, format Indonesia)
  - Email (optional, unique jika ada)
  - Alamat (optional)
  - Tanggal lahir (optional, untuk birthday promo)
  - Jenis kelamin (optional)
  - Kategori/Tag (VIP, Regular, dll)
  - Status member (aktif/nonaktif)
  - Foto profil (optional)

- **FR-001.2**: Read/List pelanggan
  - Grid/List view dengan nama, HP, total belanja, poin
  - Search by nama, HP, email, member ID
  - Filter by status, kategori, tier
  - Sort by nama, total belanja, terakhir belanja

- **FR-001.3**: Update pelanggan
  - Edit semua field
  - Bulk update (kategori, status)
  - Merge duplicate (jika ada duplikasi)

- **FR-001.4**: Delete/Deactivate pelanggan
  - Soft delete (nonaktifkan)
  - Validasi: tidak bisa hapus jika ada transaksi
  - Archive pelanggan lama

### FR-002: Loyalty Program (Poin)
- **FR-002.1**: Rules poin
  - Accrue: 1 transaksi = X poin (atau 1 rupiah = Y poin)
  - Minimum transaksi untuk dapat poin (contoh: min Rp 10.000)
  - Expiry poin (opsional, contoh: poin expire setelah 1 tahun)
- **FR-002.2**: Accrue poin otomatis
  - Setelah transaksi berhasil
  - Calculate berdasarkan rules
  - Notifikasi ke pelanggan (opsional)
- **FR-002.3**: Redeem poin
  - Pilih pelanggan di POS
  - Lihat saldo poin
  - Input poin yang akan dipakai
  - Convert ke diskon (contoh: 100 poin = Rp 10.000 diskon)
  - Deduct poin dari saldo
- **FR-002.4**: History poin
  - Timeline accrue & redeem
  - Filter by date range
  - Export untuk audit

### FR-003: Tier Member
- **FR-003.1**: Define tier
  - Bronze, Silver, Gold, Platinum (customizable)
  - Rules per tier (contoh: Gold = total belanja > Rp 5.000.000)
- **FR-003.2**: Auto-assign tier
  - Based on total belanja atau frekuensi
  - Auto-upgrade/downgrade
- **FR-003.3**: Benefit per tier
  - Diskon berbeda (Bronze 5%, Silver 10%, Gold 15%)
  - Poin multiplier (Gold dapat 2x poin)
  - Free shipping (jika ada e-commerce)

### FR-004: Diskon Member
- **FR-004.1**: Set diskon member
  - Diskon persentase atau nominal
  - Per tier atau semua member
  - Per kategori produk (opsional)
- **FR-004.2**: Apply diskon otomatis
  - Saat pilih pelanggan member di POS
  - Calculate diskon berdasarkan tier
  - Override manual (jika perlu)

### FR-005: Notifikasi WhatsApp
- **FR-005.1**: Nota digital otomatis
  - Kirim setelah transaksi
  - Format: PDF atau image
  - Include: detail transaksi, poin dapat, saldo poin
- **FR-005.2**: Promo & pengumuman
  - Broadcast ke semua pelanggan
  - Segmentasi (by tier, kategori, dll)
  - Scheduled send (jadwal kirim)
- **FR-005.3**: Birthday promo
  - Auto-detect ulang tahun
  - Kirim promo khusus (contoh: diskon 20%)
  - Template pesan customizable
- **FR-005.4**: Stok kembali
  - Notifikasi saat produk favorit kembali stok
  - Based on wishlist atau purchase history

### FR-006: Riwayat Transaksi Pelanggan
- **FR-006.1**: List transaksi per pelanggan
  - Tanggal, produk, jumlah, total
  - Filter by date range
  - Sort by tanggal
- **FR-006.2**: Statistik pelanggan
  - Total belanja (lifetime)
  - Rata-rata transaksi
  - Frekuensi belanja
  - Kategori produk favorit
  - Terakhir belanja

### FR-007: Segmentasi Pelanggan
- **FR-007.1**: Segment by criteria
  - Total belanja (VIP > Rp 1.000.000)
  - Frekuensi (frequent > 10x/bulan)
  - Kategori favorit
  - Tier member
  - Churned (tidak belanja > 3 bulan)
- **FR-007.2**: Export segment
  - Untuk marketing campaign
  - Format: Excel atau CSV

---

## 🎨 UI/UX Requirements

### Customer List Screen
```
┌─────────────────────────────────────────┐
│ [Search] [Filter] [+ New Customer]     │
├─────────────────────────────────────────┤
│ ┌──────────────────────────────────┐   │
│ │ [Photo] Budi Santoso             │   │
│ │ HP: 0812-3456-7890              │   │
│ │ Total: Rp 2.500.000 | Poin: 250 │   │
│ │ Tier: Gold | Terakhir: 2 hari    │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ [Photo] Siti Nurhaliza           │   │
│ │ HP: 0813-4567-8901              │   │
│ │ Total: Rp 1.200.000 | Poin: 120 │   │
│ │ Tier: Silver | Terakhir: 1 minggu│   │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Customer Detail Screen
```
┌─────────────────────────────────────────┐
│  Detail Pelanggan                       │
│  ─────────────────────────────────────  │
│  [Photo]                                │
│  Nama: Budi Santoso                     │
│  HP: 0812-3456-7890                     │
│  Email: budi@email.com                  │
│  Alamat: Jl. Merdeka No. 123            │
│  Tanggal Lahir: 15 Jan 1990             │
│  Tier: Gold                             │
│                                          │
│  Statistik:                             │
│  Total Belanja: Rp 2.500.000           │
│  Poin: 250                              │
│  Transaksi: 45x                         │
│  Rata-rata: Rp 55.556                   │
│  Terakhir: 2 hari lalu                  │
│                                          │
│  [Riwayat] [Poin] [Edit] [Hapus]        │
└─────────────────────────────────────────┘
```

### Loyalty Rules Screen
```
┌─────────────────────────────────────────┐
│  Aturan Loyalty Program                 │
│  ─────────────────────────────────────  │
│  Poin Accrue:                            │
│  [ ] 1 transaksi = [10] poin            │
│  [✓] 1 rupiah = [0.01] poin            │
│  Min transaksi: Rp [10.000]             │
│                                          │
│  Poin Redeem:                           │
│  [100] poin = Rp [10.000] diskon        │
│                                          │
│  Expiry: [ ] Tidak ada                  │
│          [✓] Expire setelah [12] bulan  │
│                                          │
│  [Simpan]                                │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: Data Privacy
- PII (Personal Identifiable Information) encrypted
- Consent untuk notifikasi WhatsApp (GDPR-like)
- Opt-out option untuk pelanggan

### SEC-002: Authorization
- Hanya admin yang bisa edit/delete pelanggan
- Kasir hanya bisa view & apply poin/diskon
- Export data butuh approval

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Search pelanggan: < 500ms
- Load customer list (1000 pelanggan): < 2 detik
- Apply poin/diskon: < 1 detik

### PERF-002: Scalability
- Support hingga 10.000 pelanggan per outlet
- Broadcast WhatsApp: 1000 pesan per menit

---

## 🧪 Acceptance Criteria

### AC-001: Loyalty Program
- ✅ Poin auto-accrue setelah transaksi
- ✅ Redeem poin untuk diskon
- ✅ Saldo poin ter-update real-time
- ✅ History poin tersimpan

### AC-002: Notifikasi WhatsApp
- ✅ Nota digital terkirim setelah transaksi
- ✅ Promo broadcast ke segment
- ✅ Birthday promo auto-send
- ✅ Template pesan customizable

### AC-003: Tier Member
- ✅ Auto-assign tier berdasarkan rules
- ✅ Diskon berbeda per tier
- ✅ Upgrade/downgrade otomatis

---

## 🔗 Integrations

### INT-001: WhatsApp API
- **Fonnte**: WhatsApp Business API
- **Qontak**: WhatsApp API alternative
- **Twilio**: International (backup)

### INT-002: SMS (Optional)
- SMS gateway untuk backup jika WhatsApp gagal

---

## 📈 Success Metrics

### Business Metrics
- **Customer Retention Rate**: % pelanggan yang repeat purchase
- **Loyalty Program Adoption**: % pelanggan yang aktif pakai poin
- **Average Customer Lifetime Value**: Rata-rata total belanja per pelanggan

### User Metrics
- **Time to Find Customer**: Target < 5 detik
- **Notification Delivery Rate**: > 95%
- **User Satisfaction**: > 4.5/5

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic CRUD pelanggan
- Loyalty program sederhana (poin accrue & redeem)
- Nota digital via WhatsApp

### Phase 2: Enhanced (Week 5-8)
- Tier member
- Diskon member otomatis
- Promo broadcast
- Customer analytics

### Phase 3: Advanced (Week 9-12)
- Birthday promo
- Stok kembali notifikasi
- Advanced segmentasi
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- Pelanggan dengan nomor HP sama (duplikasi)
- Poin negatif (jika ada error)
- WhatsApp rate limit
- Pelanggan opt-out notifikasi

### Future Enhancements
- Referral program (pelanggan ajak teman dapat poin)
- Wishlist produk
- Review & rating produk
- Chat support via WhatsApp

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

