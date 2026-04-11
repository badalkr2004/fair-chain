import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export class TransactionController {
  /**
   * Get all transactions
   */
  async getAllTransactions(req: Request, res: Response) {
    try {
      const { 
        status, 
        type, 
        startDate, 
        endDate, 
        senderId,
        receiverId,
        productId,
        limit = 10, 
        page = 1 
      } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      if (status) {
        filter.status = status as string;
      }
      
      if (type) {
        filter.type = type as string;
      }
      
      if (senderId) {
        filter.senderId = senderId as string;
      }
      
      if (receiverId) {
        filter.receiverId = receiverId as string;
      }
      
      if (productId) {
        filter.productId = productId as string;
      }
      
      // Date filtering
      if (startDate && endDate) {
        filter.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      } else if (startDate) {
        filter.createdAt = {
          gte: new Date(startDate as string)
        };
      } else if (endDate) {
        filter.createdAt = {
          lte: new Date(endDate as string)
        };
      }
      
      // Role-based filtering
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // If not admin, restrict to transactions the user is involved in
      if (userRole !== 'ADMIN') {
        filter.OR = [
          { senderId: userId },
          { receiverId: userId }
        ];
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get transactions with count
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
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
                images: true
              }
            },
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }),
        prisma.transaction.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          transactions,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting transactions:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get transactions', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get transaction by ID
   */
  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              images: true,
              farmerId: true
            }
          },
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
              address: true,
              phone: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              role: true,
              address: true,
              phone: true
            }
          }
        }
      });
      
      if (!transaction) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Transaction not found' 
        });
      }
      
      // Check if user is authorized to view this transaction
      if (
        userRole !== 'ADMIN' && 
        transaction.senderId !== userId && 
        transaction.receiverId !== userId &&
        transaction.product?.farmerId !== userId
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view this transaction'
        });
      }
      
      return res.status(200).json({
        status: 'success',
        data: transaction
      });
    } catch (error: any) {
      console.error('Error getting transaction:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get transaction', 
        error: error.message 
      });
    }
  }
  
  /**
   * Create new transaction
   */
  async createTransaction(req: Request, res: Response) {
    try {
      const { 
        productId, 
        senderId, 
        receiverId,
        amount,
        quantity,
        unit,
        type,
        status = 'PENDING',
        paymentMethod,
        notes,
        metadata
      } = req.body;
      
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
      
      // Check if sender and receiver exist
      const [sender, receiver] = await Promise.all([
        prisma.user.findUnique({ where: { id: senderId } }),
        prisma.user.findUnique({ where: { id: receiverId } })
      ]);
      
      if (!sender || !receiver) {
        return res.status(404).json({
          status: 'error',
          message: 'Sender or receiver not found'
        });
      }
      
      // Check if user is authorized (admin, sender, or receiver)
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole !== 'ADMIN' && userId !== senderId && userId !== receiverId) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to create this transaction'
        });
      }
      
      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          productId,
          senderId,
          receiverId,
          amount,
          quantity,
          unit,
          type,
          status,
          paymentMethod,
          notes,
          metadata
        }
      });
      
      // If status is already PAID, update payment date
      if (status === 'PAID') {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { paymentDate: new Date() }
        });
      }
      
      // If this is a purchase transaction, update product quantity
      if (type === 'PURCHASE') {
        await prisma.product.update({
          where: { id: productId },
          data: {
            quantity: {
              decrement: quantity
            }
          }
        });
      }
      
      return res.status(201).json({
        status: 'success',
        data: transaction
      });
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create transaction', 
        error: error.message 
      });
    }
  }
  
  /**
   * Update transaction
   */
  async updateTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if transaction exists
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
        include: { product: true }
      });
      
      if (!existingTransaction) {
        return res.status(404).json({
          status: 'error',
          message: 'Transaction not found'
        });
      }
      
      // Check if user is authorized (admin, sender, or receiver)
      if (
        userRole !== 'ADMIN' && 
        existingTransaction.senderId !== userId && 
        existingTransaction.receiverId !== userId
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this transaction'
        });
      }
      
      // Special handling for status changes
      if (req.body.status && req.body.status !== existingTransaction.status) {
        // When changing to PAID status, set the payment date
        if (req.body.status === 'PAID' && existingTransaction.status !== 'PAID') {
          req.body.paymentDate = new Date();
        }
        
        // When changing to DELIVERED status, set the delivery date
        if (req.body.status === 'DELIVERED' && existingTransaction.status !== 'DELIVERED') {
          req.body.deliveryDate = new Date();
        }
        
        // When changing to COMPLETED status, ensure both payment and delivery have happened
        if (req.body.status === 'COMPLETED') {
          if (existingTransaction.status !== 'DELIVERED' && existingTransaction.status !== 'PAID') {
            return res.status(400).json({
              status: 'error',
              message: 'Transaction must be both paid and delivered before marking as completed'
            });
          }
        }
        
        // When changing to CANCELLED, restore product quantity if it was a purchase
        if (req.body.status === 'CANCELLED' && existingTransaction.status !== 'CANCELLED') {
          if (existingTransaction.type === 'PURCHASE') {
            await prisma.product.update({
              where: { id: existingTransaction.productId! },
              data: {
                quantity: {
                  increment: existingTransaction.quantity ?? 0
                }
              }
            });
          }
        }
      }
      
      // Update transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: req.body
      });
      
      return res.status(200).json({
        status: 'success',
        data: updatedTransaction
      });
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update transaction', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get transactions by user ID
   */
  async getTransactionsByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status, type, limit = 10, page = 1 } = req.query;
      const requestingUserId = req.user.id;
      const userRole = req.user.role;
      
      // Check authorization - only admin can view other users' transactions
      if (userRole !== 'ADMIN' && userId !== requestingUserId) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view these transactions'
        });
      }
      
      // Build filter object
      const filter: any = {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      };
      
      if (status) {
        filter.status = status as string;
      }
      
      if (type) {
        filter.type = type as string;
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get transactions with count
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
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
                images: true
              }
            },
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }),
        prisma.transaction.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          transactions,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting user transactions:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get user transactions', 
        error: error.message 
      });
    }
  }
  
  /**
   * Get transactions by product ID
   */
  async getTransactionsByProductId(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { status, type, limit = 10, page = 1 } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;
      
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
      
      // Build filter object
      const filter: any = { productId };
      
      if (status) {
        filter.status = status as string;
      }
      
      if (type) {
        filter.type = type as string;
      }
      
      // For non-admin users, restrict access
      if (userRole !== 'ADMIN') {
        filter.OR = [
          { senderId: userId },
          { receiverId: userId }
        ];
        
        // Farmers can see all transactions involving their products
        if (userRole === 'FARMER' && product.farmerId === userId) {
          delete filter.OR;
        }
      }
      
      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get transactions with count
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
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
                images: true
              }
            },
            sender: {
              select: {
                id: true,
                name: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }),
        prisma.transaction.count({ where: filter })
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          transactions,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting product transactions:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to get product transactions', 
        error: error.message 
      });
    }
  }
  
  /**
   * Process payment for a transaction
   */
  async processPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        paymentMethod, 
        paymentReference, 
        amount,
        notes,
        metadata 
      } = req.body;
      
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if transaction exists
      const transaction = await prisma.transaction.findUnique({
        where: { id }
      });
      
      if (!transaction) {
        return res.status(404).json({
          status: 'error',
          message: 'Transaction not found'
        });
      }
      
      // Check if user is authorized (admin, receiver, or sender)
      if (
        userRole !== 'ADMIN' && 
        transaction.senderId !== userId && 
        transaction.receiverId !== userId
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to process payment for this transaction'
        });
      }
      
      // Validate payment amount
      if (amount !== transaction.amount) {
        return res.status(400).json({
          status: 'error',
          message: `Payment amount (${amount}) does not match transaction amount (${transaction.amount})`
        });
      }
      
      // Update transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status: 'PAID',
          paymentDate: new Date(),
          paymentMethod,
          paymentReference,
          notes: notes || transaction.notes,
          metadata: metadata || transaction.metadata
        }
      });
      
      // Check if both paid and delivered, then mark as completed
      if (updatedTransaction.deliveryDate) {
        await prisma.transaction.update({
          where: { id },
          data: { status: 'COMPLETED' }
        });
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Payment processed successfully',
        data: updatedTransaction
      });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to process payment', 
        error: error.message 
      });
    }
  }
  
  /**
   * Record delivery for a transaction
   */
  async recordDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        deliveryDate = new Date(),
        receivedBy,
        location,
        notes,
        metadata 
      } = req.body;
      
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Check if transaction exists
      const transaction = await prisma.transaction.findUnique({
        where: { id }
      });
      
      if (!transaction) {
        return res.status(404).json({
          status: 'error',
          message: 'Transaction not found'
        });
      }
      
      // Check if user is authorized (admin, sender, or receiver)
      if (
        userRole !== 'ADMIN' && 
        transaction.senderId !== userId && 
        transaction.receiverId !== userId
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to record delivery for this transaction'
        });
      }
      
      // Update transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          deliveryDate: new Date(deliveryDate),
          notes: notes || transaction.notes,
          metadata: {
            ...(transaction.metadata as object ?? {}),
            delivery: {
              receivedBy,
              location,
              recordedBy: userId
            },
            ...metadata
          }
        }
      });
      
      // Check if both paid and delivered, then mark as completed
      if (updatedTransaction.paymentDate) {
        await prisma.transaction.update({
          where: { id },
          data: { status: 'COMPLETED' }
        });
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Delivery recorded successfully',
        data: updatedTransaction
      });
    } catch (error: any) {
      console.error('Error recording delivery:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to record delivery', 
        error: error.message 
      });
    }
  }
} 