import prisma from '@core/database/prisma';

class ProductRepository {
  async findAll() {
    return prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: { name: string; category: string; price: number; quantity: number }) {
    return prisma.product.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; category?: string; price?: number; quantity?: number }) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }
}

export default new ProductRepository();
