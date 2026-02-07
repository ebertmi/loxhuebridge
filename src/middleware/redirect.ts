/**
 * Redirect Middleware
 * Handles redirection to setup page when not configured
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import Config from '../config';

/**
 * Redirect to setup if not configured
 */
export function redirectIfNotConfigured(_config: Config): RequestHandler {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // Angular SPA handles setup routing via /#/setup based on API responses
    next();
  };
}
