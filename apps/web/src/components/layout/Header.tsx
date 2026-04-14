'use client';

import React from 'react';
import { useBaseCurrency } from '@/context/BaseCurrencyContext';
import { CURRENCIES } from '@/lib/constants';
import { Currency } from '@/lib/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title }: HeaderProps) {
  const { baseCurrency, setBaseCurrency } = useBaseCurrency();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400 hidden sm:block">Tiền tệ cơ sở</label>
        <select
          value={baseCurrency}
          onChange={e => setBaseCurrency(e.target.value as Currency)}
          className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Đổi tiền tệ hiển thị"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.code} {c.symbol}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
