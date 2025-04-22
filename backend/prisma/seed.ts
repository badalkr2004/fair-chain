import { PrismaClient, UserRole, ProductCategory, ProductStatus } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await clearDatabase();

  // Create users
  const [admin, farmer1, farmer2, intermediary1, consumer1] = await createUsers();
  
  // Create products
  const products = await createProducts(farmer1.id, farmer2.id);
  
  // Create forecast model and predictions
  const forecastModel = await createForecastModel();
  
  // Add market price data
  await addMarketPriceData();

  console.log('Database seeded successfully!');
}

async function clearDatabase() {
  console.log('Clearing existing data...');
  
  // Delete in order to respect foreign key constraints
  await prisma.marketPrice.deleteMany({});
  await prisma.prediction.deleteMany({});
  await prisma.forecastModel.deleteMany({});
  await prisma.traceabilityRecord.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productAnalytics.deleteMany({});
  await prisma.supplyChainLink.deleteMany({});
  await prisma.supplyChain.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.consumerProfile.deleteMany({});
  await prisma.intermediaryProfile.deleteMany({});
  await prisma.farmerProfile.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Database cleared');
}

async function createUsers() {
  console.log('Creating users...');
  
  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);
  
  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fairchain.com',
      password: passwordHash,
      name: 'Admin User',
      role: UserRole.ADMIN,
      phone: '1234567890',
      address: 'Admin Office, Main Street',
      location: { lat: 37.7749, lng: -122.4194 }
    }
  });
  
  // Create farmers
  const farmer1 = await prisma.user.create({
    data: {
      email: 'farmer1@example.com',
      password: passwordHash,
      name: 'John Farmer',
      role: UserRole.FARMER,
      phone: '2345678901',
      address: 'Farm 1, Rural Road',
      location: { lat: 37.7850, lng: -122.4100 },
      farmerProfile: {
        create: {
          farmSize: 50.5,
          farmLocation: 'North Valley',
          farmCoordinates: { lat: 37.7850, lng: -122.4100 },
          cropTypes: ['wheat', 'corn', 'vegetables'],
          certifications: ['organic'],
          bankDetails: { accountNumber: '1234567890', bankName: 'Farmer Bank' }
        }
      }
    }
  });
  
  const farmer2 = await prisma.user.create({
    data: {
      email: 'farmer2@example.com',
      password: passwordHash,
      name: 'Sarah Farmer',
      role: UserRole.FARMER,
      phone: '3456789012',
      address: 'Farm 2, Country Lane',
      location: { lat: 37.8000, lng: -122.4200 },
      farmerProfile: {
        create: {
          farmSize: 75.2,
          farmLocation: 'South Hills',
          farmCoordinates: { lat: 37.8000, lng: -122.4200 },
          cropTypes: ['fruits', 'berries'],
          certifications: ['organic', 'non-gmo'],
          bankDetails: { accountNumber: '0987654321', bankName: 'Farmer Credit Union' }
        }
      }
    }
  });
  
  // Create intermediary
  const intermediary1 = await prisma.user.create({
    data: {
      email: 'logistics@example.com',
      password: passwordHash,
      name: 'Fast Logistics',
      role: UserRole.INTERMEDIARY,
      phone: '4567890123',
      address: '123 Transport Ave',
      location: { lat: 37.7900, lng: -122.4150 },
      intermediaryProfile: {
        create: {
          type: 'LOGISTICS',
          serviceAreas: ['North Valley', 'South Hills', 'Central Market'],
          capacity: { maxWeight: 5000, vehicles: 10 },
          services: ['transportation', 'storage'],
          licenseNumber: 'LOG123456'
        }
      }
    }
  });
  
  // Create consumer
  const consumer1 = await prisma.user.create({
    data: {
      email: 'store@example.com',
      password: passwordHash,
      name: 'Green Grocers',
      role: UserRole.CONSUMER,
      phone: '5678901234',
      address: '456 Market Street',
      location: { lat: 37.7700, lng: -122.4260 },
      consumerProfile: {
        create: {
          type: 'RETAILER',
          businessName: 'Green Grocers Inc.',
          taxId: 'TAX987654',
          preferences: ['organic', 'local']
        }
      }
    }
  });
  
  console.log('Users created');
  return [admin, farmer1, farmer2, intermediary1, consumer1];
}

