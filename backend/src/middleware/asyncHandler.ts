import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler to properly handle the void return type
 * required by Express 5, and automatically catches errors.
 * 
 * Express 5 requires handlers to return void | Promise<void>, but controllers
 * commonly return `res.json()` which returns Response. This wrapper discards
 * the return value and forwards errors to Express error handling middleware.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
