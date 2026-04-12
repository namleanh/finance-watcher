'use client';

import React from 'react';
import { X, Calendar, Tag, CreditCard, FileText, Trash2, Clock, MapPin, Target, TrendingUp, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/exchangeRate';
import { usePrivacy, PrivacyCategory } from '@/context/PrivacyContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  INCOME: { label: 'Thu nhập', color: 'text-emerald-500 bg-emerald-500/10', icon: TrendingUp },
  EXPENSE: { label: 'Chi tiêu', color: 'text-rose-500 bg-rose-500/10', icon: TrendingUp },
  SAVING: { label: 'Tiết kiệm', color: 'text-blue-500 bg-blue-500/10', icon: Target },
  INVESTMENT: { label: 'Đầu tư', color: 'text-violet-500 bg-violet-500/10', icon: TrendingUp },
};

export default function TransactionDetailModal({ transaction, onClose, onDelete }: Props) {
  const { maskValue } = usePrivacy();
  useBodyScrollLock(!!transaction);

  if (!transaction) return null;

  const config = TYPE_CONFIG[transaction.type] || TYPE_CONFIG['EXPENSE'];
  const dateObj = parseISO(transaction.date);
  
  const privacyCat = (transaction.type === 'INVESTMENT' ? 'INVESTMENTS' : transaction.type === 'SAVING' ? 'SAVINGS' : transaction.type) as PrivacyCategory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header/Banner - Compact */}
        <div className={`h-24 sm:h-28 bg-gradient-to-br ${transaction.type === 'INCOME' ? 'from-emerald-500 to-teal-600' : transaction.type === 'EXPENSE' ? 'from-rose-500 to-pink-600' : transaction.type === 'SAVING' ? 'from-blue-500 to-indigo-600' : 'from-violet-500 to-purple-600'} flex items-center justify-center relative`}>
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors z-10"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col items-center pt-2">
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">{config.label}</p>
            <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight text-center px-4">
              {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.originalAmount, transaction.originalCurrency, false, false)}
            </h2>
            {transaction.originalCurrency !== 'VND' && (
              <p className="text-white/60 text-[10px] font-medium mt-0.5">
                ≈ {formatCurrency(transaction.amount, 'VND', false)}
              </p>
            )}
          </div>
        </div>

        {/* Content - Compact */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Tag size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Hạng mục</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{transaction.category}</p>
              </div>
            </div>

            {/* Wallet */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <CreditCard size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ví/Tài khoản</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{transaction.walletName || 'N/A'}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ngày</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{format(dateObj, 'dd/MM/yyyy')}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Giờ</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{format(dateObj, 'HH:mm')}</p>
              </div>
            </div>

            {/* Notes - Integrated into grid if space allows, or full width */}
            {transaction.notes && (
              <div className="flex items-center gap-3 col-span-2">
                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ghi chú</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white break-words">{transaction.notes}</p>
                </div>
              </div>
            )}
          </div>

          {(transaction.depositBankName || transaction.goalName || transaction.ticker) && (
            <div className="space-y-3 pt-1">
              {(transaction.depositBankName || transaction.goalName || transaction.ticker) && (
                <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 text-[10px] space-y-1">
                  {transaction.depositBankName && (
                    <div className="flex justify-between"><span className="text-slate-500">Tiết kiệm:</span> <span className="font-bold text-indigo-600">{transaction.depositBankName}</span></div>
                  )}
                  {transaction.ticker && (
                    <div className="flex justify-between"><span className="text-slate-500">Tài sản:</span> <span className="font-bold text-violet-600">{transaction.ticker} ({transaction.units})</span></div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onDelete && (
              <button 
                onClick={() => { if (transaction.id) { onDelete(transaction.id); onClose(); } }}
                className="flex-1 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-500 text-[10px] font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={12} /> Xóa
              </button>
            )}
            <button 
              onClick={onClose}
              className="flex-[2] py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
