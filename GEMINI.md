# SIAKSA - Sistem Informasi Siklus Akuntansi

This project is an Accounting Cycle Information System built with a modern web stack. It follows a multi-tenant architecture where a user can manage multiple companies.

## Architecture & Technology Stack

- **Backend:** [NestJS](https://nestjs.com/) (Node.js framework)
  - **ORM:** [Prisma](https://www.prisma.io/) with PostgreSQL.
  - **Auth:** Passport JWT & Bcrypt.
  - **Validation:** Class-validator & Class-transformer.
- **Frontend:** [React](https://reactjs.org/) (Vite-powered)
  - **Styling:** Tailwind CSS & Radix UI.
  - **State Management:** Zustand & React Query/SWR.
  - **Forms:** React Hook Form & Zod.
- **Database:** PostgreSQL.

## Project Structure

```text
SIAKSA-Sistem-Informasi-Siklus-Akuntansi/
├── backend/            # NestJS API
│   ├── src/            # Application source code
│   ├── prisma/         # Database schema and migrations
│   └── GEMINI.md       # Backend-specific instructions
└── frontend/           # React Application
    ├── src/            # Frontend source code
    └── GEMINI.md       # Frontend-specific instructions
```

## Core Workflows

### Environment Setup
- Copy `.env.example` to `.env` in both `backend/` and `frontend/` folders.
- Update `DATABASE_URL` in `backend/.env`.

### Backend Development
Refer to [backend/GEMINI.md](./backend/GEMINI.md) for detailed instructions.
- `npm run start:dev` to start the backend server.
- `npm run prisma:migrate` to apply database changes.

### Frontend Development
Refer to [frontend/GEMINI.md](./frontend/GEMINI.md) for detailed instructions.
- `npm run dev` to start the Vite development server.

## Coding Standards
- Use TypeScript for both backend and frontend.
- Follow Prettier and ESLint configurations defined in each sub-directory.
- Use explicit types; avoid `any`.
- Keep components small and reusable in the frontend.
- Use DTOs for data transfer in the backend.

---

## 🎯 Priority Improvements for Production-Ready Application

### Backend — Critical Gaps

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 1 | Global Exception Filter | ❌ | HIGH | Standardize all error responses |
| 2 | Logging System (Winston/Pino) | ❌ | HIGH | Track application behavior & errors |
| 3 | Swagger/OpenAPI Documentation | ❌ | HIGH | Auto-generated API docs |
| 4 | Rate Limiting | ❌ | HIGH | Prevent brute force attacks |
| 5 | Security Headers (Helmet) | ❌ | HIGH | HSTS, CSP, XSS Protection |
| 6 | Role-Based Access Control (RBAC) | ❌ | HIGH | Roles: Admin, Manager, User |
| 7 | Pagination for List Endpoints | ⚠️ | HIGH | `GET /accounts?page=1&limit=20` |
| 8 | Database Audit Trail | ❌ | MEDIUM | Track who changed what & when |
| 9 | Email Verification & Password Reset | ❌ | MEDIUM | Security best practice |
| 10 | Environment Config Validation | ⚠️ | MEDIUM | `@nestjs/config` with schema |

### Frontend — Critical Gaps

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 1 | Error Boundaries | ❌ | HIGH | Catch render errors gracefully |
| 2 | Comprehensive Error Handling | ⚠️ | HIGH | Error toasts for all API failures |
| 3 | Loading Skeletons | ⚠️ | HIGH | Better UX during data fetching |
| 4 | Pagination UI | ❌ | HIGH | Implement page navigation |
| 5 | Server Error Display in Forms | ⚠️ | MEDIUM | Show field-level validation errors |
| 6 | Offline Support | ❌ | MEDIUM | Service worker for caching |

### Security Enhancements

| Issue | Risk | Solution |
|-------|------|----------|
| No password reset flow | HIGH | Email-based reset with token |
| No email verification | MEDIUM | Send verification code on signup |
| Hardcoded CORS origins | MEDIUM | Use `process.env.ALLOWED_ORIGINS` |
| No HTTPS enforcement | MEDIUM | Add HTTPS redirect middleware |
| Missing security headers | MEDIUM | Implement Helmet middleware |
| No rate limiting | HIGH | Add `@nestjs/throttler` |

### Performance Optimizations

| Issue | Impact | Solution |
|-------|--------|----------|
| No pagination | HIGH | Add `?page=1&limit=20` to list endpoints |
| No database query optimization | HIGH | Use Prisma select/include properly |
| No caching layer | HIGH | Add Redis for frequent queries |
| No API response compression | LOW | Enable gzip compression |

### Testing & Quality Assurance

- **Unit Tests:** Jest for services (Target: 80%+ coverage)
- **Integration Tests:** API endpoint testing
- **E2E Tests:** Critical user workflows (login, create account, etc.)

### DevOps & Deployment

- **Docker:** Containerize both backend & frontend
- **CI/CD:** GitHub Actions workflow
- **Database Backups:** Automated backup strategy
- **Monitoring:** Error tracking (Sentry) & performance monitoring

---

## 🚀 Recommended Implementation Order

### Phase 1: Security & Stability (Week 1-2)
1. Global Exception Filter
2. Helmet Security Headers
3. Rate Limiting
4. Environment Config Validation

### Phase 2: Observability & Documentation (Week 3-4)
1. Winston/Pino Logging
2. Swagger API Documentation
3. Frontend Error Boundaries

### Phase 3: Features & UX (Week 5-6)
1. RBAC Implementation
2. Pagination (Backend + Frontend)
3. Loading Skeletons
4. Email Verification & Password Reset

### Phase 4: Testing & Deployment (Week 7-8)
1. Unit & Integration Tests
2. Docker & CI/CD Setup
3. Database Audit Trail

---

## � Implementation Path - Choose Your Starting Point

Mulai dari salah satu track berikut sesuai prioritas:

### 🔒 Track 1: Backend Security (2-3 hari)
Implementasi fitur keamanan inti:
- Global Exception Filter
- Helmet Security Headers  
- Rate Limiting (@nestjs/throttler)
- Environment Config Validation

**Outcome:** Aplikasi lebih aman dari brute force & security vulnerabilities

---

### 📊 Track 2: Logging & Monitoring (1-2 hari)
Setup observability:
- Winston/Pino Logger integration
- Structured logging di semua services
- Error tracking & debugging

**Outcome:** Better debugging & production monitoring

---

### 📚 Track 3: API Documentation (1-2 hari)
Auto-generated API docs:
- Swagger/OpenAPI setup
- Endpoint documentation
- Interactive API testing

**Outcome:** Frontend developers & external partners punya dokumentasi yang clear

---

### 👥 Track 4: RBAC (Role-Based Access Control) (3-4 hari)
Implementasi permission system:
- User roles: Admin, Manager, User
- Permission guards pada endpoints
- UI untuk manage roles

**Outcome:** Multi-user collaboration dengan permission control

---

### ✅ Track 5: Testing Framework (2-3 hari)
Setup comprehensive testing:
- Jest unit tests untuk services
- Integration tests untuk API
- E2E tests untuk critical flows

**Outcome:** Code quality & regression prevention

---

### 🎨 Track 6: Frontend UX Improvements (2-3 hari)
Better user experience:
- Error Boundaries
- Loading Skeletons
- Pagination UI
- Comprehensive error handling

**Outcome:** More professional & responsive UI

---

### 🚀 Track 7: Production Readiness (2-3 hari)
Deployment & automation:
- Docker containerization
- GitHub Actions CI/CD
- Database backup strategy
- Environment management

**Outcome:** Ready untuk production deployment

---

## �📝 Detailed Implementation Guides

See detailed backend improvements in [backend/GEMINI.md](./backend/GEMINI.md)
See detailed frontend improvements in [frontend/GEMINI.md](./frontend/GEMINI.md)
