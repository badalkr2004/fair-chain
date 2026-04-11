import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, IS_DEV } from "../config";

console.log("📡 API connecting to:", API_URL);

/**
 * Base API service with methods for making HTTP requests
 */
class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Log requests in development only
  private logRequest(
    method: string,
    endpoint: string,
    data?: any,
    error?: any,
  ) {
    if (!IS_DEV) return;

    if (error) {
      console.error(`🔴 ${method} ${endpoint} failed:`, error);
      return;
    }

    console.log(`🟢 ${method} ${endpoint}`, data ? '(with body)' : "");
  }

  // Handle network errors better
  private handleNetworkError(
    error: any,
    method: string,
    endpoint: string,
  ): never {
    if (error.message === "Network request failed") {
      console.error(`Network request failed for ${method} ${endpoint}`, error);
      throw new Error(
        `Cannot connect to server at ${API_URL}. Please check your connection or server status.`,
      );
    }

    if (error.message && error.message.includes("Unexpected token")) {
      console.error(`Invalid JSON response from ${method} ${endpoint}`, error);
      throw new Error(`Server returned invalid data. Please try again later.`);
    }

    throw error;
  }

  private async parseResponse<T>(response: Response, method: string, endpoint: string): Promise<T> {
    // Check content type to avoid JSON parsing errors for HTML responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      console.error(`Received HTML instead of JSON from ${endpoint}`);
      throw new Error(
        "Received HTML response instead of JSON. API endpoint may be unavailable.",
      );
    }

    const text = await response.text();

    if (!text || text.trim() === "") {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return {} as T;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(`Error parsing JSON from ${endpoint}:`, parseError);
      throw new Error(
        "Invalid response format. Could not parse server response.",
      );
    }

    if (!response.ok) {
      this.logRequest(method, endpoint, null, data);
      throw new Error(
        data.message || `Request failed with status ${response.status}`,
      );
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest("GET", endpoint);

      const url = `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      return this.parseResponse<T>(response, "GET", endpoint);
    } catch (error) {
      this.logRequest("GET", endpoint, null, error);
      return this.handleNetworkError(error, "GET", endpoint);
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest("POST", endpoint, data);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      return this.parseResponse<T>(response, "POST", endpoint);
    } catch (error) {
      this.logRequest("POST", endpoint, data, error);
      return this.handleNetworkError(error, "POST", endpoint);
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest("PUT", endpoint, data);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      return this.parseResponse<T>(response, "PUT", endpoint);
    } catch (error) {
      this.logRequest("PUT", endpoint, data, error);
      return this.handleNetworkError(error, "PUT", endpoint);
    }
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest("PATCH", endpoint, data);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      });

      return this.parseResponse<T>(response, "PATCH", endpoint);
    } catch (error) {
      this.logRequest("PATCH", endpoint, data, error);
      return this.handleNetworkError(error, "PATCH", endpoint);
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getHeaders();
      this.logRequest("DELETE", endpoint);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
      });

      return this.parseResponse<T>(response, "DELETE", endpoint);
    } catch (error) {
      this.logRequest("DELETE", endpoint, null, error);
      return this.handleNetworkError(error, "DELETE", endpoint);
    }
  }

  getApiUrl() {
    return API_URL;
  }
}

export default new ApiService();
