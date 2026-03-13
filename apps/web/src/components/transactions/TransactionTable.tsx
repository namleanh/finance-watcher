'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Filter, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useFinance } from '@/context/FinanceContext';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/exchangeRate';
import { TransactionType } from '@/lib/types';

const TYPE_COLORS: Record<TransactionType, string> = {
  income: 'text-emerald-400 bg-emerald-400/10',
  expense: 'text-rose-400 bg-rose-400/10',
  saving: 'text-blue-400 bg-blue-400/10',
  investment: 'text-violet-400 bg-violet-400/10',
};

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Thu nhập',
  expense: 'Chi tiêu',
  saving: 'Tiết kiệm',
  investment: 'Đầu tư',
};

export default function TransactionTable() {
  const { state, deleteTransaction } = useFinance();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCat, setFilterCat] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return state.transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCat && t.category !== filterCat) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      if (search && !t.category.toLowerCase().includes(search.toLowerCase()) &&
        !t.notes.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [state.transactions, filterType, filterCat, dateFrom, dateTo, search]);

  const allCategories = useMemo(() =>
    [...new Set(state.transactions.map(t => t.category))].sort()
  , [state.transactions]);

  const getCatColor = (cat: string) => {
    return CATEGORIES.find(c => c.label === cat)?.color ?? '#64748b';
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Tìm giao dịch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Lọc</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 animate-in fade-in duration-200">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as TransactionType | 'all')}
              className="bg-slate-700 border border-slate-600 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="income">Thu nhập</option>
              <option value="expense">Chi tiêu</option>
              <option value="saving">Tiết kiệm</option>
              <option value="investment">Đầu tư</option>
            </select>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả danh mục</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Đến ngày"
            />
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-medium text-slate-400">Chưa có giao dịch nào</p>
          <p className="text-sm mt-1">Nhấn &quot;+&quot; để thêm giao dịch đầu tiên</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/50">
                <th className="px-4 py-3 text-left">Ngày</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-left">Ghi chú</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {format(parseISO(t.date), 'dd/MM/yyyy', { locale: vi })}
                    {t.recurring && <span className="ml-1.5 text-[9px] bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400 rounded px-1 py-0.5">↻</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${TYPE_COLORS[t.type]}`}>
                      {TYPE_LABELS[t.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCatColor(t.category) }} />
                      <span className="text-sm text-slate-900 dark:text-slate-200">{t.category}</span>
                      {t.subCategory && <span className="text-xs text-slate-500">/ {t.subCategory}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{t.notes || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : t.type === 'expense' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'}`}>
                      {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.originalAmount, t.originalCurrency, false)}
                    </span>
                    {t.originalCurrency !== 'VND' && (
                      <p className="text-[10px] text-slate-500">{formatCurrency(t.amount, 'VND', true)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-slate-700/30 text-xs text-slate-500">
            Hiển thị {filtered.length}/{state.transactions.length} giao dịch
          </div>
        </div>
      )}
    </div>
  );
}
