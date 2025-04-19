# FairChain API Routes Documentation

This document provides a comprehensive overview of all API endpoints in the FairChain platform, organized by resource category.

## Table of Contents
- [Authentication Routes](#authentication-routes)
- [Product Routes](#product-routes)
- [Produce Routes](#produce-routes)
- [Order Routes](#order-routes)
- [Bid Routes](#bid-routes)
- [Traceability Routes](#traceability-routes)
- [Supply Chain Routes](#supply-chain-routes)
- [Transaction Routes](#transaction-routes)
- [Forecast Routes](#forecast-routes)

## Authentication Routes
Base path: `/auth`

| Endpoint | Method | Auth Required | Description |
|----------|--------|--------------|-------------|
| `/signup` | POST | No | Register a new user (farmer, intermediary, or consumer) |
| `/login` | POST | No | Authenticate a user and get access token |
| `/refresh-token` | POST | No | Get a new access token using refresh token |
| `/profile` | GET | Yes | Get current user's profile |
| `/profile` | PUT | Yes | Update current user's profile |
| `/change-password` | POST | Yes | Change user's password |

## Product Routes
Base path: `/products`

| Endpoint | Method | Auth Required | Role | Description |
|----------|--------|--------------|------|-------------|
| `/` | GET | No | Any | Get all products with optional filters |
| `/:id` | GET | No | Any | Get a single product by ID |
| `/farmer/:farmerId` | GET | No | Any | Get products by farmer ID |
| `/` | POST | Yes | Farmer | Create a new product |
| `/:id` | PUT | Yes | Farmer | Update an existing product |
| `/:id` | DELETE | Yes | Farmer | Delete a product |
| `/my/products` | GET | Yes | Farmer | Get products of the logged-in farmer |

## Produce Routes
Base path: `/produce`

| Endpoint | Method | Auth Required | Description |
|----------|--------|--------------|-------------|
| `/` | GET | No | Get all produce listings |
| `/:id` | GET | No | Get a specific produce by ID |
| `/` | POST | Yes | Create a new produce listing |
| `/:id` | PUT | Yes | Update an existing produce listing |
| `/:id` | DELETE | Yes | Delete a produce listing |
| `/farmer/:farmerId` | GET | No | Get all produce listings by a specific farmer |

## Order Routes
Base path: `/orders`

| Endpoint | Method | Auth Required | Role | Description |
|----------|--------|--------------|------|-------------|
| `/` | POST | Yes | Consumer | Place a new order |
| `/:id` | GET | Yes | Any | Get details of a specific order |
| `/:id/status` | PATCH | Yes | Any | Update the status of an order |
| `/my/orders` | GET | Yes | Consumer | Get all orders placed by the logged-in consumer |
| `/farmer/orders` | GET | Yes | Farmer | Get all orders received by the logged-in farmer |
| `/` | GET | Yes | Admin | Get all orders in the system |

## Bid Routes
Base path: `/bids`

| Endpoint | Method | Auth Required | Description |
|----------|--------|--------------|-------------|
| `/` | POST | Yes | Create a new bid for a product |
| `/product/:productId` | GET | Yes | Get all bids for a specific product |
| `/my-bids` | GET | Yes | Get all bids made by the current intermediary |
| `/:id` | PUT | Yes | Update an existing bid |
| `/:id/cancel` | POST | Yes | Cancel a bid |
| `/:id/respond` | POST | Yes | Respond to a bid (accept or reject) |

## Traceability Routes
Base path: `/trace`

| Endpoint | Method | Auth Required | Description |
|----------|--------|--------------|-------------|
| `/record/:identifier` | GET | No | Get traceability record by tracking ID or QR code |
| `/product/:productId` | GET | No | Get complete traceability chain for a product |
| `/verify/:recordId` | GET | No | Verify the authenticity of a traceability record |
| `/record` | POST | Yes | Add a new traceability record for a product |

## Supply Chain Routes
Base path: `/supply-chain`

| Endpoint | Method | Auth Required | Description |
|----------|--------|--------------|-------------|
| `/` | GET | No | Get all supply chains |
| `/:id` | GET | No | Get a specific supply chain by ID |
| `/` | POST | Yes | Create a new supply chain |
| `/:id` | PUT | Yes | Update an existing supply chain |
| `/:id` | DELETE | Yes | Delete a supply chain |
| `/:id/links` | POST | Yes | Add a new link to a supply chain |
| `/product/:productId` | GET | No | Get the supply chain for a specific product |

## Transaction Routes
Base path: `/transactions`

| Endpoint | Method | Auth Required | Description |
|----------|--------|--------------|-------------|
| `/` | GET | Yes | Get all transactions |
| `/:id` | GET | Yes | Get a specific transaction by ID |
| `/` | POST | Yes | Create a new transaction |
| `/:id` | PUT | Yes | Update an existing transaction |
| `/user/:userId` | GET | Yes | Get all transactions for a specific user |
| `/product/:productId` | GET | Yes | Get all transactions for a specific product |
| `/:id/process-payment` | POST | Yes | Process payment for a transaction |
| `/:id/record-delivery` | POST | Yes | Record delivery for a transaction |

## Forecast Routes
Base path: `/forecast`

| Endpoint | Method | Auth Required | Role | Description |
|----------|--------|--------------|------|-------------|
| `/demand` | GET | No | Any | Get demand forecasts for agricultural products |
| `/market-trends` | GET | No | Any | Get market price trends |
| `/models` | POST | Yes | Admin | Create a new forecast model |
| `/models/:modelId/predictions` | POST | Yes | Admin | Add predictions to a forecast model |
| `/models/:modelId/apply` | POST | Yes | Admin | Apply demand predictions to products |
| `/market-prices` | POST | Yes | Admin | Add market price data |

---

## API Response Format

The general format for all API responses follows this structure:

```json
{
  "message": "Human-readable message about the operation",
  "data": { ... } // Operation-specific data
}
```

For error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information" // Only in development mode
}
``` 