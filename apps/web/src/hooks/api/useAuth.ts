import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  baseCurrency: string;
}

export const useUser = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User | null> => {
      // Bỏ qua nếu không có token (chưa đăng nhập)
      if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
        return null;
      }
      const { data } = await apiClient.get('/auth/me');
      return data;
    },
    retry: false, // Không retry nếu fail (ví dụ 401)
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: Record<string, any>) => {
      const { data } = await apiClient.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      if (data.userId) localStorage.setItem('userId', data.userId);
      // Dọn dẹp cache cũ (có thể đang lưu giá trị null) để Query thực hiện fetch mới hoàn toàn
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: Record<string, any>) => {
      const { data } = await apiClient.post('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      // Tokens are no longer returned on register, they will be set after email is verified and user logs in.
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        if (data.userId) localStorage.setItem('userId', data.userId);
      }
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSettled: () => {
      // Dù API có fail đi nữa, ta vẫn clear local data và quay về login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      queryClient.clear(); // Xóa sạch cache data
      router.push('/login');
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await apiClient.post('/auth/verify-email', { token });
      return data;
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post('/auth/resend-verification', { email });
      return data;
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (identifier: string) => {
      const { data } = await apiClient.post('/auth/forgot-password', { identifier });
      return data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: { token: string; newPassword: string }) => {
      const { data } = await apiClient.post('/auth/reset-password', payload);
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { username?: string; displayName?: string; baseCurrency?: string }) => {
      const { data } = await apiClient.patch('/auth/profile', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};
