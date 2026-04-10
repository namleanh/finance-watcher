'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import OverviewCards from '@/components/dashboard/OverviewCards';
import MarketDataWidget from '@/components/dashboard/MarketDataWidget';
import SpendingPieChart from '@/components/dashboard/SpendingPieChart';
import CashflowTrendChart from '@/components/dashboard/CashflowTrendChart';
import TransactionTable from '@/components/transactions/TransactionTable';
import AddTransactionModal from '@/components/shared/AddTransactionModal';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative min-h-full pb-32">
      <Header title="Dashboard" subtitle="Tổng quan tài chính của bạn" />
      <MarketDataWidget />

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
        <OverviewCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingPieChart />
          <CashflowTrendChart />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-lg">Giao dịch gần đây</h2>
          </div>
          <TransactionTable />
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
