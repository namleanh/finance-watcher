import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import React, { useState } from 'react';
import { TrendingUp, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { useCashflowTrend } from '@/hooks/api/useAnalytics';
import { formatCurrency } from '@/lib/exchangeRate';

const RANGES = [
  { label: 'Hôm nay', value: 'TODAY' },
  { label: '24H', value: '1D' },
  { label: '7D', value: '1W' },
  { label: '30D', value: '1M' },
  { label: '1Y', value: '1Y' },
];

export default function CashflowTrendChart() {
  const [range, setRange] = useState('TODAY');
  const { data = [], isLoading } = useCashflowTrend(range);

  // Helper to abbreviate large numbers for mobile axis
  const abbreviateNumber = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const balance = payload.find((p: any) => p.dataKey === 'balance')?.value || 0;

      return (
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 text-xs shadow-2xl backdrop-blur-md min-w-[180px] sm:min-w-[200px]">
          <p className="text-slate-500 dark:text-slate-400 mb-3 font-bold uppercase tracking-wider text-[9px] sm:text-[10px] border-b border-slate-100 dark:border-slate-800 pb-2">{label}</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-emerald-500 font-medium whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Thu nhập
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(income, 'VND', true)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-rose-500 font-medium whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Chi tiêu
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(expense, 'VND', true)}
              </span>
            </div>
            <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-indigo-500 font-bold whitespace-nowrap">
                <Wallet size={12} /> Tài sản
              </span>
              <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                {formatCurrency(balance, 'VND', true)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
          Xu hướng dòng tiền & Tài sản
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-[9px] text-indigo-500 font-bold uppercase tracking-wider">Live</span>
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">So sánh thu chi và biến động tài sản</p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-72 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-[11px] text-slate-500 mt-4 animate-pulse">Đang định dạng phân tích...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-72 sm:h-64 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-bold text-slate-900 dark:text-slate-100 italic text-sm">Chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="h-72 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.05} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false}
                minTickGap={range === '1D' || range === 'TODAY' ? 10 : 25}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#94a3b8', fontSize: 8 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={abbreviateNumber}
                width={35}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6366f1', fontSize: 8, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={abbreviateNumber}
                width={35}
              />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} 
                allowEscapeViewBox={{ x: true, y: true }}
              />
              
              <Bar 
                yAxisId="left"
                dataKey="income" 
                fill="#10b981" 
                radius={[3, 3, 0, 0]} 
                barSize={range === '1Y' ? 12 : 8}
                animationDuration={1000}
              />
              <Bar 
                yAxisId="left"
                dataKey="expense" 
                fill="#f43f5e" 
                radius={[3, 3, 0, 0]} 
                barSize={range === '1Y' ? 12 : 8}
                animationDuration={1000}
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="balance"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* FOOTER: Filters & Minimized Legend on one line */}
      {!isLoading && data.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Minimized Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500">Thu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500">Chi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded-full bg-indigo-500" />
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">Tài sản</span>
            </div>
          </div>

          {/* Compact Filters */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0 overflow-x-auto no-scrollbar">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all whitespace-nowrap ${
                  range === r.value
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
