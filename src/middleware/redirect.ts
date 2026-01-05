/**
 * Redirect Middleware
 * Handles redirection to setup page when not configured
 */

import path from 'path';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Config from '../config';

/**
 * Redirect to setup if not configured
 */
export function redirectIfNotConfigured(config: Config): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Allow API and setup paths
    if (req.path.startsWith('/api/') || req.path === '/setup.html') {
      next();
      return;
    }

    // Redirect to setup if not configured
    if (!config.isReady()) {
      if (req.path === '/') {
        res.sendFile(path.join(__dirname, '../../public', 'setup.html'));
        return;
      }
      res.redirect('/');
      return;
    }

    next();
  };
}
