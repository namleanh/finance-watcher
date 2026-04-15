'use client';

import React, { useState } from 'react';
import { Trash2, Edit2, Plus, TrendingUp, TrendingDown, X, Banknote, Briefcase, PiggyBank, Landmark, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { usePortfolioAssets, usePortfolioSummary, useCreatePortfolioAsset, useUpdatePortfolioAsset, useDeletePortfolioAsset, PortfolioAsset } from '@/hooks/api/usePortfolio';
import { usePrivacy } from '@/context/PrivacyContext';
import PrivacyMask from '@/components/shared/PrivacyMask';
import PortfolioDetailModal from '@/components/shared/PortfolioDetailModal';
import { StatCard } from '@/components/shared/StatCard';
import { useWallets } from '@/hooks/api/useWallets';
import { formatCurrency } from '@/lib/exchangeRate';
import { Currency } from '@/lib/types';
import { CURRENCIES } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import CurrencyInput from '../shared/CurrencyInput';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

function AddAssetModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: PortfolioAsset }) {
  const { mutateAsync: createAsset, isPending: isCreating } = useCreatePortfolioAsset();
  const { mutateAsync: updateAsset, isPending: isUpdating } = useUpdatePortfolioAsset();
  const isPending = isCreating || isUpdating;
  const { toVND } = useCurrencyConverter();
  useBodyScrollLock(open);

  const initDate = editing?.purchaseDate 
    ? format(parseISO(editing.purchaseDate), 'yyyy-MM-dd') 
    : format(new Date(), 'yyyy-MM-dd');

  const [name, setName] = useState(editing?.name ?? '');
  const [ticker, setTicker] = useState(editing?.ticker ?? '');
  const [units, setUnits] = useState(editing?.units.toString() ?? '');
  const [costBasis, setCostBasis] = useState(editing?.costBasis.toString() ?? '');
  const [currentPrice, setCurrentPrice] = useState(editing?.currentPrice.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>((editing?.currency as Currency) ?? 'VND');
  const [lastField, setLastField] = useState<'units' | 'costBasis'>('costBasis');
  const [purchaseDate, setPurchaseDate] = useState(initDate);
  const [assetType, setAssetType] = useState<'STOCK' | 'CRYPTO' | 'GOLD' | 'REAL_ESTATE' | 'OTHER'>(editing?.assetType ?? 'STOCK');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [walletId, setWalletId] = useState(editing?.walletId ?? '');
  const { data: wallets = [] } = useWallets();
  
  const totalCost = (parseFloat(units) || 0) * (parseFloat(costBasis) || 0);
  const selectedWallet = wallets.find(w => w.id === walletId);
  const isInsufficient = selectedWallet && totalCost > selectedWallet.balance;

  // Filter wallets by selected currency
  const compatibleWallets = wallets.filter(w => w.currency === currency);

  // Auto-select logic when currency changes
  React.useEffect(() => {
    if (!editing && compatibleWallets.length > 0) {
      if (!walletId || !compatibleWallets.find(w => w.id === walletId)) {
        setWalletId(compatibleWallets[0].id);
      }
    } else if (compatibleWallets.length === 0) {
      setWalletId('');
    }
  }, [currency, compatibleWallets, walletId, editing]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name, 
      ticker, 
      units: parseFloat(units) || 0,
      costBasis: parseFloat(costBasis) || 0,
      currentPrice: parseFloat(currentPrice) || 0,
      currency, 
      purchaseDate: new Date(purchaseDate).toISOString(), 
      notes,
      assetType,
      walletId,
    };

    try {
      if (editing) {
        await updateAsset({ ...data, id: editing.id });
      } else {
        await createAsset(data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm touch-none" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overscroll-contain">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="font-semibold text-slate-900 dark:text-white">{editing ? 'Cập nhật tài sản' : 'Thêm tài sản đầu tư'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3 overflow-y-auto no-scrollbar touch-pan-y">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Tên tài sản</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Vinamilk" className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Mã hiệu (ticker)</label>
              <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="VNM" className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Số lượng</label>
              <div className="relative p-0.5">
                <CurrencyInput value={units} onChange={e => { setUnits(e.target.value); setLastField('units'); }} required placeholder="100" className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" />
                {isInsufficient && !editing && lastField === 'units' && (
                  <div className="absolute top-0 right-2 -translate-y-1/2 z-20 animate-bounce pointer-events-none">
                    <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg rotate-2 flex items-center gap-1 whitespace-nowrap">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                      </span>
                      Số dư không đủ
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Tiền tệ</label>
              <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Giá vốn / cổ phiếu</label>
            <div className="relative p-0.5">
              <CurrencyInput
                value={costBasis}
                onChange={e => { setCostBasis(e.target.value); setLastField('costBasis'); }}
                currency={currency}
                rate={toVND(1, currency)}
                required placeholder="50000"
                className={`w-full bg-white border ${isInsufficient && !editing ? 'border-rose-300 dark:border-rose-500/30' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:bg-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all`}
              />
              {isInsufficient && !editing && lastField === 'costBasis' && (
                <div className="absolute top-0 right-2 -translate-y-1/2 z-20 animate-bounce pointer-events-none">
                  <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg -rotate-2 flex items-center gap-1 whitespace-nowrap">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                    </span>
                    Số dư không đủ
                  </div>
                </div>
              )}
            </div>
            </div>
            <div className="p-0.5">
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Giá hiện tại / cổ phiếu</label>
              <CurrencyInput
                value={currentPrice}
                onChange={e => setCurrentPrice(e.target.value)}
                currency={currency}
                rate={toVND(1, currency)}
                required placeholder="55000"
                className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Ngày mua</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Nguồn tiền (Ví)</label>
              <select 
                value={walletId} 
                onChange={e => setWalletId(e.target.value)} 
                disabled={!!editing || compatibleWallets.length === 0}
                className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 shadow-sm transition-all"
              >
                <option value="">{compatibleWallets.length === 0 ? '-- Không có ví phù hợp --' : '-- Chọn ví --'}</option>
                {compatibleWallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance, w.currency as Currency, false)})</option>
                ))}
              </select>
              {compatibleWallets.length === 0 && !editing && (
                <div className="mt-1.5 p-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 leading-relaxed">
                    Bạn chưa có ví <strong>{currency}</strong>. Vui lòng <a href="/wallets" className="underline font-bold hover:text-rose-700">tạo ví tương ứng</a> để thanh toán.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Loại tài sản</label>
              <select value={assetType} onChange={e => setAssetType(e.target.value as any)} className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all">
                <option value="STOCK">Cổ phiếu</option>
                <option value="CRYPTO">Tiền điện tử / Crypto</option>
                <option value="GOLD">Vàng / Kim loại quý</option>
                <option value="REAL_ESTATE">Bất động sản</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Ghi chú</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Hủy</button>
             <button 
               type="submit" 
               disabled={(!editing && (compatibleWallets.length === 0 || isInsufficient)) || isPending}
               className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50"
             >
               Lưu
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PortfolioTable() {
  const { data: assets = [], isLoading } = usePortfolioAssets();
  const { data: summary = { totalCost: 0, totalValue: 0, pnl: 0, pnlPct: 0 } } = usePortfolioSummary();
  const { mutate: deleteAsset } = useDeletePortfolioAsset();
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PortfolioAsset | undefined>();
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null);
  const { isCategoryHidden, toggleCategory, toggleIdVisibility, isIdVisible } = usePrivacy();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Tổng giá vốn"
          value={formatCurrency(summary.totalCost, 'VND', false)}
          icon={<Banknote size={20} />}
          gradient="bg-gradient-to-br from-slate-500 to-slate-600"
          privacyCategory="INVESTMENTS"
        />
        <StatCard
          title="Tổng thị giá"
          value={formatCurrency(summary.totalValue, 'VND', false)}
          icon={<Briefcase size={20} />}
          gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
          privacyCategory="INVESTMENTS"
        />
        <StatCard
          title="Lãi / Lỗ (P&L)"
          value={`${summary.pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(summary.pnl), 'VND', false)} (${summary.pnlPct.toFixed(2)}%)`}
          icon={summary.pnl >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          gradient={summary.pnl >= 0 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-rose-500 to-orange-600"}
          privacyCategory="INVESTMENTS"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <h3 className="font-semibold text-slate-900 dark:text-white">Danh mục đầu tư</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleCategory('INVESTMENT_DETAILS');
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${!isCategoryHidden('INVESTMENT_DETAILS') ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
            >
              {isCategoryHidden('INVESTMENT_DETAILS') ? <Eye size={14} /> : <EyeOff size={14} />}
              <span className="hidden sm:inline">{isCategoryHidden('INVESTMENT_DETAILS') ? 'Hiện' : 'Ẩn'}</span>
            </button>
            <button
              onClick={() => { setEditing(undefined); setShowModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all shadow-sm shadow-violet-500/20"
            >
              <Plus size={14} /> Thêm tài sản
            </button>
          </div>
        </div>
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="text-5xl mb-3">📈</div>
            <p className="font-medium text-slate-500 dark:text-slate-400">Chưa có tài sản nào</p>
            <p className="text-sm mt-1 text-slate-500">Thêm cổ phiếu, crypto, hay bất động sản</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/50">
                    <th className="px-4 py-3 text-left">Tài sản</th>
                    <th className="px-4 py-3 text-right">Số lượng</th>
                    <th className="px-4 py-3 text-right">Giá vốn</th>
                    <th className="px-4 py-3 text-right">Giá hiện tại</th>
                    <th className="px-4 py-3 text-right">Thị giá</th>
                    <th className="px-4 py-3 text-right">Lãi/Lỗ</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30">
                  {assets.map(a => {
                    const cost = a.costBasis * a.units;
                    const value = a.currentPrice * a.units;
                    const pnl = value - cost;
                    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                    return (
                      <tr 
                        key={a.id} 
                        onClick={() => setSelectedAsset(a)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.name}</p>
                            {a.ticker && <p className="text-xs text-slate-500 dark:text-slate-400">{a.ticker}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300">{a.units.toLocaleString('en-US')}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300">
                          <PrivacyMask value={formatCurrency(a.costBasis, a.currency as Currency)} category="INVESTMENT_DETAILS" id={a.id} />
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-900 dark:text-slate-200 font-medium">
                          <PrivacyMask value={formatCurrency(a.currentPrice, a.currency as Currency)} category="INVESTMENT_DETAILS" id={a.id} />
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                          <PrivacyMask value={formatCurrency(value, a.currency as Currency, false)} category="INVESTMENT_DETAILS" id={a.id} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className={`flex items-center justify-end gap-1 ${pnl >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span className="text-xs font-semibold">{pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span>
                          </div>
                          <p className={`text-[10px] text-right ${pnl >= 0 ? 'text-emerald-500/70 dark:text-emerald-400/70' : 'text-rose-500/70 dark:text-rose-400/70'}`}>
                            {pnl >= 0 ? '+' : ''}
                            <PrivacyMask value={formatCurrency(Math.abs(pnl), a.currency as Currency, false)} category="INVESTMENT_DETAILS" id={a.id} showIcon={false} />
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-right justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleIdVisibility(a.id || '');
                              }}
                              className={`p-2 rounded-lg transition-all ${isIdVisible(a.id || '') ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                              title={isIdVisible(a.id || '') ? 'Ẩn số liệu hàng này' : 'Hiện số liệu hàng này'}
                            >
                              {isIdVisible(a.id || '') ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditing(a);
                                setShowModal(true);
                              }} 
                              className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Bạn có chắc muốn xóa tài sản này?')) deleteAsset(a.id);
                              }} 
                              className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700/30">
              {assets.map(a => {
                const cost = a.costBasis * a.units;
                const value = a.currentPrice * a.units;
                const pnl = value - cost;
                const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                return (
                  <React.Fragment key={a.id}>
                    <div 
                      onClick={() => setSelectedAsset(a)}
                      className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-700/20 active:bg-slate-100 dark:active:bg-slate-700/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">{a.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {a.ticker && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-medium">{a.ticker}</span>}
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{a.units.toLocaleString('en-US')} đơn vị</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditing(a);
                              setShowModal(true);
                            }} 
                            className="p-2.5 text-slate-400 hover:text-indigo-500"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Bạn có chắc muốn xóa tài sản này?')) deleteAsset(a.id);
                            }} 
                            className="p-2.5 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Thị giá</p>
                          <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            <PrivacyMask value={formatCurrency(value, a.currency as Currency, false)} category="INVESTMENT_DETAILS" id={a.id} />
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Giá: <PrivacyMask value={formatCurrency(a.currentPrice, a.currency as Currency)} category="INVESTMENT_DETAILS" id={a.id} showIcon={false} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Lãi / Lỗ</p>
                          <div className={`flex items-center justify-end gap-1 font-bold text-sm ${pnl >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                          </div>
                          <p className={`text-[10px] font-medium mt-0.5 ${pnl >= 0 ? 'text-emerald-500/70 dark:text-emerald-400/70' : 'text-rose-500/70 dark:text-rose-400/70'}`}>
                            {pnl >= 0 ? '+' : ''}
                            <PrivacyMask value={formatCurrency(Math.abs(pnl), a.currency as Currency, false)} category="INVESTMENT_DETAILS" id={a.id} showIcon={false} />
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 justify-center py-2 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIdVisibility(a.id || '');
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${isIdVisible(a.id || '') ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20' : 'text-slate-400'}`}
                        >
                          {isIdVisible(a.id || '') ? <Eye size={14} /> : <EyeOff size={14} />} {isIdVisible(a.id || '') ? 'Ẩn' : 'Hiện'}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(a);
                            setShowModal(true);
                          }} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 font-bold text-[10px]"
                        >
                          <Edit2 size={14} /> Sửa
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Bạn có chắc muốn xóa tài sản này?')) deleteAsset(a.id);
                          }} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 font-bold text-[10px]"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {showModal && (
        <AddAssetModal open={showModal} onClose={() => setShowModal(false)} editing={editing} />
      )}

      <PortfolioDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onEdit={(asset) => {
          setEditing(asset);
          setShowModal(true);
        }}
        onDelete={(id) => {
          if (confirm('Bạn có chắc muốn xóa tài sản này?')) deleteAsset(id);
        }}
      />
    </div>
  );
}
