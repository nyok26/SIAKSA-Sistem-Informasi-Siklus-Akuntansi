# SIAKSA — Sistem Informasi Akuntansi Siklus Akuntansi

> A full-stack web application for managing the complete accounting cycle, from Chart of Accounts to Financial Statements.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Prerequisites](#4-prerequisites)
5. [Environment Setup](#5-environment-setup)
   - 5.1 [Clone the Repository](#51-clone-the-repository)
   - 5.2 [Backend `.env`](#52-backend-env)
   - 5.3 [Frontend `.env`](#53-frontend-env)
6. [Database Setup (PostgreSQL)](#6-database-setup-postgresql)
7. [Backend Setup (NestJS + Prisma)](#7-backend-setup-nestjs--prisma)
8. [Frontend Setup (Vite + React)](#8-frontend-setup-vite--react)
9. [Running the Full Stack](#9-running-the-full-stack)
10. [API Reference](#10-api-reference)
11. [Application Features](#11-application-features)
12. [Development Guidelines](#12-development-guidelines)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Project Overview

**SIAKSA** (Sistem Informasi Akuntansi Siklus Akuntansi) is an accounting cycle information system that digitises the entire manual accounting workflow:

| Module | Description |
|---|---|
| 🔐 Authentication | JWT-based register & login |
| 📒 Chart of Accounts | Manage accounts grouped by category (Assets, Liabilities, Equity, Revenue, Expenses) |
| 📝 General Journal | Manual double-entry journal entries |
| 📝 Adjusting Entries | Period-end adjustment journal entries |
| 📊 General Ledger | Aggregated T-account view per account |
| 📊 Trial Balance | Pre-/post-adjustment debit-credit balance summary |
| 📊 10-Column Worksheet | Neraca Lajur — the full accounting worksheet |
| 💰 Income Statement | Revenue minus Expenses P&L report |
| 💰 Balance Sheet | Snapshot of Assets, Liabilities & Equity |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, TypeScript, Tailwind CSS v3, Shadcn UI, Axios, TanStack React Query v5 |
| **Backend** | NestJS 10, TypeScript |
| **Auth** | JWT (access token) + bcrypt for password hashing |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 15+ |
| **Package Manager** | npm (both frontend & backend) |

---

## 3. Repository Structure

```
SIAKSA/
├── backend/                  # NestJS API
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── src/
│   │   ├── auth/             # JWT Auth module
│   │   ├── accounts/         # Chart of Accounts CRUD
│   │   ├── journals/         # General Journal endpoints
│   │   ├── adjusting/        # Adjusting Entries endpoints
│   │   ├── reports/          # Ledger, Trial Balance, Worksheet, Statements
│   │   ├── prisma/           # Prisma service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # Vite + React app
│   ├── src/
│   │   ├── api/              # Axios instance + React Query hooks
│   │   ├── components/       # Reusable Shadcn-based components
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── accounts/     # Chart of Accounts
│   │   │   ├── journals/     # General Journal form
│   │   │   ├── adjusting/    # Adjusting Entries form
│   │   │   └── reports/      # All read-only reports
│   │   ├── store/            # Auth state (Zustand or Context)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 4. Prerequisites

Ensure the following tools are installed on your machine before proceeding:

| Tool | Minimum Version | Download |
|---|---|---|
| **Node.js** | v18.x LTS | https://nodejs.org |
| **npm** | v9+ (bundled with Node) | — |
| **PostgreSQL** | v15+ | https://www.postgresql.org/download/ |
| **Git** | any recent | https://git-scm.com |

> **Windows Users:** It is strongly recommended to use [Windows Terminal](https://aka.ms/terminal) with PowerShell 7+ or WSL2 for a smooth experience.

---

## 5. Environment Setup

### 5.1 Clone the Repository

```bash
git clone <YOUR_REPO_URL> SIAKSA
cd SIAKSA
```

---

### 5.2 Backend `.env`

Navigate to the `backend/` directory and copy the example file:

```bash
cd backend
copy .env.example .env      # Windows
# OR
cp .env.example .env        # macOS / Linux
```

Open `backend/.env` and fill in your values:

```dotenv
# ── PostgreSQL Connection ─────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:root@localhost:5433/siaksa_db?schema=public"

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET="CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_STRING"
JWT_EXPIRES_IN="7d"

# ── App ───────────────────────────────────────────────────────────────────────
PORT=3000
```

> ⚠️ **Security:** Never commit your real `.env` file. The `.gitignore` already excludes it.

---

### 5.3 Frontend `.env`

Navigate to the `frontend/` directory and copy the example file:

```bash
cd ../frontend
copy .env.example .env      # Windows
# OR
cp .env.example .env        # macOS / Linux
```

Open `frontend/.env` and fill in:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 6. Database Setup (PostgreSQL)

### 6.1 Verify PostgreSQL is Running

SIAKSA uses PostgreSQL on **port 5433** (non-default, to avoid conflicts).

```powershell
# Windows — check if PostgreSQL service is running
Get-Service -Name postgresql*

# Start if stopped (replace service name as needed)
Start-Service -Name "postgresql-x64-15"
```

```bash
# macOS / Linux
pg_lsclusters         # see available clusters
sudo service postgresql start
```

### 6.2 Create the Database

Connect to PostgreSQL as the `postgres` superuser:

```bash
# Option A — psql CLI (replace 5433 with your port)
psql -U postgres -p 5433

# Inside psql:
CREATE DATABASE siaksa_db;
\q
```

```powershell
# Option B — Windows PowerShell one-liner
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -p 5433 -c "CREATE DATABASE siaksa_db;"
```

> If you use a different port, username, or password, update `DATABASE_URL` in `backend/.env` accordingly.

---

## 7. Backend Setup (NestJS + Prisma)

```bash
# From the project root
cd backend

# 1. Install all dependencies
npm install

# 2. Generate Prisma Client (must be done after every schema change)
npx prisma generate

# 3. Run database migrations (creates all tables)
npx prisma migrate dev --name init

# 4. (Optional) Open Prisma Studio to browse the database visually
npx prisma studio
```

### Verify the Backend

```bash
# Start the NestJS dev server
npm run start:dev
```

Expected output:
```
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG [Bootstrap] 🚀 Server running on http://localhost:3000
```

Test the health check endpoint:

```bash
curl http://localhost:3000/api/health
# Expected: { "status": "ok" }
```

---

## 8. Frontend Setup (Vite + React)

```bash
# From the project root
cd frontend

# 1. Install all dependencies
npm install

# 2. Start the Vite dev server
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **http://localhost:5173** in your browser. You will land on the **Login** page.

---

## 9. Running the Full Stack

For the complete application to work, **both** servers must be running simultaneously. Use two separate terminal windows/tabs:

**Terminal 1 — Backend:**
```bash
cd SIAKSA/backend
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd SIAKSA/frontend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Prisma Studio | http://localhost:5555 (run `npx prisma studio` in backend/) |

---

## 10. API Reference

All API routes are prefixed with `/api`. The backend uses JWT Bearer authentication for all protected routes.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT |

**Register body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "StrongPassword123!"
}
```

**Login body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Login response:**
```json
{
  "access_token": "<JWT>",
  "user": { "id": "...", "email": "...", "username": "..." }
}
```

---

### Chart of Accounts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/accounts` | ✅ | List all accounts |
| `POST` | `/api/accounts` | ✅ | Create an account |
| `PATCH` | `/api/accounts/:id` | ✅ | Update an account |
| `DELETE` | `/api/accounts/:id` | ✅ | Delete an account |

**Account categories & code prefixes:**

| Category | Code Prefix |
|---|---|
| Assets | `1xxx` |
| Liabilities | `2xxx` |
| Equity | `3xxx` |
| Revenue | `4xxx` |
| Expenses | `5xxx` |

**Create Account body:**
```json
{
  "account_code": "1101",
  "account_name": "Cash",
  "category": "Assets",
  "normal_balance": "Debit"
}
```

---

### General Journal

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/journals` | ✅ | List all journal entries |
| `POST` | `/api/journals` | ✅ | Create a journal entry (master + details) |
| `GET` | `/api/journals/:id` | ✅ | Get a single journal entry |
| `DELETE` | `/api/journals/:id` | ✅ | Delete a journal entry |

**Create Journal body:**
```json
{
  "date": "2025-01-15",
  "description": "Sale of goods on credit",
  "details": [
    { "account_id": "<uuid>", "debit": 500000, "credit": 0 },
    { "account_id": "<uuid>", "debit": 0, "credit": 500000 }
  ]
}
```
> ⚠️ `sum(debit)` MUST equal `sum(credit)` — the API will reject unbalanced entries.

---

### Adjusting Entries

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/adjusting` | ✅ | List all adjusting entries |
| `POST` | `/api/adjusting` | ✅ | Create an adjusting entry |
| `GET` | `/api/adjusting/:id` | ✅ | Get a single adjusting entry |
| `DELETE` | `/api/adjusting/:id` | ✅ | Delete an adjusting entry |

Same request structure as General Journal.

---

### Reports (Read-Only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reports/ledger` | ✅ | General Ledger (all accounts) |
| `GET` | `/api/reports/ledger/:account_id` | ✅ | Ledger for a single account |
| `GET` | `/api/reports/trial-balance` | ✅ | Unadjusted Trial Balance |
| `GET` | `/api/reports/trial-balance?adjusted=true` | ✅ | Adjusted Trial Balance |
| `GET` | `/api/reports/worksheet` | ✅ | 10-Column Worksheet |
| `GET` | `/api/reports/income-statement` | ✅ | Income Statement |
| `GET` | `/api/reports/balance-sheet` | ✅ | Balance Sheet |

---

## 11. Application Features

### 🔐 Authentication
- Default landing page is `/login`.
- On successful login, JWT is stored in `localStorage`.
- All protected routes redirect to `/login` if no valid token is present.
- Passwords are hashed with `bcrypt` (salt rounds: 10).

### 📒 Chart of Accounts
- Account codes are enforced by category prefix (e.g., Assets → must start with `1`).
- The prefix digit is displayed as a read-only prefix in the input field and cannot be deleted.
- Duplicate account codes are rejected by the API (unique constraint).

### 📝 Transaction Forms (Master-Detail)
- Dynamic rows: click **"+ Add Row"** to add debit/credit lines.
- Running totals for Debit and Credit are shown below the table.
- The **Submit** button is disabled unless `totalDebit === totalCredit && total > 0`.
- Date picker and description field are required.

### 📊 Reports
- All report pages are **read-only** (no edit/delete actions).
- The 10-Column Worksheet displays: Trial Balance, Adjustments, Adjusted Trial Balance, Income Statement columns, and Balance Sheet columns — all in a single wide table.

---

## 12. Development Guidelines

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Stage & commit
git add .
git commit -m "feat: add chart of accounts CRUD"

# Push and open a PR
git push origin feature/your-feature-name
```

### Commit Message Convention (Conventional Commits)

| Prefix | Use For |
|---|---|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `chore:` | Maintenance (deps, config) |
| `refactor:` | Code restructuring |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `test:` | Tests |

### Adding a New Prisma Migration

After editing `backend/prisma/schema.prisma`:

```bash
cd backend
npx prisma migrate dev --name describe_your_change
npx prisma generate
```

> ⚠️ Always run `prisma generate` after any schema change so the TypeScript client types are up to date.

### Adding Shadcn Components (Frontend)

```bash
cd frontend
npx shadcn-ui@latest add <component-name>
# Example:
npx shadcn-ui@latest add button input table dialog form
```

---

## 13. Troubleshooting

### ❌ `P1001` — Can't reach database server

**Cause:** PostgreSQL is not running or the port/credentials are wrong.

**Fix:**
1. Check PostgreSQL is running (see Section 6.1).
2. Verify `DATABASE_URL` in `backend/.env` matches your PostgreSQL port, user, and password.
3. Ensure the database `siaksa_db` exists (Section 6.2).

---

### ❌ `PrismaClientKnownRequestError` — Unique constraint failed

**Cause:** You are trying to insert a duplicate `account_code` or `email`.

**Fix:** Use a different value that does not already exist in the database.

---

### ❌ `401 Unauthorized` on API calls

**Cause:** JWT token is missing, expired, or invalid.

**Fix:**
1. Log in again via `/login` to get a fresh token.
2. Check that the frontend sends the `Authorization: Bearer <token>` header in every request.
3. Verify `JWT_SECRET` in `backend/.env` has not changed since the token was issued.

---

### ❌ CORS Error in the Browser

**Cause:** The backend is not configured to accept requests from the frontend origin.

**Fix:** Ensure `main.ts` in the backend enables CORS for `http://localhost:5173`:
```typescript
app.enableCors({ origin: 'http://localhost:5173', credentials: true });
```

---

### ❌ Vite dev server shows a blank page

**Cause:** Usually a React or TypeScript compile error.

**Fix:** Check the browser console and Vite terminal output for the exact error message.

---

### ❌ `npx prisma migrate dev` fails with migration history conflict

**Fix (development only — will wipe data):**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

*Last updated: May 2026 | Maintained by the SIAKSA development team*
