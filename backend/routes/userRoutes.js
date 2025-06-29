const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  getAllUsers,
  getUserActivity,
  getUserSalesHistory
} = require('../controllers/userController');

// User profile routes
router.get('/profile/:walletAddress', getUserProfile);
router.put('/profile/:walletAddress', updateUserProfile);
router.get('/dashboard/:walletAddress', getUserDashboard);
router.get('/activity/:walletAddress', getUserActivity);
router.get('/sales/:walletAddress', getUserSalesHistory);
router.get('/', getAllUsers);

module.exports = router;