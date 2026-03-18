# ✅ Backend Phase 1 — Walkthrough & Setup Guide

## What has been built

**TypeScript compile: ✅ Zero errors**  
**Prisma generate: ✅ Client generated**

### Complete Directory Structure

```
apps/api/
├── prisma/
│   └── schema.prisma        ← 6 models, 5 enums
├── src/
│   ├── main.ts              ← NestJS entry (port 3001, prefix /api/v1)
│   ├── app.module.ts        ← Root module
│   ├── prisma/              ← PrismaService (@Global)
│   ├── auth/                ← JWT Auth (register/login/refresh/logout/me)
│   ├── users/               ← UsersService
│   ├── wallets/             ← CRUD /api/v1/wallets
│   ├── transactions/        ← CRUD + filter/pagination /api/v1/transactions
│   ├── portfolio/           ← CRUD + PnL summary /api/v1/portfolio
│   ├── goals/               ← CRUD + contribute /api/v1/goals
│   ├── recurring/           ← CRUD /api/v1/recurring
│   └── analytics/           ← Dashboard / Net Worth / Spending
├── package.json
└── tsconfig.json
```

---

## First-time Setup

### Step 1: Install PostgreSQL

If you don't have PostgreSQL installed, [download it here](https://www.postgresql.org/download/).  
After installation, create a database:

```sql
CREATE DATABASE finance_watcher;
```

### Step 2: Create `.env` file

```bash
# Inside the apps/api/ directory
cp .env.example .env
```

Edit the `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_watcher?schema=public"
JWT_SECRET="random-secret-key-here"
JWT_REFRESH_SECRET="another-random-secret-here"
```

### Step 3: Migrate database

```bash
# From the monorepo root directory:
npm run prisma:migrate

# Or directly:
cd apps/api && npx prisma migrate dev --name init
```

This command will create **all 6 tables** in PostgreSQL.

### Step 4: Run API server

```bash
# From the root directory:
npm run dev:api

# The server will run at: http://localhost:3001/api/v1
```

---

## Quick Testing with curl

### Register an account
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","displayName":"Test User"}'

# Response: { "accessToken": "...", "refreshToken": "..." }
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Call protected API (add Bearer token)
```bash
export TOKEN="<accessToken from the response above>"

# Get user info
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Add a transaction
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INCOME",
    "amount": 15000000,
    "originalAmount": 15000000,
    "originalCurrency": "VND",
    "category": "Salary",
    "subCategory": "Base Salary",
    "date": "2026-03-17"
  }'

# Get dashboard analytics
curl http://localhost:3001/api/v1/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## API Endpoints Summary

| Group | Endpoints |
|-------|-----------|
| **Auth** | POST register, POST login, POST refresh, POST logout, GET me |
| **Wallets** | GET / POST / GET :id / PATCH :id / DELETE :id |
| **Transactions** | GET (filter+page) / POST / GET summary / GET :id / PATCH :id / DELETE :id |
| **Portfolio** | GET / POST / GET summary / GET :id / PATCH :id / DELETE :id |
| **Goals** | GET / POST / GET :id / PATCH :id / POST :id/contribute / DELETE :id |
| **Recurring** | GET / POST / GET :id / PATCH :id / DELETE :id |
| **Analytics** | GET dashboard, GET net-worth?year=, GET spending?year=&month= |

---

## ✅ Phase 2: React Frontend Integration Completed

The entire React SPA Frontend (Next.js) is now fully connected and synced with the NestJS Backend built above.

### Summary of Phase 2 Changes
- **Axios & JWT Interceptors Integration**: Automatically injects `Authorization: Bearer <token>` and automatically refreshes when the token expires.
- **Using React Query (`@tanstack/react-query`)**: Completely replaces static file/localStorage state management in the old, redundant `FinanceContext`. Custom hooks like `useWallets`, `useTransactions`, `usePortfolio`, and `useGoals` are attached to the screens.
- **Component Refactoring**: The Dashboard, Transactions grid, Goals, and Portfolio interfaces smoothly fetch data from the Backend via predefined endpoints, supporting native API filtering and pagination.
- **Security**: Page routines are configured with an Auth Guard - forcing login if a cookie token is missing.

### How to Run the Complete System

**Terminal 1 (Backend - Port 3001)**:
```bash
npm run dev:api
```

**Terminal 2 (Frontend - Port 3000)**:
```bash
cd apps/web && npm run dev
```
You can now open http://localhost:3000 to use a perfectly complete full-stack product.
