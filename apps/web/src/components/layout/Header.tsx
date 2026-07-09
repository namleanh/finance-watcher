'use client';

import React from 'react';
import { formatCurrency } from '@/lib/exchangeRate';
import { usePrivacy } from '@/context/PrivacyContext';
import { useDashboardSummary } from '@/hooks/api/useAnalytics';
import PrivacyMask from '@/components/shared/PrivacyMask';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Header({ title, children }: HeaderProps) {
  const { data: stats } = useDashboardSummary();
  const { toggleCategory, maskValue, isCategoryHidden } = usePrivacy();
  
  const netWorth = stats?.totalAssets || 0;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">{title}</h1>
      </div>
      <div>
        {children}
      </div>
    </header>
  );
}

