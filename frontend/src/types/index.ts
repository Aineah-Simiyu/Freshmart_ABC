export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  soldAt: string;
}

export interface DashboardData {
  totalProducts: number;
  totalStock: number;
  todaySales: number;
  totalRevenue: number;
  recentSales: Sale[];
  dailySales: Array<{ date: string; revenue: number }>;
}

export interface SalesReport {
  period: { start: string; end: string };
  totalSales: number;
  totalRevenue: number;
  sales: Sale[];
}

export interface StockReport {
  totalProducts: number;
  totalStock: number;
  products: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
