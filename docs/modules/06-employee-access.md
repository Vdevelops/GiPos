# PRD: Modul Karyawan & Hak Akses

**Modul ID**: MOD-006  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P1 (High)

---

## 📋 Ringkasan

Modul Karyawan & Hak Akses menyediakan sistem manajemen karyawan, role-based access control (RBAC), shift management, dan audit log untuk memastikan keamanan dan kontrol akses yang tepat di platform GiPos. Modul ini memungkinkan owner dan manager mengelola tim, mengatur hak akses, dan memantau aktivitas karyawan.

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Mengelola data karyawan dan struktur organisasi
- Mengontrol akses fitur berdasarkan role dan permission
- Memantau aktivitas karyawan untuk audit dan keamanan
- Mengelola shift kerja dan absensi kasir

### Value Proposition
- **Kontrol Penuh**: RBAC untuk mengatur siapa bisa akses apa
- **Keamanan**: Audit log untuk tracking semua aktivitas
- **Fleksibel**: Custom role dan permission sesuai kebutuhan
- **Efisien**: Shift management untuk operasional harian

---

## 👥 User Personas

### Primary User: Owner/Pemilik Bisnis
- **Kebutuhan**: Kelola karyawan, set hak akses, monitor aktivitas
- **Skill Level**: Intermediate
- **Context**: Desktop/web, butuh kontrol penuh

### Secondary User: Manager/Supervisor
- **Kebutuhan**: Kelola kasir, approve akses, lihat log aktivitas
- **Skill Level**: Intermediate
- **Context**: Desktop/web atau mobile

### Tertiary User: Kasir
- **Kebutuhan**: Login, buka/tutup shift, lihat info sendiri
- **Skill Level**: Basic
- **Context**: Mobile/tablet, butuh cepat

---

## 🎨 User Stories

### Epic 1: Manajemen Karyawan
- **US-001**: Sebagai owner, saya ingin menambah karyawan baru (nama, email, HP, role), agar tim bisa akses sistem
- **US-002**: Sebagai owner, saya ingin edit data karyawan (role, outlet, status), agar informasi selalu update
- **US-003**: Sebagai owner, saya ingin nonaktifkan karyawan yang resign, agar tidak bisa akses sistem
- **US-004**: Sebagai owner, saya ingin lihat list semua karyawan dengan role dan outlet, agar overview tim

### Epic 2: Role-Based Access Control (RBAC)
- **US-005**: Sebagai owner, saya ingin set role karyawan (admin, manager, kasir, accountant), agar hak akses sesuai
- **US-006**: Sebagai owner, saya ingin custom permission per role (contoh: kasir bisa refund tapi tidak bisa hapus produk), agar kontrol lebih detail
- **US-007**: Sebagai sistem, saya ingin enforce permission di setiap aksi (create, read, update, delete), agar tidak ada akses tidak sah
- **US-008**: Sebagai owner, saya ingin assign karyawan ke outlet tertentu, agar kasir hanya akses outlet mereka

### Epic 3: Shift Management
- **US-009**: Sebagai kasir, saya ingin buka shift (input saldo awal kas), agar mulai transaksi hari ini
- **US-010**: Sebagai kasir, saya ingin tutup shift (input saldo akhir, hitung selisih), agar rekonsiliasi harian
- **US-011**: Sebagai manager, saya ingin approve tutup shift kasir, agar validasi saldo benar
- **US-012**: Sebagai owner, saya ingin lihat history shift per kasir, agar track operasional harian

### Epic 4: Absensi & Komisi (Opsional)
- **US-013**: Sebagai kasir, saya ingin check-in/check-out shift, agar absensi otomatis
- **US-014**: Sebagai owner, saya ingin set komisi per kasir (persentase dari penjualan), agar insentif tim
- **US-015**: Sebagai owner, saya ingin lihat laporan komisi per kasir per periode, agar hitung bonus

