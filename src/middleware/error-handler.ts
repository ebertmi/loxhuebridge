/**
 * Error Handler Middleware
 * Global error handling for Express application
 */

import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';

/**
 * Extended Error interface with additional properties
 */
interface AppError extends Error {
  statusCode?: number;
  status?: number;
  details?: any;
}

/**
 * Global error handler
 * Must be registered after all routes
 */
export const errorHandler: ErrorRequestHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  // Log error
  console.error('Error:', err);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';

  const response: any = {
    error: err.message || 'Internal server error'
  };

  // Add stack trace in development
  if (isDevelopment) {
    response.stack = err.stack;
    response.details = err.details || null;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
}

/**
 * Async route wrapper
 * Catches errors in async route handlers
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
