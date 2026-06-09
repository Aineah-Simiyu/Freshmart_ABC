import prisma from '@core/database/prisma';

class SalesRepository {
  async findAll() {
    return prisma.sale.findMany({
      include: {
        product: {
          select: { name: true },
        },
      },
      orderBy: { soldAt: 'desc' },
    });
  }
}

export default new SalesRepository();
