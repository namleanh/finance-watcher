'use client';

import React from 'react';
import { X, Calendar, Tag, Info, Trash2, TrendingUp, TrendingDown, Briefcase, Wallet, Edit2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '@/lib/exchangeRate';
import { usePrivacy } from '@/context/PrivacyContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { PortfolioAsset } from '@/lib/types';

interface Props {
  asset: PortfolioAsset | null;
  onClose: () => void;
  onEdit?: (asset: PortfolioAsset) => void;
  onDelete?: (id: string) => void;
}

export default function PortfolioDetailModal({ asset, onClose, onEdit, onDelete }: Props) {
  const { maskValue } = usePrivacy();
  useBodyScrollLock(!!asset);

  if (!asset) return null;

  const marketValue = asset.units * asset.currentPrice;
  const totalCost = asset.units * asset.costBasis;
  const pnl = marketValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const purchaseDate = asset.purchaseDate ? parseISO(asset.purchaseDate) : new Date();

  const ASSET_TYPE_LABELS: Record<string, string> = {
    STOCK: 'Cổ phiếu',
    CRYPTO: 'Tiền điện tử',
    GOLD: 'Vàng',
    REAL_ESTATE: 'Bất động sản',
    OTHER: 'Khác',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header/Banner */}
        <div className="h-28 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center relative">
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors z-10"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col items-center pt-2">
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">{ASSET_TYPE_LABELS[asset.assetType] || 'Tài sản'}</p>
            <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight text-center px-4">
              {asset.name}
            </h2>
            <p className="text-white/60 text-[10px] font-medium mt-0.5 tracking-wider uppercase">
              {asset.ticker}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Summary Row */}
          <div className="grid grid-cols-2 gap-3 pb-2">
             <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Thị giá</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {formatCurrency(marketValue, asset.currency, false)}
                </p>
             </div>
             <div className={`p-3 rounded-2xl border ${pnl >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10'}`}>
                <p className={`text-[9px] font-bold uppercase tracking-tighter mb-1 ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  Lãi / Lỗ
                </p>
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-black ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </p>
                  {pnl >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            {/* Units */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Briefcase size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Số lượng</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{asset.units}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <TrendingUp size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Giá hiện tại</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{formatCurrency(asset.currentPrice, asset.currency, false)}</p>
              </div>
            </div>

            {/* Cost Basis */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Tag size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Giá vốn</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{formatCurrency(asset.costBasis, asset.currency, false)}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ngày mua</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{format(purchaseDate, 'dd/MM/yyyy')}</p>
              </div>
            </div>

            {/* Wallet Source */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Wallet size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Thông tin thêm</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{asset.walletName || 'Tài sản hiện có'}</p>
              </div>
            </div>

            {/* Notes */}
            {asset.notes && (
              <div className="flex items-start gap-3 col-span-2 pt-1">
                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Info size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ghi chú</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white break-words">{asset.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onDelete && (
                <button 
                  onClick={() => { if (asset.id) { onDelete(asset.id); onClose(); } }}
                  className="flex-1 py-3 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-500 text-[10px] font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={12} /> Xóa
                </button>
            )}
            {onEdit && (
                <button 
                  onClick={() => { onEdit(asset); onClose(); }}
                  className="flex-1 py-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-indigo-500 text-[10px] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-1.5"
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
