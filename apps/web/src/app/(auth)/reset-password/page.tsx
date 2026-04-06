'use client';

import { useState, useEffect, Suspense } from 'react';
import { useResetPassword } from '@/hooks/api/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { mutate: resetPassword, isPending, error } = useResetPassword();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!token) {
      setPasswordError('Mã xác thực không hợp lệ.');
      return;
    }

    resetPassword(
      { token, newPassword: password },
      {
        onSuccess: (data: any) => {
          setSuccessMessage(data.message || 'Mật khẩu đã được đặt lại thành công.');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 gap-2">
            FinanceWatcher
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Đặt lại mật khẩu</p>
        </div>

        {!token && !successMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl mb-6 text-center text-sm">
            Mã xác nhận không tồn tại. Vui lòng kiểm tra lại liên kết trong email của bạn.
            <div className="mt-4">
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Về trang đăng nhập
              </Link>
            </div>
          </div>
        )}

        {successMessage ? (
          <div className="text-center">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl mb-6">
              {successMessage}
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Tiếp tục đăng nhập
            </button>
          </div>
        ) : token ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            {(passwordError || error) && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                {passwordError || (error as any)?.response?.data?.message || 'Đã có lỗi xảy ra. Hãy chắc chắn link chưa hết hạn.'}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !password || !confirmPassword}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
