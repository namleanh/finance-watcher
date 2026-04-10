'use client';

import { useState, useEffect } from 'react';
import { useLogin, useResendVerification } from '@/hooks/api/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendMessage, setResendMessage] = useState({ type: '', text: '' });
  
  const { mutate: login, isPending, error } = useLogin();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResendMessage({ type: '', text: '' });
    login(
      { identifier, password },
      {
        onSuccess: () => {
          router.push('/');
        },
      }
    );
  };

  const handleResend = () => {
    if (resendCountdown > 0) return;
    setResendMessage({ type: '', text: '' });
    
    // We assume identifier is the email since it failed on this account check
    resendVerification(identifier, {
      onSuccess: () => {
        setResendCountdown(60);
        setResendMessage({ type: 'success', text: 'Email xác thực mới đã được gửi. Vui lòng kiểm tra lại hòm thư.' });
      },
      onError: () => {
        setResendMessage({ type: 'error', text: 'Không thể gửi lại email vào lúc này. Vui lòng thử lại sau.' });
      }
    });
  };

  const errorMessage = (error as any)?.response?.data?.message;
  const isNetworkError = error && !(error as any).response;
  const isUnverifiedError = errorMessage === 'Vui lòng xác thực email trước khi đăng nhập';

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 gap-2">
             FinanceWatcher
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Đăng nhập tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Email hoặc Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="name@example.com hoặc username"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu</label>
              <Link href="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm text-center ${isUnverifiedError ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : (isNetworkError ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400')}`}>
              {isUnverifiedError 
                ? 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn.' 
                : isNetworkError 
                  ? 'Lỗi hệ thống hoặc kết nối server. Vui lòng thử lại sau.'
                  : (errorMessage || 'Thông tin đăng nhập không chính xác. Vui lòng thử lại.')}
              
              {isUnverifiedError && (
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                  <p className="mb-2 text-xs opacity-80">Chưa nhận được email?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCountdown > 0 || isResending}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Đang gửi lại...' : resendCountdown > 0 ? `Gửi lại sau ${resendCountdown}s` : 'Gửi lại email xác thực'}
                  </button>
                </div>
              )}
            </div>
          )}

          {resendMessage.text && (
            <div className={`p-3 rounded-lg text-sm text-center ${resendMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
              {resendMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
