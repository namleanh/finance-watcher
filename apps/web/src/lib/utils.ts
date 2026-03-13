export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const formatPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};
