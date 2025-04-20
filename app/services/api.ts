import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the API URL from environment or use default
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical devices, use the actual IP address of your backend server
const isAndroid = Platform.OS === 'android';
// Use 10.0.2.2 for Android emulator to connect to host machine's localhost
const DEFAULT_API_URL = isAndroid ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

// Hard-code the API URL to ensure it always uses port 8080
// Overriding any potential environment variables that might be pointing to port 3000
const API_URL = 'https://api.fc.bitbrains.fun';
console.log('📡 API connecting to:', API_URL);

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

  // Handle network errors better
  private handleNetworkError(error: any, method: string, endpoint: string): never {
    if (error.message === 'Network request failed') {
      console.error(`Network request failed for ${method} ${endpoint}`, error);
      throw new Error(`Cannot connect to server at ${API_URL}. Please check your connection or server status.`);
    }
    throw error;
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
      this.handleNetworkError(error, 'GET', endpoint);
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
      this.handleNetworkError(error, 'POST', endpoint);
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
      this.handleNetworkError(error, 'PUT', endpoint);
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
      this.handleNetworkError(error, 'DELETE', endpoint);
    }
  }
  
  getApiUrl() {
    return API_URL;
  }
}

export default new ApiService(); 