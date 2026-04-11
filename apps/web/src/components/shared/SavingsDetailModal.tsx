'use client';

import React from 'react';
import { X, Calendar, Landmark, Info, Trash2, Clock, TrendingUp, Wallet } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '@/lib/exchangeRate';
import { usePrivacy } from '@/context/PrivacyContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { SavingsDeposit } from '@/hooks/api/useSavingsDeposits';
import { Currency } from '@/lib/types';

interface Props {
  deposit: SavingsDeposit | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onWithdraw?: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Đang gửi', color: 'text-emerald-500 bg-emerald-500/10' },
  MATURED: { label: 'Đáo hạn', color: 'text-amber-500 bg-amber-500/10' },
  WITHDRAWN: { label: 'Đã rút', color: 'text-slate-500 bg-slate-500/10' },
};

export default function SavingsDetailModal({ deposit, onClose, onDelete, onWithdraw }: Props) {
  const { maskValue } = usePrivacy();
  useBodyScrollLock(!!deposit);

  if (!deposit) return null;

  const status = STATUS_CONFIG[deposit.status] || STATUS_CONFIG.ACTIVE;
  const depositDate = parseISO(deposit.depositDate);
  const maturityDate = parseISO(deposit.maturityDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header/Banner */}
        <div className="h-28 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center relative">
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors z-10"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col items-center pt-2">
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">Sổ tiết kiệm</p>
            <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight text-center px-4">
              {formatCurrency(deposit.depositAmount, deposit.currency as Currency, false)}
            </h2>
            <div className={`mt-2 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${status.color.replace('text-', 'text-white/90 bg-').replace('10', '20')}`}>
              {status.label}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            {/* Bank */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Landmark size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ngân hàng</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{deposit.bankName}</p>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <TrendingUp size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Lãi suất</p>
                <p className="text-xs font-bold text-indigo-500 truncate">{deposit.interestRate}%/năm</p>
              </div>
            </div>

            {/* Deposit Date */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ngày gửi</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{format(depositDate, 'dd/MM/yyyy')}</p>
              </div>
            </div>

            {/* Maturity Date */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Đáo hạn</p>
                <p className="text-xs font-bold text-amber-500 truncate">{format(maturityDate, 'dd/MM/yyyy')}</p>
              </div>
            </div>

            {/* Interest Earned */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <TrendingUp size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Lãi dự kiến</p>
                <p className="text-xs font-bold text-emerald-500 truncate">
                  +{formatCurrency(deposit.interestEarned, deposit.currency as Currency, false)}
                </p>
              </div>
            </div>

            {/* Wallet Source */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Wallet size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Nguồn tiền</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{deposit.walletName || 'N/A'}</p>
              </div>
            </div>

            {/* Notes */}
            {deposit.notes && (
              <div className="flex items-start gap-3 col-span-2 pt-1">
                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Info size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ghi chú</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white break-words">{deposit.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            {deposit.status !== 'WITHDRAWN' && onWithdraw && (
              <button 
                onClick={() => { if (deposit.id) { onWithdraw(deposit.id); onClose(); } }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-black uppercase tracking-wider hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg active:scale-[0.98]"
              >
                Tất toán ngay
              </button>
            )}
            
            <div className="flex gap-2">
              {onDelete && (
                <button 
                  onClick={() => { if (deposit.id) { onDelete(deposit.id); onClose(); } }}
                  className="flex-1 py-3 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-500 text-[10px] font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={12} /> Xóa sổ
                </button>
              )}
              <button 
                onClick={onClose}
                className="flex-[2] py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold transition-all shadow-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
