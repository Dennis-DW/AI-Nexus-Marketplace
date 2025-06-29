const Purchase = require('../models/Purchase');
const Transaction = require('../models/Transaction');
const Model = require('../models/Model');
const { ethers } = require('ethers');

// Log a purchase
const logPurchase = async (req, res) => {
  try {
    const {
      modelId,
      contractModelId,
      walletAddress,
      sellerAddress,
      txHash,
      priceInETH,
      priceInUSD = 0,
      blockNumber,
      gasUsed,
      gasPrice,
      network = 'holesky',
      transactionType
    } = req.body;

    // Debug logging
    console.log('Received purchase data:', {
      modelId,
      contractModelId,
      walletAddress,
      sellerAddress,
      txHash,
      priceInETH,
      transactionType,
      txHashLength: txHash ? txHash.length : 0
    });

    // Validate required fields
    if (!modelId || !walletAddress || !sellerAddress || !txHash || !priceInETH || !transactionType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        received: { modelId, walletAddress, sellerAddress, txHash: !!txHash, priceInETH, transactionType }
      });
    }

    // Validate transaction type
    if (!['database_model_purchase', 'contract_model_purchase'].includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type'
      });
    }

    // Validate transaction hash format
    if (!/^0x[a-fA-F0-9]+$/.test(txHash) || txHash.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction hash format',
        receivedHash: txHash
      });
    }

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ txHash: txHash.toLowerCase() });
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already exists'
      });
    }

    // Create purchase record
    const purchase = new Purchase({
      modelId,
      contractModelId,
      walletAddress: walletAddress.toLowerCase(),
      sellerAddress: sellerAddress.toLowerCase(),
      txHash: txHash.toLowerCase(),
      priceInETH,
      priceInUSD,
      blockNumber,
      gasUsed,
      gasPrice,
      network,
      status: 'confirmed'
    });

    await purchase.save();

    // Create transaction record
    const transaction = new Transaction({
      txHash: txHash.toLowerCase(),
      modelId,
      contractModelId,
      buyerAddress: walletAddress.toLowerCase(),
      sellerAddress: sellerAddress.toLowerCase(),
      priceInETH,
      priceInWei: ethers.parseEther(priceInETH).toString(),
      priceInUSD,
      platformFee: (parseFloat(priceInETH) * 0.025).toString(), // 2.5% platform fee
      platformFeePercentage: 2.5,
      sellerAmount: (parseFloat(priceInETH) * 0.975).toString(), // 97.5% to seller
      blockNumber: blockNumber || 0,
      network,
      chainId: network === 'holesky' ? 17000 : network === 'ethereum' ? 1 : 1337,
      status: 'confirmed',
      transactionType,
      confirmedAt: new Date()
    });

    await transaction.save();

    // Update model statistics
    await Model.findByIdAndUpdate(modelId, {
      $inc: { downloads: 1 }
    });

    res.status(201).json({
      success: true,
      data: {
        purchase,
        transaction
      },
      message: 'Purchase logged successfully'
    });

  } catch (error) {
    console.error('Error logging purchase:', error);
    
    // More detailed error logging
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to log purchase',
      error: error.message,
      details: error.errors || null
    });
  }
};

// Get purchases by address
const getPurchasesByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 10, transactionType } = req.query;

    const query = {
      $or: [
        { walletAddress: address.toLowerCase() },
        { sellerAddress: address.toLowerCase() }
      ]
    };

    if (transactionType) {
      query.transactionType = transactionType;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'modelId',
        select: 'name type description image'
      }
    };

    const purchases = await Purchase.paginate(query, options);

    res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('Error getting purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchases',
      error: error.message
    });
  }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      address,
      modelId,
      transactionType,
      status,
      network,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (address) {
      query.$or = [
        { buyerAddress: address.toLowerCase() },
        { sellerAddress: address.toLowerCase() }
      ];
    }

    if (modelId) {
      query.modelId = modelId;
    }

    if (transactionType) {
      query.transactionType = transactionType;
    }

    if (status) {
      query.status = status;
    }

    if (network) {
      query.network = network;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'modelId',
        select: 'name type description image'
      }
    };

    const transactions = await Transaction.paginate(query, options);

    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction history',
      error: error.message
    });
  }
};