### Epic 5: Audit Log & Aktivitas
- **US-016**: Sebagai owner, saya ingin lihat log aktivitas semua karyawan (siapa, kapan, apa), agar audit trail jelas
- **US-017**: Sebagai owner, saya ingin filter log by karyawan, tanggal, aksi, agar cepat temukan aktivitas tertentu
- **US-018**: Sebagai owner, saya ingin export log untuk audit compliance, agar dokumentasi lengkap
- **US-019**: Sebagai sistem, saya ingin log semua aksi penting (refund, hapus produk, ubah harga), agar keamanan terjaga

---

## 🔧 Functional Requirements

### FR-001: CRUD Karyawan
- **FR-001.1**: Create karyawan
  - Nama lengkap (required)
  - Email (required, unique, untuk login)
  - Nomor HP (required, untuk notifikasi)
  - Role (required: admin, manager, kasir, accountant)
  - Outlet assignment (multi-select jika multi-outlet)
  - Status (aktif/nonaktif)
  - Tanggal bergabung
  - Foto profil (optional)
  - Password (auto-generate atau manual set)

- **FR-001.2**: Read/List karyawan
  - Grid/List view dengan nama, email, role, outlet, status
  - Search by nama, email, HP
  - Filter by role, outlet, status
  - Sort by nama, tanggal bergabung

- **FR-001.3**: Update karyawan
  - Edit semua field (kecuali email jika sudah ada transaksi)
  - Change role (dengan approval owner)
  - Change outlet assignment
  - Reset password
  - Bulk update (status, outlet)

- **FR-001.4**: Delete/Deactivate karyawan
  - Soft delete (nonaktifkan, tidak hapus dari DB)
  - Validasi: tidak bisa hapus jika ada transaksi aktif
  - Archive karyawan lama

### FR-002: Role-Based Access Control (RBAC)
- **FR-002.1**: Predefined Roles
  - **System Admin**: Full access (platform level, untuk tim GiPos)
  - **Tenant Owner (Admin)**: Full access tenant (manage semua outlet, karyawan, settings)
  - **Manager**: Manage staff, view reports, approve refunds/diskon besar, manage produk
  - **Kasir**: Create sales, refund kecil, view produk, tidak bisa edit/hapus produk
  - **Accountant**: View finance reports, export data, reconcile, tidak bisa edit transaksi
  - **Supervisor**: Monitor kasir, approve refund/diskon, view reports

- **FR-002.2**: Custom Roles (Enterprise)
  - Create custom role dengan nama
  - Assign permissions granular (per modul, per aksi)
  - Permission matrix: Create, Read, Update, Delete, Approve, Export

- **FR-002.3**: Permission Matrix
  - **POS Core**: Create sale, Refund, Void, View sales
  - **Produk**: Create, Read, Update, Delete, Import/Export
  - **Pelanggan**: Create, Read, Update, Delete, View history
  - **Laporan**: View reports, Export reports
  - **Keuangan**: View finance, Reconcile, Export
  - **Karyawan**: Manage staff (hanya owner/manager)
  - **Settings**: Manage outlet, Manage subscription

- **FR-002.4**: Outlet-Level Access
  - Assign karyawan ke outlet tertentu
  - Kasir hanya bisa akses outlet yang di-assign
  - Manager bisa akses semua outlet (jika di-set)
  - Owner akses semua outlet

- **FR-002.5**: Permission Enforcement
  - Check permission di setiap API endpoint
  - UI hide/show button berdasarkan permission
  - Error message jika akses ditolak

### FR-003: Shift Management
- **FR-003.1**: Buka Shift
  - Pilih kasir
  - Input saldo awal kas (tunai)
  - Tanggal & waktu buka shift
  - Notes (opsional)
  - Validasi: tidak bisa buka shift jika shift sebelumnya belum tutup

- **FR-003.2**: Tutup Shift
  - Pilih shift yang akan ditutup
  - Input saldo akhir kas (fisik count)
  - Hitung selisih (selisih = saldo akhir - saldo awal - penjualan tunai + refund tunai)
  - Summary: total penjualan, total refund, metode pembayaran breakdown
  - Notes (untuk selisih jika ada)
  - Approval supervisor (jika selisih > threshold)

