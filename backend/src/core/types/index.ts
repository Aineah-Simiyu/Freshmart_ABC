import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  session: Request['session'] & {
    userId?: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
