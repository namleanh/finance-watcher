export const EXCHANGE_RATES: Record<string, number> = {
  VND: 1,
  USD: 25400,
  MYR: 5400,
  EUR: 27600,
  JPY: 167,
  GBP: 32150,
  AUD: 16600,
  SGD: 18814,
  KRW: 18.67,
};

export function convertCurrency(
  amount: number,
  from: string,
  to: string
): number {
  if (from === to) return amount;
  // Rates are VND per unit
  const fromRate = EXCHANGE_RATES[from] || 0;
  const toRate = EXCHANGE_RATES[to] || 0;
  if (!fromRate || !toRate) return 0;

  // Convert to VND first, then to target
  const inVND = amount * fromRate;
  return inVND / toRate;
}

export function toVND(amount: number, from: string): number {
  return convertCurrency(amount, from, 'VND');
}
