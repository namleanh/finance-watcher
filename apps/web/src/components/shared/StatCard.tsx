'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { usePrivacy, PrivacyCategory } from '@/context/PrivacyContext';
import PrivacyMask from './PrivacyMask';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  gradient: string;
  sub?: string;
  privacyCategory?: PrivacyCategory;
  subPrivacyCategory?: PrivacyCategory;
  href?: string;
}

export function StatCard({ title, value, change, icon, gradient, sub, privacyCategory, subPrivacyCategory, href }: StatCardProps) {
  const { maskValue } = usePrivacy();

  const renderSub = () => {
    if (!sub) return null;
    if (subPrivacyCategory) {
      // Extract numeric value from sub string for better masking
      const regex = /([\d,.]+)\s*(VND|đ|\$|RM|€|¥|£|A\$|S\$|₩)/i;
      const match = sub.match(regex);
      if (match) {
        const [full, amount, currency] = match;
        const prefix = sub.split(full)[0];
        return (
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
            {prefix}
            <PrivacyMask 
              value={`${amount} ${currency}`} 
              category={subPrivacyCategory} 
              className="font-medium text-slate-700 dark:text-slate-400"
              showIcon={false} // Hide icon for sub-values to keep it clean
            />
          </p>
        );
      }
      return <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">{maskValue(sub, subPrivacyCategory)}</p>;
    }
    return <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">{sub}</p>;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-600/60 transition-all duration-300 group">
      <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${gradient}`} />
      

      <div className="relative">
        <div className="pr-14">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <div className="flex items-center gap-2 mb-1">
            <div className={`font-bold text-slate-900 dark:text-white whitespace-nowrap transition-all duration-200 ${
              value.length > 20 ? 'text-base' : value.length > 15 ? 'text-lg' : value.length >= 12 ? 'text-xl' : 'text-2xl'
            }`}>
              {privacyCategory ? (
                <PrivacyMask 
                  value={value} 
                  category={privacyCategory} 
                  showIcon={true}
                />
              ) : value}
            </div>
          </div>
          {renderSub()}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{Math.abs(change).toFixed(1)}% so với tháng trước</span>
            </div>
          )}
        </div>
        {href ? (
          <Link 
            href={href}
            className={`absolute top-0 right-0 w-11 h-11 rounded-xl ${gradient} flex items-center justify-center text-white shadow-lg hover:rotate-12 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10`}
            title={`Xem chi tiết ${title}`}
          >
            {icon}
          </Link>
        ) : (
          <div className={`absolute top-0 right-0 w-11 h-11 rounded-xl ${gradient} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
