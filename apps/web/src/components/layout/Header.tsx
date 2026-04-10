'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LogOut, User } from 'lucide-react';
import { useDashboardSummary } from '@/hooks/api/useAnalytics';
import { useUser, useLogout } from '@/hooks/api/useAuth';
import { formatCurrency } from '@/lib/exchangeRate';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: stats } = useDashboardSummary();
  const { data: user } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  
  const [showDropdown, setShowDropdown] = useState(false);

  const netWorth = stats?.totalAssets || 0;

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: vi })}
        </p>
      </div>
      <div className="hidden md:flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-slate-500 dark:text-slate-400">Tổng tài sản ước tính</span>
          <span className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
            {formatCurrency(netWorth, 'VND', true)}
          </span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
          >
            {getInitials(user?.displayName)}
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                    {getInitials(user?.displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {user?.displayName || 'Người dùng'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors text-left font-medium disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất khỏi tài khoản'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

