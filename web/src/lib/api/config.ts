export const API_BASE_URL = "https://api.fc.bitbrains.fun";

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
  },
  farmer: {
    profile: '/farmer/profile',
  },
  products: {
    list: '/products',
    create: '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  produce: {
    list: '/produce',
    myProduce: '/produce/my-produce',
    create: '/produce',
    update: (id: string) => `/produce/${id}`,
    delete: (id: string) => `/produce/${id}`,
  },
  orders: {
    list: '/orders',
    create: '/orders',
    update: (id: string) => `/orders/${id}`,
  },
  bids: {
    list: '/bids',
    create: '/bids',
    update: (id: string) => `/bids/${id}`,
  },
  transactions: {
    list: '/transactions',
    create: '/transactions',
    update: (id: string) => `/transactions/${id}`,
  },
  supplyChain: {
    track: (id: string) => `/supply-chain/${id}`,
  },
  forecast: {
    get: '/forecast',
  },
  traceability: {
    get: (id: string) => `/trace/${id}`,
  },
}; 