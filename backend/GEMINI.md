# SIAKSA Backend - NestJS & Prisma

This is the API layer for SIAKSA, built with NestJS and Prisma.

## Architecture

- **Controllers:** Handle HTTP requests and validate inputs using DTOs.
- **Services:** Contain business logic and interact with Prisma.
- **DTOs:** Define request/response shapes using `class-validator`.
- **Prisma:** Used as ORM with PostgreSQL. Schema is in `prisma/schema.prisma`.

## Multi-Tenancy
Most endpoints require the `x-company-id` header to scope data to a specific company. This is handled in the `AccountsController` and other feature controllers by extracting it from headers.

## Development Workflows

### Database Operations
- `npm run prisma:generate`: Sync Prisma Client with schema.
- `npm run prisma:migrate`: Create and apply migrations.
- `npm run prisma:studio`: Open GUI to explore data.

### Common Tasks
- **Creating a New Module:** `nest g module <name>`, `nest g controller <name>`, `nest g service <name>`.
- **Validation:** Use `ParseUUIDPipe` for ID params and DTOs for body.

## Code Conventions
- **Naming:** CamelCase for classes, camelCase for methods/variables.
- **Errors:** Use built-in NestJS exceptions (e.g., `NotFoundException`, `ConflictException`).
- **Prisma usage:** Always use the `PrismaService`. Scoped queries must always include `companyId`.
- **Account Codes:** Follow prefix rules (1=Assets, 2=Liabilities, etc.).
