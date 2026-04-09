import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface MarketData {
  id: string;
  type: 'CURRENCY' | 'GOLD' | 'STOCK';
  symbol: string;
  label: string;
  price: number;
  change?: number;
  updatedAt: string;
}

export const useMarketData = () => {
  return useQuery({
    queryKey: ['marketData', 'all'],
    queryFn: async (): Promise<MarketData[]> => {
      const { data } = await apiClient.get('/market-data');
      return data;
    },
    staleTime: 10 * 60 * 1000, 
  });
};

export const useMarketFavorites = () => {
  return useQuery({
    queryKey: ['marketData', 'favorites'],
    queryFn: async (): Promise<MarketData[]> => {
      const { data } = await apiClient.get('/market-data/favorites');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useToggleMarketPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { symbol: string, type: string, label?: string }) => {
      const { data } = await apiClient.post('/market-data/preferences/toggle', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketData', 'favorites'] });
    },
  });
};

export const useMarketSearch = (query: string) => {
  return useQuery({
    queryKey: ['marketData', 'search', query],
    queryFn: async (): Promise<MarketData[]> => {
      const { data } = await apiClient.get(`/market-data/search?q=${query}`);
      return data;
    },
    enabled: query.length >= 2,
  });
};

export const useRefreshMarketData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<MarketData[]> => {
      const { data } = await apiClient.post('/market-data/refresh');
      return data;
    },
    onSuccess: () => {
      // Invalidate all queries starting with 'marketData' (all, favorites, etc.)
      queryClient.invalidateQueries({ queryKey: ['marketData'] });
    },
  });
};
