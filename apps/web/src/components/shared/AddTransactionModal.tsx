import React, { useState, useEffect } from 'react';
import { X, Plus, RefreshCw, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import { useCreateRecurring } from '@/hooks/api/useRecurring';
import { useWallets } from '@/hooks/api/useWallets';
import { useGoals } from '@/hooks/api/useGoals';
import { useSavingsDeposits } from '@/hooks/api/useSavingsDeposits';
import { CATEGORIES, CURRENCIES } from '@/lib/constants';
import { toVND, formatCurrency } from '@/lib/exchangeRate';
import { Currency, TransactionType, RecurringInterval } from '@/lib/types';
import { format } from 'date-fns';
import CurrencyInput from './CurrencyInput';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface Props {
  open: boolean;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: 'INCOME', label: '💰 Thu nhập', color: 'from-emerald-500 to-green-600' },
  { value: 'EXPENSE', label: '💸 Chi tiêu', color: 'from-rose-500 to-pink-600' },
  { value: 'SAVING', label: '🏦 Tiết kiệm', color: 'from-blue-500 to-indigo-600' },
  { value: 'INVESTMENT', label: '📈 Đầu tư', color: 'from-violet-500 to-purple-600' },
];

const RECURRING_OPTIONS: { value: RecurringInterval; label: string }[] = [
  { value: null, label: 'Không lặp lại' },
  { value: 'DAILY', label: 'Hàng ngày' },
  { value: 'WEEKLY', label: 'Hàng tuần' },
  { value: 'MONTHLY', label: 'Hàng tháng' },
  { value: 'YEARLY', label: 'Hàng năm' },
];

