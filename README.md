# HRMS Lite – Full-Stack Assessment

Lightweight Human Resource Management System (HRMS Lite) built as a full‑stack assessment.  
The app lets an admin manage employees and track daily attendance with a simple, production‑ready web UI.

> **Features**
>
> - Employee CRUD (create, list, delete)
> - Attendance marking with date & status (Present / Absent)
> - Per‑employee attendance stats (present / absent days)
> - Attendance listing with optional filters (employee + date range)
> - Dashboard summary cards (employees, total present, total absent)

---

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS modules (single‑page layout, responsive, professional UI)
- **Backend**: Node.js + Express + TypeScript
- **Validation**: Zod (request payload & query validation)
- **Database**: SQLite via Prisma ORM
- **API Style**: RESTful JSON endpoints

---

## Project Structure

```text
.
├─ backend/              # Express + Prisma API
│  ├─ src/
│  │  ├─ index.ts        # App entry, routes, middleware
│  │  ├─ prisma.ts       # Prisma client
│  │  ├─ routes/
│  │  │  ├─ employees.ts # Employee CRUD + stats
│  │  │  └─ attendance.ts# Attendance endpoints + filters
│  │  ├─ middleware/
│  │  │  └─ errorHandler.ts
│  │  └─ validation.ts   # Zod schemas
│  ├─ prisma/
│  │  └─ schema.prisma   # SQLite models
│  ├─ .env               # Local env (port + DB URL)
│  └─ package.json
│
└─ frontend/             # React + Vite SPA
   ├─ src/
   │  ├─ main.tsx
   │  ├─ App.tsx         # Main HRMS Lite UI
   │  ├─ App.css         # Layout & component styling
   │  └─ index.css
   └─ package.json
```

---

## Backend – Running Locally

### Prerequisites

- **Node.js**: **>= 20.x** is recommended (required for the Prisma version in `package.json`)
- **npm**: Comes with Node

### 1. Install dependencies

```bash
cd backend
npm install

# If dev tools are missing, also install:
npm install -D typescript ts-node-dev prisma
```

### 2. Configure environment

`backend/.env` (already created):

```bash
DATABASE_URL="file:./dev.db"
PORT=4000
ORIGIN=http://localhost:5173
```

Adjust `ORIGIN` to match your frontend URL in development/production.

### 3. Prisma setup (SQLite)

Generate the Prisma client and create the initial database:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will create `dev.db` in the `backend` folder and sync it with the schema.

### 4. Start the backend dev server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

#### API Overview

- **Health**
  - `GET /api/health` → `{ status: "ok" }`

- **Employees**
  - `POST /api/employees`
    - Body:  
      ```json
      {
        "employeeCode": "EMP001",
        "fullName": "Jane Doe",
        "email": "jane.doe@example.com",
        "department": "Engineering"
      }
      ```
    - Validates required fields, email format, and duplicate `employeeCode` / `email`.
  - `GET /api/employees`
    - Returns list with aggregated stats:
      - `totalPresent`, `totalAbsent` per employee.
  - `DELETE /api/employees/:id`
    - Deletes the employee and cascades related attendance records.

- **Attendance**
  - `POST /api/attendance`
    - Body:  
      ```json
      {
        "employeeId": 1,
        "date": "2026-02-27",
        "status": "PRESENT"
      }
      ```
    - Validates employee existence, required fields, and basic date format.
  - `GET /api/attendance`
    - Query params (all optional):
      - `employeeId` – numeric employee ID
      - `from` – ISO date (`YYYY-MM-DD`)
      - `to` – ISO date (`YYYY-MM-DD`)
    - Example: `/api/attendance?employeeId=1&from=2026-02-01&to=2026-02-28`

All endpoints return proper HTTP status codes and JSON error messages on validation / runtime failures.

---

## Frontend – Running Locally

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure API base URL (optional)

By default, the frontend will call `http://localhost:4000`:

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
```

To point the UI to a deployed backend, create `.env` in `frontend`:

```bash
VITE_API_BASE_URL="https://your-backend-url.com"
```

### 3. Start the frontend dev server

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`) in your browser.

### UI Flows

- **Employee Management**
  - Add employee using the form (Employee ID, Full Name, Email, Department).
  - View all employees in a table with present/absent day counts.
  - Delete an employee (with confirmation) – related attendance is also removed.
  - Loading / empty states and error banners are shown as appropriate.

- **Attendance Management**
  - Select an employee, choose a date, and mark **Present** or **Absent**.
  - View attendance records in a table showing date, status, employee, department.
  - Filter by employee and/or date range.
  - A small detail card shows info for the currently selected employee.