- **FR-003.3**: Shift History
  - List semua shift per kasir
  - Filter by tanggal, kasir, outlet
  - Detail: saldo awal, saldo akhir, selisih, total penjualan
  - Export untuk rekonsiliasi

- **FR-003.4**: Shift Validation
  - Validasi: tidak bisa tutup shift jika ada transaksi pending
  - Lock shift setelah tutup (tidak bisa edit)
  - Reopen shift (dengan approval owner, untuk koreksi)

### FR-004: Absensi (Opsional)
- **FR-004.1**: Check-In/Check-Out
  - Check-in saat buka shift (GPS location optional)
  - Check-out saat tutup shift
  - Auto-calculate jam kerja
  - Late check-in alert

- **FR-004.2**: Absensi Report
  - List absensi per karyawan
  - Filter by tanggal, karyawan
  - Summary: total jam kerja, late count, absent count
  - Export untuk payroll

### FR-005: Komisi (Opsional)
- **FR-005.1**: Set Komisi Rules
  - Komisi persentase dari penjualan (contoh: 2%)
  - Komisi per produk (fixed amount)
  - Minimum target penjualan untuk dapat komisi
  - Per kasir atau semua kasir

- **FR-005.2**: Calculate Komisi
  - Auto-calculate setelah tutup shift
  - Based on penjualan per kasir
  - Exclude refund dari perhitungan

- **FR-005.3**: Komisi Report
  - List komisi per kasir per periode
  - Total komisi, breakdown per shift
  - Export untuk payroll

### FR-006: Audit Log & Aktivitas
- **FR-006.1**: Log Aktivitas
  - Record semua aksi penting:
    - Login/Logout
    - Create/Update/Delete produk
    - Create/Refund/Void transaksi
    - Approve refund/diskon
    - Change harga
    - Edit karyawan
    - Export data
    - Change settings
  - Fields: timestamp, user, action, resource, old value, new value, IP address

- **FR-006.2**: View Log
  - List semua log dengan filter
  - Filter by: user, date range, action type, resource
  - Search by keyword
  - Sort by timestamp

- **FR-006.3**: Export Log
  - Export to Excel/CSV
  - Filter export (by date, user, action)
  - For audit compliance

- **FR-006.4**: Log Retention
  - Retain log minimal 1 tahun (configurable)
  - Archive log lama (optional)
  - Compliance dengan regulasi data

---

## 🎨 UI/UX Requirements

### Employee List Screen
```
┌─────────────────────────────────────────┐
│ [Search] [Filter] [+ New Employee]     │
├─────────────────────────────────────────┤
│ ┌──────────────────────────────────┐   │
│ │ [Photo] Budi Santoso               │   │
│ │ Email: budi@email.com              │   │
│ │ Role: Kasir | Outlet: Cabang A    │   │
│ │ Status: Aktif | Bergabung: Jan 2024│   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ [Photo] Siti Nurhaliza             │   │
│ │ Email: siti@email.com             │   │
│ │ Role: Manager | Outlet: All       │   │
│ │ Status: Aktif | Bergabung: Dec 2023│   │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Role & Permission Screen
```
┌─────────────────────────────────────────┐
│  Role & Permission                      │
│  ─────────────────────────────────────  │
│  Role: Kasir                            │
│                                          │
│  Permissions:                          │
│  [✓] POS Core - Create Sale            │
│  [✓] POS Core - Refund                 │
│  [ ] POS Core - Void                   │
│  [✓] Produk - Read                      │
│  [ ] Produk - Create/Update/Delete      │
│  [✓] Pelanggan - Read                   │
│  [ ] Laporan - View                     │
│  [ ] Keuangan - View                    │
│                                          │
│  [Simpan]                               │
└─────────────────────────────────────────┘
```

### Shift Management Screen
```
┌─────────────────────────────────────────┐
│  Shift Management                       │
│  ─────────────────────────────────────  │
│  Kasir: Budi Santoso                    │
│  Outlet: Cabang A                       │
│                                          │
│  Buka Shift:                            │
│  Tanggal: 01 Jan 2024                   │
│  Saldo Awal: Rp [________]              │
│  [Buka Shift]                           │
│                                          │
│  Tutup Shift:                           │
│  Saldo Akhir: Rp [________]             │
│  Selisih: Rp 0                          │
│  Total Penjualan: Rp 2.500.000          │
│  [Tutup Shift]                          │
└─────────────────────────────────────────┘
```

### Audit Log Screen
```
┌─────────────────────────────────────────┐
│  Audit Log                              │
│  ─────────────────────────────────────  │
│  [Filter] [Export]                      │
│                                          │
│  [Table: Log]                            │
│  Waktu | User | Aksi | Resource | Detail│
│  10:00 | Budi | Create| Sale    | ...  │
│  09:30 | Siti | Update| Product | ...  │
│  ...                                    │
│                                          │
│  [Pagination]                            │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: Authentication
- Password policy (min 8 chars, complexity)
- 2FA (Two-Factor Authentication) untuk owner/manager (optional)
- Session timeout (30 menit inactive)
- Force password change setelah reset

