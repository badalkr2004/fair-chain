import prisma from './prisma';
import cron from 'node-cron';

/**
 * Initialize server-side services
 */
export async function initializeServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('Database connection established!');
    
    // Setup cron jobs for forecast updates
    setupCronJobs();
    
    return {
      success: true,
      message: 'Server initialization complete'
    };
  } catch (error) {
    console.error('Error initializing server:', error);
    throw error;
  }
}

/**
 * Setup scheduled tasks
 */
function setupCronJobs() {
  // Run daily demand forecasting update at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily demand forecast update...');
      await updateDemandForecasts();
    } catch (error) {
      console.error('Error in forecast cron job:', error);
    }
  });
  
  // Update market prices weekly on Monday at 1 AM
  cron.schedule('0 1 * * 1', async () => {
    try {
      console.log('Updating market price data...');
      await updateMarketPrices();
    } catch (error) {
      console.error('Error in market price cron job:', error);
    }
  });
  
  console.log('Scheduled tasks initialized');
}

/**
 * Update demand forecasts for all active products
 */
async function updateDemandForecasts() {
  try {
    // Get all forecast models
    const models = await prisma.forecastModel.findMany({
      where: {
        type: 'demand'
      }
    });
    
    if (models.length === 0) {
      console.log('No forecast models found for demand prediction');
      return;
    }
    
    // For each model, generate new predictions
    for (const model of models) {
      // In a real implementation, this would use the actual AI models
      // For this example, we'll generate random predictions
      const categories = ['GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'POULTRY'];
      
      for (const category of categories) {
        // Create prediction
        await prisma.prediction.create({
          data: {
            modelId: model.id,
            category: category as any,
            region: 'ALL',
            predictionDate: new Date(),
            predictedValue: Math.random() * 10, // Random value between 0-10
            metadata: {
              confidence: 0.85,
              averageMarketPrice: 100 + Math.random() * 50 // Random price between 100-150
            }
          }
        });
      }
      
      // Update model's last trained timestamp
      await prisma.forecastModel.update({
        where: { id: model.id },
        data: { lastTrainedAt: new Date() }
      });
    }
    
    console.log('Demand forecasts updated successfully');
  } catch (error) {
    console.error('Error updating demand forecasts:', error);
    throw error;
  }
}

/**
 * Update market prices from external sources
 */
async function updateMarketPrices() {
  try {
    // In a real implementation, this would fetch data from external APIs
    // For this example, we'll generate random market prices
    const categories = ['GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'POULTRY'];
    const locations = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Market'];
    
    const date = new Date();
    
    for (const category of categories) {
      for (const location of locations) {
        const basePrice = getBasePriceForCategory(category);
        const minPrice = basePrice - (basePrice * 0.2);
        const maxPrice = basePrice + (basePrice * 0.2);
        const averagePrice = (minPrice + maxPrice) / 2;
        
        await prisma.marketPrice.create({
          data: {
            productCategory: category as any,
            location,
            date,
            minPrice,
            maxPrice,
            averagePrice,
            source: 'Automated Update'
          }
        });
      }
    }
    
    console.log('Market prices updated successfully');
  } catch (error) {
    console.error('Error updating market prices:', error);
    throw error;
  }
}

/**
 * Helper function to get base price for a category
 */
function getBasePriceForCategory(category: string): number {
  switch (category) {
    case 'GRAINS':
      return 50;
    case 'VEGETABLES':
      return 75;
    case 'FRUITS':
      return 100;
    case 'DAIRY':
      return 120;
    case 'MEAT':
      return 200;
    case 'POULTRY':
      return 150;
    default:
      return 100;
  }
} 