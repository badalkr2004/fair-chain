import api from './api';

export interface SupplyChain {
  id: string;
  productId: string;
  startDate: string;
  endDate?: string;
  isComplete: boolean;
  name?: string;
  description?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  links: SupplyChainLink[];
  product?: any;
}

export interface SupplyChainLink {
  id: string;
  supplyChainId: string;
  type: string;
  fromUserId: string;
  toUserId: string;
  timestamp: string;
  location?: any;
  details?: any;
  carbonFootprint?: number;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
  serviceProviderId?: string;
  serviceProvider?: any;
}

export interface CreateSupplyChainDTO {
  productId: string;
  name?: string;
  description?: string;
}

export interface SupplyChainLinkDTO {
  type: string;
  fromUserId: string;
  toUserId: string;
  location?: any;
  details?: any;
  carbonFootprint?: number;
  certifications?: string[];
  serviceProviderId?: string;
}

export const getAllSupplyChains = async () => {
  try {
    return await api.get('/supply-chain');
  } catch (error) {
    console.error('Error fetching supply chains:', error);
    throw error;
  }
};

export const getSupplyChainById = async (id: string) => {
  try {
    return await api.get(`/supply-chain/${id}`);
  } catch (error) {
    console.error(`Error fetching supply chain with id ${id}:`, error);
    throw error;
  }
};

export const getSupplyChainByProductId = async (productId: string) => {
  try {
    return await api.get(`/supply-chain/product/${productId}`);
  } catch (error) {
    console.error(`Error fetching supply chain for product ${productId}:`, error);
    throw error;
  }
};

export const createSupplyChain = async (data: CreateSupplyChainDTO) => {
  try {
    return await api.post('/supply-chain', data);
  } catch (error) {
    console.error('Error creating supply chain:', error);
    throw error;
  }
};

export const updateSupplyChain = async (id: string, data: Partial<CreateSupplyChainDTO>) => {
  try {
    return await api.put(`/supply-chain/${id}`, data);
  } catch (error) {
    console.error(`Error updating supply chain ${id}:`, error);
    throw error;
  }
};

export const deleteSupplyChain = async (id: string) => {
  try {
    return await api.delete(`/supply-chain/${id}`);
  } catch (error) {
    console.error(`Error deleting supply chain ${id}:`, error);
    throw error;
  }
};

export const addSupplyChainLink = async (supplyChainId: string, data: SupplyChainLinkDTO) => {
  try {
    return await api.post(`/supply-chain/${supplyChainId}/links`, data);
  } catch (error) {
    console.error(`Error adding link to supply chain ${supplyChainId}:`, error);
    throw error;
  }
}; 