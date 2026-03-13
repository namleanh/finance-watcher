'use client';

import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bell } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { getPortfolioSummary, getTotalByType } from '@/lib/financeUtils';
import { formatCurrency } from '@/lib/exchangeRate';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { state } = useFinance();

  const totalIncome = getTotalByType(state.transactions, 'income');
  const totalExpense = getTotalByType(state.transactions, 'expense');
  const totalSaving = getTotalByType(state.transactions, 'saving');
  const { totalValue: portfolioValue } = getPortfolioSummary(state.portfolioAssets);
  const netWorth = totalIncome - totalExpense + totalSaving + portfolioValue;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: vi })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-slate-500 dark:text-slate-400">Tài sản ròng</span>
          <span className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
            {formatCurrency(netWorth, 'VND', true)}
          </span>
        </div>
        <button className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-all relative">
          <Bell size={16} />
          {state.recurringItems.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {state.recurringItems.length}
            </span>
          )}
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
          FW
        </div>
      </div>
    </header>
  );
}
