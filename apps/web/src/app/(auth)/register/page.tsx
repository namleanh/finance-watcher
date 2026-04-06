'use client';

import { useState, useEffect } from 'react';
import { useRegister, useResendVerification } from '@/hooks/api/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { mutate: registerAccount, isPending, error } = useRegister();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerAccount(
      { email, username, password, displayName },
      {
        onSuccess: (data: any) => {
          setSuccessMessage(data.message || 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.');
        },
      }
    );
  };

  const handleResend = () => {
    if (countdown > 0) return;
    resendVerification(email, {
      onSuccess: () => {
        setCountdown(60);
        setSuccessMessage('Email xác thực mới đã được gửi. Vui lòng kiểm tra lại hòm thư.');
      },
      onError: () => {
        setSuccessMessage('Không thể gửi lại email vào lúc này. Vui lòng thử lại sau.');
      }
    });
  };

  const getErrorMessage = (error: any) => {
    const message = error?.response?.data?.message;
    if (message === 'Email đã được sử dụng') return 'Email này đã được sử dụng.';
    if (message === 'Username đã được sử dụng') return 'Username này đã được sử dụng.';
    return 'Đăng ký thất bại. Vui lòng thử lại sau.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 gap-2">
            FinanceWatcher
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Tạo tài khoản mới</p>
        </div>

        {successMessage ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Kiểm tra Email của bạn</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm pb-4">{successMessage}</p>
            
            <button
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {isResending ? 'Đang gửi...' : countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại email xác thực'}
            </button>

            <Link href="/login" className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
              Đến trang Đăng nhập
            </Link>
          </div>
        ) : (          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                required
                minLength={3}
                maxLength={20}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="username"
              />
              <p className="text-[10px] text-slate-400 mt-1">3-20 ký tự, chỉ dùng chữ cái, số và dấu gạch dưới.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tên hiển thị (tùy chọn)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mật khẩu</label>
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

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                {getErrorMessage(error)}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
