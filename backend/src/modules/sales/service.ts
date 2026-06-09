import prisma from '@core/database/prisma';
import salesRepository from './repository';
import { SaleDTO, CreateSaleDTO } from './dto';
import { NotFoundError, AppError } from '@core/utils/errors';

class SalesService {
  async getAllSales(): Promise<SaleDTO[]> {
    const sales = await salesRepository.findAll();

    return sales.map((s) => ({
      id: s.id,
      productId: s.productId,
      productName: s.product.name,
      quantity: s.quantity,
      unitPrice: Number(s.unitPrice),
      totalAmount: Number(s.totalAmount),
      soldAt: s.soldAt,
    }));
  }

  async createSale(data: CreateSaleDTO): Promise<SaleDTO> {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    if (product.quantity < data.quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${product.quantity}, Requested: ${data.quantity}`,
        400
      );
    }

    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * data.quantity;

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          unitPrice,
          totalAmount,
        },
        include: {
          product: { select: { name: true } },
        },
      });

      await tx.product.update({
        where: { id: data.productId },
        data: { quantity: { decrement: data.quantity } },
      });

      return newSale;
    });

    return {
      id: sale.id,
      productId: sale.productId,
      productName: sale.product.name,
      quantity: sale.quantity,
      unitPrice: Number(sale.unitPrice),
      totalAmount: Number(sale.totalAmount),
      soldAt: sale.soldAt,
    };
  }
}

export default new SalesService();
