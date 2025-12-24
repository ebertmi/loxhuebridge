/**
 * PM2 Ecosystem Configuration
 * For development and production deployment
 */

module.exports = {
  apps: [
    {
      name: 'loxhuebridge',
      script: './server.js',

      // Development mode
      watch: false, // Enable with pm2 start --watch
      ignore_watch: ['node_modules', 'data', 'docs', 'logs'],

      // Environment variables
      env: {
        NODE_ENV: 'production',
        DEBUG: 'false'
      },

      // Development environment
      env_development: {
        NODE_ENV: 'development',
        DEBUG: 'true',
        HTTP_PORT: 8555
      },

      // Production environment
      env_production: {
        NODE_ENV: 'production',
        DEBUG: 'false'
      },

      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Process management
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Memory management
      max_memory_restart: '200M'
    }
  ]
};