// Get transaction by hash
const getTransactionByHash = async (req, res) => {
  try {
    const { txHash } = req.params;

    const transaction = await Transaction.findOne({ 
      txHash: txHash.toLowerCase() 
    }).populate('modelId', 'name type description image');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction',
      error: error.message
    });
  }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
  try {
    const { txHash } = req.params;
    const { status, ...additionalData } = req.body;

    const transaction = await Transaction.findOne({ 
      txHash: txHash.toLowerCase() 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.updateStatus(status, additionalData);

    res.json({
      success: true,
      data: transaction,
      message: 'Transaction status updated successfully'
    });

  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status',
      error: error.message
    });
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    const { address, network, startDate, endDate } = req.query;

    const matchStage = {};

    if (address) {
      matchStage.$or = [
        { buyerAddress: address.toLowerCase() },
        { sellerAddress: address.toLowerCase() }
      ];
    }

    if (network) {
      matchStage.network = network;
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: { $toDouble: '$priceInETH' } },
          totalVolumeUSD: { $sum: '$priceInUSD' },
          confirmedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $in: ['$status', ['failed', 'reverted']] }, 1, 0] }
          },
          databaseModelPurchases: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'database_model_purchase'] }, 1, 0] }
          },
          contractModelPurchases: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'contract_model_purchase'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalTransactions: 0,
      totalVolume: 0,
      totalVolumeUSD: 0,
      confirmedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      databaseModelPurchases: 0,
      contractModelPurchases: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction statistics',
      error: error.message
    });
  }
};

// Get all purchases with filtering and pagination
const getPurchases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      address,
      modelId,
      transactionType,
      status,
      network,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (address) {
      query.$or = [
        { walletAddress: address.toLowerCase() },
        { sellerAddress: address.toLowerCase() }
      ];
    }

    if (modelId) {
      query.modelId = modelId;
    }

    if (transactionType) {
      query.transactionType = transactionType;
    }

    if (status) {
      query.status = status;
    }

    if (network) {
      query.network = network;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'modelId',
        select: 'name type description image'
      }
    };

    const purchases = await Purchase.paginate(query, options);

    res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('Error getting purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchases',
      error: error.message
    });
  }
};

// Get purchase by ID
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findById(id).populate('modelId', 'name type description image');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: purchase
    });

  } catch (error) {
    console.error('Error getting purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase',
      error: error.message
    });
  }
};

