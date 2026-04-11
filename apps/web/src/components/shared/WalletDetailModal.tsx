'use client';

import React from 'react';
import { X, Tag, Info, Trash2, Wallet as WalletIcon, CreditCard, Coins, Smartphone, Building2, Edit2 } from 'lucide-react';
import { formatCurrency } from '@/lib/exchangeRate';
import { usePrivacy } from '@/context/PrivacyContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { Wallet, WalletType, Currency } from '@/lib/types';

interface Props {
  wallet: Wallet | null;
  onClose: () => void;
  onEdit?: (wallet: Wallet) => void;
  onDelete?: (id: string) => void;
}

const WALLET_ICONS: Record<WalletType, any> = {
  CASH: Coins,
  BANK: Building2,
  E_WALLET: Smartphone,
  CREDIT: CreditCard,
};

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  CASH: 'Tiền mặt',
  BANK: 'Ngân hàng',
  E_WALLET: 'Ví điện tử',
  CREDIT: 'Thẻ tín dụng',
};

export default function WalletDetailModal({ wallet, onClose, onEdit, onDelete }: Props) {
  const { maskValue } = usePrivacy();
  useBodyScrollLock(!!wallet);

  if (!wallet) return null;

  const Icon = WALLET_ICONS[wallet.type] || WalletIcon;
  const accentColor = wallet.color || '#6366f1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header/Banner */}
        <div 
          className="h-28 flex items-center justify-center relative transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors z-10"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col items-center pt-2 relative z-10">
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">{WALLET_TYPE_LABELS[wallet.type]}</p>
            <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight text-center px-4">
              {wallet.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Main Balance */}
          <div className="text-center space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số dư hiện tại</p>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white" style={{ color: accentColor }}>
                {formatCurrency(wallet.balance, wallet.currency as Currency, false)}
             </h3>
          </div>

          <div className="grid grid-cols-2 gap-y-5 gap-x-4 pt-2">
            {/* Type */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Loại ví</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{WALLET_TYPE_LABELS[wallet.type]}</p>
              </div>
            </div>

            {/* Currency */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Tag size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Loại tiền</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{wallet.currency}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onDelete && (
                <button 
                  onClick={() => { if (wallet.id) { onDelete(wallet.id); onClose(); } }}
                  className="flex-1 py-3 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-500 text-[10px] font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={12} /> Xóa ví
                </button>
            )}
            {onEdit && (
                <button 
                  onClick={() => { onEdit(wallet); onClose(); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit2 size={12} /> Sửa
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
  );
}
