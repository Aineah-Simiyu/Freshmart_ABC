import api from './client';
import type { ApiResponse, Product } from '@/types';

export const productsApi = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Product[]>>('/products');
    return data;
  },

  create: async (product: { name: string; category: string; price: number; quantity: number }) => {
    const { data } = await api.post<ApiResponse<Product>>('/products', product);
    return data;
  },

  update: async (id: string, product: Partial<{ name: string; category: string; price: number; quantity: number }>) => {
    const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, product);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return data;
  },
};
