import type { Request, Response, NextFunction } from 'express';
import { PrismaClient, ProductCategory, ProductStatus } from '../generated/prisma';

const prisma = new PrismaClient();

export class ProduceController {
  /**
   * Get all produce items
   */
  async getAllProduce(req: Request, res: Response) {
    try {
      const { category, status, sort, order, limit = 10, page = 1 } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      if (category) {
        filter.category = category as ProductCategory;
      }
      
      if (status) {
        filter.status = status as ProductStatus;
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build sort object
      const orderBy: any = {};
      if (sort) {
        orderBy[sort as string] = order === 'desc' ? 'desc' : 'asc';
      } else {
        orderBy.createdAt = 'desc';
      }
      
      // Get produce with count
      const [produce, total] = await Promise.all([
        prisma.product.findMany({
          where: filter,
          orderBy,
          skip,
          take: Number(limit),
          include: {
            farmer: {
              select: {
                id: true,
                name: true,
                email: true,
                farmerProfile: true
              }
            }
          }
        }),
        prisma.product.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          produce,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting produce:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get produce', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get produce by ID
   */
  async getProduceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const produce = await prisma.product.findUnique({
        where: { id },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              email: true,
              farmerProfile: true
            }
          },
          productAnalytics: true
        }
      });
      
      if (!produce) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Produce not found' 
        });
      }
      
      // Update view count in analytics
      if (produce.productAnalytics) {
        await prisma.productAnalytics.update({
          where: { productId: id },
          data: {
            viewCount: { increment: 1 }
          }
        });
      }
      
      return res.status(200).json({
        status: 'success',
        data: produce
      });
    } catch (error: any) {
      console.error('Error getting produce:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get produce', 
        error: error.message 
      });
    }
  }
  
  /**
   * Create new produce
   */
  async createProduce(req: Request, res: Response) {
    try {
      const { 
        name, 
        description, 
        category,
        quantity,
        unit,
        basePrice,
        finalPrice,
        harvestDate,
        availableUntil,
        organicCertified,
        images,
        location
      } = req.body;
      
      // Get user ID from auth middleware
      const userId = req.user.id;
      
      // Check if user is a farmer
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { farmerProfile: true }
      });
      
      if (!user || !user.farmerProfile) {
        return res.status(403).json({
          status: 'error',
          message: 'Only farmers can create produce'
        });
      }
      
      // Create produce
      const produce = await prisma.product.create({
        data: {
          name,
          description,
          farmerId: userId,
          category,
          quantity,
          unit,
          basePrice,
          finalPrice: finalPrice || basePrice,
          harvestDate: new Date(harvestDate),
          availableUntil: new Date(availableUntil),
          status: ProductStatus.LISTED,
          location,
          organicCertified: organicCertified || false,
          images: images || []
        }
      });
      
      // Create product analytics
      await prisma.productAnalytics.create({
        data: {
          productId: produce.id,
          viewCount: 0,
          demandScore: 0,
          priceHistory: [
            { price: produce.basePrice, timestamp: new Date().toISOString() }
          ]
        }
      });
      
      return res.status(201).json({
        status: 'success',
        data: produce
      });
    } catch (error: any) {
      console.error('Error creating produce:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create produce', 
        error: error.message 
      });
    }
  }
  
  /**
   * Update produce
   */
  async updateProduce(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Check if produce exists and belongs to user
      const existingProduce = await prisma.product.findUnique({
        where: { id }
      });
      
      if (!existingProduce) {
        return res.status(404).json({
          status: 'error',
          message: 'Produce not found'
        });
      }
      
      // Check ownership or admin rights
      if (existingProduce.farmerId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this produce'
        });
      }
      
      // Update produce
      const updatedProduce = await prisma.product.update({
        where: { id },
        data: req.body
      });
      
      // If price was updated, add to price history
      if (req.body.basePrice || req.body.finalPrice) {
        const analytics = await prisma.productAnalytics.findUnique({
          where: { productId: id }
        });
        
        if (analytics) {
          const priceHistory = analytics.priceHistory as any[] || [];
          priceHistory.push({
            price: req.body.finalPrice || req.body.basePrice,
            timestamp: new Date().toISOString()
          });
          
          await prisma.productAnalytics.update({
            where: { productId: id },
            data: { priceHistory }
          });
        }
      }
      
      return res.status(200).json({
        status: 'success',
        data: updatedProduce
      });
    } catch (error: any) {
      console.error('Error updating produce:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update produce', 
        error: error.message 
      });
    }
  }
  
  /**
   * Delete produce
   */
  async deleteProduce(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Check if produce exists and belongs to user
      const existingProduce = await prisma.product.findUnique({
        where: { id }
      });
      
      if (!existingProduce) {
        return res.status(404).json({
          status: 'error',
          message: 'Produce not found'
        });
      }
      
      // Check ownership or admin rights
      if (existingProduce.farmerId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete this produce'
        });
      }
      
      // Delete produce analytics first (due to foreign key constraint)
      await prisma.productAnalytics.deleteMany({
        where: { productId: id }
      });
      
      // Delete produce
      await prisma.product.delete({
        where: { id }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Produce deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting produce:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to delete produce', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get produce by farmer ID
   */
  async getProduceByFarmerId(req: Request, res: Response) {
    try {
      const { farmerId } = req.params;
      const { status, limit = 10, page = 1 } = req.query;
      
      // Build filter object
      const filter: any = { farmerId };
      
      if (status) {
        filter.status = status as ProductStatus;
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get produce with count
      const [produce, total] = await Promise.all([
        prisma.product.findMany({
          where: filter,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          include: {
            productAnalytics: true
          }
        }),
        prisma.product.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          produce,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting farmer produce:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get farmer produce', 
        error: error.message 
      });
    }
  }

  /**
   * Get produce for the current logged-in farmer
   */
  async getMyProduce(req: Request, res: Response) {
    try {
      
      // Get the farmer ID from authenticated user
      const farmerId = req.user.id;
      const { status, limit = 10, page = 1 } = req.query;
      
      // Build filter object
      const filter: any = { farmerId };
      
      if (status) {
        filter.status = status as ProductStatus;
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get produce with count
      const [produce, total] = await Promise.all([
        prisma.product.findMany({
          where: filter,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          include: {
            productAnalytics: true
          }
        }),
        prisma.product.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          produce,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting your produce:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get your produce', 
        error: error.message 
      });
    }
  }
} 