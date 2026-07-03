// backend/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import AppError from '../utils/AppError.js';

/** Factory function to create a validation middleware. Validates the request
 *  { body, query, params } against a Zod schema. On failure: returns 422 with
 *  field-level error messages. */
function validate(schema: ZodSchema) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse({
        body: _req.body,
        query: _req.query,
        params: _req.params,
      });

      if (!result.success) {
        const errors = (result.error as ZodError).errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        const cleanedErrors = errors.map((err) => ({
          field: err.field.replace(/^body\./, ''),
          message: err.message,
        }));
        res.status(422).json({
          success: false,
          message: 'بيانات غير صالحة',
          errors: cleanedErrors,
        });
        return;
      }

      next();
    } catch (err) {
      next(err instanceof Error ? err : new AppError('خطأ في التحقق'));
    }
  };
}

export default validate;
