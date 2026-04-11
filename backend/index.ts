import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initializeServer } from "./src/lib/server";

// Routes
import authRoutes from "./src/routes/auth";
import productRoutes from "./src/routes/product";
import orderRoutes from "./src/routes/order";
import forecastRoutes from "./src/routes/forecast";
import traceabilityRoutes from "./src/routes/traceability";
import transactionsRoutes from "./src/routes/transactions";
import bidRoutes from "./src/routes/bid";
import supplyChainRoutes from "./src/routes/supplyChain";
import produceRoutes from "./src/routes/produce";
import prisma from "./src/lib/prisma";

const PORT = process.env.PORT || 8080;
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN === '*' 
  ? '*' 
  : (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8081']);
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per window
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to FairChain - AI-Powered Transparent Agri-Marketplace API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth/*",
      products: "/products/*",
      produce: "/produce/*",
      orders: "/orders/*",
      bids: "/bids/*",
      transactions: "/transactions/*",
      supplyChain: "/supply-chain/*",
      forecast: "/forecast/*",
      traceability: "/trace/*"
    }
  });
});

// Register routes
app.use("/auth", authLimiter, authRoutes);
app.use("/products", productRoutes);
app.use("/produce", produceRoutes);
app.use("/orders", orderRoutes);
app.use("/forecast", forecastRoutes);
app.use("/trace", traceabilityRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/bids", bidRoutes);
app.use("/supply-chain", supplyChainRoutes);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error("Error:", err);
  
  // Handle Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({ message: 'A record with this data already exists.' });
    return;
  }
  if (err.code === 'P2025') {
    res.status(404).json({ message: 'Record not found.' });
    return;
  }
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" ? { error: err.stack } : {})
  });
});

// Initialize server services and start server
let server: any;
(async () => {
  try {
    await initializeServer();
    
    server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database connection closed.');
      process.exit(0);
    });
    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));