'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type PrivacyCategory = 'NET_WORTH' | 'NET_WORTH_DETAILS' | 'SAVINGS' | 'SAVINGS_DETAILS' | 'INVESTMENTS' | 'INVESTMENT_DETAILS' | 'INCOME' | 'EXPENSE' | 'INCOME_DETAILS' | 'EXPENSE_DETAILS';

interface PrivacyContextValue {
  privacySettings: Record<PrivacyCategory, boolean>;
  forceVisibleIds: Record<string, boolean>;
  toggleCategory: (category: PrivacyCategory) => void;
  toggleIdVisibility: (id: string) => void;
  clearForceVisibleIds: () => void;
  isCategoryHidden: (category: PrivacyCategory) => boolean;
  isIdVisible: (id: string) => boolean;
  maskValue: (value: string, category: PrivacyCategory, id?: string) => string;
}

const DEFAULT_SETTINGS: Record<PrivacyCategory, boolean> = {
  NET_WORTH: true,
  NET_WORTH_DETAILS: true,
  SAVINGS: true,
  SAVINGS_DETAILS: true,
  INVESTMENTS: true,
  INVESTMENT_DETAILS: true,
  INCOME: true,
  EXPENSE: false,
  INCOME_DETAILS: true,
  EXPENSE_DETAILS: true,
};

const PrivacyContext = createContext<PrivacyContextValue>({
  privacySettings: DEFAULT_SETTINGS,
  forceVisibleIds: {},
  toggleCategory: () => {},
  toggleIdVisibility: () => {},
  clearForceVisibleIds: () => {},
  isCategoryHidden: () => true,
  isIdVisible: () => false,
  maskValue: (v) => v,
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [privacySettings, setPrivacySettings] = useState<Record<PrivacyCategory, boolean>>(DEFAULT_SETTINGS);
  const [forceVisibleIds, setForceVisibleIds] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => {
    // Reset to defaults on navigation or reload
    setPrivacySettings(DEFAULT_SETTINGS);
    setForceVisibleIds({});
  }, [pathname]);

  const toggleCategory = (category: PrivacyCategory) => {
    setPrivacySettings(prev => ({ 
      ...prev, 
      [category]: !prev[category] 
    }));
  };

  const toggleIdVisibility = (id: string) => {
    setForceVisibleIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const clearForceVisibleIds = () => {
    setForceVisibleIds({});
  };

  const isCategoryHidden = (category: PrivacyCategory) => {
    return privacySettings[category];
  };

  const isIdVisible = (id: string) => {
    return !!forceVisibleIds[id];
  };

  const maskValue = (value: string, category: PrivacyCategory, id?: string) => {
    // If id is explicitly shown, reveal it
    if (id && forceVisibleIds[id]) return value;
    
    // Otherwise follow category setting
    if (isCategoryHidden(category)) return '••••••';
    return value;
  };

  return (
    <PrivacyContext.Provider value={{ 
      privacySettings, 
      forceVisibleIds,
      toggleCategory, 
      toggleIdVisibility,
      clearForceVisibleIds,
      isCategoryHidden, 
      isIdVisible,
      maskValue 
    }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
