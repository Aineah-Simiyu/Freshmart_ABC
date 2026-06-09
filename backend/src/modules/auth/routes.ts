import { Router } from 'express';
import authController from './controller';
import { isAuthenticated } from '@core/middleware';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/me', isAuthenticated, authController.me);

export default router;