async function createProducts(farmer1Id: string, farmer2Id: string) {
  console.log('Creating products...');
  
  const products = [];
  
  // Farmer 1 products
  const wheat = await prisma.product.create({
    data: {
      name: 'Organic Wheat',
      description: 'Premium organic wheat grown using sustainable farming practices',
      farmerId: farmer1Id,
      category: ProductCategory.GRAINS,
      quantity: 1000,
      unit: 'kg',
      basePrice: 2.5,
      finalPrice: 2.5,
      harvestDate: new Date('2023-10-10'),
      availableUntil: new Date('2024-01-10'),
      status: ProductStatus.LISTED,
      location: { lat: 37.7850, lng: -122.4100 },
      organicCertified: true,
      images: ['https://example.com/wheat1.jpg', 'https://example.com/wheat2.jpg']
    }
  });
  products.push(wheat);
  
  // Create product analytics
  await prisma.productAnalytics.create({
    data: {
      productId: wheat.id,
      viewCount: 45,
      demandScore: 78.5,
      priceHistory: [
        { price: 2.5, timestamp: new Date('2023-10-11').toISOString() }
      ],
      seasonalTrends: {
        spring: 'medium',
        summer: 'high',
        fall: 'medium',
        winter: 'low'
      }
    }
  });
  
  const corn = await prisma.product.create({
    data: {
      name: 'Fresh Sweet Corn',
      description: 'Locally grown sweet corn, perfect for grilling',
      farmerId: farmer1Id,
      category: ProductCategory.VEGETABLES,
      quantity: 500,
      unit: 'kg',
      basePrice: 3.0,
      finalPrice: 3.0,
      harvestDate: new Date('2023-11-05'),
      availableUntil: new Date('2023-12-05'),
      status: ProductStatus.LISTED,
      location: { lat: 37.7850, lng: -122.4100 },
      organicCertified: true,
      images: ['https://example.com/corn1.jpg']
    }
  });
  products.push(corn);
  
  // Create product analytics
  await prisma.productAnalytics.create({
    data: {
      productId: corn.id,
      viewCount: 32,
      demandScore: 65.0,
      priceHistory: [
        { price: 3.0, timestamp: new Date('2023-11-06').toISOString() }
      ]
    }
  });
  
  // Farmer 2 products
  const apples = await prisma.product.create({
    data: {
      name: 'Organic Apples',
      description: 'Fresh and crisp organic apples',
      farmerId: farmer2Id,
      category: ProductCategory.FRUITS,
      quantity: 300,
      unit: 'kg',
      basePrice: 4.5,
      finalPrice: 4.5,
      harvestDate: new Date('2023-09-15'),
      availableUntil: new Date('2023-12-15'),
      status: ProductStatus.LISTED,
      location: { lat: 37.8000, lng: -122.4200 },
      organicCertified: true,
      images: ['https://example.com/apples1.jpg', 'https://example.com/apples2.jpg']
    }
  });
  products.push(apples);
  
  // Create product analytics
  await prisma.productAnalytics.create({
    data: {
      productId: apples.id,
      viewCount: 67,
      demandScore: 82.0,
      priceHistory: [
        { price: 4.5, timestamp: new Date('2023-09-16').toISOString() }
      ]
    }
  });
  
  const berries = await prisma.product.create({
    data: {
      name: 'Mixed Berries',
      description: 'Assortment of fresh strawberries, blueberries, and blackberries',
      farmerId: farmer2Id,
      category: ProductCategory.FRUITS,
      quantity: 100,
      unit: 'kg',
      basePrice: 8.0,
      finalPrice: 8.0,
      harvestDate: new Date('2023-10-20'),
      availableUntil: new Date('2023-11-10'),
      status: ProductStatus.LISTED,
      location: { lat: 37.8000, lng: -122.4200 },
      organicCertified: true,
      images: ['https://example.com/berries1.jpg']
    }
  });
  products.push(berries);
  
  // Create product analytics
  await prisma.productAnalytics.create({
    data: {
      productId: berries.id,
      viewCount: 89,
      demandScore: 92.5,
      priceHistory: [
        { price: 8.0, timestamp: new Date('2023-10-21').toISOString() }
      ]
    }
  });
  
  console.log('Products created');
  return products;
}

async function createForecastModel() {
  console.log('Creating forecast model...');
  
  const model = await prisma.forecastModel.create({
    data: {
      name: 'Seasonal Demand Predictor',
      type: 'demand',
      parameters: {
        method: 'time-series',
        windowSize: 30,
        smoothing: 0.3
      },
      lastTrainedAt: new Date(),
      accuracy: 0.85
    }
  });
  
  // Add predictions for different categories
  const categories = [
    ProductCategory.FRUITS, 
    ProductCategory.VEGETABLES, 
    ProductCategory.GRAINS
  ];
  
  for (const category of categories) {
    await prisma.prediction.create({
      data: {
        modelId: model.id,
        category,
        region: 'ALL',
        predictionDate: new Date(),
        predictedValue: 7.5 + Math.random() * 2.5, // Between 7.5-10
        metadata: {
          confidence: 0.85,
          averageMarketPrice: 100 + Math.random() * 50 // Random price between 100-150
        }
      }
    });
  }
  
  console.log('Forecast model created');
  return model;
}

async function addMarketPriceData() {
  console.log('Adding market price data...');
  
  const categories = [
    ProductCategory.FRUITS, 
    ProductCategory.VEGETABLES,
    ProductCategory.GRAINS,
    ProductCategory.DAIRY
  ];
  
  const locations = [
    'North Valley', 
    'South Hills', 
    'Central Market'
  ];
  
  // Create 30 days of price history
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    for (const category of categories) {
      for (const location of locations) {
        // Get base price for this category
        let basePrice = 0;
        switch (category) {
          case ProductCategory.GRAINS:
            basePrice = 50;
            break;
          case ProductCategory.VEGETABLES:
            basePrice = 75;
            break;
          case ProductCategory.FRUITS:
            basePrice = 100;
            break;
          case ProductCategory.DAIRY:
            basePrice = 120;
            break;
          default:
            basePrice = 100;
        }
        
        // Add some random variation
        const variation = 0.1; // 10% variation
        const minPrice = basePrice * (1 - variation);
        const maxPrice = basePrice * (1 + variation);
        const averagePrice = (minPrice + maxPrice) / 2;
        
        await prisma.marketPrice.create({
          data: {
            productCategory: category,
            location,
            date,
            minPrice,
            maxPrice,
            averagePrice,
            source: 'Historical Data'
          }
        });
      }
    }
  }
  
  console.log('Market price data added');
}

// Execute the main function
main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma client
    await prisma.$disconnect();
  }); 