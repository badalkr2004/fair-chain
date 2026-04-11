export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const APP_NAME = 'FairChain';
export const APP_DESCRIPTION = 'AI-Powered Transparent Agri-Marketplace';

export const PRODUCT_CATEGORIES = [
  { value: 'GRAINS', label: 'Grains' },
  { value: 'VEGETABLES', label: 'Vegetables' },
  { value: 'FRUITS', label: 'Fruits' },
  { value: 'DAIRY', label: 'Dairy' },
  { value: 'MEAT', label: 'Meat' },
  { value: 'POULTRY', label: 'Poultry' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const PRODUCT_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'LISTED', label: 'Listed' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export const BID_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
] as const;

export const SERVICE_TYPES = [
  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'AGGREGATOR', label: 'Aggregator' },
] as const;

export const PRODUCT_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'ton', label: 'Tons' },
  { value: 'quintal', label: 'Quintals' },
  { value: 'litre', label: 'Litres' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'piece', label: 'Pieces' },
] as const;

export const INTERMEDIARY_TYPES = [
  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'AGGREGATOR', label: 'Aggregator' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'PROCESSOR', label: 'Processor' },
] as const;

export const CONSUMER_TYPES = [
  { value: 'RETAILER', label: 'Retailer' },
  { value: 'END_USER', label: 'End User' },
  { value: 'BULK_BUYER', label: 'Bulk Buyer' },
] as const;
