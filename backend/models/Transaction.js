const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new mongoose.Schema({
  // Basic transaction info
  txHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Accept any valid hexadecimal string starting with 0x
        // This is more flexible than requiring exactly 64 characters
        return /^0x[a-fA-F0-9]+$/.test(v) && v.length >= 3; // At least 0x + 1 hex character
      },
      message: 'Transaction hash must be a valid hexadecimal string starting with 0x'
    }
  },
  
  // Model information
  modelId: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or Number
    ref: 'Model',
    required: [true, 'Model ID is required']
  },
  contractModelId: {
    type: Number,
    default: null
  },
  
  // Transaction parties
  buyerAddress: {
    type: String,
    required: [true, 'Buyer address is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Buyer address must be a valid Ethereum address'
    }
  },
  sellerAddress: {
    type: String,
    required: [true, 'Seller address is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Seller address must be a valid Ethereum address'
    }
  },
  
  // Financial details
  priceInETH: {
    type: String,
    required: [true, 'Price in ETH is required'],
    validate: {
      validator: function(v) {
        return /^\d+(\.\d+)?$/.test(v) && parseFloat(v) >= 0;
      },
      message: 'Price must be a valid non-negative number'
    }
  },
  priceInWei: {
    type: String,
    default: '0'
  },
  priceInUSD: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: String,
    default: '0'
  },
  platformFeePercentage: {
    type: Number,
    default: 2.5
  },
  sellerAmount: {
    type: String,
    default: '0'
  },
  
  // Blockchain details
  blockNumber: {
    type: Number,
    default: 0
  },
  blockHash: {
    type: String,
    trim: true,
    lowercase: true
  },
  gasUsed: {
    type: String,
    default: null
  },
  gasPrice: {
    type: String,
    default: null
  },
  gasLimit: {
    type: String,
    default: null
  },
  effectiveGasPrice: {
    type: String,
    default: null
  },
  
  // Network and status
  network: {
    type: String,
    enum: ['ethereum', 'holesky', 'localhost', 'sepolia', 'goerli'],
    default: 'holesky'
  },
  chainId: {
    type: Number,
    default: 1337
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'reverted'],
    default: 'pending'
  },
  confirmations: {
    type: Number,
    default: 0
  },
  
  // Transaction type
  transactionType: {
    type: String,
    enum: ['database_model_purchase', 'contract_model_purchase', 'model_listing', 'model_update'],
    default: 'database_model_purchase'
  },
  
  // Additional metadata
  nonce: {
    type: Number,
    default: null
  },
  from: {
    type: String,
    trim: true,
    lowercase: true
  },
  to: {
    type: String,
    trim: true,
    lowercase: true
  },
  value: {
    type: String,
    default: '0'
  },
  data: {
    type: String,
    default: null
  },
  
  // Error handling
  error: {
    type: String,
    default: null
  },
  errorCode: {
    type: String,
    default: null
  },
  
  // Timestamps
  minedAt: {
    type: Date,
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
transactionSchema.index({ txHash: 1 }, { unique: true });
transactionSchema.index({ modelId: 1 });
transactionSchema.index({ buyerAddress: 1 });
transactionSchema.index({ sellerAddress: 1 });
transactionSchema.index({ blockNumber: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ network: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ minedAt: -1 });
transactionSchema.index({ confirmedAt: -1 });

// Compound indexes for common queries
transactionSchema.index({ buyerAddress: 1, status: 1 });
transactionSchema.index({ sellerAddress: 1, status: 1 });
transactionSchema.index({ network: 1, status: 1 });
transactionSchema.index({ modelId: 1, status: 1 });

// Virtual fields
transactionSchema.virtual('formattedPrice').get(function() {
  return `${this.priceInETH} ETH`;
});

transactionSchema.virtual('formattedPlatformFee').get(function() {
  return `${this.platformFee} ETH`;
});

transactionSchema.virtual('formattedSellerAmount').get(function() {
  return `${this.sellerAmount} ETH`;
});

transactionSchema.virtual('isConfirmed').get(function() {
  return this.status === 'confirmed';
});

transactionSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

transactionSchema.virtual('isFailed').get(function() {
  return this.status === 'failed' || this.status === 'reverted';
});

transactionSchema.virtual('confirmationTime').get(function() {
  if (this.confirmedAt && this.createdAt) {
    return this.confirmedAt.getTime() - this.createdAt.getTime();
  }
  return null;
});

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Normalize addresses
  if (this.isModified('buyerAddress')) {
    this.buyerAddress = this.buyerAddress.toLowerCase();
  }
  if (this.isModified('sellerAddress')) {
    this.sellerAddress = this.sellerAddress.toLowerCase();
  }
  if (this.isModified('txHash')) {
    this.txHash = this.txHash.toLowerCase();
  }
  if (this.isModified('from')) {
    this.from = this.from.toLowerCase();
  }
  if (this.isModified('to')) {
    this.to = this.to.toLowerCase();
  }
  if (this.isModified('blockHash')) {
    this.blockHash = this.blockHash.toLowerCase();
  }
  
  // Set confirmation time when status changes to confirmed
  if (this.isModified('status') && this.status === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  
  next();
});

// Static methods
transactionSchema.statics.findByAddress = function(address) {
  return this.find({
    $or: [
      { buyerAddress: address.toLowerCase() },
      { sellerAddress: address.toLowerCase() }
    ]
  }).sort({ createdAt: -1 });
};

transactionSchema.statics.findByModel = function(modelId) {
  return this.find({ modelId }).sort({ createdAt: -1 });
};

transactionSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: 1 });
};

transactionSchema.statics.findByNetwork = function(network) {
  return this.find({ network }).sort({ createdAt: -1 });
};

transactionSchema.statics.getTransactionStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalVolume: { $sum: { $toDouble: '$priceInETH' } },
        confirmedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        pendingTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        failedTransactions: {
          $sum: { $cond: [{ $in: ['$status', ['failed', 'reverted']] }, 1, 0] }
        }
      }
    }
  ]);
};

// Instance methods
transactionSchema.methods.updateStatus = function(status, additionalData = {}) {
  this.status = status;
  
  if (status === 'confirmed') {
    this.confirmedAt = new Date();
  }
  
  // Update additional fields if provided
  Object.keys(additionalData).forEach(key => {
    if (this.schema.paths[key]) {
      this[key] = additionalData[key];
    }
  });
  
  return this.save();
};

transactionSchema.methods.incrementConfirmations = function() {
  this.confirmations += 1;
  return this.save();
};

// Add pagination plugin
transactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', transactionSchema);
