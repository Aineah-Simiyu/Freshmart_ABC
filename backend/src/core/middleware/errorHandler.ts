import { Request, Response, NextFunction } from 'express';
import logger from '@core/config/logger';
import { AppError, ValidationError } from '@core/utils/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
