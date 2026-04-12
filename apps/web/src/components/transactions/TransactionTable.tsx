'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trash2, Filter, Search, ChevronLeft, ChevronRight, CreditCard, Loader2, Eye, EyeOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useInfiniteTransactions, useDeleteTransaction } from '@/hooks/api/useTransactions';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/exchangeRate';
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal';
import TransactionDetailModal from '@/components/shared/TransactionDetailModal';
import { usePrivacy, PrivacyCategory } from '@/context/PrivacyContext';
import PrivacyMask from '@/components/shared/PrivacyMask';
import { Currency } from '@/lib/types';

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
  const { isCategoryHidden, toggleCategory, toggleIdVisibility, isIdVisible } = usePrivacy();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCat, setFilterCat] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteTransactions({
    limit: 20,
    ...(showFilters && filterType !== 'all' && { type: filterType }),
    ...(showFilters && filterCat && { category: filterCat }),
    ...(showFilters && dateFrom && { startDate: dateFrom }),
    ...(showFilters && dateTo && { endDate: dateTo }),
  });

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { mutate: deleteTx, isPending: isDeleting } = useDeleteTransaction();

  const handleDelete = () => {
    if (deleteId) {
      deleteTx(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const transactions = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const totalTransactions = data?.pages[0]?.meta?.total || 0;

  // Local text search
  const filtered = useMemo(() => {
    if (!showFilters || !search) return transactions;
    return transactions.filter((t: any) => 
      t.category.toLowerCase().includes(search.toLowerCase()) || 
      (t.notes || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [transactions, search, showFilters]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(
      CATEGORIES
        .filter(c => {
          if (filterType === 'all') return c.type === 'INCOME' || c.type === 'EXPENSE';
          return c.type === filterType;
        })
        .map(c => c.label)
    )).sort();
  }, [filterType]);

  // Reset category when type changes
  useEffect(() => {
    setFilterCat('');
  }, [filterType]);

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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Lọc</span>
          </button>
          <button
            onClick={() => {
              toggleCategory('INCOME_DETAILS');
              toggleCategory('EXPENSE_DETAILS');
              toggleCategory('SAVINGS_DETAILS');
              toggleCategory('INVESTMENT_DETAILS');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${!isCategoryHidden('EXPENSE_DETAILS') ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
          >
            {isCategoryHidden('EXPENSE_DETAILS') ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="hidden sm:inline">{isCategoryHidden('EXPENSE_DETAILS') ? 'Hiện' : 'Ẩn'}</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 animate-in fade-in duration-200">
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); }}
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
              onChange={e => { setFilterCat(e.target.value); }}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả danh mục</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); }}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); }}
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
        <div className="flex flex-col items-center justify-center py-20 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <CreditCard size={28} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-bold text-slate-900 dark:text-slate-100 italic">Không tìm thấy giao dịch nào</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Vui lòng thử điều chỉnh bộ lọc hoặc tìm kiếm tên danh mục/ghi chú</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/50">
                  <th className="px-4 py-3 text-left">Ngày thực hiện</th>
                  <th className="px-4 py-3 text-left">Loại giao dịch</th>
                  <th className="px-4 py-3 text-left">Danh mục</th>
                  <th className="px-4 py-3 text-left">Ghi chú</th>
                  <th className="px-4 py-3 text-right">Số tiền</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30">
                {filtered.map((t: any) => (
                  <tr 
                    key={t.id} 
                    onClick={() => setSelectedTx(t)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{format(parseISO(t.date), 'dd/MM/yyyy', { locale: vi })}</span>
                        <span className="text-[10px] opacity-50">{format(parseISO(t.date), 'HH:mm')}</span>
                      </div>
                      {t.recurringId && <span className="ml-1.5 text-[9px] bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400 rounded px-1 py-0.5">↻</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${TYPE_COLORS[t.type] || TYPE_COLORS['EXPENSE']}`}>
                        {TYPE_LABELS[t.type] || t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.type === 'SAVING' || t.type === 'INVESTMENT' ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                              {t.type === 'SAVING' ? (t.depositBankName || 'Tiết kiệm') : (t.category || 'Đầu tư')}
                            </span>
                            {t.type === 'SAVING' && t.subCategory && (
                              <span className="text-[10px] text-slate-500">{t.subCategory}</span>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCatColor(t.category) }} />
                            <span className="text-sm text-slate-900 dark:text-slate-200">{t.category}</span>
                            {t.subCategory && <span className="text-xs text-slate-500">/ {t.subCategory}</span>}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[160px] truncate">
                      {t.notes || '—'}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {t.walletName && (
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <CreditCard size={8} /> {t.walletName}
                          </span>
                        )}
                        {t.goalName && (
                          <span className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                            🎯 {t.goalName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right whitespace-nowrap">
                      <div className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}
                        <PrivacyMask 
                          value={formatCurrency(t.originalAmount, t.originalCurrency as Currency, false)} 
                          category={t.type === 'INCOME' ? 'INCOME_DETAILS' : t.type === 'EXPENSE' ? 'EXPENSE_DETAILS' : t.type === 'SAVING' ? 'SAVINGS_DETAILS' : 'INVESTMENT_DETAILS'} 
                          id={t.id}
                        />
                      </div>
                      {t.originalCurrency !== 'VND' && (
                        <div className="text-[10px] text-slate-400/80 mt-0.5">
                          ≈ <PrivacyMask 
                              value={formatCurrency(t.amount, 'VND', false)} 
                              category={t.type === 'INCOME' ? 'INCOME_DETAILS' : t.type === 'EXPENSE' ? 'EXPENSE_DETAILS' : t.type === 'SAVING' ? 'SAVINGS_DETAILS' : 'INVESTMENT_DETAILS'} 
                              id={t.id}
                              showIcon={false}
                            />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIdVisibility(t.id);
                          }}
                          className={`p-2 rounded-lg transition-all ${isIdVisible(t.id) ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          title={isIdVisible(t.id) ? 'Ẩn số liệu hàng này' : 'Hiện số liệu hàng này'}
                        >
                          {isIdVisible(t.id) ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(t.id);
                          }}
                          className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          title="Xóa giao dịch"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700/30">
            {filtered.map((t: any) => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTx(t)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/20 active:bg-slate-100 dark:active:bg-slate-700/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" 
                    style={{ backgroundColor: `${getCatColor(t.category)}20`, color: getCatColor(t.category) }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCatColor(t.category) }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {(t.type === 'SAVING' && t.depositBankName) ? t.depositBankName : t.category}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {format(parseISO(t.date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      {t.subCategory && ` • ${t.subCategory}`}
                      {t.notes && ` • ${t.notes}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-500' : t.type === 'EXPENSE' ? 'text-rose-500' : 'dark:text-white'}`}>
                      {t.type === 'EXPENSE' ? '-' : '+'}
                      <PrivacyMask 
                        value={formatCurrency(t.originalAmount, t.originalCurrency, false, false)} 
                        category={(t.type === 'INVESTMENT' ? 'INVESTMENTS' : t.type === 'SAVING' ? 'SAVINGS' : t.type) as PrivacyCategory} 
                        id={t.id}
                      />
                    </div>
                    <p className={`text-[10px] font-medium opacity-80 mt-0.5 ${TYPE_COLORS[t.type]?.split(' ')[0] || 'text-slate-500'}`}>
                      {TYPE_LABELS[t.type]}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleIdVisibility(t.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${isIdVisible(t.id) ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-400'}`}
                    >
                      {isIdVisible(t.id) ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(t.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

            {/* Sentinel for Infinite Scroll */}
            <div ref={loadMoreRef} className="py-6 flex justify-center items-center h-20">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-indigo-500 font-medium">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Đang tải thêm...</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-[10px] text-slate-400 font-medium">Cuộn xuống để xem thêm</span>
              ) : transactions.length > 0 ? (
                <span className="text-[10px] text-slate-400">Đã hiển thị tất cả {totalTransactions} giao dịch</span>
              ) : null}
            </div>
        </>
      )}

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onDelete={(id) => setDeleteId(id)}
      />

      <DeleteConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
