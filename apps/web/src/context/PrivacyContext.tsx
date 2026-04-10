'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type PrivacyCategory = 'NET_WORTH' | 'SAVINGS' | 'INVESTMENTS' | 'INCOME' | 'EXPENSE';

interface PrivacyContextValue {
  privacySettings: Record<PrivacyCategory, boolean>;
  toggleCategory: (category: PrivacyCategory) => void;
  isCategoryHidden: (category: PrivacyCategory) => boolean;
  maskValue: (value: string, category: PrivacyCategory) => string;
}

const DEFAULT_SETTINGS: Record<PrivacyCategory, boolean> = {
  NET_WORTH: true,
  SAVINGS: true,
  INVESTMENTS: true,
  INCOME: true,
  EXPENSE: false, // Defaultly visible
};

const PrivacyContext = createContext<PrivacyContextValue>({
  privacySettings: DEFAULT_SETTINGS,
  toggleCategory: () => {},
  isCategoryHidden: () => true,
  maskValue: (v) => v,
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [privacySettings, setPrivacySettings] = useState<Record<PrivacyCategory, boolean>>(DEFAULT_SETTINGS);
  const pathname = usePathname();

  useEffect(() => {
    // Reset to defaults on navigation or reload
    setPrivacySettings(DEFAULT_SETTINGS);
  }, [pathname]);

  const toggleCategory = (category: PrivacyCategory) => {
    setPrivacySettings(prev => ({ 
      ...prev, 
      [category]: !prev[category] 
    }));
  };

  const isCategoryHidden = (category: PrivacyCategory) => {
    return privacySettings[category];
  };

  const maskValue = (value: string, category: PrivacyCategory) => {
    if (isCategoryHidden(category)) return '••••••';
    return value;
  };

  return (
    <PrivacyContext.Provider value={{ privacySettings, toggleCategory, isCategoryHidden, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
