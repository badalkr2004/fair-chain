import { z } from 'zod';

// Schema for creating a new bid
export const createBidSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    price: z.number().positive('Price must be positive'),
    quantity: z.number().positive('Quantity must be positive'),
    serviceType: z.enum(['LOGISTICS', 'STORAGE', 'PROCESSING', 'DISTRIBUTION', 'PACKAGING']),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
    validUntil: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid until date must be a valid date'
    }).optional(),
    terms: z.string().optional()
  })
});

// Schema for updating an existing bid
export const updateBidSchema = z.object({
  body: z.object({
    price: z.number().positive('Price must be positive').optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000).optional(),
    validUntil: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid until date must be a valid date'
    }).optional(),
    terms: z.string().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  })
});

// Schema for responding to a bid
export const respondToBidSchema = z.object({
  body: z.object({
    action: z.enum(['ACCEPT', 'REJECT'], {
      errorMap: () => ({ message: 'Action must be either ACCEPT or REJECT' })
    }),
    reason: z.string().optional()
  })
}); 