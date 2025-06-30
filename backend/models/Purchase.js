const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const purchaseSchema = new mongoose.Schema({
  modelId: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or Number
    required: [true, 'Model ID is required']
  },
  isContractModel: {
    type: Boolean,
    default: false
  },
  contractModelId: {
    type: Number,
    default: 0
  },
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Wallet address must be a valid Ethereum address'
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
  priceInTokens: {
    type: String,
    default: '0',
    validate: {
      validator: function(v) {
        return /^\d+(\.\d+)?$/.test(v) && parseFloat(v) >= 0;
      },
      message: 'Token price must be a valid non-negative number'
    }
  },
  priceInUSD: {
    type: Number,
    default: 0
  },
  blockNumber: {
    type: Number,
    default: null
  },
  gasUsed: {
    type: String,
    default: null
  },
  gasPrice: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  },
  network: {
    type: String,
    default: 'ethereum'
  },
  transactionType: {
    type: String,
    enum: ['eth_purchase', 'token_purchase', 'database_model_purchase', 'contract_model_purchase'],
    required: [true, 'Transaction type is required']
  },
  tokenContractAddress: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/undefined
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Token contract address must be a valid Ethereum address'
    }
  },
  tokenSymbol: {
    type: String,
    default: 'ANX'
  },
  tokenDecimals: {
    type: Number,
    default: 18
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
purchaseSchema.index({ walletAddress: 1 });
purchaseSchema.index({ sellerAddress: 1 });
purchaseSchema.index({ modelId: 1 });
purchaseSchema.index({ txHash: 1 }, { unique: true });
purchaseSchema.index({ createdAt: -1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ transactionType: 1 });
purchaseSchema.index({ tokenContractAddress: 1 });

// Virtual for formatted date
purchaseSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString().split('T')[0];
});

// Virtual for formatted price
purchaseSchema.virtual('formattedPrice').get(function() {
  if (this.transactionType === 'token_purchase' || this.priceInTokens > 0) {
    return `${this.priceInTokens} ${this.tokenSymbol}`;
  }
  return `${this.priceInETH} ETH`;
});

// Virtual for payment method
purchaseSchema.virtual('paymentMethod').get(function() {
  if (this.transactionType === 'token_purchase' || this.priceInTokens > 0) {
    return 'Token';
  }
  return 'ETH';
});

// Pre-save middleware
purchaseSchema.pre('save', function(next) {
  if (this.isModified('walletAddress')) {
    this.walletAddress = this.walletAddress.toLowerCase();
  }
  if (this.isModified('sellerAddress')) {
    this.sellerAddress = this.sellerAddress.toLowerCase();
  }
  if (this.isModified('txHash')) {
    this.txHash = this.txHash.toLowerCase();
  }
  if (this.isModified('tokenContractAddress') && this.tokenContractAddress) {
    this.tokenContractAddress = this.tokenContractAddress.toLowerCase();
  }
  next();
});

// Add pagination plugin
purchaseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Purchase', purchaseSchema);