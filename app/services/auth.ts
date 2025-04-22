import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: 'FARMER' | 'INTERMEDIARY' | 'CONSUMER';
  phone: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  profileData: any;
}

interface AuthResponse {
  user: any;
  token: string;
  refreshToken: string;
}

// User roles
export enum UserRole {
  FARMER = 'FARMER',
  INTERMEDIARY = 'INTERMEDIARY',
  CONSUMER = 'CONSUMER'
}

class AuthService {
  /**
   * Login a user
   */
  async login(credentials: LoginCredentials): Promise<any> {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      await this.storeTokens(response.token, response.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('Login successful for user:', response.user.name);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async signup(data: SignupData): Promise<any> {
    try {
      console.log('Attempting signup with:', data.email, 'role:', data.role);
      const response = await api.post<AuthResponse>('/auth/signup', data);
      
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Check if refreshToken exists in the response before storing it
      await this.storeTokens(response.token, response.refreshToken || '');
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('Signup successful for user:', response.user.name);
      return response;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    console.log('Logging out user');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    const isLogged = !!token;
    console.log('User is logged in:', isLogged);
    return isLogged;
  }

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<any> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        console.log('No user found in storage');
        return null;
      }
      
      const user = JSON.parse(userStr);
      console.log('Current user retrieved:', user.name);
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile with fresh data from server
   */
  async getUserProfile(): Promise<any> {
    try {
      const profile = await api.get('/auth/profile');
      console.log('User profile retrieved from server');
      return profile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data: any): Promise<any> {
    try {
      console.log('Updating user profile');
      const updatedProfile = await api.put('/auth/profile', data);
      
      // Update local user data
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...(currentUser as object), ...(updatedProfile as object) };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<any> {
    try {
      console.log('Changing user password');
      return await api.put('/auth/change-password', data);
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Store authentication tokens
   */
  private async storeTokens(token: string, refreshToken: string): Promise<void> {
    await AsyncStorage.setItem('token', token);
    
    // Only store refreshToken if it exists
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    
    console.log('Auth tokens stored successfully');
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      console.log('Attempting to refresh token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token found');
        return false;
      }

      const response = await api.post<{ token: string }>('/auth/refresh-token', { refreshToken });
      if (!response.token) {
        throw new Error('Invalid response from server');
      }
      
      await AsyncStorage.setItem('token', response.token);
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.logout();
      return false;
    }
  }
  
  /**
   * Check if the current auth token is valid
   */
  async validateToken(): Promise<boolean> {
    try {
      // Try to make a request that requires authentication
      await this.getUserProfile();
      return true;
    } catch (error) {
      // If token is invalid, try to refresh it
      try {
        return await this.refreshToken();
      } catch (refreshError) {
        return false;
      }
    }
  }
}

export default new AuthService(); 