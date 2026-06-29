// backend/src/utils/AppError.ts
export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
