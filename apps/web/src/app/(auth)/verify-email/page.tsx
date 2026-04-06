'use client';

import { useEffect, useState } from 'react';
import { useVerifyEmail } from '@/hooks/api/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { mutate: verifyEmail } = useVerifyEmail();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực email của bạn...');
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Mã xác thực không hợp lệ hoặc không tồn tại.');
      return;
    }

    verifyEmail(token, {
      onSuccess: () => {
        setStatus('success');
        setMessage('Xác thực email thành công! Bạn hiện đã có thể sử dụng đầy đủ các tính năng.');
      },
      onError: (err: any) => {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Xác thực thất bại. Mã xác thực có thể đã hết hạn hoặc không đúng.');
      }
    });
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
        <h1 className="text-3xl flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 gap-2 mb-6">
          FinanceWatcher
        </h1>
        
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Xác thực thành công</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm pb-4">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Xác thực thất bại</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm pb-4">{message}</p>
            <Link href="/login" className="block w-full py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium transition-colors">
              Quay lại trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
