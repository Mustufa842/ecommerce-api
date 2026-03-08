import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(result.error); // Passed to the centralized ZodError handler
      return;
    }

    // Attach parsed/coerced data back to request
    if (result.data.body) req.body = result.data.body;
    next();
  };
};