import { Router } from 'express';
import salesController from './controller';
import { isAuthenticated } from '@core/middleware';

const router = Router();

router.use(isAuthenticated);

router.get('/', salesController.getAll);
router.post('/', salesController.create);

export default router;
