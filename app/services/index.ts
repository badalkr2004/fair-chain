import api from './api';
import authService from './auth';

// Re-export services
export { default as api } from './api';
export { default as authService } from './auth';

// Export types and functions from other service files
export * from './products';
export * from './produce';
export * from './transactions';
export * from './traceability';
export * from './orders';
export * from './bids';
export * from './supplyChain';

export default {
  api,
  auth: authService,
}; 