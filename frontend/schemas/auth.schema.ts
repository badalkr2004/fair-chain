import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

const farmerProfileSchema = z.object({
  farmSize: z.coerce.number().positive().optional(),
  farmLocation: z.string().optional(),
  cropTypes: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
});

const intermediaryProfileSchema = z.object({
  type: z.enum(['LOGISTICS', 'AGGREGATOR', 'STORAGE', 'PROCESSOR']),
  serviceAreas: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  licenseNumber: z.string().optional(),
});

const consumerProfileSchema = z.object({
  type: z.enum(['RETAILER', 'END_USER', 'BULK_BUYER']),
  businessName: z.string().optional(),
  taxId: z.string().optional(),
  preferences: z.array(z.string()).default([]),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['FARMER', 'INTERMEDIARY', 'CONSUMER']),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  profileData: z.union([farmerProfileSchema, intermediaryProfileSchema, consumerProfileSchema]),
});

export type SignupInput = z.infer<typeof signupSchema>;
