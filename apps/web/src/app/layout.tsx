import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '@/context/FinanceContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinanceWatcher – Quản lý tài chính cá nhân',
  description: 'Theo dõi tiết kiệm, đầu tư và chi tiêu trong một năm với giao diện hiện đại.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <FinanceProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          </FinanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
