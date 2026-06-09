# SIAKSA — Sistem Informasi Siklus Akuntansi

SIAKSA adalah platform akuntansi berbasis web yang mendigitalisasi siklus akuntansi lengkap secara otomatis. Sistem ini dirancang untuk menangani entitas bisnis ganda (**Multi-Tenancy**), di mana satu akun pengguna dapat mengelola berbagai perusahaan dengan data yang terisolasi sepenuhnya.

---

## 📋 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Spesifikasi Teknis (Tech Stack)](#-spesifikasi-teknis-tech-stack)
3. [Arsitektur & Alur Data Frontend](#-arsitektur--alur-data-frontend)
4. [Arsitektur Data & Database Backend](#-arsitektur-data--database-backend)
5. [Dokumentasi API (Kontrak Data)](#-dokumentasi-api-kontrak-data)
6. [Logika Bisnis & Perhitungan Laporan](#-logika-bisnis--perhitungan-laporan)
7. [Panduan Instalasi & Pengaturan](#-panduan-instalasi--pengaturan)

---

## 🚀 Fitur Utama

- **Multi-Tenant Architecture**: Isolasi data antar perusahaan menggunakan header `x-company-id`.
- **Chart of Accounts Dinamis**: Validasi otomatis kode akun berdasarkan kategori standar akuntansi.
- **Double-Entry Journaling**: Sistem jurnal umum dan penyesuaian dengan validasi keseimbangan debit-kredit.
- **Real-Time Financial Reporting**: Laporan Buku Besar, Neraca Saldo, Laba Rugi, dan Neraca yang diperbarui secara instan.
- **Export & Print Ready**: Laporan dapat dicetak langsung (khusus tampilan printer) atau diekspor ke Excel.

---

## 🛠️ Spesifikasi Teknis (Tech Stack)

### Frontend (Modern React Ecosystem)
- **Framework**: React v18 + Vite (Ultra-fast development).
- **State Management**: Zustand (Global state dengan persistensi ke localStorage).
- **Data Fetching**: TanStack Query v5 (Caching, synchronization, & background updates).
- **UI Components**: Shadcn UI + Tailwind CSS (Accessible & highly customizable).
- **Routing**: React Router v6 (Protected routes & layout nesting).
- **Integrasi API**: Axios dengan interceptors otomatis.

### Backend (Node.js/NestJS)
- **Framework**: NestJS v10 (Robust, modular, & scalable).
- **ORM**: Prisma v5 (Type-safe database client).
- **Database**: PostgreSQL v15 (Relational storage).
- **Security**: JWT (Stateless auth) & Bcrypt (Password hashing).

---

## 💻 Arsitektur & Alur Data Frontend

Frontend SIAKSA dirancang dengan pola **Hook-based Data Fetching** untuk memisahkan logika data dari UI.

### 1. Manajemen State Global (Zustand)
Lokasi: `src/store/authStore.ts`
Menyimpan state kritis yang bertahan meskipun halaman di-refresh:
- `user`: Data profil pengguna aktif.
- `token`: JWT untuk otorisasi API.
- `activeCompanyId`: UUID perusahaan yang sedang dikelola (kunci multi-tenancy).

### 2. Integrasi API Otomatis
Lokasi: `src/api/axios.ts`
Axios dikonfigurasi dengan interceptor untuk menyisipkan header pada setiap permintaan:
```javascript
// Header yang disisipkan otomatis:
Authorization: Bearer <token>
x-company-id: <activeCompanyId>
```
*Jika API mengembalikan status 401 (Expired), sistem akan otomatis melakukan logout dan mengarahkan ke halaman login.*

### 3. Pola Pengambilan Data (React Query)
Setiap modul memiliki custom hooks di `src/api/hooks/` (contoh: `useAccounts`, `useJournals`, `useReports`). 
- **Caching**: Data laporan tidak di-fetch ulang jika sudah ada di cache, kecuali terjadi mutasi data.
- **Optimistic Updates**: Digunakan pada beberapa modul untuk memberikan UI yang instan.

### 4. Sistem Laporan & Ekspor
- **Print View**: Menggunakan `print.css` untuk menyembunyikan navigasi dan elemen UI yang tidak perlu saat pengguna menekan `Ctrl+P`.
- **Excel Export**: Menggunakan library `xlsx` untuk mengonversi data JSON dari API langsung menjadi file `.xlsx` yang siap pakai.

---

## 🗄️ Arsitektur Data & Database Backend

### Model Utama (Prisma)
- **User**: Menyimpan data kredensial dan relasi ke perusahaan.
- **Company**: Entitas bisnis utama. Semua transaksi keuangan terikat ke ID perusahaan ini.
- **Account (COA)**: Master data akun (Assets, Liabilities, dll).
- **JournalEntry & Detail**: Struktur transaksi double-entry.

---

## 🔌 Dokumentasi API (Kontrak Data)

### 1. Autentikasi (`/api/auth`)
- `POST /register`: Pendaftaran pengguna baru.
- `POST /login`: Mendapatkan token akses.

### 2. Manajemen Akun (`/api/accounts`)
Setiap akun harus memiliki `account_code` yang unik per perusahaan dan diawali dengan prefix kategori (1-5).
**Struktur Akun:**
- `1xxx`: Assets (Normal: Debit) | `2xxx`: Liabilities (Normal: Credit) | `3xxx`: Equity (Normal: Credit)

### 3. Jurnal & Transaksi (`/api/journals`)
**Payload Jurnal:**
```json
{
  "date": "YYYY-MM-DD",
  "description": "Keterangan transaksi",
  "details": [
    { "account_id": "uuid", "debit": 1000, "credit": 0 },
    { "account_id": "uuid", "debit": 0, "credit": 1000 }
  ]
}
```

---

## 🧠 Logika Bisnis & Perhitungan Laporan

1. **Neraca Saldo**: Menjumlahkan seluruh mutasi debit dan kredit per akun untuk menghasilkan saldo akhir.
2. **Laba Rugi**: Menghitung `Total Pendapatan - Total Beban` pada periode tertentu.
3. **Neraca**: Menampilkan posisi keuangan seimbang (`Aset = Liabilitas + Ekuitas`). Laba periode berjalan dimasukkan secara otomatis ke dalam komponen Ekuitas.

---

## 🏁 Panduan Instalasi & Pengaturan

### Pengaturan Backend
```bash
cd backend && npm install
# Konfigurasi .env (DATABASE_URL, JWT_SECRET)
npx prisma migrate dev
npm run start:dev
```

### Pengaturan Frontend
```bash
cd frontend && npm install
# Konfigurasi .env (VITE_API_BASE_URL)
npm run dev
```

---
*Dibuat dengan standar profesional untuk Sistem Informasi Akuntansi yang handal.*
