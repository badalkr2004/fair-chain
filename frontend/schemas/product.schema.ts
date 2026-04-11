import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  category: z.enum(['GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'POULTRY', 'OTHER']),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  basePrice: z.coerce.number().positive('Price must be positive'),
  harvestDate: z.string().optional(),
  availableUntil: z.string().optional(),
  organicCertified: z.boolean().default(false),
  images: z.array(z.string()).default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
