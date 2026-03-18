# Frontend and Backend Integration Plan (Phase 2)

Objective: Replace all current local storage data management logic (`localStorage`) in the Frontend with REST API calls to the Backend via React Query, while completing the Authentication flow with full Access/Refresh Tokens.

## 1. Foundation Setup and Configuration

1.  **Install libraries in `apps/web`**:
    *   `@tanstack/react-query`: Manage API state (caching, loading, background updates).
    *   `axios`: Makes it easy to setup interceptors for requests/responses.

2.  **New folder structure**:
    ```
    apps/web/src/
    ├── lib/
    │   └── apiClient.ts       // Axios instance config + Interceptors
    ├── hooks/
    │   ├── api/               // React Query hooks
    │   │   ├── useAuth.ts
    │   │   ├── useWallets.ts
    │   │   ├── useTransactions.ts
    │   │   ...
    ```

3.  **Setup `apiClient.ts`**:
    *   Create an Axios instance with `baseURL` assigned to `http://localhost:3001/api/v1`.
    *   **Request Interceptor**: Automatically attach `Authorization: Bearer <accessToken>` to the header. (AccessToken will be stored securely, either in memory or localStorage/cookies depending on the strategy).
    *   **Response Interceptor**: Listen for `401 Unauthorized` errors. If `accessToken` expires, automatically call the `/auth/refresh` API with `refreshToken`, save the new tokens, and retry the original request. If the refresh fails, redirect the user to the Login page.

4.  **Setup `QueryClientProvider`**:
    *   Wrap the Next.js application (`app/layout.tsx` or `pages/_app.tsx` files) with the React Query Provider.

## 2. Refactor Authentication Flow

Currently, the Frontend does not have real Login/Register screens connected to a DB.
1.  **Create Login / Registration Pages**:
    *   Use forms (React Hook Form + Zod) for validation.
    *   Call `/auth/login` or `/auth/register` APIs.
2.  **Token Storage**:
    *   Manage the Access Token in the app state (or localStorage) to pass it into the apiClient.
3.  **Create Loading/Auth Check Screen**:
    *   When the app starts, call `/auth/me` to get User info. Only show the Dashboard when the user is validly authenticated.

## 3. Transition Data Management Logic (React Query Hooks)

We will gradually discard `localStorage` in `FinanceContext` or completely replace `FinanceContext` with React Query Hooks.

1.  `useWallets.ts`:
    *   `useWallets`: Query endpoint `GET /wallets`.
    *   `useCreateWallet`: Mutation for sending `POST /wallets`.
    *   `useUpdateWallet`, `useDeleteWallet`.

2.  `useTransactions.ts`:
    *   `useTransactions(filters)`: Query endpoint `GET /transactions` with query params (month/year, type, pagination).
    *   `useMonthlySummary`: Query endpoint `GET /transactions/summary`.
    *   `useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`.

3.  Do the same for Modules: **Portfolio**, **Goals**, **Recurring**, **Analytics** (Dashboard / Net Worth / Spending).

## 4. UI Components Update

Instead of getting data from `FinanceContext`, components will call hooks directly:

*   **Dashboard**: Use `useAnalyticsDashboard()` to get overview data instead of calculating it manually using `financeUtils.ts` (Backend does this calculation).
*   **Transactions Page**: Use `useTransactions()` and add pagination UI and filters calling the API. Instead of filtering on the client-side, parameters will be pushed to the Backend.
*   **Wallets Page**: Update the add/edit forms, call the mutation, and call `queryClient.invalidateQueries(['wallets'])` to refresh the list.

## 5. Verification Plan (Visual Testing Plan)

1.  **Run Frontend & Backend in parallel**: `npm run dev:api` and `npm run dev:web`.
2.  **Auth Flow**:
    *   User opens Web -> Blocked at Login screen.
    *   Register a new account -> Success, redirects to Dashboard.
    *   Logout -> Returns to Login.
3.  **Data Fetching**:
    *   Create 1 Wallet -> Refresh webpage -> Wallet is still there.
    *   Add 1 Transaction -> The overview metrics on Dashboard change instantly (Backend recalculates).
4.  **Edge cases (Network Errors/Limitations)**:
    *   Ensure React Query shows a Spinner (Loading state) smoothly while fetching data.
    *   Display a Toast error notification if API calls fail.

---

### User Review Required
> [!IMPORTANT]
> - Should we completely remove `FinanceContext` and only use React Query? (This is the most common and clean architecture when a fully-featured REST API Backend is available).
> - Token Storage: Easiest way for the current React SPA, we can store Tokens in `localStorage`, then attach them to the apiClient. Do you agree with this approach for a smooth testing phase? For long-term, HttpOnly Cookies could be used.
