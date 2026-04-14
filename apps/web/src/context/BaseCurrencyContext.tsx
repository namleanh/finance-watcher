'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useUpdateProfile } from '@/hooks/api/useAuth';
import { Currency } from '@/lib/types';

interface BaseCurrencyContextValue {
  baseCurrency: Currency;
  setBaseCurrency: (currency: Currency) => void;
  isLoading: boolean;
}

const BaseCurrencyContext = createContext<BaseCurrencyContextValue>({
  baseCurrency: 'VND',
  setBaseCurrency: () => {},
  isLoading: false,
});

export function BaseCurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();
  const [baseCurrency, setBaseCurrencyState] = useState<Currency>('VND');

  // Sync from user profile when loaded
  useEffect(() => {
    if (user?.baseCurrency) {
      setBaseCurrencyState(user.baseCurrency as Currency);
    }
  }, [user?.baseCurrency]);

  const setBaseCurrency = useCallback((currency: Currency) => {
    setBaseCurrencyState(currency);
    updateProfile({ baseCurrency: currency });
  }, [updateProfile]);

  return (
    <BaseCurrencyContext.Provider value={{ baseCurrency, setBaseCurrency, isLoading: isUserLoading }}>
      {children}
    </BaseCurrencyContext.Provider>
  );
}

export function useBaseCurrency() {
  return useContext(BaseCurrencyContext);
}
