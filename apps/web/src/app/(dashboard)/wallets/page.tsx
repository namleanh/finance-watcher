'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Wallet, Building2, Smartphone, CreditCard, Coins, Edit2 } from 'lucide-react';
import { useWallets, useCreateWallet, useDeleteWallet, useUpdateWallet, Wallet as WalletType } from '@/hooks/api/useWallets';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { formatCurrency } from '@/lib/exchangeRate';
import { Currency } from '@/lib/types';
import { CURRENCIES } from '@/lib/constants';
import Header from '@/components/layout/Header';
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal';
import CurrencyInput from '@/components/shared/CurrencyInput';

const WALLET_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  CASH: { icon: Coins, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  BANK: { icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  E_WALLET: { icon: Smartphone, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  CREDIT: { icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-500/10' },
};

const WALLET_TYPE_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK: 'Ngân hàng',
  E_WALLET: 'Ví điện tử',
  CREDIT: 'Thẻ tín dụng',
};

const PRESET_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  editWallet?: WalletType | null;
}

function WalletModal({ open, onClose, editWallet }: WalletModalProps) {
  const { mutateAsync: create, isPending: isCreating } = useCreateWallet();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateWallet();
  const { getRate } = useCurrencyConverter();

  const [name, setName] = useState(editWallet?.name || '');
  const [type, setType] = useState<string>(editWallet?.type || 'CASH');
  const [balance, setBalance] = useState(editWallet?.balance?.toString() || '');
  const [currency, setCurrency] = useState<Currency>((editWallet?.currency as Currency) || 'VND');
  const [color, setColor] = useState(editWallet?.color || PRESET_COLORS[0]);

  React.useEffect(() => {
    if (editWallet) {
      setName(editWallet.name);
      setType(editWallet.type);
      setBalance(editWallet.balance?.toString() || '0');
      setCurrency((editWallet.currency as Currency) || 'VND');
      setColor(editWallet.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setType('CASH');
      setBalance('');
      setCurrency('VND');
      setColor(PRESET_COLORS[0]);
    }
  }, [editWallet, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      type: type as any,
      balance: parseFloat(balance) || 0,
      currency,
      color,
    };
    try {
      if (editWallet) {
        await update({ id: editWallet.id, ...payload });
      } else {
        await create(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra!');
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {editWallet ? 'Sửa ví' : 'Thêm ví mới'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Tên ví</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: MBBank, MoMo..."
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Loại tiền</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Loại ví</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(WALLET_TYPE_LABELS).map(([val, label]) => {
                const { icon: Icon, color, bg } = WALLET_ICONS[val];
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setType(val)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      type === val
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className={`p-1 rounded-lg ${bg}`}>
                      <Icon size={14} className={color} />
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Số dư hiện tại
            </label>
            <div className="flex gap-2">
              <CurrencyInput
                value={balance}
                onChange={e => setBalance(e.target.value)}
                currency={currency}
                rate={getRate(currency)}
                placeholder="0"
                min="0"
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="w-16 flex items-center justify-center font-bold text-slate-400 text-sm">{currency}</div>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Số dư sẽ tự động cập nhật khi bạn thêm giao dịch</p>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Màu sắc</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isPending ? 'Đang lưu...' : editWallet ? 'Cập nhật ví' : 'Tạo ví'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WalletsPage() {
  const { data: wallets = [], isLoading } = useWallets();
  const { mutate: deleteWallet, isPending: isDeleting } = useDeleteWallet();
  const { toVND } = useCurrencyConverter();
  const [showModal, setShowModal] = useState(false);
  const [editWallet, setEditWallet] = useState<WalletType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalBalance = wallets.reduce((s, w) => s + toVND(w.balance, w.currency as Currency), 0);

  const handleDelete = () => {
    if (deleteId) {
      deleteWallet(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Ví tiền" subtitle="Quản lý các tài khoản và ví của bạn" />

      <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
        {/* Summary Card */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-500/20">
          <p className="text-sm text-indigo-200 mb-1">Tổng số dư tất cả ví</p>
          <p className="text-3xl font-bold">{formatCurrency(totalBalance, 'VND', true)}</p>
          <p className="text-sm text-indigo-200 mt-2">{wallets.length} ví đang hoạt động</p>
        </div>

        {/* Wallet List */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Danh sách ví</h2>
          <button
            onClick={() => { setEditWallet(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Thêm ví
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <Wallet size={40} className="mb-3 opacity-40" />
            <p className="font-medium">Chưa có ví nào</p>
            <p className="text-sm mt-1">Hãy thêm ví đầu tiên của bạn</p>
            <button
              onClick={() => { setEditWallet(null); setShowModal(true); }}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              + Thêm ví
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map(wallet => {
              const { icon: Icon, color, bg } = WALLET_ICONS[wallet.type] || WALLET_ICONS.CASH;
              const accentColor = wallet.color || '#6366f1';
              return (
                <div
                  key={wallet.id}
                  className="relative rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                >
                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: accentColor }} />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${bg}`}>
                        <Icon size={20} className={color} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{wallet.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{WALLET_TYPE_LABELS[wallet.type]}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditWallet(wallet); setShowModal(true); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        title="Sửa ví"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(wallet.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Xóa ví"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(wallet.balance, 'VND', true)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{wallet.currency}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete note */}
        {wallets.length > 0 && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Lưu ý khi xóa ví:</strong> Các giao dịch đã liên kết với ví sẽ không bị mất, chúng sẽ chuyển sang trạng thái "không có ví".
            </p>
          </div>
        )}
      </div>

      <WalletModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditWallet(null); }}
        editWallet={editWallet}
      />

      <DeleteConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
