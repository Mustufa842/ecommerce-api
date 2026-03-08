import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
}

const handleCastErrorDB = (err: MongoError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError): AppError => {
  const value = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  const message = `Duplicate field value for '${value}'. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: Error & { errors?: Record<string, { message: string }> }): AppError => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired. Please log in again.', 401);

const handleZodError = (err: ZodError): AppError => {
  const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  const message = `Validation failed: ${errors.join('; ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ status: err.status, message: err.message });
  } else {
    console.error('💥 UNEXPECTED ERROR:', err);
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
  }
};

export const errorHandler = (
  err: Error & { statusCode?: number; code?: number; name?: string; keyValue?: Record<string, unknown>; errors?: Record<string, { message: string }> },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  let error = Object.assign(new AppError(err.message, statusCode), err);

  if (err instanceof ZodError) error = handleZodError(err);
  else if (err.name === 'CastError') error = handleCastErrorDB(err as MongoError);
  else if (err.code === 11000) error = handleDuplicateFieldsDB(err as MongoError);
  else if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  else if (err.name === 'JsonWebTokenError') error = handleJWTError();
  else if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};