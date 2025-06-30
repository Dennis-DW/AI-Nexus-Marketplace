const Purchase = require('../models/Purchase');
const Model = require('../models/Model');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Constants
const TOKENS_PER_ETH = 1000; // 1 ETH = 1000 tokens
const PLATFORM_FEE_PERCENTAGE = 2.5; // 2.5% platform fee
const ETH_USD_RATE = 3500; // Current ETH price in USD (update as needed)

// Helper function to convert ETH to USD
const ethToUSD = (ethAmount) => {
  return parseFloat(ethAmount) * ETH_USD_RATE;
};

// Helper function to convert tokens to ETH
const tokensToEth = (tokenAmount) => {
  return parseFloat(tokenAmount) / TOKENS_PER_ETH;
};

// Helper function to convert tokens to USD
const tokensToUSD = (tokenAmount) => {
  const ethAmount = tokensToEth(tokenAmount);
  return ethToUSD(ethAmount);
};

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

    // Calculate total revenue with better breakdown
    const revenueStats = await Purchase.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: '$priceInETH' } },
          totalRevenueUSD: { $sum: '$priceInUSD' },
          totalTokenRevenue: { $sum: { $toDouble: '$priceInTokens' } },
          totalPlatformFees: { $sum: { $toDouble: '$priceInETH' } }, // Will calculate platform fees
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // Calculate platform fees (2.5% of total revenue)
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const platformFees = totalRevenue * (PLATFORM_FEE_PERCENTAGE / 100);
    const platformFeesUSD = ethToUSD(platformFees);

    // Calculate token revenue in USD
    const totalTokenRevenue = revenueStats.length > 0 ? revenueStats[0].totalTokenRevenue : 0;
    const totalTokenRevenueUSD = tokensToUSD(totalTokenRevenue);

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
          recentRevenue: { $sum: { $toDouble: '$priceInETH' } },
          recentTokenRevenue: { $sum: { $toDouble: '$priceInTokens' } }
        }
      }
    ]);

    // Get new models in last 7 days
    const newModels = await Model.countDocuments({
      isActive: true,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Calculate average transaction value
    const totalTransactions = revenueStats.length > 0 ? revenueStats[0].totalTransactions : 0;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const averageTransactionValueUSD = ethToUSD(averageTransactionValue);

    const stats = {
      totalModels,
      totalPurchases,
      uniqueBuyers: uniqueBuyers.length,
      uniqueSellers: uniqueSellers.length,
      totalRevenue: totalRevenue.toFixed(6),
      totalRevenueUSD: ethToUSD(totalRevenue).toFixed(2),
      totalTokenRevenue: totalTokenRevenue.toFixed(2),
      totalTokenRevenueUSD: totalTokenRevenueUSD.toFixed(2),
      platformFees: platformFees.toFixed(6),
      platformFeesUSD: platformFeesUSD.toFixed(2),
      averageTransactionValue: averageTransactionValue.toFixed(6),
      averageTransactionValueUSD: averageTransactionValueUSD.toFixed(2),
      totalTransactions,
      topCategories,
      recentActivity: {
        purchases: recentActivity.length > 0 ? recentActivity[0].purchases : 0,
        newModels,
        recentRevenue: recentActivity.length > 0 ? recentActivity[0].recentRevenue.toFixed(6) : '0',
        recentTokenRevenue: recentActivity.length > 0 ? recentActivity[0].recentTokenRevenue.toFixed(2) : '0'
      },
      // Token conversion info
      tokenConversion: {
        tokensPerEth: TOKENS_PER_ETH,
        platformFeePercentage: PLATFORM_FEE_PERCENTAGE,
        ethUsdRate: ETH_USD_RATE
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
          tokenVolume: { $sum: { $toDouble: '$priceInTokens' } },
          platformFees: { $sum: { $toDouble: '$priceInETH' } } // Will calculate platform fees
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create chart data with all dates filled and platform fees calculated
    const chartData = dateArray.map(date => {
      const dayData = dailyData.find(d => d._id === date);
      if (dayData) {
        const platformFees = dayData.volume * (PLATFORM_FEE_PERCENTAGE / 100);
        const platformFeesUSD = ethToUSD(platformFees);
        const tokenVolumeUSD = tokensToUSD(dayData.tokenVolume);
        
        return {
          date,
          volume: parseFloat(dayData.volume.toFixed(6)),
          volumeUSD: parseFloat(dayData.volumeUSD.toFixed(2)),
          transactions: dayData.transactions,
          tokenVolume: parseFloat(dayData.tokenVolume.toFixed(2)),
          tokenVolumeUSD: parseFloat(tokenVolumeUSD.toFixed(2)),
          platformFees: parseFloat(platformFees.toFixed(6)),
          platformFeesUSD: parseFloat(platformFeesUSD.toFixed(2))
        };
      } else {
        return {
          date,
          volume: 0,
          volumeUSD: 0,
          transactions: 0,
          tokenVolume: 0,
          tokenVolumeUSD: 0,
          platformFees: 0,
          platformFeesUSD: 0
        };
      }
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
          _id: null,
          totalVolume: { $sum: { $toDouble: '$priceInETH' } },
          totalVolumeUSD: { $sum: '$priceInUSD' },
          totalTokenVolume: { $sum: { $toDouble: '$priceInTokens' } },
          totalTransactions: { $sum: 1 },
          uniqueBuyers: { $addToSet: '$walletAddress' },
          uniqueSellers: { $addToSet: '$sellerAddress' }
        }
      }
    ]);

    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    const prevTrends = await Purchase.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: prevStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: { $toDouble: '$priceInETH' } },
          totalVolumeUSD: { $sum: '$priceInUSD' },
          totalTokenVolume: { $sum: { $toDouble: '$priceInTokens' } },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const currentData = trends.length > 0 ? trends[0] : {
      totalVolume: 0,
      totalVolumeUSD: 0,
      totalTokenVolume: 0,
      totalTransactions: 0,
      uniqueBuyers: [],
      uniqueSellers: []
    };

    const prevData = prevTrends.length > 0 ? prevTrends[0] : {
      totalVolume: 0,
      totalVolumeUSD: 0,
      totalTokenVolume: 0,
      totalTransactions: 0
    };

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const trendsData = {
      period,
      current: {
        volume: currentData.totalVolume.toFixed(6),
        volumeUSD: currentData.totalVolumeUSD.toFixed(2),
        tokenVolume: currentData.totalTokenVolume.toFixed(2),
        tokenVolumeUSD: tokensToUSD(currentData.totalTokenVolume).toFixed(2),
        transactions: currentData.totalTransactions,
        uniqueBuyers: currentData.uniqueBuyers.length,
        uniqueSellers: currentData.uniqueSellers.length,
        platformFees: (currentData.totalVolume * (PLATFORM_FEE_PERCENTAGE / 100)).toFixed(6),
        platformFeesUSD: ethToUSD(currentData.totalVolume * (PLATFORM_FEE_PERCENTAGE / 100)).toFixed(2)
      },
      previous: {
        volume: prevData.totalVolume.toFixed(6),
        volumeUSD: prevData.totalVolumeUSD.toFixed(2),
        tokenVolume: prevData.totalTokenVolume.toFixed(2),
        tokenVolumeUSD: tokensToUSD(prevData.totalTokenVolume).toFixed(2),
        transactions: prevData.totalTransactions
      },
      changes: {
        volume: calculateChange(currentData.totalVolume, prevData.totalVolume).toFixed(2),
        volumeUSD: calculateChange(currentData.totalVolumeUSD, prevData.totalVolumeUSD).toFixed(2),
        tokenVolume: calculateChange(currentData.totalTokenVolume, prevData.totalTokenVolume).toFixed(2),
        transactions: calculateChange(currentData.totalTransactions, prevData.totalTransactions).toFixed(2)
      }
    };

    res.json({
      success: true,
      data: trendsData
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