import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface TransactionParams {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
}

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
  walletName?: string;
  goalId?: string;
  goalName?: string;
  savingsDepositId?: string;
  depositBankName?: string;
  recurringId?: string;
  // Investment fields
  ticker?: string;
  units?: number;
  assetType?: 'STOCK' | 'CRYPTO' | 'GOLD' | 'REAL_ESTATE' | 'OTHER';
  currentPrice?: number;
}

export const useTransactions = (params?: TransactionParams) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/transactions', { params });
      return data; // { data: Transaction[], meta: { total, page, limit, totalPages } }
    },
  });
};

export const useInfiniteTransactions = (params?: Omit<TransactionParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['transactions', 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get('/transactions', { 
        params: { ...params, page: pageParam } 
      });
      return data;
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
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
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
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
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
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
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};
