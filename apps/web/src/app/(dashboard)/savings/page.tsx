'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Banknote, TrendingUp, Clock, X, Landmark } from 'lucide-react';
import { useSavingsDeposits, useCreateSavingsDeposit, useDeleteSavingsDeposit, SavingsDeposit } from '@/hooks/api/useSavingsDeposits';
import { useWallets } from '@/hooks/api/useWallets';
import { formatCurrency } from '@/lib/exchangeRate';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { format, parseISO, isPast } from 'date-fns';
import { vi } from 'date-fns/locale';
import Header from '@/components/layout/Header';
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { Currency } from '@/lib/types';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

const TERM_OPTIONS = [
  { value: 1, label: '1 tháng' },
  { value: 3, label: '3 tháng' },
  { value: 6, label: '6 tháng' },
  { value: 9, label: '9 tháng' },
  { value: 12, label: '12 tháng' },
  { value: 18, label: '18 tháng' },
  { value: 24, label: '24 tháng' },
  { value: 36, label: '36 tháng' },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Đang gửi', className: 'text-emerald-500 bg-emerald-500/10' },
  MATURED: { label: 'Đáo hạn', className: 'text-amber-500 bg-amber-500/10' },
  WITHDRAWN: { label: 'Đã rút', className: 'text-slate-500 bg-slate-500/10' },
};

interface AddModalProps {
  open: boolean;
  onClose: () => void;
}