### SEC-002: Authorization
- RBAC enforcement di backend (tidak hanya frontend)
- API rate limiting per user
- IP whitelist untuk admin (optional, enterprise)

### SEC-003: Audit & Compliance
- Log semua aksi sensitive (tidak bisa dihapus)
- Immutable audit log (append-only)
- Compliance dengan regulasi data privacy

### SEC-004: Data Protection
- Encrypt sensitive data (password, PII)
- Secure password storage (bcrypt/argon2)
- Token rotation untuk API keys

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Load employee list (100 karyawan): < 1 detik
- Check permission: < 50ms
- Load audit log (1000 entries): < 2 detik
- Buka/tutup shift: < 1 detik

### PERF-002: Scalability
- Support hingga 100 karyawan per outlet
- Support hingga 10.000 audit log entries per hari
- Concurrent users: 50 karyawan per outlet

---

## 🧪 Acceptance Criteria

### AC-001: RBAC
- ✅ Permission enforced di backend
- ✅ UI hide/show sesuai permission
- ✅ Error message jika akses ditolak
- ✅ Custom role bisa dibuat dan di-assign

### AC-002: Shift Management
- ✅ Buka shift dengan saldo awal
- ✅ Tutup shift dengan rekonsiliasi
- ✅ Validasi: tidak bisa buka jika shift sebelumnya belum tutup
- ✅ History shift tersimpan

### AC-003: Audit Log
- ✅ Semua aksi penting ter-log
- ✅ Filter & search berfungsi
- ✅ Export log sukses
- ✅ Log tidak bisa dihapus (immutable)

---

## 🔗 Integrations

### INT-001: Authentication
- JWT tokens untuk API auth
- Refresh token rotation
- OAuth (Google, Microsoft) untuk enterprise (optional)

### INT-002: Notifications
- Email untuk reset password
- WhatsApp untuk notifikasi shift (opsional)

---

## 📈 Success Metrics

### Business Metrics
- **User Adoption**: % karyawan yang aktif login per bulan
- **Permission Accuracy**: % akses yang sesuai dengan role
- **Shift Compliance**: % shift yang tutup tepat waktu

### User Metrics
- **Time to Add Employee**: Target < 2 menit
- **Time to Set Permission**: Target < 1 menit
- **User Satisfaction**: > 4.5/5

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-4)
- Basic CRUD karyawan
- Predefined roles (owner, manager, kasir)
- Basic permission enforcement
- Shift management (buka/tutup)

### Phase 2: Enhanced (Week 5-8)
- Custom roles & granular permissions
- Audit log dasar
- Absensi (opsional)
- Export log

### Phase 3: Advanced (Week 9-12)
- Komisi calculation (opsional)
- Advanced audit log (immutable)
- 2FA untuk admin
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- Karyawan dengan multiple roles
- Shift overlap (kasir lupa tutup shift)
- Permission conflict (multiple roles)
- Audit log storage (volume besar)

### Future Enhancements
- Biometric login (fingerprint, face recognition)
- Geolocation untuk check-in
- Advanced analytics (employee performance)
- Integration dengan payroll system

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

