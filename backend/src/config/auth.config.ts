export default {
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'fairchain-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Password settings
  saltRounds: 10,
  
  // Token settings
  tokenTypes: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'resetPassword',
    VERIFY_EMAIL: 'verifyEmail'
  }
}; 