import { Request, Response, NextFunction } from 'express';
import reportsService from './service';
import { ApiResponse } from '@core/types';
import { DashboardDTO, SalesReportDTO, StockReportDTO } from './dto';

class ReportsController {
  async getDashboard(
    _req: Request,
    res: Response<ApiResponse<DashboardDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const dashboard = await reportsService.getDashboard();

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesReport(
    req: Request,
    res: Response<ApiResponse<SalesReportDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, productId } = req.query;

      const report = await reportsService.getSalesReport(
        startDate as string | undefined,
        endDate as string | undefined,
        productId as string | undefined
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockReport(
    _req: Request,
    res: Response<ApiResponse<StockReportDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const report = await reportsService.getStockReport();

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportsController();
