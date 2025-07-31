// Production Configuration
module.exports = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000', // Using same URL for testing
    timeout: 30000,
    retryAttempts: 3,
  },
  
  // Performance Settings
  performance: {
    enableCompression: true,
    enableCaching: true,
    enableMinification: true,
  },
  
  // Security Settings
  security: {
    enableHttps: false, // Disabled for testing
    enableCors: true,
    enableCsrf: false, // Disabled for testing
  },
  
  // Error Reporting
  errorReporting: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    service: 'sentry', // or 'logrocket', 'bugsnag', etc.
  },
  
  // Analytics
  analytics: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    service: 'google-analytics', // or 'mixpanel', 'amplitude', etc.
  },
}; 