import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Currency } from '@/lib/types';

export interface PortfolioAsset {
  id: string;
  name: string;
  ticker?: string;
  assetType: 'STOCK' | 'CRYPTO' | 'GOLD' | 'REAL_ESTATE' | 'OTHER';
  units: number;
  costBasis: number;
  currentPrice: number;
  currency: Currency;
  purchaseDate?: string;
  notes?: string;
  walletId?: string;
  walletName?: string;
  transactionId?: string;
}

export const usePortfolioAssets = () => {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async (): Promise<PortfolioAsset[]> => {
      const { data } = await apiClient.get('/portfolio');
      return data;
    },
  });
};

export const usePortfolioSummary = () => {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/portfolio/summary');
      return data; // { totalValue, totalCost, totalPnL, pnlPercentage }
    },
  });
};

export const useCreatePortfolioAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAsset: Omit<PortfolioAsset, 'id'>) => {
      const { data } = await apiClient.post('/portfolio', newAsset);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useUpdatePortfolioAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<PortfolioAsset> & { id: string }) => {
      const { data } = await apiClient.patch(`/portfolio/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useDeletePortfolioAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
