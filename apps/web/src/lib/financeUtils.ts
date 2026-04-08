import { Transaction, PortfolioAsset, SavingsGoal, TransactionType } from './types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export function getMonthlyTransactions(
  transactions: Transaction[],
  year: number,
  month: number // 0-indexed
): Transaction[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return transactions.filter(t => {
    const d = parseISO(t.date);
    return isWithinInterval(d, { start, end });
  });
}

export function getTotalByType(transactions: Transaction[], type: TransactionType): number {
  return transactions
    .filter(t => t.type.toLowerCase() === type.toLowerCase())
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getNetWorthHistory(
  transactions: Transaction[],
  assets: PortfolioAsset[],
  year: number
): { month: string; netWorth: number }[] {
  const result: { month: string; netWorth: number }[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();

  let runningNet = 0;
  for (let m = 0; m <= 11; m++) {
    if (year === now.getFullYear() && m > currentMonth) break;
    const txns = getMonthlyTransactions(transactions, year, m);
    txns.forEach(t => {
      if (t.type === 'INCOME') runningNet += t.amount;
      if (t.type === 'EXPENSE') runningNet -= t.amount;
    });
    result.push({ month: format(new Date(year, m), 'MMM'), netWorth: runningNet });
  }
  return result;
}

export function getSpendingByCategory(
  transactions: Transaction[],
  year: number,
  month: number
): { name: string; value: number; color: string }[] {
  const monthly = getMonthlyTransactions(transactions, year, month);
  const expenses = monthly.filter(t => t.type === 'EXPENSE');

  const map: Record<string, number> = {};
  expenses.forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });

  const COLORS = [
    '#f59e0b', '#fb923c', '#ef4444', '#e11d48',
    '#7c3aed', '#4f46e5', '#0891b2', '#64748b',
  ];

  return Object.entries(map).map(([name, value], i) => ({
    name,
    value,
    color: COLORS[i % COLORS.length],
  }));
}

export function getPortfolioSummary(assets: PortfolioAsset[]) {
  const totalCost = assets.reduce((s, a) => s + a.costBasis * a.units, 0);
  const totalValue = assets.reduce((s, a) => s + a.currentPrice * a.units, 0);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  return { totalCost, totalValue, pnl, pnlPct };
}

export function getGoalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
}

export function getDashboardSummary(state: { 
  transactions: Transaction[], 
  portfolioAssets: PortfolioAsset[], 
  savingsGoals: SavingsGoal[],
  wallets: any[] 
}) {
  const now = new Date();
  const thisMonthTxns = getMonthlyTransactions(state.transactions, now.getFullYear(), now.getMonth());
  const lastMonthTxns = getMonthlyTransactions(state.transactions, now.getFullYear(), now.getMonth() - 1);

  const income = getTotalByType(thisMonthTxns, 'INCOME');
  const expense = getTotalByType(thisMonthTxns, 'EXPENSE');

  const lastIncome = getTotalByType(lastMonthTxns, 'INCOME');
  const lastExpense = getTotalByType(lastMonthTxns, 'EXPENSE');

  const { totalValue: portfolioValue, pnlPct } = getPortfolioSummary(state.portfolioAssets);

  const totalIncome = getTotalByType(state.transactions, 'INCOME');
  const totalExpense = getTotalByType(state.transactions, 'EXPENSE');
  const totalGoalCurrent = state.savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalWalletBalance = state.wallets.reduce((s, w) => s + w.balance, 0);

  // Công thức: Tổng Ví + Mục tiêu tiết kiệm + Giá trị đầu tư
  const totalAssets = totalWalletBalance + portfolioValue + totalGoalCurrent;

  const incomeChange = lastIncome > 0 ? ((income - lastIncome) / lastIncome) * 100 : 0;
  const expenseChange = lastExpense > 0 ? ((expense - lastExpense) / lastExpense) * 100 : 0;

  const totalGoalTarget = state.savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const savingPercent = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

  return {
    income,
    expense,
    totalAssets,
    portfolioValue,
    pnlPct,
    incomeChange,
    expenseChange,
    savingPercent
  };
}
