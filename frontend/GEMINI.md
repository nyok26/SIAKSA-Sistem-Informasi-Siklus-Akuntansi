# SIAKSA Frontend - React & Vite

This is the frontend application for SIAKSA, built with React and Vite.

## Architecture & State Management

- **API Layer:** Located in `src/api/`. Uses `axios` with interceptors for JWT and `x-company-id`.
- **Query Hooks:** Uses `@tanstack/react-query` (and some SWR) for data fetching. See `src/api/hooks/`.
- **Global State:** Managed by `zustand` in `src/store/`. Primarily `authStore.ts`.
- **UI Components:** Built with Tailwind CSS and Radix UI. Shared components in `src/components/ui/`.

## Development Workflows

### Styling
- Use Tailwind CSS utility classes.
- Shared animations use `framer-motion`.
- Icons are from `lucide-react`.

### Forms
- Use `react-hook-form` paired with `zod` for validation.

### Reports
- Accounting reports (Balance Sheet, Ledger, etc.) are in `src/pages/reports/`.
- Export to Excel is supported using `xlsx`.
- Printing uses `src/print.css`.

## Code Conventions
- **Component Pattern:** Prefer functional components with hooks.
- **API Pattern:** Always create a custom hook in `src/api/hooks/` for any new API interaction.
- **Types:** Define interfaces for API responses in the hook file or a shared types file.
- **Path Aliases:** Use `@/` to refer to `src/`.

## Environment Variables
- `VITE_API_BASE_URL`: The URL of the backend API.
