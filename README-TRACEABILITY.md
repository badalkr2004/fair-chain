# FairChain Traceability System

## Overview
The traceability system in FairChain enables end-to-end tracking of agricultural products from the farm to the consumer. It provides transparency into the supply chain, allowing all stakeholders to verify the authenticity and journey of each product.

## Key Features
- **Product Registration**: Farmers can register their products for traceability
- **Supply Chain Events**: Record events as products move through the supply chain
- **Verification**: QR codes and tracking IDs for product verification
- **Timeline View**: Visualize the complete journey of a product

## How It Works

### 1. Farmer Registers a Product
Farmers can register products for traceability in two ways:
- Register a new product directly for traceability
- Register an existing listed product for traceability

When registering, the farmer provides:
- Product name
- Quantity and unit
- Batch number
- Production and expiry dates
- Origin location
- Certifications (optional)

### 2. Recording Supply Chain Events
As the product moves through the supply chain, different events can be recorded:
- **Harvested**: Initial stage when the crop is harvested
- **Processed**: Product undergoes processing
- **Packaged**: Product is packaged for distribution
- **Shipped**: Product is shipped to the next destination
- **Received**: Product is received at a destination
- **Quality Check**: Product undergoes quality verification
- **Stored**: Product is placed in storage

Each event captures:
- Event type
- Location
- Timestamp
- Additional details specific to the event

### 3. Viewing Traceability Data
- **Farmer Dashboard**: Shows supply chain activities for the farmer's products
- **Product Traceability Screen**: Detailed timeline view of the product journey
- **Consumer View**: Consumers can scan QR codes to verify product authenticity and view its journey

## Technical Implementation
The traceability system uses a combination of:
- Secure record-keeping with hash chaining for data integrity
- API endpoints for registering products and recording events
- Mobile app interfaces for all stakeholders

## API Endpoints
- `POST /trace/record`: Register a new product or record an event
- `GET /trace/product/:productId`: Get product traceability data
- `GET /trace/products/my`: Get user's traceable products
- `GET /trace/verify/:recordId`: Verify a traceability record

## Future Enhancements
- Blockchain integration for immutable record-keeping
- IoT sensor integration for automated event recording
- Enhanced analytics on supply chain efficiency
- Integration with certification authorities for verification 