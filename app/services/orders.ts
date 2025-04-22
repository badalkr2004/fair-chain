import api from './api';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderDTO {
  items: OrderItem[];
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
}

export interface Order {
  id: string;
  orderId: string;
  buyerId: string;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product?: any;
  }[];
}

// Create a new order
export const createOrder = async (orderData: CreateOrderDTO) => {
  try {
    return await api.post('/orders', orderData);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get order details by ID
export const getOrderById = async (id: string) => {
  try {
    return await api.get(`/orders/${id}`);
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

// Get all orders for the current user (consumer)
export const getMyOrders = async () => {
  try {
    return await api.get('/orders/my/orders');
  } catch (error) {
    console.error('Error fetching my orders:', error);
    throw error;
  }
};

// Get all orders for the current farmer
export const getFarmerOrders = async () => {
  try {
    return await api.get('/orders/farmer/orders');
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  try {
    return await api.put(`/orders/${id}/status`, { status });
  } catch (error) {
    console.error(`Error updating order ${id} status:`, error);
    throw error;
  }
};

// Cancel an order
export const cancelOrder = async (id: string, reason?: string) => {
  try {
    return await api.post(`/orders/${id}/cancel`, { reason });
  } catch (error) {
    console.error(`Error cancelling order ${id}:`, error);
    throw error;
  }
};

// Get order tracking information
export const getOrderTracking = async (id: string) => {
  try {
    return await api.get(`/orders/${id}/tracking`);
  } catch (error) {
    console.error(`Error fetching tracking for order ${id}:`, error);
    throw error;
  }
};

// Get products purchased by the current user
export const getPurchasedProducts = async () => {
  try {
    return await api.get('/orders/purchased-products');
  } catch (error) {
    console.error('Error fetching purchased products:', error);
    throw error;
  }
};