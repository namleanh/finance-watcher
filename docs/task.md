# Backend Phase 1 Implementation Checklist

## Phase 1: Project Setup & Auth

### 1. NestJS Project Init
- [x] Review existing apps/api structure
- [x] Initialize NestJS in apps/api (install dependencies)
- [x] Configure TypeScript (tsconfig.json)

### 2. Prisma + Database
- [x] Install Prisma
- [x] Create `prisma/schema.prisma` with 6 models + enums
- [x] Create `.env.example` with DATABASE_URL
- [x] Create `PrismaService` + `PrismaModule`

### 3. Auth Module
- [x] Create `UsersModule` + `UsersService`
- [x] Create `AuthModule` with JWT
- [x] `POST /auth/register` endpoint
- [x] `POST /auth/login` endpoint
- [x] `POST /auth/refresh` endpoint
- [x] `GET /auth/me` endpoint (protected)
- [x] `JwtAuthGuard` + `JwtStrategy`

### 4. Core Modules (CRUD)
- [x] WalletsModule
- [x] TransactionsModule (+ query filters, pagination)
- [x] PortfolioModule
- [x] GoalsModule (+ contribute endpoint)
- [x] RecurringModule

### 5. Analytics Module
- [x] Dashboard summary endpoint
- [x] Net worth history endpoint
- [x] Spending by category endpoint

### 6. Verification
- [x] Prisma generate ✅ | TypeScript compile check
- [x] Update root `package.json` scripts
- [x] Create walkthrough.md with Database setup guide

## Phase 2: Frontend & Backend Integration

### 1. Foundations
- [x] Install `@tanstack/react-query` and `axios`
- [x] Setup `apiClient.ts` (Axios interceptors for JWT)
- [x] Configure `QueryClientProvider` in Next.js App

### 2. Authentication Flow
- [x] Create `useAuth` hooks (login, register, logout, me)
- [x] Build Login & Register screens/pages (or update existing ones)
- [x] Handle Protected Routes

### 3. Data Queries & Mutations
- [x] `useWallets` hooks
- [x] `useTransactions` hooks (add filter/pagination state)
- [x] `usePortfolio` hooks
- [x] `useGoals` hooks
- [x] `useRecurring` hooks
- [x] `useAnalytics` hooks

### 4. Component Refactoring (Remove FinanceContext)
- [x] Update **Dashboard** (use data from `/analytics`)
- [x] Update **Transactions Page**
- [x] Update **Wallets Page** (UI not yet implemented, skipped)
- [x] Update **Portfolio/Goals/Recurring Pages** (Recurring not yet implemented)
- [x] Complete removal of static file/localStorage state in `FinanceContext`

## Phase 2 Completion
- Successfully integrated Frontend and Backend.
- React Query now handles state management.
- Login/Register and Authenticated Routes are working reliably.
