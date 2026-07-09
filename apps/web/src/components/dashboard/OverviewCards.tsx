'use client';

import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Briefcase } from 'lucide-react';
import { useDashboardSummary } from '@/hooks/api/useAnalytics';
import { formatCurrency } from '@/lib/exchangeRate';
import { StatCard } from '@/components/shared/StatCard';
import { usePrivacy } from '@/context/PrivacyContext';

interface OverviewCardsProps {
  selectedWallet?: string | null;
}

export default function OverviewCards({ selectedWallet }: OverviewCardsProps) {
  const { data: stats, isLoading } = useDashboardSummary(selectedWallet);

  const isFiltered = !!selectedWallet;

  if (isLoading || !stats) {
    return (
      <div className={`grid grid-cols-1 gap-4 ${isFiltered ? '' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {[...Array(isFiltered ? 1 : 4)].map((_, i) => (
          <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-4 ${isFiltered ? '' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
      <StatCard
        title={isFiltered && stats.wallet ? `Số dư ${stats.wallet.name}` : "Tổng tài sản"}
        value={formatCurrency(
          isFiltered && stats.wallet ? stats.wallet.balance : stats.totalAssets,
          isFiltered && stats.wallet ? stats.wallet.currency : 'VND',
          false
        )}
        icon={<TrendingUp size={20} />}
        gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        sub={isFiltered && stats.wallet ? `Loại ví: ${stats.wallet.type}` : "Tổng tích lũy"}
        privacyCategory="NET_WORTH"
      />
      {!isFiltered && (
        <>
          <StatCard
            title="Chi tiêu tháng này"
            value={formatCurrency(stats.thisMonth.expense, 'VND', false)}
            change={stats.thisMonth.expenseChange}
            icon={<TrendingDown size={20} />}
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            sub={`Thu nhập: ${formatCurrency(stats.thisMonth.income, 'VND', false)}`}
            privacyCategory="EXPENSE"
            subPrivacyCategory="INCOME"
          />
          <StatCard
            title="Tổng tiết kiệm"
            value={formatCurrency(stats.totalDeposits, 'VND', false)}
            icon={<PiggyBank size={20} />}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            sub={`Tiến độ mục tiêu: ${stats.savingPercent.toFixed(0)}%`}
            privacyCategory="SAVINGS"
            href="/savings"
          />
          <StatCard
            title="Danh mục đầu tư"
            value={formatCurrency(stats.portfolioValue, 'VND', false)}
            icon={<Briefcase size={20} />}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            privacyCategory="INVESTMENTS"
            href="/portfolio"
          />
        </>
      )}
    </div>
  );
}
