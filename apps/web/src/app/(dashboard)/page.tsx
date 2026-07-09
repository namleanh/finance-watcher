'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import OverviewCards from '@/components/dashboard/OverviewCards';
import SpendingPieChart from '@/components/dashboard/SpendingPieChart';
import CashflowTrendChart from '@/components/dashboard/CashflowTrendChart';
import TransactionTable from '@/components/transactions/TransactionTable';
import AddTransactionModal from '@/components/shared/AddTransactionModal';
import { Plus, Wallet as WalletIcon, ChevronDown, Check } from 'lucide-react';
import { useWallets } from '@/hooks/api/useWallets';

interface DashboardPageProps {
  userId: string;
}

export default function DashboardPage({ userId }: DashboardPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: wallets = [] } = useWallets();
  const activeWallet = wallets.find(w => w.id === selectedWallet);

  return (
    <div className="relative min-h-full pb-32">
      <Header title="Tổng quan tài chính">
        {/* Sleek Custom Dropdown trigger */}
        <div className="relative">
          <button
            id="wallet-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 min-w-[150px] justify-between focus:outline-none"
          >
            <span className="flex items-center gap-1.5">
              <WalletIcon size={14} className={activeWallet ? "text-indigo-500" : "text-slate-400"} />
              {activeWallet ? activeWallet.name : 'Tất cả ví'}
            </span>
            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </Header>

      {/* Dropdown rendered outside Header to avoid stacking context clipping */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setDropdownOpen(false)} />
          <div className="fixed top-[3.25rem] right-4 sm:right-6 lg:right-8 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => {
                setSelectedWallet(null);
                setDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <WalletIcon size={14} className="text-slate-400" />
                Tất cả ví (Tổng hợp)
              </span>
              {!selectedWallet && <Check size={14} className="text-indigo-500 font-bold" />}
            </button>

            <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />

            <div className="max-h-48 overflow-y-auto no-scrollbar">
              {wallets.map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    setSelectedWallet(wallet.id);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: wallet.color || '#6366f1' }}
                    />
                    <span className="truncate max-w-[110px]">{wallet.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[11px] text-slate-500">
                      {Number(wallet.balance).toLocaleString('en-US')} {wallet.currency}
                    </span>
                    {selectedWallet === wallet.id && <Check size={14} className="text-indigo-500 font-bold" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">

        <OverviewCards selectedWallet={selectedWallet} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingPieChart selectedWallet={selectedWallet} />
          <CashflowTrendChart selectedWallet={selectedWallet} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-lg">Giao dịch gần đây</h2>
          </div>
          <TransactionTable selectedWallet={selectedWallet} />
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center z-40"
        aria-label="Thêm giao dịch"
      >
        <Plus size={24} />
      </button>

      <AddTransactionModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}