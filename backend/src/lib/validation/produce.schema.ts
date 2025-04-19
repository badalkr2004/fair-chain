import { z } from 'zod';
import { ProductCategory, ProductStatus } from '../../generated/prisma';

// Schema for creating a new produce
export const createProduceSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
    category: z.nativeEnum(ProductCategory, {
      errorMap: () => ({ message: 'Invalid product category' })
    }),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    basePrice: z.number().positive('Base price must be positive'),
    finalPrice: z.number().positive('Final price must be positive').optional(),
    harvestDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Harvest date must be a valid date'
    }),
    availableUntil: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Available until date must be a valid date'
    }),
    organicCertified: z.boolean().optional(),
    images: z.array(z.string().url('Image must be a valid URL')).optional(),
    location: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  })
});

// Schema for updating an existing produce
export const updateProduceSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000).optional(),
    category: z.nativeEnum(ProductCategory, {
      errorMap: () => ({ message: 'Invalid product category' })
    }).optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    unit: z.string().min(1, 'Unit is required').optional(),
    basePrice: z.number().positive('Base price must be positive').optional(),
    finalPrice: z.number().positive('Final price must be positive').optional(),
    harvestDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Harvest date must be a valid date'
    }).optional(),
    availableUntil: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Available until date must be a valid date'
    }).optional(),
    status: z.nativeEnum(ProductStatus, {
      errorMap: () => ({ message: 'Invalid product status' })
    }).optional(),
    organicCertified: z.boolean().optional(),
    images: z.array(z.string().url('Image must be a valid URL')).optional(),
    location: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  })
}); 