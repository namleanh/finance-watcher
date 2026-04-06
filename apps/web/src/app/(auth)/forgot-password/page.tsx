'use client';

import { useState } from 'react';
import { useForgotPassword } from '@/hooks/api/useAuth';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    forgotPassword(identifier, {
      onSuccess: (data: any) => {
        setSuccessMessage(data.message || 'Nếu tài khoản tồn tại, một email hướng dẫn đã được gửi đi.');
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 gap-2">
            FinanceWatcher
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Quên mật khẩu</p>
        </div>

        {successMessage ? (
          <div className="text-center">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl mb-6">
              {successMessage}
            </div>
            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Email hoặc Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Nhập email hoặc username của bạn"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                Đã có lỗi xảy ra. Vui lòng thử lại.
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !identifier}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
