'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Briefcase } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { getDashboardSummary } from '@/lib/financeUtils';
import { formatCurrency } from '@/lib/exchangeRate';
import { StatCard } from '@/components/shared/StatCard';

export default function OverviewCards() {
  const { state } = useFinance();
  
  const stats = useMemo(() => getDashboardSummary(state), [state]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tổng tài sản"
        value={formatCurrency(stats.totalAssets, 'VND', true)}
        icon={<TrendingUp size={20} />}
        gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        sub="Tổng tích lũy"
      />
      <StatCard
        title="Chi tiêu tháng này"
        value={formatCurrency(stats.expense, 'VND', true)}
        change={stats.expenseChange}
        icon={<TrendingDown size={20} />}
        gradient="bg-gradient-to-br from-rose-500 to-pink-600"
        sub={`Thu nhập: ${formatCurrency(stats.income, 'VND', true)}`}
      />
      <StatCard
        title="Tiết kiệm tháng này"
        value={formatCurrency(stats.saving, 'VND', true)}
        icon={<PiggyBank size={20} />}
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        sub={`Tiến độ mục tiêu: ${stats.savingPercent.toFixed(0)}%`}
      />
      <StatCard
        title="Danh mục đầu tư"
        value={formatCurrency(stats.portfolioValue, 'VND', true)}
        change={stats.pnlPct}
        icon={<Briefcase size={20} />}
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        sub={`${state.portfolioAssets.length} tài sản`}
      />
    </div>
  );
}
