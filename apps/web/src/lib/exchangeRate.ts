import { Currency } from './types';
import { EXCHANGE_RATES } from './constants';

/**
 * Convert amount from one currency to another using stored exchange rates.
 * To integrate ExchangeRate-API, replace EXCHANGE_RATES with live data
 * fetched from https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  // Rates are now VND per 1 unit of currency
  // Convert fromSource to VND first, then from VND to Target
  const amountInVND = amount * EXCHANGE_RATES[from];
  return amountInVND / EXCHANGE_RATES[to];
}

/**
 * Convert to base currency (VND)
 */
export function toVND(amount: number, from: Currency): number {
  return convertCurrency(amount, from, 'VND');
}

/**
 * Format a number as currency string
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'VND',
  compact = false,
  round = true
): string {
  const symbols: Record<Currency, string> = { 
    VND: 'đ', USD: '$', MYR: 'RM', EUR: '€', JPY: '¥', GBP: '£', AUD: 'A$', SGD: 'S$', KRW: '₩' 
  };
  const sym = symbols[currency] ?? currency;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (currency === 'VND') {
      if (abs >= 1_000_000_000) return `${sign}${Number((abs / 1_000_000_000).toFixed(1))}B\u00A0đ`;
      if (abs >= 1_000_000)     return `${sign}${Number((abs / 1_000_000).toFixed(1))}tr\u00A0đ`;
      if (abs >= 1_000)         return `${sign}${Number((abs / 1_000).toFixed(1))}k\u00A0đ`;
      return `${sign}${round ? Math.round(abs) : abs.toLocaleString('en-US', { maximumFractionDigits: 2 })}\u00A0đ`;
    }
    // Generic compact for other currencies (USD, MYR, etc.)
    if (abs >= 1_000_000_000) return `${sign}${sym}${Number((abs / 1_000_000_000).toFixed(2))}B`;
    if (abs >= 1_000_000)     return `${sign}${sym}${Number((abs / 1_000_000).toFixed(2))}M`;
    if (abs >= 1_000)         return `${sign}${sym}${Number((abs / 1_000).toFixed(1))}K`;
    return `${sign}${sym}${round ? abs.toFixed(2) : abs.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
  }

  if (currency === 'VND') {
    const formatted = round 
      ? Math.round(amount).toLocaleString('en-US') 
      : amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return `${formatted}\u00A0${sym}`;
  }

  const formatted = amount.toLocaleString('en-US', {
    maximumFractionDigits: round ? 2 : 8,
  });
  return `${sym}${formatted}`;
}

/**
 * Hook structure to integrate live exchange rate API
 * Usage: await fetchLiveRates() to override EXCHANGE_RATES
 */
export async function fetchLiveRates(apiKey: string): Promise<Record<Currency, number>> {
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    const data = await res.json();
    const usdToVnd = data.conversion_rates.VND ?? EXCHANGE_RATES.VND;
    
    const convert = (target: Currency) => {
      const usdToTarget = data.conversion_rates[target];
      if (!usdToTarget) return EXCHANGE_RATES[target];
      // Convert USD-based rate to VND-based rate: (VND/USD) / (Unit/USD) = VND/Unit
      return usdToVnd / usdToTarget;
    };

    return {
      VND: 1,
      USD: usdToVnd,
      MYR: convert('MYR'),
      EUR: convert('EUR'),
      JPY: convert('JPY'),
      GBP: convert('GBP'),
      AUD: convert('AUD'),
      SGD: convert('SGD'),
      KRW: convert('KRW'),
    };
  } catch {
    return EXCHANGE_RATES;
  }
}
