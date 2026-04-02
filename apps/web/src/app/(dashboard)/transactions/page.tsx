'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import TransactionTable from '@/components/transactions/TransactionTable';
import AddTransactionModal from '@/components/shared/AddTransactionModal';
import { Plus } from 'lucide-react';

export default function TransactionsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative min-h-full pb-20">
      <Header title="Giao dịch" subtitle="Theo dõi thu nhập và chi tiêu" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Lịch sử giao dịch</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg hover:from-indigo-600 hover:to-violet-700 transition-all"
          >
            <Plus size={15} /> Thêm giao dịch
          </button>
        </div>
        <TransactionTable />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center z-40"
      >
        <Plus size={24} />
      </button>

      <AddTransactionModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
