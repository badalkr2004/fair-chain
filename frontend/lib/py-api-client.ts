import axios from 'axios';

// Create a custom Axios instance pointing strictly to the Python FastAPI backend
const pyApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FORECAST_API_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // 'X-API-Key': process.env.NEXT_PUBLIC_FORECAST_API_KEY // Un-comment if used
  },
});

// Response interceptor to handle errors uniformly
pyApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Python API Client Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default pyApiClient;
