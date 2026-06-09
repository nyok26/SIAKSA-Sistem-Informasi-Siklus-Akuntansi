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
