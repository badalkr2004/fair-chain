export enum ProductCategory {
  RICE = 'RICE',
  WHEAT = 'WHEAT',
  CORN = 'CORN',
  SUGARCANE = 'SUGARCANE',
  COTTON = 'COTTON',
  VEGETABLES = 'VEGETABLES',
  FRUITS = 'FRUITS',
  OTHER = 'OTHER'
}

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface Farmer {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  location: {
    lat: number;
    lng: number;
  };
  farmSize: number;
  crops: ProductCategory[];
  rating?: number;
  profileImage?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
  basePrice: number;
  finalPrice: number;
  images: string[];
  farmerId: string;
  farmer?: Farmer;
  harvestDate: Date;
  availableUntil: Date;
  isCertified: boolean;
  certifications?: string[];
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
} 