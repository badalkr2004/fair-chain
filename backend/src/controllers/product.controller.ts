import type { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { nanoid } from 'nanoid';

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      category, 
      quantity, 
      unit, 
      basePrice, 
      harvestDate, 
      availableUntil,
      location,
      organicCertified,
      images
    } = req.body;

    // Get the farmer ID from the authenticated user
    const farmerId = req.user.id;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        farmerId,
        category,
        quantity,
        unit,
        basePrice,
        finalPrice: basePrice, // Initially set final price to base price
        harvestDate: harvestDate ? new Date(harvestDate) : undefined,
        availableUntil: availableUntil ? new Date(availableUntil) : undefined,
        location,
        organicCertified: organicCertified || false,
        images: images || [],
        status: 'LISTED'
      }
    });

    // Create initial product analytics
    await prisma.productAnalytics.create({
      data: {
        productId: product.id,
        viewCount: 0,
        priceHistory: [{ price: basePrice, timestamp: new Date().toISOString() }]
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: 'Error creating product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all products with optional filtering
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      status,
      farmerId,
      organic,
      search
    } = req.query;

    // Build the where clause for filtering
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (minPrice) {
      where.basePrice = {
        ...where.basePrice,
        gte: parseFloat(minPrice as string)
      };
    }

    if (maxPrice) {
      where.basePrice = {
        ...where.basePrice,
        lte: parseFloat(maxPrice as string)
      };
    }

    if (status) {
      where.status = status;
    }

    if (farmerId) {
      where.farmerId = farmerId;
    }

    if (organic === 'true') {
      where.organicCertified = true;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Only show LISTED products by default (unless status filter is specified)
    if (!status) {
      where.status = 'LISTED';
    }

    // Get products with farmer info
    const products = await prisma.product.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            farmerProfile: true
          }
        },
        productAnalytics: {
          select: {
            viewCount: true,
            demandScore: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ 
      message: 'Error getting products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get product with farmer info
    const product = await prisma.product.findUnique({
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
        productAnalytics: true,
        supplyChain: {
          include: {
            links: {
              include: {
                serviceProvider: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    await prisma.productAnalytics.update({
      where: { productId: id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ 
      message: 'Error getting product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      category, 
      quantity, 
      unit, 
      basePrice, 
      harvestDate, 
      availableUntil,
      location,
      organicCertified,
      images,
      status
    } = req.body;

    // Get the farmer ID from the authenticated user
    const farmerId = req.user.id;

    // Check if the product exists and belongs to the farmer
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (existingProduct.farmerId !== farmerId) {
      return res.status(403).json({ message: 'You are not authorized to update this product' });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        category,
        quantity,
        unit,
        basePrice,
        harvestDate: harvestDate ? new Date(harvestDate) : undefined,
        availableUntil: availableUntil ? new Date(availableUntil) : undefined,
        location,
        organicCertified,
        images,
        status
      }
    });

    // If price changed, update price history
    if (basePrice && basePrice !== existingProduct.basePrice) {
      await prisma.productAnalytics.update({
        where: { productId: id },
        data: {
          priceHistory: {
            push: { price: basePrice, timestamp: new Date().toISOString() }
          }
        }
      });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Error updating product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the farmer ID from the authenticated user
    const farmerId = req.user.id;

    // Check if the product exists and belongs to the farmer
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (existingProduct.farmerId !== farmerId) {
      return res.status(403).json({ message: 'You are not authorized to delete this product' });
    }

    // Check if the product is part of any orders
    const orders = await prisma.orderItem.findFirst({
      where: { productId: id }
    });

    if (orders) {
      // If product is in orders, just change status to CANCELLED instead of deleting
      await prisma.product.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      return res.status(200).json({ message: 'Product cancelled successfully' });
    }

    // Delete product and related data
    await prisma.$transaction([
      prisma.productAnalytics.delete({
        where: { productId: id }
      }),
      prisma.product.delete({
        where: { id }
      })
    ]);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Error deleting product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get products by farmer ID
export const getProductsByFarmer = async (req: Request, res: Response) => {
  try {
    const { farmerId } = req.params;

    const products = await prisma.product.findMany({
      where: { farmerId },
      include: {
        productAnalytics: {
          select: {
            viewCount: true,
            demandScore: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error getting farmer products:', error);
    res.status(500).json({ 
      message: 'Error getting farmer products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a farmer's own products
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const farmerId = req.user.id;

    const products = await prisma.product.findMany({
      where: { farmerId },
      include: {
        productAnalytics: {
          select: {
            viewCount: true,
            demandScore: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error getting your products:', error);
    res.status(500).json({ 
      message: 'Error getting your products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 