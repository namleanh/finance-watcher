import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { decryptNote } from '../utils/crypto.util';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Dashboard Overview ──────────────────────────────────────
  async getDashboard(userId: string) {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
    const lastMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));

    const [thisMonthTxns, lastMonthTxns, allTxns, portfolioAssets, savingsGoals, wallets, savingsDeposits] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, date: { gte: thisMonthStart, lte: thisMonthEnd } },
        select: { type: true, amount: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
        select: { type: true, amount: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId },
        select: { type: true, amount: true },
      }),
      this.prisma.portfolioAsset.findMany({
        where: { userId },
        select: { units: true, currentPrice: true },
      }),
      this.prisma.savingsGoal.findMany({
        where: { userId },
        select: { currentAmount: true, targetAmount: true },
      }),
      this.prisma.wallet.findMany({
        where: { userId },
        select: { balance: true },
      }),
      this.prisma.savingsDeposit.findMany({
        where: { userId, status: 'ACTIVE' },
        select: { depositAmount: true, interestRate: true, termMonths: true, maturityDate: true },
      }),
    ]);

    const sumByType = (txns: any[], type: string) =>
      txns.filter(t => t.type === type).reduce((s, t) => s + Number(t.amount), 0);

    const income = sumByType(thisMonthTxns, 'INCOME');
    const expense = sumByType(thisMonthTxns, 'EXPENSE');
    const saving = sumByType(thisMonthTxns, 'SAVING');

    const lastIncome = sumByType(lastMonthTxns, 'INCOME');
    const lastExpense = sumByType(lastMonthTxns, 'EXPENSE');

    const totalIncome = sumByType(allTxns, 'INCOME');
    const totalExpense = sumByType(allTxns, 'EXPENSE');
    const totalSaving = sumByType(allTxns, 'SAVING');
    const totalInvestment = sumByType(allTxns, 'INVESTMENT');

    const portfolioValue = portfolioAssets.reduce(
      (s, a) => s + Number(a.currentPrice) * Number(a.units), 0);

    const totalWalletBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
    const totalGoalCurrent = savingsGoals.reduce((s, g) => s + Number(g.currentAmount), 0);
    const totalGoalTarget = savingsGoals.reduce((s, g) => s + Number(g.targetAmount), 0);

    // Tổng tiết kiệm có kỳ hạn: gốc luôn cộng, lãi chỉ cộng khi đã đáo hạn
    const totalDeposits = savingsDeposits.reduce((s, d) => {
      const principal = Number(d.depositAmount);
      const isMatured = new Date(d.maturityDate) <= now;
      const interest = isMatured
        ? Math.round(principal * (Number(d.interestRate) / 100) * (d.termMonths / 12))
        : 0;
      return s + principal + interest;
    }, 0);

    // Tài sản ròng = Ví + Danh mục đầu tư + Mục tiêu tiết kiệm + Tiết kiệm có kỳ hạn
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
  async getSpendingByCategory(userId: string, year: number, month: number) {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));

    const txns = await this.prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
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
}
