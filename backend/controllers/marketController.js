const Purchase = require('../models/Purchase');
const Model = require('../models/Model');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get market statistics
const getStats = async (req, res) => {
  try {
    // Get total models
    const totalModels = await Model.countDocuments({ isActive: true });

    // Get total purchases
    const totalPurchases = await Purchase.countDocuments({ status: 'confirmed' });

    // Get unique buyers and sellers
    const [uniqueBuyers, uniqueSellers] = await Promise.all([
      Purchase.distinct('walletAddress'),
      Purchase.distinct('sellerAddress')
    ]);

    // Calculate total revenue
    const revenueStats = await Purchase.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$priceInETH' } },
          totalRevenueUSD: { $sum: '$priceInUSD' },
          totalTokenRevenue: { $sum: { $toDouble: '$priceInTokens' } }
        }
      }
    ]);

    // Get top categories
    const topCategories = await Model.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Purchase.aggregate([
      { 
        $match: { 
          status: 'confirmed',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: null,
          purchases: { $sum: 1 },
          newModels: { $sum: 1 } // This will be updated separately
        }
      }
    ]);

    // Get new models in last 7 days
    const newModels = await Model.countDocuments({
      isActive: true,
      createdAt: { $gte: sevenDaysAgo }
    });

    const stats = {
      totalModels,
      totalPurchases,
      uniqueBuyers: uniqueBuyers.length,
      uniqueSellers: uniqueSellers.length,
      totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue.toString() : '0',
      totalRevenueUSD: revenueStats.length > 0 ? revenueStats[0].totalRevenueUSD.toString() : '0',
      totalTokenRevenue: revenueStats.length > 0 ? revenueStats[0].totalTokenRevenue.toString() : '0',
      topCategories,
      recentActivity: {
        purchases: recentActivity.length > 0 ? recentActivity[0].purchases : 0,
        newModels
      }
    };

    res.json({
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

// Get chart data for volume and transactions
const getChartData = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysInt = parseInt(days);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInt);

    // Generate date array for the period
    const dateArray = [];
    for (let i = 0; i < daysInt; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dateArray.push(date.toISOString().split('T')[0]);
    }

    // Get daily purchase data
    const dailyData = await Purchase.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          volume: { $sum: { $toDouble: '$priceInETH' } },
          volumeUSD: { $sum: '$priceInUSD' },
          transactions: { $sum: 1 },
          tokenVolume: { $sum: { $toDouble: '$priceInTokens' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create chart data with all dates filled
    const chartData = dateArray.map(date => {
      const dayData = dailyData.find(d => d._id === date);
      return {
        date,
        volume: dayData ? parseFloat(dayData.volume.toFixed(4)) : 0,
        volumeUSD: dayData ? parseFloat(dayData.volumeUSD.toFixed(2)) : 0,
        transactions: dayData ? dayData.transactions : 0,
        tokenVolume: dayData ? parseFloat(dayData.tokenVolume.toFixed(2)) : 0
      };
    });

    res.json({
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

// Get market trends
const getMarketTrends = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let days;
    switch (period) {
      case '24h':
        days = 1;
        break;
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      default:
        days = 7;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get trends data
    const trends = await Purchase.aggregate([
      {
        $match: {
          status: 'confirmed',
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
          uniqueBuyers: { $addToSet: '$walletAddress' },
          uniqueSellers: { $addToSet: '$sellerAddress' }
        }
      },
      {
        $project: {
          date: '$_id',
          volume: 1,
          transactions: 1,
          uniqueBuyers: { $size: '$uniqueBuyers' },
          uniqueSellers: { $size: '$uniqueSellers' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Calculate growth rates
    const totalVolume = trends.reduce((sum, day) => sum + day.volume, 0);
    const totalTransactions = trends.reduce((sum, day) => sum + day.transactions, 0);
    const avgVolume = totalVolume / trends.length;
    const avgTransactions = totalTransactions / trends.length;

    res.json({
      success: true,
      data: {
        trends,
        summary: {
          totalVolume: parseFloat(totalVolume.toFixed(4)),
          totalTransactions,
          avgVolume: parseFloat(avgVolume.toFixed(4)),
          avgTransactions: Math.round(avgTransactions),
          period
        }
      }
    });

  } catch (error) {
    console.error('Error fetching market trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market trends',
      error: error.message
    });
  }
};

// Get top performing models
const getTopModels = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topModels = await Purchase.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$modelId',
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: { $toDouble: '$priceInETH' } },
          totalRevenueUSD: { $sum: '$priceInUSD' },
          avgPrice: { $avg: { $toDouble: '$priceInETH' } }
        }
      },
      {
        $lookup: {
          from: 'models',
          localField: '_id',
          foreignField: '_id',
          as: 'model'
        }
      },
      { $unwind: '$model' },
      {
        $project: {
          modelId: '$_id',
          name: '$model.name',
          type: '$model.type',
          description: '$model.description',
          image: '$model.image',
          totalSales: 1,
          totalRevenue: 1,
          totalRevenueUSD: 1,
          avgPrice: 1
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: topModels
    });

  } catch (error) {
    console.error('Error fetching top models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top models',
      error: error.message
    });
  }
};

// Get market insights
const getMarketInsights = async (req, res) => {
  try {
    // Get overall market health metrics
    const [totalModels, totalPurchases, totalUsers] = await Promise.all([
      Model.countDocuments({ isActive: true }),
      Purchase.countDocuments({ status: 'confirmed' }),
      User.countDocuments()
    ]);

    // Get recent activity
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const recentActivity = await Purchase.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: last24Hours }
        }
      },
      {
        $group: {
          _id: null,
          purchases24h: { $sum: 1 },
          volume24h: { $sum: { $toDouble: '$priceInETH' } },
          uniqueBuyers24h: { $addToSet: '$walletAddress' }
        }
      }
    ]);

    // Get transaction type distribution
    const transactionTypes = await Purchase.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 },
          volume: { $sum: { $toDouble: '$priceInETH' } }
        }
      }
    ]);

    // Get token vs ETH usage
    const paymentMethods = await Purchase.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: null,
          ethTransactions: {
            $sum: { $cond: [{ $gt: [{ $toDouble: '$priceInETH' }, 0] }, 1, 0] }
          },
          tokenTransactions: {
            $sum: { $cond: [{ $gt: [{ $toDouble: '$priceInTokens' }, 0] }, 1, 0] }
          },
          ethVolume: { $sum: { $toDouble: '$priceInETH' } },
          tokenVolume: { $sum: { $toDouble: '$priceInTokens' } }
        }
      }
    ]);

    const insights = {
      marketHealth: {
        totalModels,
        totalPurchases,
        totalUsers,
        activeModels: totalModels,
        purchaseRate: totalPurchases > 0 ? (totalPurchases / totalModels).toFixed(2) : 0
      },
      recentActivity: {
        purchases24h: recentActivity.length > 0 ? recentActivity[0].purchases24h : 0,
        volume24h: recentActivity.length > 0 ? parseFloat(recentActivity[0].volume24h.toFixed(4)) : 0,
        uniqueBuyers24h: recentActivity.length > 0 ? recentActivity[0].uniqueBuyers24h.length : 0
      },
      transactionTypes,
      paymentMethods: paymentMethods.length > 0 ? paymentMethods[0] : {
        ethTransactions: 0,
        tokenTransactions: 0,
        ethVolume: 0,
        tokenVolume: 0
      }
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Error fetching market insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market insights',
      error: error.message
    });
  }
};

module.exports = {
  getStats,
  getChartData,
  getMarketTrends,
  getTopModels,
  getMarketInsights
}; 