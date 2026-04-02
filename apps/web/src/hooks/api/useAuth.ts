import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
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
    // Đăng ký xong thì login luôn nên ta có thể lưu token tại onSuccess nếu backend trả về.
    onSuccess: (data) => {
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
