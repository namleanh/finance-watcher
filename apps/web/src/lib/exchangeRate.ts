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
  // Convert to USD first, then to target currency
  const inUSD = amount / EXCHANGE_RATES[from];
  return inUSD * EXCHANGE_RATES[to];
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
  compact = false
): string {
  if (amount == null || isNaN(amount)) {
    amount = 0;
  }

  // Compact logic disabled per user request to show exact digits
  /*
  if (compact && Math.abs(amount) >= 1_000_000) {
    const val = amount / 1_000_000;
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${formatted}M`;
  }
  */

  const symbols: Record<Currency, string> = { VND: '₫', USD: '$', MYR: 'RM' };
  const sym = symbols[currency];

  if (currency === 'VND') {
    return `${sym}${Math.round(amount).toLocaleString('vi-VN')}`;
  }
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Hook structure to integrate live exchange rate API
 * Usage: await fetchLiveRates() to override EXCHANGE_RATES
 */
export async function fetchLiveRates(apiKey: string): Promise<Record<Currency, number>> {
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    const data = await res.json();
    return {
      USD: 1,
      VND: data.conversion_rates.VND ?? EXCHANGE_RATES.VND,
      MYR: data.conversion_rates.MYR ?? EXCHANGE_RATES.MYR,
    };
  } catch {
    return EXCHANGE_RATES;
  }
}
