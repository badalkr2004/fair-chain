import type { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export class BidController {
  /**
   * Create a new bid from an intermediary
   */
  async createBid(req: Request, res: Response) {
    try {
      const { 
        productId, 
        price, 
        quantity,
        serviceType, // 'LOGISTICS', 'STORAGE', 'PROCESSING', etc.
        description,
        validUntil,
        terms 
      } = req.body;
      
      // Get intermediary ID from auth middleware
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Verify the user is an intermediary
      if (userRole !== 'INTERMEDIARY' && userRole !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Only intermediaries can submit bids'
        });
      }
      
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
      
      // Check if bid quantity is valid
      if (quantity > product.quantity) {
        return res.status(400).json({
          status: 'error',
          message: 'Bid quantity cannot exceed product quantity'
        });
      }
      
      // Create the bid
      const bid = await prisma.bid.create({
        data: {
          productId,
          intermediaryId: userId,
          price,
          quantity,
          serviceType,
          description,
          validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
          terms,
          status: 'PENDING'
        }
      });
      
      // Notify the farmer (in a real implementation, this would send an email or push notification)
      console.log(`New bid created for product ${productId} by intermediary ${userId}`);
      
      return res.status(201).json({
        status: 'success',
        data: bid
      });
    } catch (error: any) {
      console.error('Error creating bid:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create bid', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get all bids for a specific product
   */
  async getProductBids(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { status, limit = 10, page = 1 } = req.query;
      
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
      
      // Get user ID from auth middleware for authorization check
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Only the product owner, bid creators, or admin can view bids
      if (userRole !== 'ADMIN' && product.farmerId !== userId) {
        // Check if the user is one of the bidding intermediaries
        const userBidCount = await prisma.bid.count({
          where: {
            productId,
            intermediaryId: userId
          }
        });
        
        if (userBidCount === 0) {
          return res.status(403).json({
            status: 'error',
            message: 'You are not authorized to view these bids'
          });
        }
      }
      
      // Build filter object
      const filter: any = { productId };
      
      if (status) {
        filter.status = status as string;
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get bids with count
      const [bids, total] = await Promise.all([
        prisma.bid.findMany({
          where: filter,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          include: {
            intermediary: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                intermediaryProfile: true
              }
            }
          }
        }),
        prisma.bid.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          bids,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting product bids:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get product bids', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get all bids made by the current intermediary
   */
  async getMyBids(req: Request, res: Response) {
    try {
      const { status, limit = 10, page = 1 } = req.query;
      
      // Get user ID from auth middleware
      const userId = req.user.id;
      
      // Build filter object
      const filter: any = { intermediaryId: userId };
      
      if (status) {
        filter.status = status as string;
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get bids with count
      const [bids, total] = await Promise.all([
        prisma.bid.findMany({
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
                quantity: true,
                unit: true,
                basePrice: true,
                status: true,
                images: true,
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
        prisma.bid.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          bids,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting intermediary bids:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get intermediary bids', 
        error: error.message 
      });
    }
  }
  
  /**
   * Update a bid (intermediary can update their own bid)
   */
  async updateBid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Get user ID from auth middleware
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if bid exists
      const bid = await prisma.bid.findUnique({
        where: { id }
      });
      
      if (!bid) {
        return res.status(404).json({
          status: 'error',
          message: 'Bid not found'
        });
      }
      
      // Check if user is authorized to update this bid
      if (userRole !== 'ADMIN' && bid.intermediaryId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to update this bid'
        });
      }
      
      // Check if bid is in a state that can be updated
      if (bid.status !== 'PENDING') {
        return res.status(400).json({
          status: 'error',
          message: `Bid cannot be updated as it is already ${bid.status.toLowerCase()}`
        });
      }
      
      // Update the bid
      const updatedBid = await prisma.bid.update({
        where: { id },
        data: req.body
      });
      
      return res.status(200).json({
        status: 'success',
        data: updatedBid
      });
    } catch (error: any) {
      console.error('Error updating bid:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update bid', 
        error: error.message 
      });
    }
  }
  
  /**
   * Cancel a bid (intermediary can cancel their own bid)
   */
  async cancelBid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Get user ID from auth middleware
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if bid exists
      const bid = await prisma.bid.findUnique({
        where: { id }
      });
      
      if (!bid) {
        return res.status(404).json({
          status: 'error',
          message: 'Bid not found'
        });
      }
      
      // Check if user is authorized to cancel this bid
      if (userRole !== 'ADMIN' && bid.intermediaryId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to cancel this bid'
        });
      }
      
      // Check if bid is in a state that can be cancelled
      if (bid.status !== 'PENDING') {
        return res.status(400).json({
          status: 'error',
          message: `Bid cannot be cancelled as it is already ${bid.status.toLowerCase()}`
        });
      }
      
      // Update the bid status to CANCELLED
      const updatedBid = await prisma.bid.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Bid cancelled successfully',
        data: updatedBid
      });
    } catch (error: any) {
      console.error('Error cancelling bid:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to cancel bid', 
        error: error.message 
      });
    }
  }
  
  /**
   * Respond to a bid (farmer can accept or reject a bid)
   */
  async respondToBid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action, reason } = req.body; // action: 'ACCEPT' or 'REJECT'
      
      // Get user ID from auth middleware
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if bid exists
      const bid = await prisma.bid.findUnique({
        where: { id },
        include: {
          product: true
        }
      });
      
      if (!bid) {
        return res.status(404).json({
          status: 'error',
          message: 'Bid not found'
        });
      }
      
      // Check if user is authorized to respond to this bid (only the farmer or admin)
      if (userRole !== 'ADMIN' && bid.product.farmerId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to respond to this bid'
        });
      }
      
      // Check if bid is in a state that can be responded to
      if (bid.status !== 'PENDING') {
        return res.status(400).json({
          status: 'error',
          message: `Bid cannot be ${action.toLowerCase()}ed as it is already ${bid.status.toLowerCase()}`
        });
      }
      
      // Validate action
      if (action !== 'ACCEPT' && action !== 'REJECT') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid action. Must be either "ACCEPT" or "REJECT"'
        });
      }
      
      // Update the bid status based on the action
      const status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
      
      const updatedBid = await prisma.bid.update({
        where: { id },
        data: { 
          status,
          responseReason: reason || null
        }
      });
      
      // If accepted, update the product status if needed
      if (action === 'ACCEPT') {
        // Update product status only if it's still listed
        if (bid.product.status === 'LISTED') {
          await prisma.product.update({
            where: { id: bid.productId },
            data: { status: 'PROCESSING' }
          });
        }
        
        // Create a supply chain if it doesn't exist yet
        const existingSupplyChain = await prisma.supplyChain.findFirst({
          where: { productId: bid.productId }
        });
        
        if (!existingSupplyChain) {
          // Create a new supply chain
          const supplyChain = await prisma.supplyChain.create({
            data: {
              productId: bid.productId,
              startDate: new Date(),
              isComplete: false,
              createdById: userId,
              name: `Supply Chain for ${bid.product.name}`,
              description: `Supply chain for ${bid.product.name} with ${bid.serviceType} services`
            }
          });
          
          // Create initial supply chain link (production)
          await prisma.supplyChainLink.create({
            data: {
              supplyChainId: supplyChain.id,
              type: 'PRODUCTION',
              fromUserId: bid.product.farmerId,
              toUserId: bid.intermediaryId,
              timestamp: new Date(),
              location: bid.product.location || { lat: 0, lng: 0 },
              details: {
                productName: bid.product.name,
                quantity: bid.quantity,
                unit: bid.product.unit,
                bidAmount: bid.price
              }
            }
          });
        }
        
        // Create a transaction record for this bid
        await prisma.transaction.create({
          data: {
            productId: bid.productId,
            senderId: bid.product.farmerId,
            receiverId: bid.intermediaryId,
            amount: bid.price * bid.quantity,
            quantity: bid.quantity,
            unit: bid.product.unit,
            type: 'SALE',
            status: 'PENDING',
            metadata: {
              bidId: bid.id,
              serviceType: bid.serviceType,
              terms: bid.terms
            }
          }
        });
      }
      
      return res.status(200).json({
        status: 'success',
        message: `Bid ${status.toLowerCase()} successfully`,
        data: updatedBid
      });
    } catch (error: any) {
      console.error('Error responding to bid:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to respond to bid', 
        error: error.message 
      });
    }
  }
} 