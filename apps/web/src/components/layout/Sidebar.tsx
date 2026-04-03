'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PieChart, Target, ChevronLeft, ChevronRight, Moon, Sun, Wallet, CreditCard, Landmark, X, Bell, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useUser, useLogout } from '@/hooks/api/useAuth';
import { useRecurringItems } from '@/hooks/api/useRecurring';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Giao dịch' },
  { href: '/wallets', icon: CreditCard, label: 'Ví tiền' },
  { href: '/savings', icon: Landmark, label: 'Tiết kiệm' },
  { href: '/portfolio', icon: PieChart, label: 'Đầu tư' },
  { href: '/goals', icon: Target, label: 'Mục tiêu' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { data: user } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: recurring = [] } = useRecurringItems();

  const activeRecurringCount = recurring.filter(r => r.active).length;

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside className={`fixed md:relative flex flex-col h-screen transition-all duration-300 z-50 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${collapsed ? 'w-16' : 'w-56'} 
        bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-700/50 shrink-0 shadow-2xl md:shadow-none`}
      >
        {/* Logo & Mobile Close */}
        <div className={`flex items-center justify-between px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
          <div onClick={() => { router.push('/'); onClose?.(); }} className={`flex items-center gap-3 transition-transform duration-100 active:scale-102 cursor-pointer`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <Wallet size={16} className="text-white" />
            </div>
            {!collapsed && <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">FinanceWatcher</span>}
          </div>
          
          <button onClick={onClose} className="md:hidden p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-2 space-y-1 border-t border-slate-200 dark:border-slate-800/50">
          {/* Mobile Profile & Notification section (Visible on mobile only) */}
          <div className="md:hidden pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3 px-3 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                {getInitials(user?.displayName)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                  {user?.displayName || 'Người dùng'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium relative"
              >
                <Bell size={14} />
                Thông báo
                {activeRecurringCount > 0 && (
                  <span className="absolute top-0 right-2 w-4 h-4 bg-indigo-500 rounded-full text-[10px] text-white flex items-center justify-center -translate-y-1">
                    {activeRecurringCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-medium"
              >
                <LogOut size={14} />
                Đăng xuất
              </button>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>

        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-all z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
