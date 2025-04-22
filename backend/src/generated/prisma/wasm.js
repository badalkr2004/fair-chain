
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  role: 'role',
  phone: 'phone',
  address: 'address',
  location: 'location',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FarmerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  farmSize: 'farmSize',
  farmLocation: 'farmLocation',
  farmCoordinates: 'farmCoordinates',
  cropTypes: 'cropTypes',
  certifications: 'certifications',
  bankDetails: 'bankDetails',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IntermediaryProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  serviceAreas: 'serviceAreas',
  capacity: 'capacity',
  services: 'services',
  licenseNumber: 'licenseNumber',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConsumerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  businessName: 'businessName',
  taxId: 'taxId',
  purchaseHistory: 'purchaseHistory',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  farmerId: 'farmerId',
  category: 'category',
  quantity: 'quantity',
  unit: 'unit',
  basePrice: 'basePrice',
  finalPrice: 'finalPrice',
  images: 'images',
  harvestDate: 'harvestDate',
  availableUntil: 'availableUntil',
  status: 'status',
  location: 'location',
  organicCertified: 'organicCertified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductAnalyticsScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  viewCount: 'viewCount',
  demandScore: 'demandScore',
  priceHistory: 'priceHistory',
  seasonalTrends: 'seasonalTrends',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BidScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  intermediaryId: 'intermediaryId',
  price: 'price',
  quantity: 'quantity',
  serviceType: 'serviceType',
  description: 'description',
  validUntil: 'validUntil',
  terms: 'terms',
  status: 'status',
  responseReason: 'responseReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SupplyChainScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  startDate: 'startDate',
  endDate: 'endDate',
  isComplete: 'isComplete',
  name: 'name',
  description: 'description',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SupplyChainLinkScalarFieldEnum = {
  id: 'id',
  supplyChainId: 'supplyChainId',
  type: 'type',
  fromUserId: 'fromUserId',
  toUserId: 'toUserId',
  timestamp: 'timestamp',
  location: 'location',
  details: 'details',
  carbonFootprint: 'carbonFootprint',
  certifications: 'certifications',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  serviceProviderId: 'serviceProviderId'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  buyerId: 'buyerId',
  totalAmount: 'totalAmount',
  status: 'status',
  deliveryAddress: 'deliveryAddress',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  totalPrice: 'totalPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  senderId: 'senderId',
  receiverId: 'receiverId',
  amount: 'amount',
  quantity: 'quantity',
  unit: 'unit',
  type: 'type',
  status: 'status',
  paymentMethod: 'paymentMethod',
  paymentReference: 'paymentReference',
  paymentDate: 'paymentDate',
  deliveryDate: 'deliveryDate',
  notes: 'notes',
  metadata: 'metadata',
  transactionId: 'transactionId',
  orderId: 'orderId',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TraceabilityRecordScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  orderId: 'orderId',
  qrCode: 'qrCode',
  trackingId: 'trackingId',
  eventType: 'eventType',
  location: 'location',
  timestamp: 'timestamp',
  verifiedBy: 'verifiedBy',
  metadata: 'metadata',
  previousHash: 'previousHash',
  currentHash: 'currentHash',
  createdAt: 'createdAt'
};

exports.Prisma.RatingScalarFieldEnum = {
  id: 'id',
  fromUserId: 'fromUserId',
  toUserId: 'toUserId',
  score: 'score',
  comment: 'comment',
  transactionId: 'transactionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ForecastModelScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  category: 'category',
  region: 'region',
  parameters: 'parameters',
  lastTrainedAt: 'lastTrainedAt',
  accuracy: 'accuracy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PredictionScalarFieldEnum = {
  id: 'id',
  modelId: 'modelId',
  category: 'category',
  region: 'region',
  predictionDate: 'predictionDate',
  predictedValue: 'predictedValue',
  actualValue: 'actualValue',
  accuracy: 'accuracy',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WeatherDataScalarFieldEnum = {
  id: 'id',
  location: 'location',
  date: 'date',
  temperature: 'temperature',
  humidity: 'humidity',
  rainfall: 'rainfall',
  windSpeed: 'windSpeed',
  forecast: 'forecast',
  source: 'source',
  createdAt: 'createdAt'
};

exports.Prisma.MarketPriceScalarFieldEnum = {
  id: 'id',
  productCategory: 'productCategory',
  location: 'location',
  date: 'date',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  averagePrice: 'averagePrice',
  source: 'source',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  FARMER: 'FARMER',
  INTERMEDIARY: 'INTERMEDIARY',
  CONSUMER: 'CONSUMER',
  ADMIN: 'ADMIN'
};

exports.IntermediaryType = exports.$Enums.IntermediaryType = {
  LOGISTICS: 'LOGISTICS',
  AGGREGATOR: 'AGGREGATOR',
  STORAGE: 'STORAGE',
  PROCESSOR: 'PROCESSOR'
};

exports.ConsumerType = exports.$Enums.ConsumerType = {
  RETAILER: 'RETAILER',
  END_USER: 'END_USER',
  BULK_BUYER: 'BULK_BUYER'
};

exports.ProductCategory = exports.$Enums.ProductCategory = {
  GRAINS: 'GRAINS',
  VEGETABLES: 'VEGETABLES',
  FRUITS: 'FRUITS',
  DAIRY: 'DAIRY',
  MEAT: 'MEAT',
  POULTRY: 'POULTRY',
  OTHER: 'OTHER'
};

exports.ProductStatus = exports.$Enums.ProductStatus = {
  DRAFT: 'DRAFT',
  LISTED: 'LISTED',
  SOLD: 'SOLD',
  PROCESSING: 'PROCESSING',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

exports.BidStatus = exports.$Enums.BidStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND',
  COMMISSION: 'COMMISSION',
  ESCROW_DEPOSIT: 'ESCROW_DEPOSIT',
  ESCROW_RELEASE: 'ESCROW_RELEASE',
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  TRANSFER: 'TRANSFER'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.Prisma.ModelName = {
  User: 'User',
  FarmerProfile: 'FarmerProfile',
  IntermediaryProfile: 'IntermediaryProfile',
  ConsumerProfile: 'ConsumerProfile',
  Product: 'Product',
  ProductAnalytics: 'ProductAnalytics',
  Bid: 'Bid',
  SupplyChain: 'SupplyChain',
  SupplyChainLink: 'SupplyChainLink',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Transaction: 'Transaction',
  TraceabilityRecord: 'TraceabilityRecord',
  Rating: 'Rating',
  ForecastModel: 'ForecastModel',
  Prediction: 'Prediction',
  WeatherData: 'WeatherData',
  MarketPrice: 'MarketPrice'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
