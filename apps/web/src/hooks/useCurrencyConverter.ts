import { useMemo } from 'react';
import { useMarketData } from './api/useMarketData';
import { EXCHANGE_RATES as STATIC_RATES } from '@/lib/constants';
import { Currency } from '@/lib/types';
import { useBaseCurrency } from '@/context/BaseCurrencyContext';

export const useCurrencyConverter = () => {
  const { data: marketData, isLoading } = useMarketData();
  const { baseCurrency } = useBaseCurrency();

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

  /** Convert any currency to VND using the rates map (VND per 1 unit). */
  const toVND = (amount: number, from: Currency): number => {
    if (from === 'VND') return amount;
    const rate = rates[from] || STATIC_RATES[from] || 0;
    return amount * rate;
  };

  /** Convert VND amount to a target currency. */
  const fromVND = (amount: number, to: Currency): number => {
    if (to === 'VND') return amount;
    const rate = rates[to] || STATIC_RATES[to] || 0;
    return rate > 0 ? amount / rate : 0;
  };

  /**
   * Generic cross-currency conversion via VND pivot.
   * convert(100, 'USD', 'MYR') = 100 USD → VND → MYR
   */
  const convert = (amount: number, from: Currency, to: Currency): number => {
    if (from === to) return amount;
    const amountInVND = toVND(amount, from);
    return fromVND(amountInVND, to);
  };

  /**
   * Convert an amount in any currency to the user's chosen base currency.
   * This is the primary helper to use in display components instead of toVND().
   */
  const toBase = (amount: number, from: Currency): number => {
    return convert(amount, from, baseCurrency);
  };

  const getRate = (currency: Currency): number => {
    return rates[currency] || STATIC_RATES[currency] || 1;
  };

  return {
    toVND,
    fromVND,
    convert,
    toBase,
    getRate,
    isLoading,
    rates,
    baseCurrency,
  };
};
