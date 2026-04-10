'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import { usePrivacy, PrivacyCategory } from '@/context/PrivacyContext';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  gradient: string;
  sub?: string;
  privacyCategory?: PrivacyCategory;
  subPrivacyCategory?: PrivacyCategory;
}

export function StatCard({ title, value, change, icon, gradient, sub, privacyCategory, subPrivacyCategory }: StatCardProps) {
  const { isCategoryHidden, toggleCategory, maskValue } = usePrivacy();

  const isHidden = privacyCategory ? isCategoryHidden(privacyCategory) : false;
  const displayValue = privacyCategory ? maskValue(value, privacyCategory) : value;
  
  const displaySub = (sub && subPrivacyCategory) 
    ? sub.replace(/[\d,.]+ VND/, maskValue('...', subPrivacyCategory))
    : sub;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-600/60 transition-all duration-300 group">
      <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${gradient}`} />
      

      <div className="relative">
        <div className="pr-14">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-bold text-slate-900 dark:text-white whitespace-nowrap transition-all duration-200 ${
              displayValue.length > 20 ? 'text-base' : displayValue.length > 15 ? 'text-lg' : displayValue.length >= 12 ? 'text-xl' : 'text-2xl'
            }`}>{displayValue}</p>
            
            {privacyCategory && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleCategory(privacyCategory);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100"
                title={isHidden ? 'Hiện số liệu' : 'Ẩn số liệu'}
              >
                {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}
          </div>
          {sub && <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">{displaySub}</p>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{Math.abs(change).toFixed(1)}% so với tháng trước</span>
            </div>
          )}
        </div>
        <div className={`absolute top-0 right-0 w-11 h-11 rounded-xl ${gradient} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
