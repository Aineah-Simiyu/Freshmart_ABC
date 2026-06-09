import { Router } from 'express';
import productController from './controller';
import { isAuthenticated } from '@core/middleware';

const router = Router();

router.use(isAuthenticated);

router.get('/', productController.getAll);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

export default router;
