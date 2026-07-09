import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const useDashboardSummary = (walletId?: string | null) => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', walletId],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/dashboard', {
        params: walletId ? { walletId } : {}
      });
      return data; 
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

export const useSpendingByCategory = (year: number, month: number, walletId?: string | null) => {
  return useQuery({
    queryKey: ['analytics', 'spending', year, month, walletId],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/spending', { 
        params: { year, month, ...(walletId && { walletId }) } 
      });
      return data; // { category, amount, percentage, color }[]
    },
    enabled: !!year && !!month,
  });
};

export const useCashflowTrend = (range: string, walletId?: string | null) => {
  return useQuery({
    queryKey: ['analytics', 'cashflow', range, walletId],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/cashflow', { 
        params: { range, ...(walletId && { walletId }) } 
      });
      return data;
    },
    enabled: !!range,
  });
};
