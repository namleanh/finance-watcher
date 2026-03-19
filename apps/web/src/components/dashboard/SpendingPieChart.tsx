'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSpendingByCategory } from '@/hooks/api/useAnalytics';
import { formatCurrency } from '@/lib/exchangeRate';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.07) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SpendingPieChart() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year] = useState(now.getFullYear());

  const { data = [], isLoading } = useSpendingByCategory(year, month + 1);
  const total = data.reduce((s: any, d: any) => s + d.value, 0);

  const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Chi tiêu theo danh mục</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tổng: {formatCurrency(total, 'VND', true)}</p>
        </div>
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">Chưa có dữ liệu chi tiêu</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius="80%"
              innerRadius="40%"
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={index} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--color-bg-popover, #1e293b)', border: '1px solid var(--color-border, #334155)', borderRadius: '12px', fontSize: 12 }}
              itemStyle={{ color: 'var(--color-text, #e2e8f0)' }}
              formatter={(value: any) => [formatCurrency(value as number, 'VND', true), '']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
