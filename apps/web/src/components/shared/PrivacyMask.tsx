'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy, PrivacyCategory } from '@/context/PrivacyContext';

interface PrivacyMaskProps {
  value: string;
  category: PrivacyCategory;
  id?: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * A component that displays a value or a mask based on privacy settings.
 * Individual row visibility is supported if an 'id' is provided.
 */
export default function PrivacyMask({ value, category, id, className = '', showIcon = false }: PrivacyMaskProps) {
  const { isCategoryHidden, isIdVisible } = usePrivacy();
  
  // Hidden only if global category is hidden AND this specific ID is not forced visible
  const isHidden = isCategoryHidden(category) && (!id || !isIdVisible(id));

  return (
    <span 
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
    >
      <span className={isHidden ? 'font-mono tracking-tighter' : ''}>
        {isHidden ? '••••••' : value}
      </span>
      {showIcon && (
        <span className="text-slate-400 dark:text-slate-500 shrink-0">
          {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </span>
      )}
    </span>
  );
}
