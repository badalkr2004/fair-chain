// ─── Enums ───────────────────────────────────────────────

export type UserRole = 'FARMER' | 'INTERMEDIARY' | 'CONSUMER' | 'ADMIN';
export type IntermediaryType = 'LOGISTICS' | 'AGGREGATOR' | 'STORAGE' | 'PROCESSOR';
export type ConsumerType = 'RETAILER' | 'END_USER' | 'BULK_BUYER';
export type ProductCategory = 'GRAINS' | 'VEGETABLES' | 'FRUITS' | 'DAIRY' | 'MEAT' | 'POULTRY' | 'OTHER';
export type ProductStatus = 'DRAFT' | 'LISTED' | 'SOLD' | 'PROCESSING' | 'EXPIRED' | 'CANCELLED';
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type TransactionType = 'PAYMENT' | 'REFUND' | 'COMMISSION' | 'ESCROW_DEPOSIT' | 'ESCROW_RELEASE' | 'PURCHASE' | 'SALE' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'PAID' | 'DELIVERED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// ─── Users ───────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  location?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  farmerProfile?: FarmerProfile | null;
  intermediaryProfile?: IntermediaryProfile | null;
  consumerProfile?: ConsumerProfile | null;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  farmSize?: number | null;
  farmLocation?: string | null;
  farmCoordinates?: Record<string, unknown> | null;
  cropTypes: string[];
  certifications: string[];
  bankDetails?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntermediaryProfile {
  id: string;
  userId: string;
  type: IntermediaryType;
  serviceAreas: string[];
  capacity?: Record<string, unknown> | null;
  services: string[];
  licenseNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumerProfile {
  id: string;
  userId: string;
  type: ConsumerType;
  businessName?: string | null;
  taxId?: string | null;
  purchaseHistory?: Record<string, unknown> | null;
  preferences: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Products ────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  farmerId: string;
  farmer?: Pick<User, 'id' | 'name' | 'email'> & { farmerProfile?: FarmerProfile | null };
  category: ProductCategory;
  quantity: number;
  unit: string;
  basePrice: number;
  finalPrice?: number | null;
  images: string[];
  harvestDate?: string | null;
  availableUntil?: string | null;
  status: ProductStatus;
  location?: Record<string, unknown> | null;
  organicCertified: boolean;
  createdAt: string;
  updatedAt: string;
  productAnalytics?: ProductAnalytics | null;
  supplyChain?: SupplyChain | null;
  bids?: Bid[];
}

export interface ProductAnalytics {
  id: string;
  productId: string;
  viewCount: number;
  demandScore?: number | null;
  priceHistory: Array<{ price: number; timestamp: string }>;
  seasonalTrends?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Bids ────────────────────────────────────────────────

export interface Bid {
  id: string;
  productId: string;
  product?: Pick<Product, 'id' | 'name' | 'category' | 'quantity' | 'unit' | 'basePrice' | 'status' | 'images'> & {
    farmer?: Pick<User, 'id' | 'name'>;
  };
  intermediaryId: string;
  intermediary?: Pick<User, 'id' | 'name' | 'email' | 'role'> & {
    intermediaryProfile?: IntermediaryProfile | null;
  };
  price: number;
  quantity: number;
  serviceType: string;
  description: string;
  validUntil: string;
  terms?: string | null;
  status: BidStatus;
  responseReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Orders ──────────────────────────────────────────────

export interface Order {
  id: string;
  orderId: string;
  buyerId: string;
  buyer?: Pick<User, 'id' | 'name' | 'email'>;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress?: Record<string, unknown> | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  transactions?: Transaction[];
  traceability?: TraceabilityRecord[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Transactions ────────────────────────────────────────

export interface Transaction {
  id: string;
  productId?: string | null;
  product?: Pick<Product, 'id' | 'name' | 'category' | 'images'> | null;
  senderId: string;
  sender?: Pick<User, 'id' | 'name' | 'role'>;
  receiverId: string;
  receiver?: Pick<User, 'id' | 'name' | 'role'>;
  amount: number;
  quantity?: number | null;
  unit?: string | null;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paymentDate?: string | null;
  deliveryDate?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  transactionId?: string | null;
  orderId?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Supply Chain ────────────────────────────────────────

export interface SupplyChain {
  id: string;
  productId: string;
  product?: Pick<Product, 'id' | 'name' | 'category'> & {
    farmer?: Pick<User, 'id' | 'name'>;
  };
  startDate: string;
  endDate?: string | null;
  isComplete: boolean;
  name?: string | null;
  description?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  links?: SupplyChainLink[];
}

export interface SupplyChainLink {
  id: string;
  supplyChainId: string;
  type: string;
  fromUserId: string;
  fromUser?: Pick<User, 'id' | 'name' | 'role'>;
  toUserId: string;
  toUser?: Pick<User, 'id' | 'name' | 'role'>;
  timestamp: string;
  location?: Record<string, unknown> | null;
  details?: Record<string, unknown> | null;
  carbonFootprint?: number | null;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Traceability ────────────────────────────────────────

export interface TraceabilityRecord {
  id: string;
  productId: string;
  product?: Product;
  orderId?: string | null;
  order?: Pick<Order, 'id' | 'orderId' | 'status' | 'createdAt'> & {
    buyer?: Pick<User, 'name'>;
  } | null;
  qrCode?: string | null;
  trackingId?: string | null;
  eventType: string;
  location?: Record<string, unknown> | null;
  timestamp: string;
  verifiedBy?: string | null;
  metadata?: Record<string, unknown> | null;
  previousHash?: string | null;
  currentHash?: string | null;
  createdAt: string;
}

export interface TraceabilityTimeline {
  id: string;
  eventType: string;
  timestamp: string;
  location?: Record<string, unknown> | null;
  trackingId?: string | null;
  verifiedBy?: string | null;
  order?: {
    id: string;
    orderId: string;
    status: string;
    buyerName: string;
    date: string;
  } | null;
  metadata?: Record<string, unknown> | null;
  hash?: string | null;
}

// ─── Forecasting ─────────────────────────────────────────

export interface Prediction {
  id: string;
  modelId: string;
  model?: { name: string; type: string; accuracy?: number | null };
  category?: ProductCategory | null;
  region?: string | null;
  predictionDate: string;
  predictedValue: number;
  actualValue?: number | null;
  accuracy?: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketPrice {
  id: string;
  productCategory: ProductCategory;
  location: string;
  date: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  source?: string | null;
  createdAt: string;
}

// ─── API Response Types ──────────────────────────────────

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  status?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: {
    [key: string]: any;
    pagination: Pagination;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  message?: string;
}
