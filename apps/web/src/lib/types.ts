export type Currency = 'VND' | 'USD' | 'MYR' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'SGD' | 'KRW';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'SAVING' | 'INVESTMENT';

export type RecurringInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;

export type WalletType = 'CASH' | 'BANK' | 'E_WALLET' | 'CREDIT';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: Currency;
  color?: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always stored in base currency (VND)
  originalAmount: number;
  originalCurrency: Currency;
  category: string;       // top level e.g. "Ăn uống"
  subCategory: string;    // e.g. "Cafe"
  date: string;           // ISO date string
  notes: string;
  walletId?: string;
  walletName?: string;
  goalId?: string;
  goalName?: string;
  savingsDepositId?: string;
  depositBankName?: string;
  recurringId?: string;
  createdAt: string;

  // Investment Linkage
  ticker?: string;
  units?: number;
  assetType?: PortfolioAsset['assetType'];
  currentPrice?: number;
}

export interface PortfolioAsset {
  id: string;
  name: string;
  ticker?: string;
  assetType: 'STOCK' | 'CRYPTO' | 'GOLD' | 'REAL_ESTATE' | 'OTHER';
  units: number;
  costBasis: number;       // per unit, in VND
  currentPrice: number;    // per unit, in VND
  currency: Currency;
  purchaseDate?: string;
  notes?: string;
  walletId?: string;
  walletName?: string;
  transactionId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;    // in VND
  currentAmount: number;   // in VND
  deadline: string;        // ISO date
  color: string;
  icon: string;
}

export interface RecurringItem {
  id: string;
  type: TransactionType;
  amount: number;
  originalCurrency: Currency;
  category: string;
  subCategory: string;
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDate: string;
  notes: string;
  active: boolean;
}

export interface FinanceState {
  transactions: Transaction[];
  portfolioAssets: PortfolioAsset[];
  savingsGoals: SavingsGoal[];
  recurringItems: RecurringItem[];
  wallets: Wallet[];
  baseCurrency: Currency;
}

export type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_PORTFOLIO_ASSET'; payload: PortfolioAsset }
  | { type: 'UPDATE_PORTFOLIO_ASSET'; payload: PortfolioAsset }
  | { type: 'DELETE_PORTFOLIO_ASSET'; payload: string }
  | { type: 'ADD_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_RECURRING'; payload: RecurringItem }
  | { type: 'DELETE_RECURRING'; payload: string }
  | { type: 'LOAD_STATE'; payload: FinanceState };
