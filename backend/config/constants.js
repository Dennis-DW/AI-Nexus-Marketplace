// Platform configuration constants
const PLATFORM_CONFIG = {
  // Platform fee percentage (2.5%)
  PLATFORM_FEE_PERCENTAGE: 2.5,
  
  // Network configurations
  NETWORKS: {
    HOLESKY: {
      name: 'holesky',
      chainId: 17000,
      displayName: 'Holesky Testnet'
    },
    ETHEREUM: {
      name: 'ethereum',
      chainId: 1,
      displayName: 'Ethereum Mainnet'
    },
    LOCAL: {
      name: 'local',
      chainId: 1337,
      displayName: 'Local Network'
    }
  },
  
  // Default values
  DEFAULTS: {
    PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_MIN_LENGTH: 2,
    MAX_SEARCH_RESULTS: 50
  },
  
  // Validation patterns
  PATTERNS: {
    ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
    TX_HASH: /^0x[a-fA-F0-9]{64}$/,
    FILE_HASH: /^[a-fA-F0-9]{64}$/
  },
  
  // Transaction types
  TRANSACTION_TYPES: {
    DATABASE_MODEL_PURCHASE: 'database_model_purchase',
    CONTRACT_MODEL_PURCHASE: 'contract_model_purchase',
    TOKEN_PURCHASE: 'token_purchase'
  },
  
  // Model types
  MODEL_TYPES: ['NLP', 'Computer Vision', 'Audio', 'Generative', 'Prediction', 'Other'],
  
  // Status values
  STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  }
};

// Utility functions
const calculatePlatformFee = (amount) => {
  return (parseFloat(amount) * (PLATFORM_CONFIG.PLATFORM_FEE_PERCENTAGE / 100)).toString();
};

const calculateSellerAmount = (amount) => {
  const platformFee = calculatePlatformFee(amount);
  return (parseFloat(amount) - parseFloat(platformFee)).toString();
};

const validateEthAddress = (address) => {
  return PLATFORM_CONFIG.PATTERNS.ETH_ADDRESS.test(address);
};

const validateTxHash = (hash) => {
  return PLATFORM_CONFIG.PATTERNS.TX_HASH.test(hash);
};

const validateFileHash = (hash) => {
  return PLATFORM_CONFIG.PATTERNS.FILE_HASH.test(hash);
};

const getNetworkConfig = (networkName) => {
  const network = Object.values(PLATFORM_CONFIG.NETWORKS).find(
    net => net.name === networkName
  );
  return network || PLATFORM_CONFIG.NETWORKS.LOCAL;
};

module.exports = {
  PLATFORM_CONFIG,
  calculatePlatformFee,
  calculateSellerAmount,
  validateEthAddress,
  validateTxHash,
  validateFileHash,
  getNetworkConfig
}; 