'use client';

import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface WithdrawConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export default function WithdrawConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Xác nhận tất toán',
  message = 'Bạn có chắc chắn muốn tất toán sổ tiết kiệm này? Tiền gốc và lãi sẽ được cộng lại vào ví của bạn.',
  isLoading = false,
}: WithdrawConfirmModalProps) {
  useBodyScrollLock(open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative w-full sm:max-w-sm bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'Tất toán'}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
