import type { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { nanoid } from 'nanoid';

// Get traceability record by tracking ID or QR code
export const getTraceabilityRecord = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is tracking ID or QR code
    const record = await prisma.traceabilityRecord.findFirst({
      where: {
        OR: [
          { trackingId: identifier },
          { qrCode: identifier }
        ]
      },
      include: {
        product: {
          include: {
            farmer: {
              select: {
                id: true,
                name: true,
                farmerProfile: true
              }
            }
          }
        },
        order: {
          select: {
            id: true,
            orderId: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Traceability record not found' });
    }
    
    res.status(200).json({ record });
  } catch (error) {
    console.error('Error getting traceability record:', error);
    res.status(500).json({ 
      message: 'Error getting traceability record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get complete traceability chain for a product
export const getProductTraceability = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            farmerProfile: true
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get all traceability records for this product
    const records = await prisma.traceabilityRecord.findMany({
      where: { productId },
      orderBy: { timestamp: 'asc' },
      include: {
        order: {
          select: {
            id: true,
            orderId: true,
            status: true,
            createdAt: true,
            buyerId: true,
            buyer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    // Organize records into a chain/timeline
    const timeline = records.map(record => ({
      id: record.id,
      eventType: record.eventType,
      timestamp: record.timestamp,
      location: record.location,
      trackingId: record.trackingId,
      verifiedBy: record.verifiedBy,
      order: record.order ? {
        id: record.order.id,
        orderId: record.order.orderId,
        status: record.order.status,
        buyerName: record.order.buyer?.name || 'Anonymous',
        date: record.order.createdAt
      } : null,
      metadata: record.metadata,
      hash: record.currentHash
    }));
    
    res.status(200).json({
      product: {
        id: product.id,
        name: product.name,
        farmer: {
          name: product.farmer.name,
          location: product.farmer.farmerProfile?.farmLocation
        },
        harvestDate: product.harvestDate,
        organicCertified: product.organicCertified
      },
      timeline
    });
  } catch (error) {
    console.error('Error getting product traceability:', error);
    res.status(500).json({ 
      message: 'Error getting product traceability',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Verify the authenticity of a traceability record
export const verifyTraceability = async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;
    
    // Get the record
    const record = await prisma.traceabilityRecord.findUnique({
      where: { id: recordId }
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Traceability record not found' });
    }
    
    // Get previous record to check hash chain
    const previousRecord = record.previousHash 
      ? await prisma.traceabilityRecord.findFirst({
          where: { currentHash: record.previousHash }
        })
      : null;
    
    // Verify the hash chain
    const isHashValid = await verifyHash(record, previousRecord);
    
    // Update verification status if user is authenticated
    if (req.user) {
      await prisma.traceabilityRecord.update({
        where: { id: recordId },
        data: { verifiedBy: req.user.id }
      });
    }
    
    res.status(200).json({
      record,
      verification: {
        isValid: isHashValid,
        previousRecord: previousRecord ? {
          id: previousRecord.id,
          eventType: previousRecord.eventType,
          timestamp: previousRecord.timestamp
        } : null,
        verifiedBy: req.user ? req.user.name : 'Anonymous',
        verifiedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error verifying traceability:', error);
    res.status(500).json({ 
      message: 'Error verifying traceability',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Add new traceability record
export const addTraceabilityRecord = async (req: Request, res: Response) => {
  try {
    const { 
      productId, 
      eventType, 
      location, 
      metadata
    } = req.body;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Only allow records to be added by farmer or admin
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'ADMIN' && product.farmerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to add traceability records for this product' });
    }
    
    // Get the latest record to chain the hash
    const previousRecords = await prisma.traceabilityRecord.findMany({
      where: { productId },
      orderBy: { timestamp: 'desc' },
      take: 1
    });
    
    const previousHash = previousRecords.length > 0 ? previousRecords[0].currentHash : '';
    
    // Create event data
    const eventData = {
      productId,
      eventType,
      location,
      metadata,
      trackingId: `TRK-${nanoid(8).toUpperCase()}`,
      qrCode: `QR-${nanoid(10).toUpperCase()}`
    };
    
    // Create a hash for the traceability record
    const currentHash = await createHash(JSON.stringify({
      ...eventData,
      previousHash,
      timestamp: new Date().toISOString()
    }));
    
    // Create the record
    const record = await prisma.traceabilityRecord.create({
      data: {
        ...eventData,
        previousHash,
        currentHash
      }
    });
    
    res.status(201).json({
      message: 'Traceability record added successfully',
      record
    });
  } catch (error) {
    console.error('Error adding traceability record:', error);
    res.status(500).json({ 
      message: 'Error adding traceability record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to create a hash
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

// Helper function to verify a hash
async function verifyHash(record: any, previousRecord: any | null): Promise<boolean> {
  // In a real implementation, you'd verify the hash cryptographically
  // For this example, we'll just check if the previous hash matches
  
  // If there's no previous record, but record claims there is
  if (!previousRecord && record.previousHash) {
    return false;
  }
  
  // If there's no previous hash, it's the first record
  if (!record.previousHash) {
    return true;
  }
  
  // Check if the previous hash matches the previous record's current hash
  return record.previousHash === (previousRecord?.currentHash || '');
} 