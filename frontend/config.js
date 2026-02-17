/**
 * TrustBank Configuration
 * 
 * Central configuration file for the TrustBank frontend application.
 * Modify these settings based on your deployment environment.
 */

const CONFIG = {
  // API Configuration
  API_BASE_URL: "http://localhost:8081/api",
  
  // Feature Flags
  FEATURES: {
    enableCharts: true,
    enableTransactionHistory: true,
    enableAutoRefresh: true,
  },
  
  // UI Configuration
  UI: {
    toastDuration: 3000, // milliseconds
    autoRefreshInterval: 30000, // 30 seconds
    maxTransactionsDisplay: 50,
  },
  
  // App Metadata
  APP: {
    name: "TrustBank",
    version: "1.0.0",
    environment: "development", // development | production
  },
  
  // Validation Rules
  VALIDATION: {
    minPinLength: 4,
    maxPinLength: 6,
    minDepositAmount: 1,
    minWithdrawAmount: 1,
    minTransferAmount: 1,
  },
};

// For backward compatibility, expose API constant
const API = CONFIG.API_BASE_URL;

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.APP);
Object.freeze(CONFIG.VALIDATION);

console.log(`🏦 TrustBank v${CONFIG.APP.version} - ${CONFIG.APP.environment} mode`);
