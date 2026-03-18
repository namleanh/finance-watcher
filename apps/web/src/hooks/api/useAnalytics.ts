import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/dashboard');
      return data; 
      // {
      //   wallets: { totalBalance, count },
      //   portfolio: { totalValue, count },
      //   transactionsMonth: { income, expense, count },
      //   goals: { totalCurrent, totalTarget, count }
      // }
    },
  });
};

export const useNetWorthHistory = (year: number) => {
  return useQuery({
    queryKey: ['analytics', 'net-worth', year],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/net-worth', { params: { year } });
      return data; // { year, data: { month, netWorth }[] }
    },
    enabled: !!year,
  });
};

export const useSpendingByCategory = (year: number, month: number) => {
  return useQuery({
    queryKey: ['analytics', 'spending', year, month],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/spending', { params: { year, month } });
      return data; // { category, amount, percentage, color }[]
    },
    enabled: !!year && !!month,
  });
};
