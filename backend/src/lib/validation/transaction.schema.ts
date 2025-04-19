import { z } from 'zod';

// Schema for creating a new transaction
export const createTransactionSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    senderId: z.string().uuid('Invalid sender ID'),
    receiverId: z.string().uuid('Invalid receiver ID'),
    amount: z.number().positive('Amount must be positive'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    type: z.enum(['PURCHASE', 'SALE', 'TRANSFER']),
    status: z.enum(['PENDING', 'PAID', 'DELIVERED', 'COMPLETED', 'CANCELLED']).optional(),
    paymentMethod: z.enum(['BANK_TRANSFER', 'CASH', 'CREDIT', 'MOBILE_MONEY']).optional(),
    notes: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })
});

// Schema for updating an existing transaction
export const updateTransactionSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PAID', 'DELIVERED', 'COMPLETED', 'CANCELLED']).optional(),
    paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Payment date must be a valid date'
    }).optional(),
    deliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Delivery date must be a valid date'
    }).optional(),
    notes: z.string().optional(),
    paymentReference: z.string().optional(),
    paymentMethod: z.enum(['BANK_TRANSFER', 'CASH', 'CREDIT', 'MOBILE_MONEY']).optional(),
    metadata: z.record(z.any()).optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  })
});

// Schema for processing a payment
export const processPaymentSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(['BANK_TRANSFER', 'CASH', 'CREDIT', 'MOBILE_MONEY']),
    paymentReference: z.string().optional(),
    amount: z.number().positive('Amount must be positive'),
    notes: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })
});

// Schema for recording a delivery
export const recordDeliverySchema = z.object({
  body: z.object({
    deliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Delivery date must be a valid date'
    }).optional(),
    receivedBy: z.string().min(1, 'Received by is required'),
    location: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    notes: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })
}); 