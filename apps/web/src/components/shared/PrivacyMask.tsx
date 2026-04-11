'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy, PrivacyCategory } from '@/context/PrivacyContext';

interface PrivacyMaskProps {
  value: string;
  category: PrivacyCategory;
  className?: string;
  showIcon?: boolean;
}

/**
 * A component that displays a value or a mask based on privacy settings.
 * Clicking the component toggles the privacy state for the entire category.
 */
export default function PrivacyMask({ value, category, className = '', showIcon = true }: PrivacyMaskProps) {
  const { isCategoryHidden, toggleCategory } = usePrivacy();
  const isHidden = isCategoryHidden(category);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers (e.g., table row clicks)
    toggleCategory(category);
  };

  return (
    <span 
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity select-none ${className}`}
      title={isHidden ? 'Hiện số liệu' : 'Ẩn số liệu'}
    >
      <span className={isHidden ? 'font-mono tracking-tighter' : ''}>
        {isHidden ? '••••••' : value}
      </span>
      {showIcon && (
        <span className="text-slate-400 dark:text-slate-500 hover:text-indigo-500 transition-colors shrink-0">
          {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </span>
      )}
    </span>
  );
}
