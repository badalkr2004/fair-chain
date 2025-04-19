import type { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { nanoid } from 'nanoid';

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { 
      items, 
      deliveryAddress, 
      notes 
    } = req.body;

    // Get buyer ID from authenticated user
    const buyerId = req.user.id;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Begin transaction
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItems = [];
      const productUpdates = [];
      const profitSplits = {};

      // Create human-readable order ID
      const orderId = `ORD-${nanoid(8).toUpperCase()}`;

      // Process each item in the order
      for (const item of items) {
        // Verify product exists and has sufficient quantity
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { farmer: true }
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.status !== 'LISTED') {
          throw new Error(`Product ${product.name} is not available for purchase`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient quantity available for ${product.name}`);
        }

        // Calculate item total
        const itemTotal = product.finalPrice * item.quantity;
        totalAmount += itemTotal;

        // Add to order items
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.finalPrice,
          totalPrice: itemTotal
        });

        // Prepare to update product quantity
        productUpdates.push(
          tx.product.update({
            where: { id: product.id },
            data: {
              quantity: {
                decrement: item.quantity
              },
              status: product.quantity === item.quantity ? 'SOLD' : 'LISTED'
            }
          })
        );

        // Calculate profit split (60% farmer, 20% logistics, 20% platform)
        const farmerShare = itemTotal * 0.6;
        const logisticsShare = itemTotal * 0.2;
        const platformShare = itemTotal * 0.2;

        profitSplits[product.id] = {
          productName: product.name,
          total: itemTotal,
          farmerShare,
          logisticsShare,
          platformShare,
          farmerId: product.farmerId,
          farmerName: product.farmer.name
        };
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderId,
          buyerId,
          totalAmount,
          status: 'PENDING',
          deliveryAddress,
          notes,
          items: {
            create: orderItems
          }
        },
        include: {
          items: true
        }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionId: `TXN-${nanoid(8).toUpperCase()}`,
          orderId: order.id,
          userId: buyerId,
          amount: totalAmount,
          type: 'PAYMENT',
          status: 'COMPLETED',
          profitSplit: profitSplits
        }
      });

      // Execute product updates
      await Promise.all(productUpdates);

      // Create traceability records for each product
      const traceabilityRecords = [];
      for (const item of order.items) {
        const previousRecords = await tx.traceabilityRecord.findMany({
          where: { productId: item.productId },
          orderBy: { timestamp: 'desc' },
          take: 1
        });

        const previousHash = previousRecords.length > 0 ? previousRecords[0].currentHash : '';
        const eventData = {
          productId: item.productId,
          orderId: order.id,
          eventType: 'PURCHASED',
          location: deliveryAddress,
          metadata: {
            buyerId,
            quantity: item.quantity,
            price: item.unitPrice
          }
        };

        // Create a simple hash for the traceability record
        const currentHash = await createHash(JSON.stringify({
          ...eventData,
          previousHash,
          timestamp: new Date().toISOString()
        }));

        traceabilityRecords.push(
          tx.traceabilityRecord.create({
            data: {
              ...eventData,
              trackingId: `TRK-${nanoid(6).toUpperCase()}`,
              previousHash,
              currentHash
            }
          })
        );
      }

      await Promise.all(traceabilityRecords);

      return { order, transaction };
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: result.order,
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all orders (for admins)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ 
      message: 'Error getting orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                farmer: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        transactions: true,
        traceability: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user is authorized to view this order
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Only the buyer, farmers who supplied products, or admins can view the order
    const isBuyer = order.buyerId === userId;
    const isFarmer = order.items.some(item => item.product.farmerId === userId);
    const isAdmin = userRole === 'ADMIN';
    
    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to view this order' });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ 
      message: 'Error getting order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin or the buyer can update order status
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'ADMIN' && order.buyerId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this order' });
    }

    // Handle cancellation specially
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id },
          data: { status }
        });

        // Return quantities to products
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                increment: item.quantity
              },
              status: 'LISTED'
            }
          });
        }

        // Create traceability record for cancellation
        await tx.traceabilityRecord.create({
          data: {
            productId: order.items[0].productId,
            orderId: order.id,
            eventType: 'ORDER_CANCELLED',
            metadata: {
              cancelledBy: userId,
              reason: req.body.reason || 'Not specified'
            }
          }
        });

        // Update transaction status
        await tx.transaction.updateMany({
          where: { orderId: order.id },
          data: { status: 'CANCELLED' }
        });
      });

      return res.status(200).json({ message: 'Order cancelled successfully' });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Create traceability record for status change
    await prisma.traceabilityRecord.create({
      data: {
        productId: order.items[0].productId,
        orderId: order.id,
        eventType: `ORDER_${status}`,
        metadata: {
          updatedBy: userId
        }
      }
    });

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      message: 'Error updating order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get my orders (for buyers)
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const buyerId = req.user.id;
    const { status } = req.query;
    
    const where: any = { buyerId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error getting your orders:', error);
    res.status(500).json({ 
      message: 'Error getting your orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get orders for products supplied by a farmer
export const getFarmerOrders = async (req: Request, res: Response) => {
  try {
    const farmerId = req.user.id;
    const { status } = req.query;
    
    // Find order items containing products from this farmer
    const farmersOrderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          farmerId
        }
      },
      include: {
        order: true,
        product: true
      }
    });

    // Extract unique order IDs
    const orderIds = [...new Set(farmersOrderItems.map(item => item.orderId))];
    
    // Get the full orders
    const where: any = { id: { in: orderIds } };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                farmer: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error getting farmer orders:', error);
    res.status(500).json({ 
      message: 'Error getting farmer orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to create a simple hash for traceability
async function createHash(data: string): Promise<string> {
  // In a real implementation, you'd use a proper crypto library
  // For this example, we'll use a simple approach
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Use the browser's SubtleCrypto API or Node.js crypto module
  // Here we're just simulating it
  const hashHex = Array.from(dataBuffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return hashHex;
} 