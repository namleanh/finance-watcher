import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, subMonths, eachDayOfInterval, eachMonthOfInterval, eachHourOfInterval, subHours } from 'date-fns';
import { decryptNote } from '../utils/crypto.util';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Dashboard Overview ──────────────────────────────────────
  async getDashboard(userId: string, walletId?: string) {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
    const lastMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));

    const [periodTxns, portfolioAssets, goalsAgg, wallets, savingsDeposits, marketData] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, date: { gte: lastMonthStart }, ...(walletId && { walletId }) },
        select: { type: true, amount: true, date: true },
      }),
      this.prisma.portfolioAsset.findMany({
        where: { userId, ...(walletId && { walletId }) },
        select: { units: true, currentPrice: true, currency: true, ticker: true },
      }),
      this.prisma.savingsGoal.aggregate({
        where: { userId },
        _sum: { currentAmount: true, targetAmount: true },
      }),
      this.prisma.wallet.findMany({
        where: { userId, ...(walletId && { id: walletId }) },
        select: { id: true, name: true, balance: true, currency: true, type: true },
      }),
      this.prisma.savingsDeposit.findMany({
        where: { userId, status: 'ACTIVE', ...(walletId && { walletId }) },
        select: { depositAmount: true, interestRate: true, termMonths: true, maturityDate: true },
      }),
      this.prisma.marketData.findMany({
        where: { 
          OR: [
            { type: 'CURRENCY' },
            { type: 'GOLD' }
          ]
        }
      }),
    ]);

    // Create a lookup for currency rates (relative to 1 unit = ? VND)
    const rates: Record<string, number> = { VND: 1 };
    marketData.forEach(m => {
      rates[m.symbol] = Number(m.price);
    });

    const sumByType = (txns: any[], type: string, start?: Date, end?: Date) =>
      txns
          .filter(t => t.type === type && (!start || new Date(t.date) >= start) && (!end || new Date(t.date) <= end))
          .reduce((s, t) => s + Number(t.amount), 0);

    const income = sumByType(periodTxns, 'INCOME', thisMonthStart, thisMonthEnd);
    const expense = sumByType(periodTxns, 'EXPENSE', thisMonthStart, thisMonthEnd);
    const saving = sumByType(periodTxns, 'SAVING', thisMonthStart, thisMonthEnd);

    const lastIncome = sumByType(periodTxns, 'INCOME', lastMonthStart, lastMonthEnd);
    const lastExpense = sumByType(periodTxns, 'EXPENSE', lastMonthStart, lastMonthEnd);

    // Calculate Portfolio Value with live prices where possible
    const portfolioValue = portfolioAssets.reduce((sum, asset) => {
      let price = Number(asset.currentPrice);
      // If we have a live market price for this ticker/symbol, use it
      if (asset.ticker && rates[asset.ticker]) {
        price = rates[asset.ticker];
      }
      
      const valueInOriginalCurrency = Number(asset.units) * price;
      const rate = rates[asset.currency] || 1;
      return sum + (valueInOriginalCurrency * rate);
    }, 0);

    // Calculate Wallet Balance in VND
    const totalWalletBalance = wallets.reduce((sum, w) => {
      const rate = rates[w.currency] || 1;
      return sum + (Number(w.balance) * rate);
    }, 0);

    const totalGoalCurrent = walletId ? 0 : Number(goalsAgg._sum?.currentAmount || 0);
    const totalGoalTarget = walletId ? 0 : Number(goalsAgg._sum?.targetAmount || 0);

    const totalDeposits = savingsDeposits.reduce((s, d) => {
      const principal = Number(d.depositAmount);
      const isMatured = new Date(d.maturityDate) <= now;
      const interest = isMatured
        ? Math.round(principal * (Number(d.interestRate) / 100) * (d.termMonths / 12))
        : 0;
      return s + principal + interest;
    }, 0);

    const totalAssets = totalWalletBalance + portfolioValue + totalGoalCurrent + totalDeposits;

    return {
      thisMonth: {
        income,
        expense,
        saving,
        net: income - expense,
        incomeChange: lastIncome > 0 ? ((income - lastIncome) / lastIncome) * 100 : 0,
        expenseChange: lastExpense > 0 ? ((expense - lastExpense) / lastExpense) * 100 : 0,
      },
      totalAssets,
      portfolioValue,
      totalDeposits,
      savingPercent: totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0,
      wallet: wallets[0] ? {
        id: wallets[0].id,
        name: decryptNote(wallets[0].name, userId),
        balance: Number(wallets[0].balance),
        currency: wallets[0].currency,
        type: wallets[0].type,
      } : null,
    };
  }

  // ── Net Worth History (monthly, whole year) ─────────────────
  async getNetWorthHistory(userId: string, year: number) {
    const allTxns = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) },
      },
      select: { type: true, amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    const now = new Date();
    const maxMonth = year === now.getFullYear() ? now.getMonth() : 11;
    let runningNet = 0;
    const result: { month: string; netWorth: number }[] = [];

    for (let m = 0; m <= maxMonth; m++) {
      const monthTxns = allTxns.filter(t => new Date(t.date).getMonth() === m);
      for (const t of monthTxns) {
        if (t.type === 'INCOME') runningNet += Number(t.amount);
        if (t.type === 'EXPENSE') runningNet -= Number(t.amount);
        if (t.type === 'SAVING') runningNet += Number(t.amount);
        if (t.type === 'INVESTMENT') runningNet += Number(t.amount);
      }
      result.push({ month: format(new Date(year, m), 'MMM'), netWorth: runningNet });
    }

    return { year, data: result };
  }

  // ── Spending by Category (pie chart data) ───────────────────
  async getSpendingByCategory(userId: string, year: number, month: number, walletId?: string) {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));

    const txns = await this.prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', date: { gte: start, lte: end }, ...(walletId && { walletId }) },
      select: { category: true, amount: true },
    });

    const map: Record<string, number> = {};
    for (const t of txns) {
      const catName = decryptNote(t.category, userId) || 'Other';
      map[catName] = (map[catName] || 0) + Number(t.amount);
    }

    const COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#d946ef', '#84cc16'];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }));
  }

  // ── Cashflow Trend (dynamic ranges) ───────────────────────
  async getCashflowTrend(userId: string, range: '1D' | '1W' | '1M' | '1Y' = '1M', walletId?: string) {
    const now = new Date();
    let start: Date;
    let buckets: { label: string; start: Date; end: Date }[] = [];

    switch (range) {
      case 'TODAY' as any:
        start = startOfDay(now);
        buckets = eachHourOfInterval({ start, end: endOfDay(now) }).map(h => ({
          label: format(h, 'HH:mm'),
          start: h,
          end: new Date(h.getTime() + 3599999), 
        }));
        break;
      case '1D':
        start = subHours(now, 23); // 24 entries total
        buckets = eachHourOfInterval({ start, end: now }).map(h => ({
          label: format(h, 'HH:mm'),
          start: h,
          end: new Date(h.getTime() + 3599999),
        }));
        break;
      case '1W':
        start = subDays(now, 6);
        buckets = eachDayOfInterval({ start, end: now }).map(d => ({
          label: format(d, 'EEE'),
          start: startOfDay(d),
          end: endOfDay(d),
        }));
        break;
      case '1M':
        start = subDays(now, 29);
        buckets = eachDayOfInterval({ start, end: now }).map(d => ({
          label: format(d, 'dd/MM'),
          start: startOfDay(d),
          end: endOfDay(d),
        }));
        break;
      case '1Y':
        start = subMonths(now, 11);
        buckets = eachMonthOfInterval({ start, end: now }).map(m => ({
          label: format(m, 'MMM'),
          start: startOfMonth(m),
          end: endOfMonth(m),
        }));
        break;
    }

    // 1. Get current total assets (snapshot)
    const [wallets, portfolioAssets, goalsAgg, savingsDeposits, marketData] = await Promise.all([
      this.prisma.wallet.findMany({ where: { userId, ...(walletId && { id: walletId }) }, select: { balance: true, currency: true } }),
      this.prisma.portfolioAsset.findMany({ where: { userId, ...(walletId && { walletId }) }, select: { units: true, currentPrice: true, currency: true, ticker: true } }),
      this.prisma.savingsGoal.aggregate({ where: { userId }, _sum: { currentAmount: true } }),
      this.prisma.savingsDeposit.findMany({ where: { userId, status: 'ACTIVE', ...(walletId && { walletId }) }, select: { depositAmount: true, interestRate: true, termMonths: true, maturityDate: true } }),
      this.prisma.marketData.findMany({ where: { OR: [{ type: 'CURRENCY' }, { type: 'GOLD' }] } }),
    ]);

    const rates: Record<string, number> = { VND: 1 };
    marketData.forEach(m => { rates[m.symbol] = Number(m.price); });

    const portfolioValue = portfolioAssets.reduce((sum, asset) => {
      let price = Number(asset.currentPrice);
      if (asset.ticker && rates[asset.ticker]) price = rates[asset.ticker];
      const valueInOriginalCurrency = Number(asset.units) * price;
      return sum + (valueInOriginalCurrency * (rates[asset.currency] || 1));
    }, 0);

    const walletBalance = wallets.reduce((sum, w) => sum + (Number(w.balance) * (rates[w.currency] || 1)), 0);
    const goalBalance = walletId ? 0 : Number(goalsAgg._sum?.currentAmount || 0);
    const depositBalance = savingsDeposits.reduce((s, d) => {
      const principal = Number(d.depositAmount);
      const interest = new Date(d.maturityDate) <= now ? Math.round(principal * (Number(d.interestRate) / 100) * (d.termMonths / 12)) : 0;
      return s + principal + interest;
    }, 0);

    const currentTotalAssets = walletBalance + portfolioValue + goalBalance + depositBalance;

    // 2. Get all transactions from start to now to calculate history
    const allTxnsSinceStart = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: start }, ...(walletId && { walletId }) },
      select: { type: true, amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    // 3. Calculate initial balance at start
    // initialBalance = currentTotalAssets - sum(net changes since start)
    const totalNetChangeSinceStart = allTxnsSinceStart.reduce((sum, t) => {
      const amt = Number(t.amount);
      if (t.type === 'INCOME' || t.type === 'SAVING' || t.type === 'INVESTMENT') return sum + amt;
      if (t.type === 'EXPENSE') return sum - amt;
      return sum;
    }, 0);

    let runningBalance = currentTotalAssets - totalNetChangeSinceStart;

    // 4. Map buckets
    const data = buckets.map(b => {
      const bucketTxns = allTxnsSinceStart.filter(t => {
        const d = new Date(t.date);
        return d >= b.start && d <= b.end;
      });

      const income = bucketTxns.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
      const expense = bucketTxns.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
      const saving = bucketTxns.filter(t => t.type === 'SAVING').reduce((s, t) => s + Number(t.amount), 0);
      const investment = bucketTxns.filter(t => t.type === 'INVESTMENT').reduce((s, t) => s + Number(t.amount), 0);

      const netChange = income - expense + saving + investment;
      runningBalance += netChange;

      const isFuture = b.start > now;

      return {
        label: b.label,
        income: isFuture ? null : income,
        expense: isFuture ? null : expense,
        saving: isFuture ? null : saving,
        investment: isFuture ? null : investment,
        balance: isFuture ? null : runningBalance,
        net: isFuture ? null : income - expense,
      };
    });

    return data;
  }
}
