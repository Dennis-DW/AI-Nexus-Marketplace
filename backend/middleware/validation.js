const { validateEthAddress, validateTxHash, PLATFORM_CONFIG } = require('../config/constants');

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page = 1, limit = PLATFORM_CONFIG.DEFAULTS.PAGE_SIZE } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1 || limitNum < 1 || limitNum > PLATFORM_CONFIG.DEFAULTS.MAX_PAGE_SIZE) {
    return res.status(400).json({
      success: false,
      message: `Invalid pagination parameters. Page must be >= 1, limit must be between 1 and ${PLATFORM_CONFIG.DEFAULTS.MAX_PAGE_SIZE}`
    });
  }
  
  req.query.page = pageNum;
  req.query.limit = limitNum;
  next();
};

// Validate Ethereum address
const validateAddress = (req, res, next) => {
  const { address } = req.params;
  
  if (!validateEthAddress(address)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Ethereum address format'
    });
  }
  
  next();
};

// Validate transaction hash
const validateTransactionHash = (req, res, next) => {
  const { txHash } = req.params;
  
  if (!validateTxHash(txHash)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid transaction hash format'
    });
  }
  
  next();
};

// Validate search query
const validateSearch = (req, res, next) => {
  const { search } = req.query;
  
  if (search && search.length < PLATFORM_CONFIG.DEFAULTS.SEARCH_MIN_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Search query must be at least ${PLATFORM_CONFIG.DEFAULTS.SEARCH_MIN_LENGTH} characters long`
    });
  }
  
  next();
};

// Validate date range
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start date format'
    });
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid end date format'
    });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be after end date'
    });
  }
  
  next();
};

// Validate network parameter
const validateNetwork = (req, res, next) => {
  const { network } = req.query;
  
  if (network && !Object.values(PLATFORM_CONFIG.NETWORKS).find(net => net.name === network)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid network parameter',
      validNetworks: Object.values(PLATFORM_CONFIG.NETWORKS).map(net => net.name)
    });
  }
  
  next();
};

module.exports = {
  validatePagination,
  validateAddress,
  validateTransactionHash,
  validateSearch,
  validateDateRange,
  validateNetwork
}; 