// Log a token-based purchase
const logTokenPurchase = async (req, res) => {
  try {
    const {
      modelId,
      contractModelId,
      walletAddress,
      sellerAddress,
      txHash,
      priceInTokens,
      priceInUSD = 0,
      blockNumber,
      gasUsed,
      gasPrice,
      network = 'localhost',
      transactionType = 'token_purchase',
      tokenContractAddress,
      tokenSymbol = 'ANX',
      tokenDecimals = 18
    } = req.body;

    // Validate required fields
    if (!modelId || !walletAddress || !sellerAddress || !priceInTokens) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: modelId, walletAddress, sellerAddress, priceInTokens'
      });
    }

    // Generate a unique transaction hash if not provided (for database models)
    const finalTxHash = txHash || `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ txHash: finalTxHash.toLowerCase() });
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already exists'
      });
    }

    // Create purchase record
    const purchase = new Purchase({
      modelId,
      contractModelId: contractModelId || 0,
      walletAddress: walletAddress.toLowerCase(),
      sellerAddress: sellerAddress.toLowerCase(),
      txHash: finalTxHash.toLowerCase(),
      priceInETH: '0', // Token purchases don't use ETH
      priceInTokens: priceInTokens.toString(),
      priceInUSD,
      blockNumber: blockNumber || 0,
      gasUsed,
      gasPrice,
      network,
      status: 'confirmed',
      transactionType,
      tokenContractAddress: tokenContractAddress || null,
      tokenSymbol,
      tokenDecimals
    });

    await purchase.save();

    // Create transaction record
    const transaction = new Transaction({
      txHash: finalTxHash.toLowerCase(),
      modelId,
      contractModelId: contractModelId || 0,
      buyerAddress: walletAddress.toLowerCase(),
      sellerAddress: sellerAddress.toLowerCase(),
      priceInETH: '0',
      priceInWei: '0',
      priceInUSD,
      platformFee: (parseFloat(priceInTokens) * 0.025).toString(), // 2.5% platform fee
      platformFeePercentage: 2.5,
      sellerAmount: (parseFloat(priceInTokens) * 0.975).toString(), // 97.5% to seller
      blockNumber: blockNumber || 0,
      network,
      chainId: network === 'holesky' ? 17000 : network === 'ethereum' ? 1 : 1337,
      status: 'confirmed',
      transactionType,
      confirmedAt: new Date()
    });

    await transaction.save();

    // Update model statistics
    await Model.findByIdAndUpdate(modelId, {
      $inc: { downloads: 1 }
    });

    res.status(201).json({
      success: true,
      data: {
        purchase,
        transaction
      },
      message: 'Token purchase logged successfully'
    });

  } catch (error) {
    console.error('Error logging token purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log token purchase',
      error: error.message
    });
  }
};

// Update purchase status
const updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    purchase.status = status;
    Object.assign(purchase, additionalData);
    await purchase.save();

    res.json({
      success: true,
      data: purchase,
      message: 'Purchase status updated successfully'
    });

  } catch (error) {
    console.error('Error updating purchase status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase status',
      error: error.message
    });
  }
};

// Get purchase statistics
const getPurchaseStats = async (req, res) => {
  try {
    const { address, network, startDate, endDate } = req.query;

    const matchStage = {};

    if (address) {
      matchStage.$or = [
        { walletAddress: address.toLowerCase() },
        { sellerAddress: address.toLowerCase() }
      ];
    }

    if (network) {
      matchStage.network = network;
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await Purchase.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalVolume: { $sum: { $toDouble: '$priceInETH' } },
          totalTokenVolume: { $sum: { $toDouble: '$priceInTokens' } },
          totalVolumeUSD: { $sum: '$priceInUSD' },
          ethPurchases: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'eth_purchase'] }, 1, 0] }
          },
          tokenPurchases: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'token_purchase'] }, 1, 0] }
          },
          databasePurchases: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'database_model_purchase'] }, 1, 0] }
          },
          contractPurchases: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'contract_model_purchase'] }, 1, 0] }
          },
          confirmedPurchases: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pendingPurchases: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failedPurchases: {
            $sum: { $cond: [{ $in: ['$status', ['failed', 'reverted']] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalPurchases: 0,
      totalVolume: 0,
      totalTokenVolume: 0,
      totalVolumeUSD: 0,
      ethPurchases: 0,
      tokenPurchases: 0,
      databasePurchases: 0,
      contractPurchases: 0,
      confirmedPurchases: 0,
      pendingPurchases: 0,
      failedPurchases: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting purchase stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase statistics',
      error: error.message
    });
  }
};

// Get user's purchase history
const getUserPurchaseHistory = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { page = 1, limit = 10, transactionType } = req.query;

    const query = {
      walletAddress: walletAddress.toLowerCase()
    };

    if (transactionType) {
      query.transactionType = transactionType;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'modelId',
        select: 'name type description image'
      }
    };

    const purchases = await Purchase.paginate(query, options);

    res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('Error getting user purchase history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user purchase history',
      error: error.message
    });
  }
};

// Get all purchases for analytics
const getAllPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 1000, transactionType, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const matchStage = {};
    
    if (transactionType) {
      matchStage.transactionType = transactionType;
    }
    
    if (status) {
      matchStage.status = status;
    }
    
    const sortStage = {};
    sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const purchases = await Purchase.find(matchStage)
      .populate('modelId', 'name category')
      .sort(sortStage)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Purchase.countDocuments(matchStage);
    
    res.json({
      success: true,
      data: {
        docs: purchases,
        totalDocs: total,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error getting all purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all purchases',
      error: error.message
    });
  }
};

module.exports = {
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
}; 