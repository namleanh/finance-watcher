'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useNetWorthHistory } from '@/hooks/api/useAnalytics';
import { formatCurrency } from '@/lib/exchangeRate';

export default function NetWorthLineChart() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const { data: response, isLoading } = useNetWorthHistory(year);
  const data = response?.data || [];
  const years = [now.getFullYear() - 1, now.getFullYear()];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-xs shadow-lg">
          <p className="text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(payload[0].value, 'VND', true)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Biến động tài sản ròng</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Theo từng tháng</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-bold text-slate-900 dark:text-slate-100 italic text-sm">Chưa có dữ liệu giao dịch</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">Cập nhật tài sản để xem biến động</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => formatCurrency(v, 'VND', true)}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#netWorthGrad)"
              dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#818cf8' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

