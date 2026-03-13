'use client';

import React, { useState } from 'react';
import { Trash2, Edit2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/exchangeRate';
import { getPortfolioSummary } from '@/lib/financeUtils';
import { PortfolioAsset, Currency } from '@/lib/types';
import { CURRENCIES } from '@/lib/constants';
import { format } from 'date-fns';

function AddAssetModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: PortfolioAsset }) {
  const { addPortfolioAsset, updatePortfolioAsset } = useFinance();
  const [name, setName] = useState(editing?.name ?? '');
  const [ticker, setTicker] = useState(editing?.ticker ?? '');
  const [units, setUnits] = useState(editing?.units.toString() ?? '');
  const [costBasis, setCostBasis] = useState(editing?.costBasis.toString() ?? '');
  const [currentPrice, setCurrentPrice] = useState(editing?.currentPrice.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(editing?.currency ?? 'VND');
  const [purchaseDate, setPurchaseDate] = useState(editing?.purchaseDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState(editing?.notes ?? '');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name, ticker, units: parseFloat(units) || 0,
      costBasis: parseFloat(costBasis) || 0,
      currentPrice: parseFloat(currentPrice) || 0,
      currency, purchaseDate, notes,
    };
    if (editing) {
      updatePortfolioAsset({ ...data, id: editing.id });
    } else {
      addPortfolioAsset(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{editing ? 'Cập nhật tài sản' : 'Thêm tài sản đầu tư'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tên tài sản</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Vinamilk" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Mã hiệu (ticker)</label>
              <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="VNM" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Số lượng</label>
              <input type="number" value={units} onChange={e => setUnits(e.target.value)} required placeholder="100" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tiền tệ</label>
              <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Giá vốn / cổ phiếu</label>
              <input type="number" value={costBasis} onChange={e => setCostBasis(e.target.value)} required placeholder="50000" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Giá hiện tại / cổ phiếu</label>
              <input type="number" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} required placeholder="55000" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Ngày mua</label>
            <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Ghi chú</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-all">Hủy</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PortfolioTable() {
  const { state, deletePortfolioAsset } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PortfolioAsset | undefined>();
  const summary = getPortfolioSummary(state.portfolioAssets);

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng giá vốn', value: formatCurrency(summary.totalCost, 'VND', true), color: 'text-slate-200' },
          { label: 'Tổng thị giá', value: formatCurrency(summary.totalValue, 'VND', true), color: 'text-indigo-400' },
          {
            label: 'Lãi / Lỗ (P&L)',
            value: `${summary.pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(summary.pnl), 'VND', true)} (${summary.pnlPct.toFixed(2)}%)`,
            color: summary.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400',
          },
        ].map(card => (
          <div key={card.label} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 px-4 py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className={`text-lg font-bold ${card.color.replace('text-slate-200', 'text-slate-900 dark:text-slate-200')}`}>{card.value}</p>
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
        {state.portfolioAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="text-5xl mb-3">📈</div>
            <p className="font-medium text-slate-500 dark:text-slate-400">Chưa có tài sản nào</p>
            <p className="text-sm mt-1 text-slate-500">Thêm cổ phiếu, crypto, hay bất động sản</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
              <tbody className="divide-y divide-slate-700/30">
                {state.portfolioAssets.map(a => {
                  const cost = a.costBasis * a.units;
                  const value = a.currentPrice * a.units;
                  const pnl = value - cost;
                  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                  return (
                    <tr key={a.id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{a.name}</p>
                          {a.ticker && <p className="text-xs text-slate-400">{a.ticker}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300">{a.units.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300">{formatCurrency(a.costBasis, a.currency)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-200 font-medium">{formatCurrency(a.currentPrice, a.currency)}</td>
                      <td className="px-4 py-3 text-right text-sm text-indigo-400 font-semibold">{formatCurrency(value, a.currency, true)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className={`flex items-center justify-end gap-1 ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span className="text-xs font-semibold">{pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span>
                        </div>
                        <p className={`text-[10px] text-right ${pnl >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(Math.abs(pnl), a.currency, true)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditing(a); setShowModal(true); }} className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => deletePortfolioAsset(a.id)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddAssetModal open={showModal} onClose={() => setShowModal(false)} editing={editing} />
    </div>
  );
}
