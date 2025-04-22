import {
  UserFormData,
  FarmerFormData,
  ConsumerFormData,
  UserRole,
  IntermediaryFormData,
} from "@/types/auth";

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  farmerProfile?: {
    farmSize: number;
    location: string;
    cropTypes: string[];
    certifications: string[];
  };
  buyerProfile?: {
    businessName: string;
    businessType: string;
    location: string;
  };
  intermediaryProfile?: {
    type: "LOGISTICS" | "AGGREGATOR" | "STORAGE" | "PROCESSOR";
    serviceAreas: string[];
    services: string[];
    licenseNumber?: string;
    capacity?: Record<string, any>; // Optional: can be shaped like { storageCapacity: number, transportCapacity: number }
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  farmerId: string;
  category:
    | "GRAINS"
    | "VEGETABLES"
    | "FRUITS"
    | "DAIRY"
    | "MEAT"
    | "POULTRY"
    | "OTHER";
  quantity: number;
  unit: string;
  basePrice: number;
  finalPrice?: number;
  images: string[];
  harvestDate?: string;
  availableUntil?: string;
  status: "DRAFT" | "LISTED" | "SOLD" | "PROCESSING" | "EXPIRED" | "CANCELLED";
  location?: any;
  organicCertified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: string;
  productId: string;
  consumerId: string;
  quantity: number;
  price: number;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

// Supply Chain Types
export interface SupplyChain {
  id: string;
  productId: string;
  stages: {
    stage: string;
    timestamp: string;
    location: string;
    status: string;
  }[];
}

// Forecast Types
export interface Forecast {
  id: string;
  productId: string;
  predictedPrice: number;
  confidence: number;
  timestamp: string;
}

// Traceability Types
export interface Traceability {
  id: string;
  productId: string;
  events: {
    type: string;
    timestamp: string;
    location: string;
    details: string;
  }[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface RegistrationFormData {
  user: UserFormData;
  profile: FarmerFormData | ConsumerFormData;
  role: UserRole;
}
