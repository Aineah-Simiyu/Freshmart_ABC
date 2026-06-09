import reportsRepository from './repository';
import { DashboardDTO, SalesReportDTO, StockReportDTO } from './dto';

class ReportsService {
  async getDashboard(): Promise<DashboardDTO> {
    const [totalProducts, totalStock, todaySales, totalRevenue, recentSales, dailySales] =
      await Promise.all([
        reportsRepository.getTotalProducts(),
        reportsRepository.getTotalStock(),
        reportsRepository.getTodaySalesCount(),
        reportsRepository.getTotalRevenue(),
        reportsRepository.getRecentSales(6),
        reportsRepository.getDailySales(7),
      ]);

    return {
      totalProducts,
      totalStock,
      todaySales,
      totalRevenue,
      recentSales: recentSales.map((s) => ({
        id: s.id,
        productName: s.product.name,
        quantity: s.quantity,
        unitPrice: Number(s.unitPrice),
        totalAmount: Number(s.totalAmount),
        soldAt: s.soldAt,
      })),
      dailySales,
    };
  }

  async getSalesReport(startDate?: string, endDate?: string, productId?: string): Promise<SalesReportDTO> {
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2099-12-31');

    end.setHours(23, 59, 59, 999);

    const sales = await reportsRepository.getSalesByDateRange(start, end, productId);

    const totalRevenue = sales.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0
    );

    return {
      period: {
        start: startDate || 'All time',
        end: endDate || 'Present',
      },
      totalSales: sales.length,
      totalRevenue,
      sales: sales.map((s) => ({
        id: s.id,
        productName: s.product.name,
        quantity: s.quantity,
        unitPrice: Number(s.unitPrice),
        totalAmount: Number(s.totalAmount),
        soldAt: s.soldAt,
      })),
    };
  }

  async getStockReport(): Promise<StockReportDTO> {
    const products = await reportsRepository.getAllProducts();

    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);

    return {
      totalProducts: products.length,
      totalStock,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        quantity: p.quantity,
      })),
    };
  }
}

export default new ReportsService();
