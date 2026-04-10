'use client';

import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useCashflowTrend } from '@/hooks/api/useAnalytics';
import { formatCurrency } from '@/lib/exchangeRate';
import { usePrivacy } from '@/context/PrivacyContext';

const RANGES = [
  { label: '24H', value: '1D' },
  { label: '7D', value: '1W' },
  { label: '30D', value: '1M' },
  { label: '1Y', value: '1Y' },
];

export default function CashflowTrendChart() {
  const [range, setRange] = useState('1M');
  const { data = [], isLoading } = useCashflowTrend(range);
  const { maskValue } = usePrivacy();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs shadow-xl backdrop-blur-md bg-opacity-90">
          <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <ArrowDownLeft size={12} /> Thu nhập
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {maskValue(formatCurrency(payload[0].value, 'VND', true), 'INCOME')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-rose-500">
                <ArrowUpRight size={12} /> Chi tiêu
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {maskValue(formatCurrency(payload[1].value, 'VND', true), 'EXPENSE')}
              </span>
            </div>
            <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Số dư</span>
              <span className={`font-bold ${payload[0].value - payload[1].value >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
                {maskValue(formatCurrency(payload[0].value - payload[1].value, 'VND', true), 'NET_WORTH')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            Xu hướng dòng tiền
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Live</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Thống kê thu nhập và chi tiêu theo thời gian</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-center">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
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
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-56">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-[11px] text-slate-500 mt-4 animate-pulse">Đang tải dữ liệu doanh thu...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-bold text-slate-900 dark:text-slate-100 italic text-sm">Chưa có dữ liệu giao dịch</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">Hãy bắt đầu ghi nhật ký chi tiêu của bạn</p>
        </div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => formatCurrency(v, 'VND', true)}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#incomeFill)"
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                strokeWidth={3}
                fill="url(#expenseFill)"
                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mini Legend */}
      {!isLoading && data.length > 0 && (
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Thu nhập</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/20" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Chi tiêu</span>
          </div>
        </div>
      )}
    </div>
  );
}
