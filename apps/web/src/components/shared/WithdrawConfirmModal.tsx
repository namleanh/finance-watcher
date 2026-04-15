'use client';

import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useWallets } from '@/hooks/api/useWallets';
import { formatCurrency } from '@/lib/exchangeRate';

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
  defaultWalletId,
  currency,
  title = 'Xác nhận tất toán',
  message = 'Bạn có chắc chắn muốn tất toán sổ tiết kiệm này? Tiền gốc và lãi sẽ được cộng vào ví của bạn.',
  isLoading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (targetWalletId?: string) => void;
  defaultWalletId?: string;
  currency?: string;
  title?: string;
  message?: string;
  isLoading?: boolean;
}) {
  const { data: wallets = [] } = useWallets();
  const filteredWallets = React.useMemo(() => {
    if (!currency) return wallets;
    return wallets.filter(w => w.currency === currency);
  }, [wallets, currency]);

  const [selectedWalletId, setSelectedWalletId] = React.useState('');

  React.useEffect(() => {
    if (open) {
      // 1. If default wallet matches currency, pick it
      const def = wallets.find(w => w.id === defaultWalletId);
      if (def && def.currency === currency) {
        setSelectedWalletId(defaultWalletId || '');
      } 
      // 2. Otherwise pick first matching if only one exists
      else if (filteredWallets.length === 1) {
        setSelectedWalletId(filteredWallets[0].id);
      }
      else {
        setSelectedWalletId('');
      }
    }
  }, [defaultWalletId, open, currency, wallets, filteredWallets]);

  useBodyScrollLock(open);
  if (!open) return null;

  const handleSubmit = () => {
    onConfirm(selectedWalletId);
  };

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

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Ví nhận tiền</label>
            <select
              value={selectedWalletId}
              onChange={e => setSelectedWalletId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="">-- Chọn ví {currency} nhận tiền --</option>
              {filteredWallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatCurrency(w.balance, w.currency as any, false)})
                </option>
              ))}
            </select>
            {filteredWallets.length === 0 && open && (
               <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30">
                 <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                   Bạn chưa có ví nào thuộc đơn vị tiền tệ <strong>{currency}</strong>. Vui lòng tạo ví mới trước khi tất toán sổ tiết kiệm này để đảm bảo chính xác.
                 </p>
               </div>
            )}
            {defaultWalletId && !filteredWallets.find(w => w.id === defaultWalletId) && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                * Ví gốc của sổ này không cùng đơn vị tiền tệ hoặc không còn tồn tại.
              </p>
            )}
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
              onClick={handleSubmit}
              disabled={isLoading || !selectedWalletId}
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
