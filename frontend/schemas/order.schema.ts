import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().positive(),
  })).min(1, 'At least one item is required'),
  deliveryAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
