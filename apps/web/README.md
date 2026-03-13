# 💰 Finance Watcher - Web App

Welcome to the frontend of **Finance Watcher**, a comprehensive personal finance management application built with Next.js. This application helps you track assets, liabilities, and transactions with a beautiful, intuitive interface.

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm, yarn, pnpm, or bun

### Installation
From the `apps/web` directory (or workspace root), run:

```bash
npm install
# then
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🏗️ Project Structure

The codebase is organized following modern Next.js best practices:

- **`src/app/`**: Contains the App Router pages and layouts.
  - `/wallets`: Wallet management.
  - `/liabilities`: Debt and liability tracking.
  - `/portfolio`: Investment overviews.
  - `/transactions`: Detailed activity logs.
- **`src/components/`**: Reusable UI components organized by domain logic (Dashboard, Goals, Layout, etc.).
- **`src/context/`**: Global state providers like `FinanceContext` (for financial data) and `ThemeContext`.
- **`src/lib/`**: Core business logic, including:
  - `financeUtils.ts`: Complex financial calculations.
  - `exchangeRate.ts`: Currency conversion handling.
  - `types.ts`: TypeScript interfaces used throughout the app.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Components**: Standard React components with a focus on accessibility and responsiveness.

---

## 🗺️ Roadmap & Directions

Current focus and future enhancements:

1.  **Backend Integration**: Currently using localized state/mock data; transitioning to a unified API.
2.  **Multi-currency Support**: Expanding beyond static rates to dynamic API-driven conversions.
3.  **Advanced Analytics**: Adding more granular reporting for spending habits and net worth projections.
4.  **Goal Tracking Improvements**: Enhancing the "Savings Goals" feature with visual progress and automated suggestions.

---

## 📄 Learn More

To learn more about Next.js, take a look at the [Next.js Documentation](https://nextjs.org/docs).
