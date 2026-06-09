import api from './client';
import type { ApiResponse, User } from '@/types';

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<User>>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  logout: async () => {
    const { data } = await api.post<ApiResponse<null>>('/auth/logout');
    return data;
  },

  me: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },
};
