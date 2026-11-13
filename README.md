# Doctor Tracker

## Description
**Doctor Tracker** is a secure, full-stack administrative web application designed to streamline the management of medical practitioners and their patient records. Built with Next.js, Node.js/Express, and MongoDB, the platform focuses on high-performance database querying, responsive UI/UX, and actionable data visualization. Authenticated administrators can efficiently create, search, filter, and paginate doctor and patient records while monitoring real-time clinic metrics through an interactive analytics dashboard.

---

## System Architecture
The application uses a decoupled client-server architecture communicating over RESTful APIs:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 Client (TypeScript)           │
│  • Tailwind CSS v4 & Lucide Icons (Responsive UI)           │
│  • TanStack React Query v5 (Server-State & Caching)         │
│  • Recharts (Dashboard Data Visualization)                  │
│  • Axios (HTTP Client with Credentialed Requests)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼  REST API (JSON + HTTP-Only JWT Cookies)
┌─────────────────────────────────────────────────────────────┐
│                 Node.js & Express Server (ESM)              │
│  • Helmet & CORS (Security & Origin Protection)             │
│  • JWT & Cookie-Parser (Route Authentication Middleware)    │
│  • Zod (Strict Request Payload & Query Validation)          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼  Mongoose ODM (Indexed Queries & Aggregations)
┌─────────────────────────────────────────────────────────────┐
│                       MongoDB Database                      │
│  • Indexed Collections: Admins, Doctors, Patients           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow & Service Interactions
1. **Authentication Flow:** Administrators authenticate via `/api/auth/login`. The Express server verifies hashed credentials (`bcryptjs`) and issues a signed JWT stored in a secure HTTP-only cookie (`cookie-parser`), protecting all frontend routes and backend endpoints.
2. **Data Fetching & Caching:** The Next.js frontend uses **TanStack React Query** and **Axios** to request paginated, filtered, and searched datasets from the Express REST API.
3. **Database Optimization:** Incoming search, filter, and pagination parameters are validated with **Zod** and executed against **MongoDB** using indexed fields and aggregation pipelines to minimize query latency.

---

## Technical Decisions

### 1. TanStack React Query v5 over Redux/Context API for Server State
* **Decision:** Adopted `@tanstack/react-query` instead of a global client-state manager like Redux or React Context for managing doctor, patient, and analytics data.
* **Reasoning:** Doctor Tracker relies heavily on server-driven operations—specifically paginated tables, live search inputs, and multi-parameter filtering (date-wise, specialization, and patient condition). React Query provides out-of-the-box request caching, automatic background refetching, deduplication, and clean loading/error states without boilerplate reducers. When a doctor or patient is created, updated, or deleted, targeted cache invalidation (`invalidateQueries`) keeps the UI and dashboard charts immediately synchronized while preventing unnecessary re-renders.

### 2. HTTP-Only Cookie JWT Authentication + Zod Schema Validation
* **Decision:** Combined JWT authentication stored in HTTP-only cookies (`jsonwebtoken` + `cookie-parser`) with strict runtime schema validation (`zod`) and security headers (`helmet`).
* **Reasoning:** Storing JWTs in HTTP-only cookies mitigates Cross-Site Scripting (XSS) token theft compared to `localStorage`. On the backend, pairing `zod` validation middleware with Mongoose ensures malformed query strings, invalid filter dates, or incomplete doctor/patient payloads are rejected early with standardized error responses before hitting MongoDB. Additionally, MongoDB indexes on searchable and filterable fields ensure fast query execution as record counts scale.

---

## Setup Guide

### Prerequisites
* **Node.js** (v20+ recommended)
* **MongoDB** (Local instance or MongoDB Atlas connection string)
* **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com
cd doctor-tracker
```
*(Note: If your frontend and backend are in separate repositories, clone each repository into its own folder.)*

### 2. Backend Setup (`doctor-tracker-backend`)
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```
Copy the `.env.example` file to `.env` and fill in your values:
```bash
cp .env.example .env
```
Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```
The Express API server will run on `http://localhost:5000`.

### 3. Frontend Setup (`frontend`)
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```
Copy the `.env.example` file to `.env.local` and configure the API URL:
```bash
cp .env.example .env.local
```
Start the Next.js development server:
```bash
npm run dev
```
The frontend application will be accessible at `http://localhost:3000`.

### 4. Demo / Admin Credentials
*(Replace with your seeded admin credentials or registration instructions for evaluators)*
* **Email:** `admin@doctortracker.com`
* **Password:** `Admin@1234`

---

## Visual Evidence

> **Note:** Replace the placeholder paths below with actual high-resolution screenshots stored in your repository (e.g., `/screenshots/...`).

### Desktop Views

| Admin Dashboard & Analytics | Doctor Management (Search & Filter) |
| :---: | :---: |
| ![Dashboard Desktop](./screenshots/dashboard-desktop.png) | ![Doctors Desktop](./screenshots/doctors-desktop.png) |

| Doctor Details & Assigned Patients | Patient Management Page |
| :---: | :---: |
| ![Doctor Patients Desktop](./screenshots/doctor-patients-desktop.png) | ![Patients Desktop](./screenshots/patients-desktop.png) |

### Mobile Views

| Mobile Dashboard | Mobile Doctors List | Mobile Patients List |
| :---: | :---: | :---: |
| ![Dashboard Mobile](./screenshots/dashboard-mobile.png) | ![Doctors Mobile](./screenshots/doctors-mobile.png) | ![Patients Mobile](./screenshots/patients-mobile.png) |
