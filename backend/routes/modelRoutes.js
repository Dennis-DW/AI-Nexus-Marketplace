const express = require('express');
const router = express.Router();
const {
  addModel,
  getAllModels,
  getModelById,
  getTrendingModels,
  getFeaturedModels,
  getMarketStats,
  getChartData
} = require('../controllers/modelController');

// Model routes
router.post('/models', addModel);
router.get('/models', getAllModels);
router.get('/models/trending', getTrendingModels);
router.get('/models/featured', getFeaturedModels);
router.get('/models/:id', getModelById);

// Market data routes
router.get('/market/stats', getMarketStats);
router.get('/market/chart-data', getChartData);

module.exports = router;