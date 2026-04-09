export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  VND: 25400,
  MYR: 4.7,
  EUR: 0.92,
  JPY: 152,
  GBP: 0.79,
  AUD: 1.53,
  SGD: 1.35,
  KRW: 1360,
};

export function convertCurrency(
  amount: number,
  from: string,
  to: string
): number {
  if (from === to) return amount;
  // Convert to USD first, then to target currency
  const fromRate = EXCHANGE_RATES[from] || 1;
  const toRate = EXCHANGE_RATES[to] || 1;
  const inUSD = amount / fromRate;
  return inUSD * toRate;
}
