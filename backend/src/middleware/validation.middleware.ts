import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';

/**
 * Middleware to validate request body, query or params against a Zod schema
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: any) {
      const errorMessage = error.errors?.map((e: any) => e.message).join(', ') || 'Validation error';
      res.status(400).json({ 
        status: 'error',
        message: 'Validation error',
        errors: error.errors || errorMessage
      });
    }
  };
};