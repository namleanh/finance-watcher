'use client';

import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Briefcase } from 'lucide-react';
import { useDashboardSummary } from '@/hooks/api/useAnalytics';
import { formatCurrency } from '@/lib/exchangeRate';
import { StatCard } from '@/components/shared/StatCard';
import { usePrivacy } from '@/context/PrivacyContext';

export default function OverviewCards() {
  const { data: stats, isLoading } = useDashboardSummary();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tổng tài sản"
        value={formatCurrency(stats.totalAssets, 'VND', true)}
        icon={<TrendingUp size={20} />}
        gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        sub="Tổng tích lũy"
        privacyCategory="NET_WORTH"
      />
      <StatCard
        title="Chi tiêu tháng này"
        value={formatCurrency(stats.thisMonth.expense, 'VND', true)}
        change={stats.thisMonth.expenseChange}
        icon={<TrendingDown size={20} />}
        gradient="bg-gradient-to-br from-rose-500 to-pink-600"
        sub={`Thu nhập: ${formatCurrency(stats.thisMonth.income, 'VND', true)}`}
        privacyCategory="EXPENSE"
        subPrivacyCategory="INCOME"
      />
      <StatCard
        title="Tổng tiết kiệm"
        value={formatCurrency(stats.totalDeposits, 'VND', true)}
        icon={<PiggyBank size={20} />}
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        sub={`Tiến độ mục tiêu: ${stats.savingPercent.toFixed(0)}%`}
        privacyCategory="SAVINGS"
      />
      <StatCard
        title="Danh mục đầu tư"
        value={formatCurrency(stats.portfolioValue, 'VND', true)}
        icon={<Briefcase size={20} />}
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        privacyCategory="INVESTMENTS"
      />
    </div>
  );
}