function AddDepositModal({ open, onClose }: AddModalProps) {
  const { mutateAsync: create, isPending } = useCreateSavingsDeposit();
  const { data: wallets = [] } = useWallets();
  useBodyScrollLock(open);
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [termMonths, setTermMonths] = useState(6);
  const [interestRate, setInterestRate] = useState('');
  const [depositDate, setDepositDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [walletId, setWalletId] = useState('');

  // Derived currency from selected wallet
  const selectedWallet = wallets.find(w => w.id === walletId);
  const currency = (selectedWallet?.currency as Currency) || 'VND';
  const isInsufficient = selectedWallet && (parseFloat(amount) || 0) > selectedWallet.balance;

  if (!open) return null;

  const previewInterest = amount && interestRate
    ? Math.round(parseFloat(amount) * (parseFloat(interestRate) / 100) * (termMonths / 12))
    : 0;

  const maturityPreview = (() => {
    const d = new Date(depositDate);
    d.setMonth(d.getMonth() + termMonths);
    return format(d, 'dd/MM/yyyy', { locale: vi });
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create({
        bankName,
        depositAmount: parseFloat(amount),
        termMonths,
        interestRate: parseFloat(interestRate),
        depositDate: new Date(depositDate).toISOString(),
        currency,
        notes,
        walletId,
      });
      setBankName(''); setAmount(''); setInterestRate(''); setNotes(''); setWalletId('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm touch-none" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 overscroll-contain">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Landmark size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Thêm sổ tiết kiệm</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar max-h-[80vh] touch-pan-y">
          {/* Bank name */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Ngân hàng</label>
            <input
              type="text" value={bankName} onChange={e => setBankName(e.target.value)}
              placeholder="VD: Vietcombank, MBBank..."
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Số tiền gửi ({currency})</label>
            <div className="relative">
              <CurrencyInput
                value={amount} onChange={(e: any) => setAmount(e.target.value)}
                placeholder="0" required
                currency={currency}
                className={`w-full bg-white dark:bg-slate-800 border ${isInsufficient ? 'border-rose-300 dark:border-rose-500/30' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all`}
              />
              {isInsufficient && (
                <div className="absolute top-0 right-2 -translate-y-1/2 z-10 animate-bounce pointer-events-none">
                  <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg rotate-3 flex items-center gap-1">
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
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Nguồn tiền (Ví)</label>
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              >
                <option value="">-- Chọn ví --</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.balance, w.currency as Currency, true)})
                  </option>
                ))}
              </select>
            </div>
          </div>


          {/* Term */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Kỳ hạn</label>
            <select
              value={termMonths}
              onChange={e => setTermMonths(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            >
              {TERM_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Interest rate + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Lãi suất (%/năm)</label>
              <input
                type="text" inputMode="decimal"
                value={interestRate} onChange={e => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9.]*$/.test(val)) setInterestRate(val);
                }}
                placeholder="5.5" required
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Ngày gửi</label>
              <input
                type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} required
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Preview */}
          {amount && interestRate && (
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Dự tính</p>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Ngày đáo hạn:</span>
                <span className="font-medium text-slate-900 dark:text-white">{maturityPreview}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tiền lãi dự kiến:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(previewInterest, currency, true)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tổng nhận được:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(parseFloat(amount) + previewInterest, currency, true)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Ghi chú (tuỳ chọn)</label>
            <input
              type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Số sổ tiết kiệm, chi nhánh..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            />
          </div>

          <button
            type="submit" disabled={isPending || isInsufficient}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 mt-2"
          >
            {isPending ? 'Đang lưu...' : 'Thêm sổ tiết kiệm'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SavingsDepositsPage() {
  const { data: deposits = [], isLoading } = useSavingsDeposits();
  const { mutate: deleteDeposit, isPending: isDeleting } = useDeleteSavingsDeposit();
  const { toVND } = useCurrencyConverter();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalDeposited = deposits
    .filter(d => d.status === 'ACTIVE')
    .reduce((s, d) => s + toVND(d.depositAmount, d.currency as Currency), 0);
    
  const totalInterest = deposits
    .filter(d => d.status === 'ACTIVE')
    .reduce((s, d) => s + toVND(d.interestEarned, d.currency as Currency), 0);

  return (
    <div className="flex flex-col h-full">
      <Header title="Tiết kiệm" subtitle="Quản lý các sổ tiết kiệm có kỳ hạn" />

      <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Tổng đang gửi', value: totalDeposited, icon: Banknote, color: 'from-indigo-500 to-violet-600', iconBg: 'bg-white/20' },
            { label: 'Tiền lãi dự kiến', value: totalInterest, icon: TrendingUp, color: 'from-emerald-500 to-teal-600', iconBg: 'bg-white/20' },
            { label: 'Số sổ hoạt động', value: deposits.filter(d => d.status === 'ACTIVE').length, icon: Clock, color: 'from-amber-500 to-orange-600', iconBg: 'bg-white/20', isCount: true },
          ].map(({ label, value, icon: Icon, color, iconBg, isCount }) => (
            <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm opacity-90">{label}</p>
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {isCount ? `${value} sổ` : formatCurrency(value as number, 'VND', true)}
              </p>
            </div>
          ))}
        </div>

        {/* Table header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Danh sách sổ tiết kiệm</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Thêm sổ
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : deposits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Landmark size={40} className="mb-3 opacity-30" />
              <p className="font-medium">Chưa có sổ tiết kiệm nào</p>
              <p className="text-sm mt-1">Hãy thêm sổ tiết kiệm đầu tiên</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                + Thêm sổ
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/50">
                      <th className="px-5 py-3 text-left">Ngân hàng</th>
                      <th className="px-5 py-3 text-right">Số tiền gửi</th>
                      <th className="px-5 py-3 text-center">Ngày gửi</th>
                      <th className="px-5 py-3 text-center">Kỳ hạn</th>
                      <th className="px-5 py-3 text-center">Ngày đáo hạn</th>
                      <th className="px-5 py-3 text-center">Lãi suất</th>
                      <th className="px-5 py-3 text-right">Tiền lãi</th>
                      <th className="px-5 py-3 text-center">Trạng thái</th>
                      <th className="px-5 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30">
                    {deposits.map(d => {
                      const isMatured = isPast(parseISO(d.maturityDate)) && d.status === 'ACTIVE';
                      const statusKey = isMatured ? 'MATURED' : d.status;
                      const { label, className } = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ACTIVE;
                      return (
                        <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Landmark size={14} className="text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.bankName}</p>
                                {d.notes && <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{d.notes}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(d.depositAmount, d.currency as Currency, true)}</span>
                          </td>
                          <td className="px-4 py-4 text-center text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {format(parseISO(d.depositDate), 'dd/MM/yyyy', { locale: vi })}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg whitespace-nowrap">
                              {d.termMonths} tháng
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <span className={isMatured ? 'text-amber-500 font-medium' : ''}>
                              {format(parseISO(d.maturityDate), 'dd/MM/yyyy', { locale: vi })}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{d.interestRate}%</span>
                          </td>
                          <td className="px-3 py-4 text-right whitespace-nowrap">
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              +{formatCurrency(d.interestEarned, d.currency as Currency, true)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${className}`}>{label}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                disabled
                                title="Rút tiết kiệm (sẽ hỗ trợ sau)"
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
                              >
                                Rút tiết kiệm
                              </button>
                              <button
                                onClick={() => setDeleteId(d.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700/30">
                {deposits.map(d => {
                  const isMatured = isPast(parseISO(d.maturityDate)) && d.status === 'ACTIVE';
                  const statusKey = isMatured ? 'MATURED' : d.status;
                  const { label, className } = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ACTIVE;
                  return (
                    <div key={d.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <Landmark size={18} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{d.bankName}</p>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${className}`}>{label}</span>
                          </div>
                        </div>
                        <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                          <p className="text-slate-400 mb-1">Số tiền gửi</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{formatCurrency(d.depositAmount, d.currency as Currency, true)}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3">
                          <p className="text-slate-400 mb-1">Tiền lãi</p>
                          <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">+{formatCurrency(d.interestEarned, d.currency as Currency, true)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                          <p className="text-slate-400 mb-1">Kỳ hạn / Lãi suất</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{d.termMonths} tháng · {d.interestRate}%/năm</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                          <p className="text-slate-400 mb-1">Đáo hạn</p>
                          <p className={`font-semibold ${isMatured ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                            {format(parseISO(d.maturityDate), 'dd/MM/yyyy', { locale: vi })}
                          </p>
                        </div>
                      </div>
                      <button
                        disabled
                        className="w-full py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                      >
                        Rút tiết kiệm (sẽ hỗ trợ sau)
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <AddDepositModal open={showModal} onClose={() => setShowModal(false)} />
      <DeleteConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteDeposit(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={isDeleting}
      />
    </div>
  );
}
