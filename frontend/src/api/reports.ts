import api from './client';
import type { ApiResponse, DashboardData, SalesReport, StockReport } from '@/types';

export const reportsApi = {
  getDashboard: async () => {
    const { data } = await api.get<ApiResponse<DashboardData>>('/reports/dashboard');
    return data;
  },

  getSalesReport: async (startDate?: string, endDate?: string, productId?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (productId) params.append('productId', productId);

    const { data } = await api.get<ApiResponse<SalesReport>>(
      `/reports/sales?${params.toString()}`
    );
    return data;
  },

  getStockReport: async () => {
    const { data } = await api.get<ApiResponse<StockReport>>('/reports/stock');
    return data;
  },
};
