import api from './api';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  product?: any;
}

export interface Order {
  id: string;
  orderId: string;
  buyerId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  deliveryAddress?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  buyer?: any;
}

export interface CreateOrderDTO {
  items: {
    productId: string;
    quantity: number;
  }[];
  deliveryAddress?: any;
  notes?: string;
}

export interface UpdateOrderStatusDTO {
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
}

export const createOrder = async (orderData: CreateOrderDTO) => {
  try {
    return await api.post('/orders', orderData);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrderById = async (id: string) => {
  try {
    return await api.get(`/orders/${id}`);
  } catch (error) {
    console.error(`Error fetching order with id ${id}:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, statusData: UpdateOrderStatusDTO) => {
  try {
    return await api.put(`/orders/${id}/status`, statusData);
  } catch (error) {
    console.error(`Error updating order status for order ${id}:`, error);
    throw error;
  }
};

export const getMyOrders = async () => {
  try {
    return await api.get('/orders/my/orders');
  } catch (error) {
    console.error('Error fetching my orders:', error);
    throw error;
  }
};

export const getFarmerOrders = async () => {
  try {
    return await api.get('/orders/farmer/orders');
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    return await api.get('/orders');
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
}; 