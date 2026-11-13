# AGENTS.md — Doctor Tracker Project Rules

## 1. Architecture & Tech Stack
- **Monorepo Structure:**
  - `/frontend`: Next.js (App Router, TypeScript, Tailwind CSS)
  - `/backend`: Standalone Node.js + Express REST API (ES Modules)
  - **Database:** MongoDB with Mongoose
- **Communication:** Frontend communicates strictly with `/backend` over REST endpoints (`/api/*`) using `axios` (`withCredentials: true`). Do not use Next.js API routes for database logic.

## 2. Core Domain & Features
- **Authentication:** JWT stored in HTTP-only cookies. Protect all frontend routes via `frontend/src/middleware.ts` and all backend routes via Express auth middleware.
- **Doctors:** CRUD operations (`name`, `specialization`, `hospital`, `phone`, `email`), search, date-wise/specialization filtering, pagination, and viewing/adding/deleting assigned patients.
- **Patients:** Dedicated directory with edit/delete, search, pagination, and date-wise/condition filtering.
- **Dashboard:** MongoDB aggregation endpoint returning total doctors, total patients, patients per doctor, and date-based trends rendered with Recharts.

## 3. Performance & Code Quality Standards
- **Database Optimization:** Always define Mongoose indexes on searchable and filterable fields (`name`, `specialization`, `hospital`, `condition`, `doctorId`, `createdAt`). Use `.lean()` for read-only queries.
- **Validation & Errors:** Validate all incoming Express request bodies and query params using `zod`. Route all errors to a centralized Express error-handling middleware.
- **Frontend State:** Use `@tanstack/react-query` for server state, caching, and pagination. Debounce search inputs (300ms) to prevent unnecessary re-renders and API spam.
- **UI/UX:** Keep components modular and reusable (`components/ui`, `components/layout`). Ensure full desktop and mobile responsiveness.
