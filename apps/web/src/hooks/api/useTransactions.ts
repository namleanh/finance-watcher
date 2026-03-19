import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'SAVING' | 'INVESTMENT';
  amount: number;
  originalAmount: number;
  originalCurrency: string;
  category: string;
  subCategory?: string;
  date: string;
  notes?: string;
  walletId?: string;
  recurringId?: string;
}

export const useTransactions = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/transactions', { params });
      return data; // { data: Transaction[], meta: { total, page, limit, totalPages } }
    },
  });
};

export const useTransactionSummary = (year: number, month: number) => {
  return useQuery({
    queryKey: ['transactions', 'summary', year, month],
    queryFn: async () => {
      const { data } = await apiClient.get('/transactions/summary', { params: { year, month } });
      return data;
    },
    enabled: !!year && !!month,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newT: Omit<Transaction, 'id'>) => {
      const { data } = await apiClient.post('/transactions', newT);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      // Invalidate goals (since SAVING transactions update goal progress)
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Transaction> & { id: string }) => {
      const { data } = await apiClient.patch(`/transactions/${id}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};
