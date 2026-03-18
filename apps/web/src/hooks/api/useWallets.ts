import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Wallet {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT' | 'E_WALLET';
  balance: number;
  currency: string;
  color: string;
  icon: string;
}

// Lấy danh sách wallets
export const useWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: async (): Promise<Wallet[]> => {
      const { data } = await apiClient.get('/wallets');
      return data;
    },
  });
};

// Lấy 1 wallet cụ thể
export const useWallet = (id: string) => {
  return useQuery({
    queryKey: ['wallets', id],
    queryFn: async (): Promise<Wallet> => {
      const { data } = await apiClient.get(`/wallets/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Tạo wallet mới
export const useCreateWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newWallet: Omit<Wallet, 'id'>) => {
      const { data } = await apiClient.post('/wallets', newWallet);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};

// Cập nhật wallet
export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Wallet> & { id: string }) => {
      const { data } = await apiClient.patch(`/wallets/${id}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallets', variables.id] });
    },
  });
};

// Xóa wallet
export const useDeleteWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/wallets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};
