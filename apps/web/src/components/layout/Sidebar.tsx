'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PieChart, Target, ChevronLeft, ChevronRight, Moon, Sun, Wallet, CreditCard, Landmark, X, LogOut, Info } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useUser, useLogout } from '@/hooks/api/useAuth';
import ProfileModal from '@/components/shared/ProfileModal';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Tổng quan' },
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
  const [showProfile, setShowProfile] = useState(false);

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
      <aside className={`fixed md:relative flex flex-col h-[100dvh] transition-all duration-300 z-50 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${collapsed ? 'w-16' : 'w-56'} 
        bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-700/50 shrink-0 shadow-2xl md:shadow-none`}
      >
        {/* Logo & Mobile Close */}
        <div className={`flex items-center justify-between px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
          <Link 
            href="/" 
            onClick={onClose}
            className={`flex items-center gap-3 transition-transform duration-100 active:scale-102 cursor-pointer`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <Wallet size={16} className="text-white" />
            </div>
            {!collapsed && <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">FinanceWatcher</span>}
          </Link>
          
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
                className={`flex items-center gap-3 px-3 py-3.5 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
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
          
          {/* Mobile-only About Link */}
          <Link
            href="/about"
            onClick={onClose}
            className={`md:hidden flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
              ${pathname === '/about'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <Info size={18} className="shrink-0" />
            <span>Về chúng tôi</span>
          </Link>
        </nav>

        {/* Bottom controls */}
        <div className="p-3 mt-auto border-t border-slate-200 dark:border-slate-800/50 space-y-2">
          {/* User Profile Section */}
          {!collapsed ? (
            <div className="group relative">
              <div 
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                  {getInitials(user?.displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white truncate text-sm leading-tight">
                    {user?.displayName || 'Người dùng'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="flex items-center gap-2 mt-2 w-full px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors text-xs font-medium disabled:opacity-50"
                title="Đăng xuất"
              >
                <LogOut size={14} />
                <span>Đăng xuất</span>
              </button>
              
              <Link 
                href="/about"
                className="flex items-center gap-2 mt-1 w-full px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors text-xs font-medium"
                title="Về chúng tôi"
              >
                <Info size={14} />
                <span>Về chúng tôi</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <button 
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm"
              >
                {getInitials(user?.displayName)}
              </button>
              <button 
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors disabled:opacity-50"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
              <Link 
                href="/about"
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                title="Về chúng tôi"
              >
                <Info size={18} />
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all ${collapsed ? 'justify-center border border-transparent' : 'border border-transparent'}`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}</span>}
          </button>
        </div>

        <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />

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
