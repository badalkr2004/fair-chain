// Fail fast if JWT_SECRET is not set in production
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production');
}

const config = {
  // JWT configuration
  jwtSecret: (jwtSecret || 'dev-only-fairchain-secret-key') as string,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string,
  jwtRefreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
  
  // Password settings
  saltRounds: 10,
  
  // Token settings
  tokenTypes: {
    ACCESS: 'access' as const,
    REFRESH: 'refresh' as const,
    RESET_PASSWORD: 'resetPassword' as const,
    VERIFY_EMAIL: 'verifyEmail' as const,
  }
} as const;

export default config;