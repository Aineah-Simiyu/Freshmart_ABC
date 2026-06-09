import { Response, NextFunction } from 'express';
import authService from './service';
import { loginSchema } from './validation';
import { ValidationError } from '@core/utils/errors';
import { AuthenticatedRequest, ApiResponse } from '@core/types';
import { UserDTO } from './dto';

class AuthController {
  async login(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error);
      }

      const { email, password } = parsed.data;
      const user = await authService.login(email, password);

      req.session.userId = user.id;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }

        res.clearCookie('freshmart.sid');
        res.status(200).json({
          success: true,
          message: 'Logout successful',
        });
      });
    } catch (error) {
      next(error);
    }
  }

  async me(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.session.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const user = await authService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
