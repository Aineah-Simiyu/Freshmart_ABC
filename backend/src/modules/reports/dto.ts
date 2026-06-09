export interface DashboardDTO {
  totalProducts: number;
  totalStock: number;
  todaySales: number;
  totalRevenue: number;
  recentSales: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    soldAt: Date;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface SalesReportDTO {
  period: { start: string; end: string };
  totalSales: number;
  totalRevenue: number;
  sales: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    soldAt: Date;
  }>;
}

export interface StockReportDTO {
  totalProducts: number;
  totalStock: number;
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}
