export enum UserRole {
  FARMER = "FARMER",
  CONSUMER = "CONSUMER",
  BUYER = "BUYER",
  ADMIN = "ADMIN",
  INTERMEDIARY = "INTERMEDIARY",
}

export enum IntermediaryType {
  LOGISTICS = "LOGISTICS",
  AGGREGATOR = "AGGREGATOR",
  STORAGE = "STORAGE",
  PROCESSOR = "PROCESSOR",
}

export enum ConsumerType {
  RETAILER = "RETAILER",
  END_USER = "END_USER",
  BULK_BUYER = "BULK_BUYER",
}

export interface UserFormData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface FarmerFormData {
  farmSize?: number;
  farmLocation?: string;
  cropTypes: string[];
  certifications: string[];
}
export interface IntermediaryFormData {
  type: IntermediaryType;
  serviceAreas: string[];
  services: string[];
  licenseNumber?: string;
  capacity?: Record<string, any>;
}
export interface ConsumerFormData {
  type: ConsumerType;
  businessName?: string;
  taxId?: string;
  preferences: string[];
}

export interface RegistrationFormData {
  user: UserFormData;
  profile: FarmerFormData | ConsumerFormData;
  role: UserRole;
}
