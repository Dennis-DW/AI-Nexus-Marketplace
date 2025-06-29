const express = require('express');
const router = express.Router();
const {
  getPurchases,
  getPurchaseById,
  logPurchase,
  logTokenPurchase,
  updatePurchaseStatus,
  getPurchaseStats,
  getUserPurchaseHistory,
  // Legacy functions for backward compatibility
  getPurchasesByAddress,
  getTransactionHistory,
  getTransactionByHash,
  updateTransactionStatus,
  getTransactionStats,
  getAllPurchases
} = require('../controllers/purchaseController');

// Get all purchases with filtering and pagination
router.get('/', getPurchases);

// Get purchase statistics
router.get('/stats', getPurchaseStats);

// Get purchase by ID
router.get('/purchase/:id', getPurchaseById);

// Log a new purchase (ETH-based)
router.post('/', logPurchase);

// Log a token-based purchase
router.post('/token', logTokenPurchase);

// Update purchase status
router.put('/purchase/:id/status', updatePurchaseStatus);

// Get user's purchase history
router.get('/user/:walletAddress', getUserPurchaseHistory);

// Legacy routes for backward compatibility
// Get purchases by address
router.get('/:address', getPurchasesByAddress);

// Get transaction history
router.get('/transactions', getTransactionHistory);

// Get transaction by hash
router.get('/transactions/:txHash', getTransactionByHash);

// Update transaction status
router.put('/transactions/:txHash/status', updateTransactionStatus);

// Get transaction statistics
router.get('/transactions/stats', getTransactionStats);

// Get all purchases for analytics
router.get('/all', getAllPurchases);

module.exports = router; 