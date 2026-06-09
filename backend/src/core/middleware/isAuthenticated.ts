import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.session && req.session.userId) {
    next();
    return;
  }

  res.status(401).json({
    success: false,
    message: 'Unauthorized. Please log in.',
  });
};
