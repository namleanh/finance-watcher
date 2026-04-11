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
  compact = false
): string {
  if (currency === 'VND' && compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      const val = amount / 1_000_000_000;
      return `${Number(val.toFixed(1))}B\u00A0đ`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      const val = amount / 1_000_000;
      return `${Number(val.toFixed(1))}tr\u00A0đ`;
    }
    if (Math.abs(amount) >= 1_000) {
      const val = amount / 1_000;
      return `${Number(val.toFixed(1))}k\u00A0đ`;
    }
    return `${Math.round(amount)}\u00A0đ`;
  }

  const symbols: Record<Currency, string> = { 
    VND: 'đ', USD: '$', MYR: 'RM', EUR: '€', JPY: '¥', GBP: '£', AUD: 'A$', SGD: 'S$', KRW: '₩' 
  };
  const sym = symbols[currency];

  if (currency === 'VND') {
    return `${Math.round(amount).toLocaleString('en-US')}\u00A0${sym}`;
  }
  return `${sym}${amount.toLocaleString('en-US')}`;
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
