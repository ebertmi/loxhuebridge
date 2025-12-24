/**
 * Error Handler Middleware
 * Global error handling for Express application
 */

/**
 * Global error handler
 * Must be registered after all routes
 */
function errorHandler(err, req, res, next) {
    // Log error
    console.error('Error:', err);

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';

    const response = {
        error: err.message || 'Internal server error'
    };

    // Add stack trace in development
    if (isDevelopment) {
        response.stack = err.stack;
        response.details = err.details || null;
    }

    res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
}

/**
 * Async route wrapper
 * Catches errors in async route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
