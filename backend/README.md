# FairChain - AI-Powered Transparent Agri-Marketplace

FairChain is a transparent platform that connects farmers, intermediaries, and consumers in the agricultural supply chain. It ensures fair profit distribution and traceability from farm to table with AI-powered demand forecasting.

## Features

1. **User Management**: Separate profiles for farmers, intermediaries (logistics, aggregators), and consumers.
2. **Product Listing**: Farmers can list their produce with details including pricing and availability.
3. **AI-Powered Demand Forecasting**: Prediction of market demand and pricing trends.
4. **Transparent Pricing Model**: Fair profit-sharing with clear breakdown.
5. **End-to-End Traceability**: Track produce from farm to consumer with blockchain-inspired verification.
6. **Secure Transactions**: Manage orders and payments with built-in escrow functionality.
7. **Rating System**: Build trust with feedback for all participants.

## Tech Stack

- **Backend**: Node.js with Express.js & TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth system
- **AI/ML**: Demand forecasting using time series models
- **Traceability**: Hash chain for immutable record-keeping

## Getting Started

### Prerequisites

- Node.js 18+ and Bun
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fairchain.git
cd fairchain/backend
```

2. Install dependencies
```bash
bun install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Initialize the database
```bash
bun run prisma:generate
bun run prisma:migrate
```

5. Start the development server
```bash
bun run dev
```

## API Documentation

### Authentication Endpoints

#### `POST /auth/signup`
Register a new user (farmer, intermediary, or consumer).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "FARMER", 
  "phone": "1234567890",
  "address": "123 Farm St, Rural County",
  "location": { "lat": 37.7749, "lng": -122.4194 },
  "profileData": {
    "farmSize": 50.5,
    "farmLocation": "Rural County",
    "cropTypes": ["wheat", "corn"],
    "certifications": ["organic"]
  }
}
```

#### `POST /auth/login`
Log in a user and get authentication tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### `POST /auth/refresh-token`
Refresh the authentication token.

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### `GET /auth/profile`
Get the current user's profile.

#### `PUT /auth/profile`
Update the current user's profile.

#### `POST /auth/change-password`
Change the current user's password.

### Product Endpoints

#### `POST /products`
Create a new product listing (farmers only).

**Request Body:**
```json
{
  "name": "Organic Apples",
  "description": "Fresh organic apples from our farm",
  "category": "FRUITS",
  "quantity": 100,
  "unit": "kg",
  "basePrice": 2.5,
  "harvestDate": "2023-10-15",
  "availableUntil": "2023-11-15",
  "location": { "lat": 37.7749, "lng": -122.4194 },
  "organicCertified": true,
  "images": ["url-to-image-1", "url-to-image-2"]
}
```

#### `GET /products`
Get all products with optional filtering.

**Query Parameters:**
- `category`: Filter by product category
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `status`: Product status (DRAFT, LISTED, SOLD, etc.)
- `farmerId`: Filter by farmer
- `organic`: Filter for organic products (true/false)
- `search`: Search by name

#### `GET /products/:id`
Get a single product by ID.

#### `PUT /products/:id`
Update a product (farmers only).

#### `DELETE /products/:id`
Delete a product (farmers only).

#### `GET /products/my/products`
Get products listed by the current farmer.

### Order Endpoints

#### `POST /orders`
Create a new order (consumers only).

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 10
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "country": "USA",
    "coordinates": { "lat": 37.7749, "lng": -122.4194 }
  },
  "notes": "Please deliver in the morning"
}
```

#### `GET /orders/:id`
Get an order by ID.

#### `PATCH /orders/:id/status`
Update order status.

**Request Body:**
```json
{
  "status": "CONFIRMED", 
  "reason": "Customer requested" 
}
```

#### `GET /orders/my/orders`
Get orders placed by the current consumer.

#### `GET /orders/farmer/orders`
Get orders for products supplied by the current farmer.

### Forecasting Endpoints

#### `GET /forecast/demand`
Get demand forecasts for products.

**Query Parameters:**
- `category`: Filter by product category
- `region`: Filter by region

#### `GET /forecast/market-trends`
Get market price trends.

**Query Parameters:**
- `category`: Filter by product category
- `location`: Filter by location
- `days`: Number of days of history (default: 30)

### Traceability Endpoints

#### `GET /trace/record/:identifier`
Get a traceability record by tracking ID or QR code.

#### `GET /trace/product/:productId`
Get the complete traceability chain for a product.

#### `GET /trace/verify/:recordId`
Verify the authenticity of a traceability record.

#### `POST /trace/record`
Add a new traceability record (farmers or admins only).

**Request Body:**
```json
{
  "productId": "product-uuid",
  "eventType": "HARVESTED",
  "location": { "lat": 37.7749, "lng": -122.4194 },
  "metadata": {
    "batchNumber": "BATCH123",
    "temperature": 24.5,
    "humidity": 65
  }
}
```

## License

[MIT License](LICENSE)