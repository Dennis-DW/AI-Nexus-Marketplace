const express = require('express');
const router = express.Router();
const {
  getStats,
  getChartData,
  getMarketTrends,
  getTopModels,
  getMarketInsights
} = require('../controllers/marketController');

// Get market statistics
router.get('/stats', getStats);

// Get chart data
router.get('/chart-data', getChartData);

// Get market trends
router.get('/trends', getMarketTrends);

// Get top performing models
router.get('/top-models', getTopModels);

// Get market insights
router.get('/insights', getMarketInsights);

module.exports = router; 