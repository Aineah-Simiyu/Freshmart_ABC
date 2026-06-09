import { Router } from 'express';
import reportsController from './controller';
import { isAuthenticated } from '@core/middleware';

const router = Router();

router.use(isAuthenticated);

router.get('/dashboard', reportsController.getDashboard);
router.get('/sales', reportsController.getSalesReport);
router.get('/stock', reportsController.getStockReport);

export default router;
