'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, RefreshCw, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import { useCreateRecurring } from '@/hooks/api/useRecurring';
import { useWallets } from '@/hooks/api/useWallets';
import { CATEGORIES, CURRENCIES } from '@/lib/constants';
import { toVND } from '@/lib/exchangeRate';
import { Currency, TransactionType, RecurringInterval } from '@/lib/types';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: 'income', label: '💰 Thu nhập', color: 'from-emerald-500 to-green-600' },
  { value: 'expense', label: '💸 Chi tiêu', color: 'from-rose-500 to-pink-600' },
];

const RECURRING_OPTIONS: { value: RecurringInterval; label: string }[] = [
  { value: null, label: 'Không lặp lại' },
  { value: 'daily', label: 'Hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần' },
  { value: 'monthly', label: 'Hàng tháng' },
  { value: 'yearly', label: 'Hàng năm' },
];

export default function AddTransactionModal({ open, onClose }: Props) {
  const { mutateAsync: createTransaction, isPending: isTxPending } = useCreateTransaction();
  const { mutateAsync: createRecurring, isPending: isRecPending } = useCreateRecurring();
  const { data: wallets = [] } = useWallets();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('VND');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState<RecurringInterval>(null);
  const [walletId, setWalletId] = useState<string>('');

  const cats = CATEGORIES.filter(c => c.type === type);
  const selectedCat = cats.find(c => c.label === category);

  useEffect(() => {
    setCategory('');
    setSubCategory('');
  }, [type]);

  useEffect(() => {
    setSubCategory('');
  }, [category]);

  // Auto-chọn ví đầu tiên khi danh sách load xong
  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets]);

  if (!open) return null;

  // Gate: yêu cầu tạo ví trước
  if (wallets.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
            <CreditCard size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Chưa có ví tiền</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Bạn cần tạo ít nhất một ví trước khi thêm giao dịch để theo dõi số dư chính xác.
            </p>
          </div>
          <Link
            href="/wallets"
            onClick={onClose}
            className="flex items-center gap-2 w-full justify-center py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            Tạo ví tiền ngay
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (!num || !category || !walletId) return;

    const amtVND = toVND(num, currency);

    try {
      await createTransaction({
        type: type.toUpperCase() as any,
        amount: amtVND,
        originalAmount: num,
        originalCurrency: currency,
        category,
        subCategory,
        date: new Date(date).toISOString(),
        notes,
        walletId: walletId || undefined,
      });

      if (recurring) {
        const nextD = new Date(date);
        if (recurring === 'daily') nextD.setDate(nextD.getDate() + 1);
        else if (recurring === 'weekly') nextD.setDate(nextD.getDate() + 7);
        else if (recurring === 'monthly') nextD.setMonth(nextD.getMonth() + 1);
        else if (recurring === 'yearly') nextD.setFullYear(nextD.getFullYear() + 1);

        await createRecurring({
          type: type.toUpperCase() as any,
          amount: amtVND,
          originalCurrency: currency,
          category,
          subCategory,
          interval: recurring.toUpperCase() as any,
          nextDate: nextD.toISOString(),
          notes,
        });
      }

      // Reset
      setAmount('');
      setNotes('');
      setRecurring(null);
      setWalletId('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xãy ra khi thêm giao dịch!');
    }
  };

  const isPending = isTxPending || isRecPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-white dark:bg-slate-900 border-x sm:border border-slate-200 dark:border-slate-700 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-indigo-500 dark:text-indigo-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Thêm giao dịch</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-64px)] sm:max-h-[85vh]">
          {/* Type selector */}
          <div>
            <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5 block">Loại giao dịch</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all
                    ${type === opt.value
                      ? `bg-gradient-to-r ${opt.color} text-white shadow-lg`
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white dark:border-slate-700'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Currency */}
          <div>
            <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5 block">Số tiền</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                className="bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-2 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[70px] sm:min-w-[80px]"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                ))}
              </select>
            </div>
            {currency !== 'VND' && amount && !isNaN(parseFloat(amount)) && (
              <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                <RefreshCw size={10} />
                ≈ {(parseFloat(amount) * (currency === 'USD' ? 25400 : 5404)).toLocaleString('vi-VN')} ₫
              </p>
            )}
          </div>

          {/* Category + SubCategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Danh mục</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Chọn danh mục</option>
                {cats.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Phân mục</label>
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                disabled={!selectedCat}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
              >
                <option value="">Tất cả</option>
                {selectedCat?.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Wallet Selector */}
          <div>
            <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Ví thanh toán <span className="text-rose-400">*</span>
            </label>
            <select
              value={walletId}
              onChange={e => setWalletId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Date + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Ngày</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Ghi chú</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Tuỳ chọn..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5 block">Giao dịch định kỳ</label>
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {RECURRING_OPTIONS.map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setRecurring(opt.value)}
                  className={`py-1.5 px-2.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
                    ${recurring === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isPending ? 'Đang thêm...' : 'Thêm giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
