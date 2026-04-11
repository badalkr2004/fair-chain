import type { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get demand forecasts for products
export const getDemandForecasts = async (req: Request, res: Response) => {
  try {
    const { category, region } = req.query;
    
    // Build query filters
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (region) {
      where.region = region;
    }
    
    // Get the latest predictions
    const forecasts = await prisma.prediction.findMany({
      where,
      include: {
        model: {
          select: {
            name: true,
            type: true,
            accuracy: true
          }
        }
      },
      orderBy: {
        predictionDate: 'desc'
      },
      take: 100 // Limit to recent predictions
    });
    
    res.status(200).json({ forecasts });
  } catch (error) {
    console.error('Error getting demand forecasts:', error);
    res.status(500).json({ 
      message: 'Error getting demand forecasts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new forecast model
export const createForecastModel = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      type, 
      category, 
      region, 
      parameters 
    } = req.body;
    
    // Create new forecast model
    const model = await prisma.forecastModel.create({
      data: {
        name,
        type,
        category,
        region,
        parameters,
        lastTrainedAt: new Date()
      }
    });
    
    res.status(201).json({
      message: 'Forecast model created successfully',
      model
    });
  } catch (error) {
    console.error('Error creating forecast model:', error);
    res.status(500).json({ 
      message: 'Error creating forecast model',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Add a prediction to a forecast model
export const addPrediction = async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const { 
      category, 
      region, 
      predictionDate, 
      predictedValue, 
      metadata 
    } = req.body;
    
    // Verify model exists
    const model = await prisma.forecastModel.findUnique({
      where: { id: modelId }
    });
    
    if (!model) {
      return res.status(404).json({ message: 'Forecast model not found' });
    }
    
    // Create prediction
    const prediction = await prisma.prediction.create({
      data: {
        modelId: modelId!,
        category,
        region,
        predictionDate: new Date(predictionDate),
        predictedValue,
        metadata
      }
    });
    
    res.status(201).json({
      message: 'Prediction added successfully',
      prediction
    });
  } catch (error) {
    console.error('Error adding prediction:', error);
    res.status(500).json({ 
      message: 'Error adding prediction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Apply demand predictions to products
export const applyDemandPredictions = async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    
    // Get the forecast model
    const model = await prisma.forecastModel.findUnique({
      where: { id: modelId },
      include: {
        predictions: {
          orderBy: {
            predictionDate: 'desc'
          },
          take: 1
        }
      }
    });
    
    if (!model) {
      return res.status(404).json({ message: 'Forecast model not found' });
    }
    
    if (model.predictions.length === 0) {
      return res.status(400).json({ message: 'No predictions available for this model' });
    }
    
    // Get products that match the model's category
    const products = await prisma.product.findMany({
      where: {
        category: model.category ?? undefined,
        status: 'LISTED'
      },
      include: {
        productAnalytics: true
      }
    });
    
    // Apply demand scores to products
    const updates = [];
    for (const product of products) {
      // Calculate demand score based on prediction
      // This is a simplified example - real implementation would use more complex logic
      const latestPrediction = model.predictions[0];
      const demandScore = calculateDemandScore(product, latestPrediction);
      
      // Update product analytics with demand score
      updates.push(
        prisma.productAnalytics.update({
          where: { productId: product.id },
          data: { demandScore }
        })
      );
    }
    
    // Execute all updates
    await Promise.all(updates);
    
    // Update the model's last trained time
    await prisma.forecastModel.update({
      where: { id: modelId },
      data: { lastTrainedAt: new Date() }
    });
    
    res.status(200).json({
      message: 'Demand predictions applied successfully',
      productsUpdated: updates.length
    });
  } catch (error) {
    console.error('Error applying demand predictions:', error);
    res.status(500).json({ 
      message: 'Error applying demand predictions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get market price trends
export const getMarketPriceTrends = async (req: Request, res: Response) => {
  try {
    const { category, location, days } = req.query;
    
    const daysAgo = days ? parseInt(days as string) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Build query filters
    const where: any = {
      date: {
        gte: startDate
      }
    };
    
    if (category) {
      where.productCategory = category;
    }
    
    if (location) {
      where.location = location;
    }
    
    // Get market prices
    const prices = await prisma.marketPrice.findMany({
      where,
      orderBy: {
        date: 'asc'
      }
    });
    
    // Group by date and category for trends
    const trends = processMarketPriceTrends(prices);
    
    res.status(200).json({ trends });
  } catch (error) {
    console.error('Error getting market price trends:', error);
    res.status(500).json({ 
      message: 'Error getting market price trends',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Add market price data
export const addMarketPrice = async (req: Request, res: Response) => {
  try {
    const { 
      productCategory, 
      location, 
      date, 
      minPrice, 
      maxPrice, 
      averagePrice, 
      source 
    } = req.body;
    
    // Create market price entry
    const marketPrice = await prisma.marketPrice.create({
      data: {
        productCategory,
        location,
        date: new Date(date),
        minPrice,
        maxPrice,
        averagePrice,
        source
      }
    });
    
    res.status(201).json({
      message: 'Market price added successfully',
      marketPrice
    });
  } catch (error) {
    console.error('Error adding market price:', error);
    res.status(500).json({ 
      message: 'Error adding market price',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to calculate demand score
function calculateDemandScore(product: any, prediction: any): number {
  // This is a simplified implementation
  // In a real application, this would involve more complex calculations
  // based on seasonality, trends, and other factors
  
  // Base score from prediction
  let score = prediction.predictedValue;
  
  // Adjust based on product view count (popularity)
  if (product.productAnalytics && product.productAnalytics.viewCount) {
    // More views means higher demand
    const viewMultiplier = Math.min(1 + (product.productAnalytics.viewCount / 1000), 1.5);
    score *= viewMultiplier;
  }
  
  // Adjust based on product price relative to average market price
  // Lower prices increase demand
  if (product.basePrice && prediction.metadata && prediction.metadata.averageMarketPrice) {
    const priceRatio = prediction.metadata.averageMarketPrice / product.basePrice;
    score *= Math.min(priceRatio, 1.5); // Cap the multiplier
  }
  
  // Normalize to a scale of 0-100
  return Math.min(Math.max(score * 10, 0), 100);
}

// Helper function to process market price trends
function processMarketPriceTrends(prices: any[]): any {
  // Group prices by category and date
  const trendsByCategory: Record<string, any[]> = {};
  
  for (const price of prices) {
    const dateStr = price.date.toISOString().split('T')[0];
    const category = price.productCategory;
    
    if (!trendsByCategory[category]) {
      trendsByCategory[category] = [];
    }
    
    trendsByCategory[category].push({
      date: dateStr,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      averagePrice: price.averagePrice
    });
  }
  
  return trendsByCategory;
} 