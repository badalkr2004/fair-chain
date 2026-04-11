// Configuration variables for the application

import { Platform } from "react-native";

// API URL configuration — SINGLE SOURCE OF TRUTH
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical devices or production, set the actual backend URL
const isAndroid = Platform.OS === "android";
const DEV_API_URL = isAndroid
  ? "https://ec8f-2409-40e4-2010-5b-7d7b-9237-3b24-6828.ngrok-free.app"
  : "http://localhost:8080";

// Production API URL — change this for deployment
export const API_URL = __DEV__
  ? DEV_API_URL
  : "https://ec8f-2409-40e4-2010-5b-7d7b-9237-3b24-6828.ngrok-free.app";

// Forecasting API URL — separate backend service
export const FORECASTING_API_URL = __DEV__
  ? "http://localhost:8000"
  : "https://forecasting.fc.bitbrains.fun";

// Environment
export const IS_DEV = __DEV__;

// App settings
export const APP_NAME = "FairChain";
export const APP_VERSION = "1.0.0";
