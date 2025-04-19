import express from "express";
require("dotenv").config();
import cors from "cors";
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

const PORT = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

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
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/produce", produceRoutes);
app.use("/orders", orderRoutes);
app.use("/forecast", forecastRoutes);
app.use("/trace", traceabilityRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/bids", bidRoutes);
app.use("/supply-chain", supplyChainRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err.stack
  });
});

// Initialize server services and start server
(async () => {
  try {
    await initializeServer();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
})();