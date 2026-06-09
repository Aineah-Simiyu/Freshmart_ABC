import { Request, Response, NextFunction } from 'express';
import salesService from './service';
import { createSaleSchema } from './validation';
import { ValidationError } from '@core/utils/errors';
import { ApiResponse } from '@core/types';
import { SaleDTO } from './dto';

class SalesController {
  async getAll(
    _req: Request,
    res: Response<ApiResponse<SaleDTO[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const sales = await salesService.getAllSales();

      res.status(200).json({
        success: true,
        data: sales,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response<ApiResponse<SaleDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = createSaleSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error);
      }

      const sale = await salesService.createSale(parsed.data);

      res.status(201).json({
        success: true,
        message: 'Sale recorded successfully',
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SalesController();
