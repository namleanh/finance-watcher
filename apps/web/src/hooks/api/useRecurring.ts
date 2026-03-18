import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface RecurringItem {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'SAVING';
  amount: number;
  originalCurrency: string;
  category: string;
  subCategory?: string;
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDate: string;
  notes?: string;
  active: boolean;
}

export const useRecurringItems = () => {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: async (): Promise<RecurringItem[]> => {
      const { data } = await apiClient.get('/recurring');
      return data;
    },
  });
};

export const useCreateRecurring = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newItem: Omit<RecurringItem, 'id' | 'active'>) => {
      const { data } = await apiClient.post('/recurring', newItem);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
};

export const useUpdateRecurring = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<RecurringItem> & { id: string }) => {
      const { data } = await apiClient.patch(`/recurring/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
};

export const useDeleteRecurring = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/recurring/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
};
