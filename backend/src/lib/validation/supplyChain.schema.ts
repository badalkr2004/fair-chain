import { z } from 'zod';

// Schema for creating a new supply chain
export const createSupplyChainSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000).optional(),
    productId: z.string().uuid('Invalid product ID'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Start date must be a valid date'
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'End date must be a valid date'
    }).optional()
  })
});

// Schema for updating an existing supply chain
export const updateSupplyChainSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000).optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'End date must be a valid date'
    }).optional(),
    isComplete: z.boolean().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  })
});

// Schema for adding a link to supply chain
export const addSupplyChainLinkSchema = z.object({
  body: z.object({
    type: z.enum(['PRODUCTION', 'PROCESSING', 'TRANSPORTATION', 'STORAGE', 'DISTRIBUTION', 'RETAIL']),
    from: z.string().uuid('Invalid from user ID'),
    to: z.string().uuid('Invalid to user ID'),
    location: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Timestamp must be a valid date'
    }).optional(),
    details: z.record(z.any()).optional(),
    carbonFootprint: z.number().nonnegative('Carbon footprint must be a non-negative number').optional(),
    certifications: z.array(z.string()).optional()
  })
}); 