export default function AddTransactionModal({ open, onClose }: Props) {
  const { mutateAsync: createTransaction, isPending: isTxPending } = useCreateTransaction();
  const { data: wallets = [] } = useWallets();
  const { data: goals = [] } = useGoals();
  const { data: deposits = [] } = useSavingsDeposits();
  const { toVND, getRate } = useCurrencyConverter();
  useBodyScrollLock(open);

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('VND');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [walletId, setWalletId] = useState<string>('');
  const [goalId, setGoalId] = useState<string>('');
  const [savingsDepositId, setSavingsDepositId] = useState<string>('');

  // Investment States
  const [ticker, setTicker] = useState('');
  const [units, setUnits] = useState('');
  const [assetType, setAssetType] = useState('STOCK');
  const [currentPrice, setCurrentPrice] = useState('');

  const selectedWallet = wallets.find(w => w.id === walletId);
  const isInsufficient = (type === 'EXPENSE' || type === 'SAVING' || type === 'INVESTMENT') && 
    selectedWallet && (parseFloat(amount) || 0) > selectedWallet.balance;

  const cats = CATEGORIES.filter(c => c.type === type);
  const selectedCat = cats.find(c => c.label === category);

  useEffect(() => {
    if (type === 'SAVING') {
      setCategory('Tiết kiệm');
      setSubCategory('Gửi tiền');
    } else if (type === 'INVESTMENT') {
      setCategory('Đầu tư');
      setSubCategory('Mua tài sản');
    } else {
      setCategory('');
      setSubCategory('');
    }
    setGoalId('');
    setSavingsDepositId('');
    setTicker('');
    setUnits('');
    setCurrentPrice('');
  }, [type]);

  useEffect(() => {
    if (type !== 'SAVING' && type !== 'INVESTMENT') {
      setSubCategory('');
    }
  }, [category, type]);

  // Filter wallets by selected currency
  const compatibleWallets = wallets.filter(w => w.currency === currency);

  // Auto-select first compatible wallet when currency changes
  useEffect(() => {
    const currentWallet = wallets.find(w => w.id === walletId);
    if (!currentWallet || currentWallet.currency !== currency) {
      if (compatibleWallets.length > 0) {
        setWalletId(compatibleWallets[0].id);
      } else {
        setWalletId('');
      }
    }
  }, [currency, wallets]);

  if (!open) return null;

  if (wallets.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center gap-5">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X size={20} />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
            <CreditCard size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Chưa có ví tiền</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bạn cần tạo ít nhất một ví để bắt đầu.</p>
          </div>
          <Link href="/wallets" onClick={onClose} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold">Tạo ví ngay</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (!num || !category || !walletId) return;

    const amtVND = toVND(num, currency);

    try {
      await createTransaction({
        type,
        amount: amtVND,
        originalAmount: num,
        originalCurrency: currency,
        category,
        subCategory,
        date: new Date(date).toISOString(),
        notes,
        walletId,
        goalId: type === 'SAVING' ? goalId : undefined,
        savingsDepositId: type === 'SAVING' ? savingsDepositId : undefined,
        // Investment sync
        ticker: type === 'INVESTMENT' ? (ticker || undefined) : undefined,
        units: type === 'INVESTMENT' ? (parseFloat(units) || undefined) : undefined,
        assetType: type === 'INVESTMENT' ? (assetType as any) : undefined,
        currentPrice: type === 'INVESTMENT' ? (toVND(parseFloat(currentPrice) || 0, currency)) : undefined,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra!');
    }
  };

  const isPending = isTxPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm touch-none" onClick={onClose} />
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col overscroll-contain">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Thêm giao dịch</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar max-h-[85vh] touch-pan-y">
          {/* Type */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Loại</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value} type="button" onClick={() => setType(opt.value)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all ${type === opt.value ? `bg-gradient-to-r ${opt.color} text-white shadow-md shadow-indigo-500/20` : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400 transition-colors'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex-1 min-w-0 relative">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Số tiền</label>
              <CurrencyInput
                value={amount}
                onChange={e => setAmount(e.target.value)}
                currency={currency}
                rate={getRate(currency)}
                placeholder="0"
                required
                className={`w-full bg-white dark:bg-slate-800 border ${isInsufficient ? 'border-rose-300 dark:border-rose-500/30' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all`}
              />
              {isInsufficient && (
                <div className="absolute top-0 right-0 -translate-y-1/2 z-10 animate-bounce">
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
            <div className="w-full sm:w-24">
              <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Đơn vị</label>
              <select 
                value={currency} 
                onChange={e => {
                  setCurrency(e.target.value as Currency);
                  setAmount('');
                  setCurrentPrice('');
                }} 
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
              {currency !== 'VND' && (
                <div className="mt-1.5 px-1 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-medium">
                    1 {currency} ≈ {getRate(currency).toLocaleString('en-US')} VND
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* Wallet Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400 uppercase">Chọn ví thanh toán</label>
              {walletId && (
                <span className="text-[10px] font-semibold text-slate-400">
                  Số dư: {formatCurrency(wallets.find(w => w.id === walletId)?.balance || 0, currency as any, true)}
                </span>
              )}
            </div>
            {compatibleWallets.length > 0 ? (
              <select 
                value={walletId} 
                onChange={e => setWalletId(e.target.value)} 
                required 
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              >
                {compatibleWallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance, w.currency as any, true)})</option>
                ))}
              </select>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 flex flex-col gap-2">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Bạn chưa có ví **{currency}** nào.
                </p>
                <Link 
                  href="/wallets" 
                  onClick={onClose}
                  className="text-[10px] text-amber-700 dark:text-amber-500 font-bold underline decoration-dotted"
                >
                  + Click để tạo ví {currency} mới
                </Link>
              </div>
            )}
          </div>

          {/* Goal & Deposit selection for Saving */}
          {type === 'SAVING' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="text-xs font-medium text-blue-500 uppercase mb-2 block">Mục tiêu tiết kiệm</label>
                <select value={goalId} onChange={e => setGoalId(e.target.value)} className="w-full bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Không chọn --</option>
                  {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-indigo-500 uppercase mb-2 block">Sổ tiết kiệm</label>
                {deposits.length > 0 ? (
                  <select value={savingsDepositId} onChange={e => setSavingsDepositId(e.target.value)} required className="w-full bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="">-- Chọn sổ --</option>
                    {deposits.map(d => <option key={d.id} value={d.id}>{d.bankName} - {formatCurrency(d.depositAmount, 'VND', true)}</option>)}
                  </select>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800/30">
                      Chưa có sổ tiết kiệm nào.
                    </div>
                    <Link href="/savings" onClick={onClose} className="text-[10px] text-indigo-500 hover:underline font-semibold ml-2">
                      + Tạo sổ mới ngay
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Investment Details */}
          {type === 'INVESTMENT' && (
            <div className="space-y-3 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-800/20 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-violet-500 uppercase mb-1.5 block">Mã tài sản (Ticker/Symbol)</label>
                  <input
                    type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
                    placeholder="VD: AAPL, BTC, SJC..." required
                    className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-violet-500 uppercase mb-1.5 block">Loại tài sản</label>
                  <select value={assetType} onChange={e => setAssetType(e.target.value)} className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-2 py-2 text-sm dark:text-white focus:ring-2 focus:ring-violet-500">
                    <option value="STOCK">Cổ phiếu</option>
                    <option value="CRYPTO">Tiền điện tử</option>
                    <option value="GOLD">Vàng</option>
                    <option value="REAL_ESTATE">Bất động sản</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-violet-500 uppercase mb-1.5 block">Số lượng (Units)</label>
                    <input
                      type="text" inputMode="decimal"
                      value={units} onChange={e => {
                        let val = e.target.value;
                        if (val.endsWith(',') && !val.includes('.')) {
                          val = val.slice(0, -1) + '.';
                        } else {
                          val = val.replace(',', '.');
                        }
                        if (/^[0-9.]*$/.test(val)) setUnits(val);
                      }}
                      placeholder="10.5" required
                      className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-violet-500"
                    />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-violet-500 uppercase mb-1.5 block">Giá hiện tại (Mặc định bằng giá mua)</label>
                <div className="relative">
              <CurrencyInput
                value={currentPrice} onChange={e => setCurrentPrice(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-violet-500 shadow-sm transition-all"
              />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{currency}</span>
                </div>
              </div>
            </div>
          )}

          {/* Category (Hidden for Saving/Investment because it's redundant) */}
          {(type === 'INCOME' || type === 'EXPENSE') && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Danh mục</label>
                <select value={category} onChange={e => setCategory(e.target.value)} required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all">
                  <option value="">Chọn</option>
                  {cats.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Phân mục</label>
                <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all disabled:opacity-40" disabled={!category}>
                  <option value="">Chọn</option>
                  {selectedCat?.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="w-full">
            <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">Ngày</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending || compatibleWallets.length === 0 || isInsufficient} 
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm shadow-xl disabled:opacity-50 disabled:grayscale mt-4"
          >
            {isPending ? 'Đang lưu...' : (compatibleWallets.length === 0 ? `Cần ví ${currency} để tiếp tục` : 'Thêm giao dịch')}
          </button>
        </form>
      </div>
    </div>
  );
}
