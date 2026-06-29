// backend/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import AppError from '../utils/AppError.js';

/**
 * Factory function to create a validation middleware.
 * Validates the request { body, query, params } against a Zod schema.
 * On failure: returns 422 with field-level error messages.
 */
function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Allow partial matching against body/query/params
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        // Clean up the 'body.' prefix from field names for cleaner responses
        const cleanedErrors = errors.map((err) => ({
          field: err.field.replace(/^body\./, ''),
          message: err.message,
        }));

        return res.status(422).json({
          success: false,
          message: 'بيانات غير صالحة',
          errors: cleanedErrors,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export default validate;
