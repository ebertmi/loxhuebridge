/**
 * Redirect Middleware
 * Handles redirection to setup page when not configured
 */

const path = require('path');

/**
 * Redirect to setup if not configured
 * @param {Object} config - Config instance
 * @returns {Function} Middleware function
 */
function redirectIfNotConfigured(config) {
    return (req, res, next) => {
        // Allow API and setup paths
        if (req.path.startsWith('/api/') || req.path === '/setup.html') {
            return next();
        }

        // Redirect to setup if not configured
        if (!config.isReady()) {
            if (req.path === '/') {
                return res.sendFile(path.join(__dirname, '../../public', 'setup.html'));
            }
            return res.redirect('/');
        }

        next();
    };
}

module.exports = {
    redirectIfNotConfigured
};
