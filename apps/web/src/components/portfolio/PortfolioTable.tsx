'use client';

import React, { useState } from 'react';
import { Trash2, Edit2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolioAssets, usePortfolioSummary, useCreatePortfolioAsset, useUpdatePortfolioAsset, useDeletePortfolioAsset, PortfolioAsset } from '@/hooks/api/usePortfolio';
import { useWallets } from '@/hooks/api/useWallets';
import { formatCurrency } from '@/lib/exchangeRate';
import { Currency } from '@/lib/types';
import { CURRENCIES } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import CurrencyInput from '../shared/CurrencyInput';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

function AddAssetModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: PortfolioAsset }) {
  const { mutateAsync: createAsset } = useCreatePortfolioAsset();
  const { mutateAsync: updateAsset } = useUpdatePortfolioAsset();
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
  const [purchaseDate, setPurchaseDate] = useState(initDate);
  const [assetType, setAssetType] = useState<'STOCK' | 'CRYPTO' | 'GOLD' | 'REAL_ESTATE' | 'OTHER'>(editing?.assetType ?? 'STOCK');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [walletId, setWalletId] = useState(editing?.walletId ?? '');

  const { data: wallets = [] } = useWallets();

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4 shrink-0">{editing ? 'Cập nhật tài sản' : 'Thêm tài sản đầu tư'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Tên tài sản</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Vinamilk" className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Mã hiệu (ticker)</label>
              <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="VNM" className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Số lượng</label>
              <CurrencyInput value={units} onChange={e => setUnits(e.target.value)} required placeholder="100" className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Tiền tệ</label>
              <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Giá vốn / cổ phiếu</label>
              <CurrencyInput
                value={costBasis}
                onChange={e => setCostBasis(e.target.value)}
                currency={currency}
                rate={toVND(1, currency)}
                required placeholder="50000"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Giá hiện tại / cổ phiếu</label>
              <CurrencyInput
                value={currentPrice}
                onChange={e => setCurrentPrice(e.target.value)}
                currency={currency}
                rate={toVND(1, currency)}
                required placeholder="55000"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Ngày mua</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Nguồn tiền (Ví)</label>
              <select 
                value={walletId} 
                onChange={e => setWalletId(e.target.value)} 
                disabled={!!editing}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">-- Chọn ví --</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance, w.currency as Currency, true)})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Loại tài sản</label>
              <select value={assetType} onChange={e => setAssetType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
            <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Hủy</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all">Lưu</button>
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tổng giá vốn', value: formatCurrency(summary.totalCost, 'VND', true), color: 'text-slate-900 dark:text-slate-200' },
          { label: 'Tổng thị giá', value: formatCurrency(summary.totalValue, 'VND', true), color: 'text-indigo-600 dark:text-indigo-400' },
          {
            label: 'Lãi / Lỗ (P&L)',
            value: `${summary.pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(summary.pnl), 'VND', true)} (${summary.pnlPct.toFixed(2)}%)`,
            color: summary.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
          },
        ].map(card => (
          <div key={card.label} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <h3 className="font-semibold text-slate-900 dark:text-white">Danh mục đầu tư</h3>
          <button
            onClick={() => { setEditing(undefined); setShowModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all"
          >
            <Plus size={13} /> Thêm tài sản
          </button>
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
                    <th className="px-4 py-3 text-right">SL</th>
                    <th className="px-4 py-3 text-right">Giá vốn</th>
                    <th className="px-4 py-3 text-right">Giá hiện tại</th>
                    <th className="px-4 py-3 text-right">Thị giá</th>
                    <th className="px-4 py-3 text-right">P&L</th>
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
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.name}</p>
                            {a.ticker && <p className="text-xs text-slate-500 dark:text-slate-400">{a.ticker}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300">{a.units.toLocaleString('en-US')}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300">{formatCurrency(a.costBasis, a.currency as Currency)}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-900 dark:text-slate-200 font-medium">{formatCurrency(a.currentPrice, a.currency as Currency)}</td>
                        <td className="px-4 py-3 text-right text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{formatCurrency(value, a.currency as Currency, true)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className={`flex items-center justify-end gap-1 ${pnl >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span className="text-xs font-semibold">{pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span>
                          </div>
                          <p className={`text-[10px] text-right ${pnl >= 0 ? 'text-emerald-500/70 dark:text-emerald-400/70' : 'text-rose-500/70 dark:text-rose-400/70'}`}>
                            {pnl >= 0 ? '+' : ''}{formatCurrency(Math.abs(pnl), a.currency as Currency, true)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all text-right justify-end">
                            <button onClick={() => { setEditing(a); setShowModal(true); }} className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit2 size={13} /></button>
                            <button 
                              onClick={() => {
                                if (confirm('Bạn có chắc muốn xóa tài sản này?')) deleteAsset(a.id);
                              }} 
                              className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"><Trash2 size={13} />
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
                  <div key={a.id} className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-700/20 active:bg-slate-100 dark:active:bg-slate-700/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{a.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {a.ticker && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-medium">{a.ticker}</span>}
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{a.units.toLocaleString('en-US')} đơn vị</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditing(a); setShowModal(true); }} className="p-2 text-slate-400 hover:text-indigo-500"><Edit2 size={16} /></button>
                        <button 
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn xóa tài sản này?')) deleteAsset(a.id);
                          }} 
                          className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Thị giá</p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(value, a.currency as Currency, true)}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Giá: {formatCurrency(a.currentPrice, a.currency as Currency)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Lãi / Lỗ</p>
                        <div className={`flex items-center justify-end gap-1 font-bold text-sm ${pnl >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                          {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                        </div>
                        <p className={`text-[10px] font-medium mt-0.5 ${pnl >= 0 ? 'text-emerald-500/70 dark:text-emerald-400/70' : 'text-rose-500/70 dark:text-rose-400/70'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(Math.abs(pnl), a.currency as Currency, true)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {showModal && (
        <AddAssetModal open={showModal} onClose={() => setShowModal(false)} editing={editing} />
      )}
    </div>
  );
}
