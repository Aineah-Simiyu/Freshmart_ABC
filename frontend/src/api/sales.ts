import api from './client';
import type { ApiResponse, Sale } from '@/types';

export const salesApi = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Sale[]>>('/sales');
    return data;
  },

  create: async (sale: { productId: string; quantity: number }) => {
    const { data } = await api.post<ApiResponse<Sale>>('/sales', sale);
    return data;
  },
};
