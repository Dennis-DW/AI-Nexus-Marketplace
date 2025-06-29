const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Model = require('../models/Model');

// Get or create user profile
const getUserProfile = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        lastActive: new Date()
      });
      await user.save();
    } else {
      // Update last active
      user.lastActive = new Date();
      await user.save();
    }

    // Get user statistics
    const [totalPurchases, totalSales, ownedModels] = await Promise.all([
      Purchase.countDocuments({ walletAddress: walletAddress.toLowerCase() }),
      Purchase.countDocuments({ sellerAddress: walletAddress.toLowerCase() }),
      Model.countDocuments({ sellerAddress: walletAddress.toLowerCase(), isActive: true })
    ]);

    const userProfile = {
      ...user.toObject(),
      stats: {
        totalPurchases,
        totalSales,
        ownedModels
      }
    };

    res.status(200).json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { username, email, bio, avatar, preferences } = req.body;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences !== undefined) updateData.preferences = preferences;

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      updateData,
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get user dashboard data
const getUserDashboard = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    const [user, purchases, listedModels, recentActivity] = await Promise.all([
      User.findOne({ walletAddress: walletAddress.toLowerCase() }),
      Purchase.find({ walletAddress: walletAddress.toLowerCase() })
        .populate('modelId', 'name type price')
        .sort({ createdAt: -1 })
        .limit(10),
      Model.find({ sellerAddress: walletAddress.toLowerCase() })
        .sort({ createdAt: -1 })
        .limit(10),
      Purchase.find({
        $or: [
          { walletAddress: walletAddress.toLowerCase() },
          { sellerAddress: walletAddress.toLowerCase() }
        ]
      })
        .populate('modelId', 'name type')
        .sort({ createdAt: -1 })
        .limit(20)
    ]);

    // Calculate earnings
    const earnings = await Purchase.aggregate([
      { $match: { sellerAddress: walletAddress.toLowerCase() } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $toDouble: '$priceInETH' } },
          totalEarningsUSD: { $sum: '$priceInUSD' }
        }
      }
    ]);

    const dashboardData = {
      user,
      stats: {
        totalPurchases: purchases.length,
        totalListings: listedModels.length,
        totalEarnings: earnings.length > 0 ? earnings[0].totalEarnings : 0,
        totalEarningsUSD: earnings.length > 0 ? earnings[0].totalEarningsUSD : 0
      },
      recentPurchases: purchases,
      listedModels,
      recentActivity
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get all users (for admin/analytics)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find({})
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all activities (purchases and model listings)
    const [purchases, models] = await Promise.all([
      Purchase.find({ 
        $or: [
          { walletAddress: walletAddress.toLowerCase() },
          { sellerAddress: walletAddress.toLowerCase() }
        ]
      })
        .populate('modelId', 'name type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Model.find({ sellerAddress: walletAddress.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    ]);

    // Combine and sort activities
    const activities = [
      ...purchases.map(p => ({
        type: p.walletAddress.toLowerCase() === walletAddress.toLowerCase() ? 'purchase' : 'sale',
        data: p,
        createdAt: p.createdAt
      })),
      ...models.map(m => ({
        type: 'listing',
        data: m,
        createdAt: m.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  getAllUsers,
  getUserActivity
};