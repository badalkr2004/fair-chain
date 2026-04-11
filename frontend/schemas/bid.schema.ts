import { z } from 'zod';

export const createBidSchema = z.object({
  productId: z.string().uuid(),
  price: z.coerce.number().positive('Price must be positive'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  serviceType: z.string().min(1, 'Service type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  validUntil: z.string().optional(),
  terms: z.string().optional(),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;

export const respondBidSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT']),
  reason: z.string().optional(),
});

export type RespondBidInput = z.infer<typeof respondBidSchema>;
