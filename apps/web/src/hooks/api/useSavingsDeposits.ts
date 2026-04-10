import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface SavingsDeposit {
  id: string;
  bankName: string;
  depositAmount: number;
  termMonths: number;
  interestRate: number;
  interestEarned: number;
  depositDate: string;
  maturityDate: string;
  status: 'ACTIVE' | 'MATURED' | 'WITHDRAWN';
  currency: string;
  notes?: string;
  walletId?: string;
  walletName?: string;
  createdAt: string;
}

export const useSavingsDeposits = () =>
  useQuery({
    queryKey: ['savings-deposits'],
    queryFn: async (): Promise<SavingsDeposit[]> => {
      const { data } = await apiClient.get('/savings-deposits');
      return data;
    },
  });

export const useCreateSavingsDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Omit<SavingsDeposit, 'id' | 'interestEarned' | 'maturityDate' | 'status' | 'createdAt'>) => {
      const { data } = await apiClient.post('/savings-deposits', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-deposits'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useDeleteSavingsDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/savings-deposits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-deposits'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
