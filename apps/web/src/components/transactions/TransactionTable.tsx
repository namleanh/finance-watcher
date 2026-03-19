'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTransactions, useDeleteTransaction } from '@/hooks/api/useTransactions';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/exchangeRate';

const TYPE_COLORS: Record<string, string> = {
  INCOME: 'text-emerald-400 bg-emerald-400/10',
  EXPENSE: 'text-rose-400 bg-rose-400/10',
  SAVING: 'text-blue-400 bg-blue-400/10',
  INVESTMENT: 'text-violet-400 bg-violet-400/10',
};

const TYPE_LABELS: Record<string, string> = {
  INCOME: 'Thu nhập',
  EXPENSE: 'Chi tiêu',
  SAVING: 'Tiết kiệm',
  INVESTMENT: 'Đầu tư',
};

export default function TransactionTable() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCat, setFilterCat] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useTransactions({
    page,
    limit: 20,
    ...(filterType !== 'all' && { type: filterType }),
    ...(filterCat && { category: filterCat }),
    ...(dateFrom && { startDate: dateFrom }),
    ...(dateTo && { endDate: dateTo }),
  });

  const { mutate: deleteTx } = useDeleteTransaction();

  const transactions = response?.data || [];
  const meta = response?.meta || { total: 0, totalPages: 1 };

  // Local text search
  const filtered = useMemo(() => {
    if (!search) return transactions;
    return transactions.filter((t: any) => 
      t.category.toLowerCase().includes(search.toLowerCase()) || 
      (t.notes || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [transactions, search]);

  const allCategories = CATEGORIES.map(c => c.label).sort();

  const getCatColor = (cat: string) => {
    return CATEGORIES.find(c => c.label === cat)?.color ?? '#64748b';
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700/50 space-y-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Tìm giao dịch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 animate-in fade-in duration-200">
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="INCOME">Thu nhập</option>
              <option value="EXPENSE">Chi tiêu</option>
              <option value="SAVING">Tiết kiệm</option>
              <option value="INVESTMENT">Đầu tư</option>
            </select>
            <select
              value={filterCat}
              onChange={e => { setFilterCat(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả danh mục</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Đến ngày"
            />
          </div>
        )}
      </div>

      {/* Table & List View */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-medium text-slate-400">Không tìm thấy giao dịch nào</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                {filtered.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {format(parseISO(t.date), 'dd/MM/yyyy', { locale: vi })}
                      {t.recurringId && <span className="ml-1.5 text-[9px] bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400 rounded px-1 py-0.5">↻</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${TYPE_COLORS[t.type] || TYPE_COLORS['EXPENSE']}`}>
                        {TYPE_LABELS[t.type] || t.type}
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
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className={`text-sm font-semibold ${t.type === 'INCOME' ? 'text-emerald-500 dark:text-emerald-400' : t.type === 'EXPENSE' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'}`}>
                        {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.originalAmount, t.originalCurrency, false)}
                      </span>
                      {t.originalCurrency !== 'VND' && (
                        <p className="text-[10px] text-slate-500">{formatCurrency(t.amount, 'VND', true)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa giao dịch này?')) deleteTx(t.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700/30">
            {filtered.map((t: any) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/20 active:bg-slate-100 dark:active:bg-slate-700/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" 
                    style={{ backgroundColor: `${getCatColor(t.category)}20`, color: getCatColor(t.category) }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCatColor(t.category) }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.category}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {format(parseISO(t.date), 'dd/MM/yyyy', { locale: vi })}
                      {t.notes && ` • ${t.notes}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-500' : t.type === 'EXPENSE' ? 'text-rose-500' : 'dark:text-white'}`}>
                      {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.originalAmount, t.originalCurrency, false)}
                    </p>
                    <p className={`text-[10px] font-medium opacity-80 mt-0.5 ${TYPE_COLORS[t.type]?.split(' ')[0] || 'text-slate-500'}`}>
                      {TYPE_LABELS[t.type]}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa giao dịch này?')) deleteTx(t.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700/30 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-[10px] sm:text-xs text-slate-500">
              {meta.total} GD | {page}/{meta.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
