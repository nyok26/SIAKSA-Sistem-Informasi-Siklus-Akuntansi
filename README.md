<p align="center">
  <img src="frontend/public/logo-original-siaksa.png" width="120" alt="SIAKSA Logo" />
</p>

<h1 align="center">SIAKSA</h1>
<p align="center">
  <strong>Sistem Informasi Siklus Akuntansi</strong><br />
  <em>Platform Akuntansi Enterprise-Grade untuk Manajemen Siklus Akuntansi Terintegrasi</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-NestJS%2010-E0234E?style=flat-square&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/Library-React%2018-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
</p>

---

## 📖 Deskripsi Proyek

**SIAKSA** (Sistem Informasi Siklus Akuntansi) adalah platform akuntansi berbasis web yang dirancang untuk mendigitalisasi seluruh siklus akuntansi secara otomatis dan akurat. Mulai dari pengelolaan *Chart of Accounts* (COA), pencatatan Jurnal Umum & Penyesuaian, hingga pembuatan laporan keuangan komprehensif.

Sistem ini mengusung arsitektur **Multi-Tenancy**, memungkinkan satu akun pengguna untuk mengelola berbagai entitas bisnis (perusahaan) dengan isolasi data yang sangat ketat dan aman.

---

## ✨ Fitur Utama

### 🏢 Multi-Tenant & Multi-Company

- **Isolasi Data**: Pemisahan data antar perusahaan yang aman menggunakan konteks `companyId`.
- **Global Context**: Pengguna dapat berpindah antar perusahaan secara instan tanpa perlu login ulang.
- **Tenant Security**: Header `x-company-id` wajib digunakan untuk setiap transaksi data yang sensitif terhadap konteks perusahaan.

### 📊 Manajemen Siklus Akuntansi

- **Chart of Accounts (COA)**: Fleksibilitas dalam mendefinisikan akun dengan kategori standar (Aset, Kewajiban, Ekuitas, Pendapatan, Beban).
- **Double-Entry Journaling**: Validasi otomatis untuk memastikan setiap entri jurnal (Umum & Penyesuaian) selalu dalam keadaan seimbang (Balanced).
- **Automated Posting**: Transaksi otomatis diposting ke Buku Besar dan diringkas ke dalam Neraca Saldo.

### 📈 Pelaporan Keuangan Otomatis

- **Laporan Laba Rugi**: Perhitungan otomatis profit/loss secara real-time.
- **Neraca (Balance Sheet)**: Tampilan posisi keuangan yang selalu up-to-date.
- **Laporan Perubahan Ekuitas**: Pelacakan modal pemilik dan laba ditahan.
- **Kertas Kerja (Worksheet)**: Visualisasi 10-kolom untuk proses penyesuaian yang transparan.

### 🖨️ Ekspor & Cetak

- **Ekspor Excel**: Dukungan penuh ekspor laporan ke format `.xlsx` menggunakan engine `XLSX`.
- **Print Optimization**: Tampilan khusus cetak yang bersih dan profesional melalui CSS Media Queries.

---

## 🛠️ Spesifikasi Teknis (Tech Stack)

### Backend (API Server)

- **Runtime**: Node.js v18+
- **Framework**: **NestJS v10** (Modular & Scalable)
- **ORM**: **Prisma v5** (Type-safe access)
- **Database**: **PostgreSQL**
- **Authentication**: JWT (JSON Web Token) via Passport.js
- **Validation**: `class-validator` & `class-transformer`

### Frontend (Client Application)

- **Core**: **React 18** with **TypeScript**
- **Build Tool**: **Vite** (Optimized build performance)
- **State Management**:
  - **Server State**: TanStack Query (React Query) v5
  - **Local State**: Zustand (Auth & Context Persistence)
- **UI/UX**:
  - **Styling**: Tailwind CSS
  - **Components**: Radix UI + Shadcn/UI
  - **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod Validation

---

## 🚀 Panduan Instalasi & Pengaturan

### Prasyarat

- **Node.js** (versi 18.x atau terbaru)
- **PostgreSQL** (versi 15 atau terbaru)
- **npm** atau **yarn**

### 1. Kloning Repositori

```bash
git clone https://github.com/username/SIAKSA-Sistem-Informasi-Siklus-Akuntansi.git
cd SIAKSA-Sistem-Informasi-Siklus-Akuntansi
```

### 2. Konfigurasi Backend

```bash
cd backend
npm install

# Buat file .env dari template
cp .env.example .env
```

Edit `.env` dan sesuaikan `DATABASE_URL` serta `JWT_SECRET`.

**Inisialisasi Database:**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Jalankan Backend:**

```bash
npm run start:dev
```

### 3. Konfigurasi Frontend

```bash
cd ../frontend
npm install

# Buat file .env dari template
cp .env.example .env
```

Sesuaikan `VITE_API_BASE_URL` jika backend berjalan di port yang berbeda.

**Jalankan Frontend:**

```bash
npm run dev
```

---

## 📝 Konvensi Kode & Standar Akuntansi

### Kategori Akun & Saldo Normal

| Kode Akun | Kategori                | Saldo Normal |
| :-------- | :---------------------- | :----------- |
| `1xxx`  | Assets (Aset)           | Debit        |
| `2xxx`  | Liabilities (Kewajiban) | Kredit       |
| `3xxx`  | Equity (Ekuitas)        | Kredit       |
| `4xxx`  | Revenue (Pendapatan)    | Kredit       |
| `5xxx`  | Expenses (Beban)        | Debit        |

### Struktur Payload Jurnal

Setiap transaksi harus mematuhi prinsip *Balance*:

```json
{
  "date": "2024-01-01",
  "description": "Pembelian Perlengkapan",
  "details": [
    { "account_id": "UUID-AKUN-1", "debit": 500000, "credit": 0 },
    { "account_id": "UUID-AKUN-2", "debit": 0, "credit": 500000 }
  ]
}
```

---

## 📂 Struktur Folder Utama

```text
.
├── backend/                # Source code API NestJS
│   ├── prisma/             # Schema & Migrasi Database
│   └── src/                # Business Logic (Modules, Services, Controllers)
├── frontend/               # Source code React (Vite)
│   ├── src/
│   │   ├── api/            # Axios config & Custom Hooks
│   │   ├── components/     # UI Library (Atomic & Layout)
│   │   ├── lib/            # Utils & Excel Exporters
│   │   ├── pages/          # View Components
│   │   └── store/          # Zustand State
└── README.md
```

---

## 📄 Lisensi

Proyek ini bersifat tertutup (Private). Penggunaan dan distribusi harus mendapatkan izin tertulis dari pemilik proyek.

---

<p align="center">
  Dibuat oleh Tim Pengembang SIAKSA
</p>
