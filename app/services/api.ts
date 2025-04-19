import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the API URL from environment or use default
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical devices, use the actual IP address of your backend server
const isAndroid = Platform.OS === 'android';
const DEFAULT_API_URL = isAndroid ? 'http://localhost:8080' : 'http://localhost:8080';

// Force API URL to 8080 for Expo Go
const API_URL = 'http://localhost:8080';

// Debug flag - set to true to log API requests/responses
const DEBUG = true;

/**
 * Base API service with methods for making HTTP requests
 */
class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Log requests in development
  private logRequest(method: string, endpoint: string, data?: any, error?: any) {
    if (!DEBUG) return;
    
    if (error) {
      console.error(`🔴 ${method} ${endpoint} failed:`, error);
      return;
    }
    
    console.log(`🟢 ${method} ${endpoint}`, data || '');
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest('GET', endpoint);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        this.logRequest('GET', endpoint, null, data);
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      this.logRequest('GET', endpoint, null, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest('POST', endpoint, data);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        this.logRequest('POST', endpoint, data, responseData);
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }
      
      return responseData;
    } catch (error) {
      this.logRequest('POST', endpoint, data, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest('PUT', endpoint, data);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        this.logRequest('PUT', endpoint, data, responseData);
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }
      
      return responseData;
    } catch (error) {
      this.logRequest('PUT', endpoint, data, error);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest('DELETE', endpoint);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        this.logRequest('DELETE', endpoint, null, data);
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      this.logRequest('DELETE', endpoint, null, error);
      throw error;
    }
  }
  
  getApiUrl() {
    return API_URL;
  }
}

export default new ApiService(); 