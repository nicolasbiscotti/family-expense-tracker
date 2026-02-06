/**
 * Utilities Index
 * 
 * Re-exports all utility functions for convenient importing
 */

// Environment Configuration
export {
  getAppEnvironment,
  isLocalEnvironment,
  isPreviewEnvironment,
  isProductionEnvironment,
  useEmulators,
  getFirestoreRootPath,
  getCollectionPath,
  getDocumentPath,
  getEnvironmentConfig,
  logEnvironmentInfo,
  validateEnvironmentConfig,
} from './environment';

// Helper Functions
export {
  // ID Generation
  generateId,
  
  // Date Formatting
  formatDate,
  formatDateISO,
  formatDateForInput,
  parseDateFromInput,
  getMonthName,
  getMonthNameShort,
  getMonthRange,
  
  // Currency Formatting
  formatCurrency,
  formatCurrencyValue,
  parseCurrency,
  dollarsToCents,
  centsToDollars,
  
  // String Utilities
  truncate,
  capitalize,
  parseTags,
  formatTags,
  
  // Validation
  isValidEmail,
  isValidPassword,
  isValidAmount,
  
  // Percentage
  calculatePercentChange,
  formatPercentChange,
  
  // Debounce & Throttle
  debounce,
  throttle,
  
  // Storage
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from './helpers';
