'use client';

import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Briefcase } from 'lucide-react';
import { useDashboardSummary } from '@/hooks/api/useAnalytics';
import { formatCurrency } from '@/lib/exchangeRate';
import { StatCard } from '@/components/shared/StatCard';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { Currency } from '@/lib/types';

export default function OverviewCards() {
  const { data: stats, isLoading } = useDashboardSummary();
  const { fromVND, baseCurrency } = useCurrencyConverter();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Stats from backend are in VND; convert to the user's base currency for display
  const bc = baseCurrency as Currency;
  const fmt = (n: number) => formatCurrency(fromVND(n, bc), bc, false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tổng tài sản"
        value={fmt(stats.totalAssets)}
        icon={<TrendingUp size={20} />}
        gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        sub="Tổng tích lũy"
        privacyCategory="NET_WORTH"
      />
      <StatCard
        title="Chi tiêu tháng này"
        value={fmt(stats.thisMonth.expense)}
        change={stats.thisMonth.expenseChange}
        icon={<TrendingDown size={20} />}
        gradient="bg-gradient-to-br from-rose-500 to-pink-600"
        sub={`Thu nhập: ${fmt(stats.thisMonth.income)}`}
        privacyCategory="EXPENSE"
        subPrivacyCategory="INCOME"
      />
      <StatCard
        title="Tổng tiết kiệm"
        value={fmt(stats.totalDeposits)}
        icon={<PiggyBank size={20} />}
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        sub={`Tiến độ mục tiêu: ${stats.savingPercent.toFixed(0)}%`}
        privacyCategory="SAVINGS"
        href="/savings"
      />
      <StatCard
        title="Danh mục đầu tư"
        value={fmt(stats.portfolioValue)}
        icon={<Briefcase size={20} />}
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        privacyCategory="INVESTMENTS"
        href="/portfolio"
      />
    </div>
  );
}
