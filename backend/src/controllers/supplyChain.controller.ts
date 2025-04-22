import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export class SupplyChainController {
  /**
   * Get all supply chains
   */
  async getAllSupplyChains(req: Request, res: Response) {
    try {
      const { productId, isComplete, limit = 10, page = 1 } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      if (productId) {
        filter.productId = productId as string;
      }
      
      if (isComplete !== undefined) {
        filter.isComplete = isComplete === 'true';
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get supply chains with count
      const [supplyChains, total] = await Promise.all([
        prisma.supplyChain.findMany({
          where: filter,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                farmer: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }),
        prisma.supplyChain.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          supplyChains,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting supply chains:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get supply chains', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get supply chain by ID
   */
  async getSupplyChainById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const supplyChain = await prisma.supplyChain.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              farmer: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          links: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              },
              toUser: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      });
      
      if (!supplyChain) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Supply chain not found' 
        });
      }
      
      return res.status(200).json({
        status: 'success',
        data: supplyChain
      });
    } catch (error: any) {
      console.error('Error getting supply chain:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get supply chain', 
        error: error.message 
      });
    }
  }
  
  /**
   * Create new supply chain
   */
  async createSupplyChain(req: Request, res: Response) {
    try {
      const { 
        name, 
        description, 
        productId,
        startDate,
        endDate
      } = req.body;
      
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { farmer: true }
      });
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      // Check if user is authorized (admin, product owner or intermediary)
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole !== 'ADMIN' && userRole !== 'INTERMEDIARY' && product.farmerId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to create a supply chain for this product'
        });
      }
      
      // Create supply chain
      const supplyChain = await prisma.supplyChain.create({
        data: {
          name,
          description,
          productId,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
          isComplete: false,
          createdById: userId
        }
      });
      
      // Create initial supply chain link (production)
      await prisma.supplyChainLink.create({
        data: {
          supplyChainId: supplyChain.id,
          type: 'PRODUCTION',
          fromUserId: product.farmerId,
          toUserId: product.farmerId, // Initially the same as 'from' for production
          timestamp: new Date(),
          location: product.location || { lat: 0, lng: 0 },
          details: {
            productName: product.name,
            harvestDate: product.harvestDate,
            quantity: product.quantity,
            unit: product.unit
          }
        }
      });
      
      return res.status(201).json({
        status: 'success',
        data: supplyChain
      });
    } catch (error: any) {
      console.error('Error creating supply chain:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create supply chain', 
        error: error.message 
      });
    }
  }
  
  /**
   * Update supply chain
   */
  async updateSupplyChain(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if supply chain exists
      const existingSupplyChain = await prisma.supplyChain.findUnique({
        where: { id },
        include: { product: true }
      });
      
      if (!existingSupplyChain) {
        return res.status(404).json({
          status: 'error',
          message: 'Supply chain not found'
        });
      }
      
      // Check if user is authorized (admin, creator, or product owner)
      if (
        userRole !== 'ADMIN' && 
        existingSupplyChain.createdById !== userId && 
        existingSupplyChain.product.farmerId !== userId
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this supply chain'
        });
      }
      
      // Update supply chain
      const updatedSupplyChain = await prisma.supplyChain.update({
        where: { id },
        data: req.body
      });
      
      return res.status(200).json({
        status: 'success',
        data: updatedSupplyChain
      });
    } catch (error: any) {
      console.error('Error updating supply chain:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update supply chain', 
        error: error.message 
      });
    }
  }
  
  /**
   * Delete supply chain
   */
  async deleteSupplyChain(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if supply chain exists
      const existingSupplyChain = await prisma.supplyChain.findUnique({
        where: { id },
        include: { product: true }
      });
      
      if (!existingSupplyChain) {
        return res.status(404).json({
          status: 'error',
          message: 'Supply chain not found'
        });
      }
      
      // Check if user is authorized (admin, creator, or product owner)
      if (
        userRole !== 'ADMIN' && 
        existingSupplyChain.createdById !== userId && 
        existingSupplyChain.product.farmerId !== userId
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete this supply chain'
        });
      }
      
      // Delete supply chain links first (due to foreign key constraints)
      await prisma.supplyChainLink.deleteMany({
        where: { supplyChainId: id }
      });
      
      // Delete supply chain
      await prisma.supplyChain.delete({
        where: { id }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Supply chain deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting supply chain:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to delete supply chain', 
        error: error.message 
      });
    }
  }
  
  /**
   * Add link to supply chain
   */
  async addSupplyChainLink(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        type,
        from,
        to,
        location,
        timestamp,
        details,
        carbonFootprint,
        certifications
      } = req.body;
      
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if supply chain exists
      const existingSupplyChain = await prisma.supplyChain.findUnique({
        where: { id },
        include: { 
          product: true,
          links: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
      
      if (!existingSupplyChain) {
        return res.status(404).json({
          status: 'error',
          message: 'Supply chain not found'
        });
      }
      
      // Check if users exist
      const fromUser = await prisma.user.findUnique({ where: { id: from } });
      const toUser = await prisma.user.findUnique({ where: { id: to } });
      
      if (!fromUser || !toUser) {
        return res.status(404).json({
          status: 'error',
          message: 'One or both users in the link not found'
        });
      }
      
      // Check if chain is already complete
      if (existingSupplyChain.isComplete) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot add links to a completed supply chain'
        });
      }
      
      // Create the supply chain link
      const newLink = await prisma.supplyChainLink.create({
        data: {
          supplyChainId: id,
          type,
          fromUserId: from,
          toUserId: to,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          location,
          details,
          carbonFootprint,
          certifications
        }
      });
      
      // Check if this is a delivery to consumer (RETAIL link)
      if (type === 'RETAIL' && toUser.role === 'CONSUMER') {
        // Mark supply chain as complete
        await prisma.supplyChain.update({
          where: { id },
          data: { 
            isComplete: true,
            endDate: new Date()
          }
        });
      }
      
      return res.status(201).json({
        status: 'success',
        data: newLink
      });
    } catch (error: any) {
      console.error('Error adding supply chain link:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to add supply chain link', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get product supply chain
   */
  async getProductSupplyChain(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      // Find the active supply chain for this product
      const supplyChain = await prisma.supplyChain.findFirst({
        where: { 
          productId,
          OR: [
            { isComplete: false },
            { isComplete: true, endDate: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          links: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              },
              toUser: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      });
      
      if (!supplyChain) {
        return res.status(404).json({
          status: 'error',
          message: 'No active supply chain found for this product'
        });
      }
      
      return res.status(200).json({
        status: 'success',
        data: supplyChain
      });
    } catch (error: any) {
      console.error('Error getting product supply chain:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get product supply chain', 
        error: error.message 
      });
    }
  }
} 