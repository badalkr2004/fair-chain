/**
 * Token storage utility for managing authentication tokens
 */

// Storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';

/**
 * Sets the access token in storage
 */
export const setAccessToken = (token: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

/**
 * Gets the access token from storage
 */
export const getAccessToken = (): string | null => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

/**
 * Gets the token (alias for getAccessToken for compatibility)
 */
export const getToken = (): string | null => {
  return getAccessToken();
};

/**
 * Sets the refresh token in storage
 */
export const setRefreshToken = (token: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

/**
 * Gets the refresh token from storage
 */
export const getRefreshToken = (): string | null => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

/**
 * Sets the user ID in storage
 */
export const setUserId = (userId: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, userId);
  }
};

/**
 * Gets the user ID from storage
 */
export const getUserId = (): string | null => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(USER_ID_KEY);
  }
  return null;
};

/**
 * Clears all tokens from storage
 */
export const clearTokens = (): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};

// Default export for all token storage functions
const tokenStorage = {
  setAccessToken,
  getAccessToken,
  getToken,
  setRefreshToken,
  getRefreshToken,
  setUserId,
  getUserId,
  clearTokens,
  isAuthenticated,
};

export default tokenStorage; 