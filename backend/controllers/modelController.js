const Model = require('../models/Model');
const Purchase = require('../models/Purchase');
const mongoose = require('mongoose');

// Add a new AI model
const addModel = async (req, res) => {
  try {
    const { name, type, description, price, fileHash, sellerAddress, tags, category } = req.body;

    // Validate required fields
    if (!name || !type || !description || !price || !fileHash || !sellerAddress) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Create new model
    const newModel = new Model({
      name: name.trim(),
      type,
      description: description.trim(),
      price: price.toString(),
      fileHash,
      sellerAddress,
      tags: tags || [],
      category: category || type
    });

    const savedModel = await newModel.save();

    res.status(201).json({
      success: true,
      message: 'Model added successfully',
      data: savedModel
    });

  } catch (error) {
    console.error('Error adding model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add model',
      error: error.message
    });
  }
};

// Get all models with filtering and pagination
const getAllModels = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      category, 
      minPrice, 
      maxPrice, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      sellerAddress
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (sellerAddress) filter.sellerAddress = sellerAddress.toLowerCase();
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice.toString();
      if (maxPrice) filter.price.$lte = maxPrice.toString();
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const models = await Model.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const totalModels = await Model.countDocuments(filter);
    const totalPages = Math.ceil(totalModels / parseInt(limit));

    res.status(200).json({
      success: true,
      data: models,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalModels,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch models',
      error: error.message
    });
  }
};

// Get model details by ID
const getModelById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid model ID'
      });
    }

    const model = await Model.findById(id).select('-__v');

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    // Get purchase count for this model
    const purchaseCount = await Purchase.countDocuments({ modelId: id });

    res.status(200).json({
      success: true,
      data: {
        ...model.toObject(),
        purchaseCount
      }
    });

  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch model',
      error: error.message
    });
  }
};

// Get trending models (based on recent downloads and ratings)
const getTrendingModels = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get models with highest downloads in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent purchases to determine trending models
    const recentPurchases = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$modelId',
          purchaseCount: { $sum: 1 },
          totalRevenue: { $sum: { $toDouble: '$priceInETH' } }
        }
      },
      {
        $sort: { purchaseCount: -1, totalRevenue: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Get the actual model details
    const modelIds = recentPurchases.map(p => p._id);
    const trendingModels = await Model.find({
      _id: { $in: modelIds },
      isActive: true
    }).select('-__v');

    // Add trending metrics to models
    const modelsWithMetrics = trendingModels.map(model => {
      const metrics = recentPurchases.find(p => p._id.toString() === model._id.toString());
      return {
        ...model.toObject(),
        recentPurchases: metrics?.purchaseCount || 0,
        recentRevenue: metrics?.totalRevenue || 0
      };
    });

    res.status(200).json({
      success: true,
      data: modelsWithMetrics
    });

  } catch (error) {
    console.error('Error fetching trending models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending models',
      error: error.message
    });
  }
};

// Get featured models (manually curated)
const getFeaturedModels = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const featuredModels = await Model.find({ 
      isActive: true,
      isFeatured: true 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      data: featuredModels
    });

  } catch (error) {
    console.error('Error fetching featured models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured models',
      error: error.message
    });
  }
};

// Get market statistics
const getMarketStats = async (req, res) => {
  try {
    // Get total models
    const totalModels = await Model.countDocuments({ isActive: true });

    // Get total purchases
    const totalPurchases = await Purchase.countDocuments();

    // Get unique buyers and sellers
    const uniqueBuyers = await Purchase.distinct('walletAddress');
    const uniqueSellers = await Purchase.distinct('sellerAddress');

    // Calculate total revenue
    const revenueStats = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$priceInETH' } },
          totalRevenueUSD: { $sum: '$priceInUSD' }
        }
      }
    ]);

    // Get top categories
    const topCategories = await Model.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPurchases = await Purchase.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentModels = await Model.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      isActive: true
    });

    const stats = {
      totalModels,
      totalPurchases,
      uniqueBuyers: uniqueBuyers.length,
      uniqueSellers: uniqueSellers.length,
      totalRevenue: revenueStats[0]?.totalRevenue?.toString() || '0',
      totalRevenueUSD: revenueStats[0]?.totalRevenueUSD?.toString() || '0',
      topCategories,
      recentActivity: {
        purchases: recentPurchases,
        newModels: recentModels
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching market stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market statistics',
      error: error.message
    });
  }
};

// Get chart data for analytics
const getChartData = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get daily purchase data
    const dailyData = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          volume: { $sum: { $toDouble: '$priceInETH' } },
          transactions: { $sum: 1 },
          volumeUSD: { $sum: '$priceInUSD' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing dates with zero values
    const chartData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = dailyData.find(d => d._id === dateStr);

      chartData.push({
        date: dateStr,
        volume: existingData?.volume || 0,
        transactions: existingData?.transactions || 0,
        volumeUSD: existingData?.volumeUSD || 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      error: error.message
    });
  }
};

module.exports = {
  addModel,
  getAllModels,
  getModelById,
  getTrendingModels,
  getFeaturedModels,
  getMarketStats,
  getChartData
};