- **Dashboard Summary**
  - Summary cards for:
    - Total employees
    - Total present days (across all employees)
    - Total absent days

---

## Deployment Guide (for submission)

You’ll need:

1. **Public GitHub repository** (frontend + backend in this root folder)
2. **Live backend URL**
3. **Live frontend URL** pointing to the backend

Below is a suggested deployment setup; you can swap providers as you prefer.

### 1. Push to GitHub

From the project root (`hrms_ethara_ai`):

```bash
git init
git add .
git commit -m "HRMS Lite initial implementation"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Use this repository URL in the submission form.

### 2. Deploy Backend (e.g., Render or Railway)

Example with **Render**:

1. Create a new **Web Service**.
2. Connect the GitHub repo and select the `backend` folder as the root.
3. Set:
   - **Runtime**: Node 20 (or latest supported).
   - **Build Command**:  
     `npm install && npx prisma generate && npm run build`
   - **Start Command**:  
     `npm run start`
4. Configure environment variables:
   - `DATABASE_URL` – keep `file:./dev.db` for SQLite (acceptable for assessment), _or_ point to a managed Postgres instance if you prefer.
   - `PORT` – usually provided by the platform (`PORT` env var); the app already reads `process.env.PORT`.
   - `ORIGIN` – your frontend URL (e.g., `https://your-frontend.vercel.app`).
5. Deploy and note the public backend URL, e.g. `https://hrms-lite-backend.onrender.com`.

> If using PostgreSQL instead of SQLite in production, update `schema.prisma` datasource and `DATABASE_URL` accordingly, then re‑run migrations.

### 3. Deploy Frontend (e.g., Vercel or Netlify)

Example with **Vercel**:

1. Create a new project, import from the same GitHub repo.
2. Set the project root to the `frontend` folder.
3. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL` = your deployed backend URL  
     (e.g. `https://hrms-lite-backend.onrender.com`)
5. Deploy and note the public frontend URL, e.g. `https://hrms-lite.vercel.app`.

Use this URL as the **Live Application URL** in the submission.

---

## Assumptions & Limitations

- **Single admin**: No authentication; the app assumes a trusted internal admin user (per assignment).
- **SQLite for demo**: SQLite is used for simplicity and quick local setup. For production‑grade use, switch to Postgres/MySQL by adjusting `schema.prisma` and `DATABASE_URL`.
- **No pagination**: Employee and attendance lists are unpaginated, which is acceptable for the expected assessment data volume.
- **Minimal domain scope**: Leave management, payroll, and other advanced HR features are intentionally out of scope, as required.

This implementation focuses on **clean structure, basic robustness, and a usable UI** so the reviewers can immediately exercise all core flows from the deployed link.

---

## Troubleshooting: Node.js & npm

### "Cannot find module ... npm-prefix.js" or "Could not determine Node.js install directory"

These errors usually mean the **npm** that ships with Node.js is broken or misconfigured (e.g. after upgrading Node, or a failed global `npm install -g npm`). The path in the error often has `node_modules\npm\bin` repeated twice—that’s a sign of a bad install.

**Fix options (choose one):**

1. **Repair Node.js (recommended)**  
   - Run the **same Node.js installer** you used (e.g. from [nodejs.org](https://nodejs.org)) and choose **Repair**.  
   - Restart the terminal (and IDE) and try again.

2. **Clean reinstall of Node.js**  
   - Uninstall Node.js from **Settings → Apps**.  
   - Delete these if they exist:  
     - `C:\Program Files\nodejs`  
     - `C:\Users\<You>\AppData\Roaming\npm`  
     - `C:\Users\<You>\AppData\Roaming\npm-cache`  
   - Install the latest **LTS** from [nodejs.org](https://nodejs.org).  
   - Restart the terminal and run:  
     ```bash
     node -v
     npm -v
     ```

3. **Use a version manager (clean npm)**  
   - Install [nvm-windows](https://github.com/coreybutler/nvm-windows), then:  
     ```bash
     nvm install 22
     nvm use 22
     node -v
     npm -v
     ```  
   - Use this terminal for the project; avoid global `npm install -g npm`.

**For this project you do not need to run `npm install -g npm@latest`.** Use only project-local commands:

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

If `npm` or `npx` still fail after a repair/reinstall, run from an **elevated (Run as administrator)** PowerShell:

```powershell
where.exe node
where.exe npm
```

Then check that both point under `C:\Program Files\nodejs\` (or your nvm path) and that `C:\Program Files\nodejs\node_modules\npm\bin` exists and contains `npm-cli.js` (no duplicated `node_modules\npm\bin` in the path).

