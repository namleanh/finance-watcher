import { useMemo } from 'react';
import { useMarketData } from './api/useMarketData';
import { EXCHANGE_RATES as STATIC_RATES } from '@/lib/constants';
import { Currency } from '@/lib/types';

export const useCurrencyConverter = () => {
  const { data: marketData, isLoading } = useMarketData();

  const rates = useMemo(() => {
    const r: Record<string, number> = { ...STATIC_RATES };
    if (marketData) {
      marketData.forEach(m => {
        if (m.type === 'CURRENCY' || m.type === 'GOLD') {
          r[m.symbol] = m.price;
        }
      });
    }
    return r;
  }, [marketData]);

  const toVND = (amount: number, from: Currency): number => {
    if (from === 'VND') return amount;
    const rate = rates[from] || STATIC_RATES[from] || 1;
    return amount * rate;
  };

  const fromVND = (amount: number, to: Currency): number => {
    if (to === 'VND') return amount;
    const rate = rates[to] || STATIC_RATES[to] || 1;
    return rate > 0 ? amount / rate : 0;
  };

  const getRate = (currency: Currency): number => {
    return rates[currency] || STATIC_RATES[currency] || 1;
  };

  return {
    toVND,
    fromVND,
    getRate,
    isLoading,
    rates
  };
};
