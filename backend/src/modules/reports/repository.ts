import prisma from '@core/database/prisma';

class ReportsRepository {
  async getTotalProducts() {
    return prisma.product.count();
  }

  async getTotalStock() {
    const result = await prisma.product.aggregate({
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }

  async getTotalRevenue() {
    const result = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
    });
    return Number(result._sum.totalAmount) || 0;
  }

  async getTodaySalesCount() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.sale.count({
      where: {
        soldAt: { gte: startOfDay, lte: endOfDay },
      },
    });
  }

  async getRecentSales(limit: number = 6) {
    return prisma.sale.findMany({
      take: limit,
      include: {
        product: { select: { name: true } },
      },
      orderBy: { soldAt: 'desc' },
    });
  }

  async getSalesByDateRange(startDate: Date, endDate: Date, productId?: string) {
    return prisma.sale.findMany({
      where: {
        soldAt: { gte: startDate, lte: endDate },
        ...(productId && { productId }),
      },
      include: {
        product: { select: { name: true } },
      },
      orderBy: { soldAt: 'desc' },
    });
  }

  async getDailySales(days: number = 7) {
    const startOfDay = new Date();
    startOfDay.setDate(startOfDay.getDate() - days + 1);
    startOfDay.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        soldAt: { gte: startOfDay },
      },
      select: {
        totalAmount: true,
        soldAt: true,
      },
      orderBy: { soldAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - days + 1 + i);
      const key = d.toISOString().split('T')[0];
      grouped[key] = 0;
    }

    for (const sale of sales) {
      const key = sale.soldAt.toISOString().split('T')[0];
      if (key in grouped) {
        grouped[key] += Number(sale.totalAmount);
      }
    }

    return Object.entries(grouped).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));
  }

  async getAllProducts() {
    return prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

export default new ReportsRepository();
