const mongoose = require('mongoose');
const { PLATFORM_CONFIG, validateEthAddress, validateFileHash } = require('../config/constants');

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true,
    maxlength: [100, 'Model name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Model type is required'],
    enum: PLATFORM_CONFIG.MODEL_TYPES,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Model description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: String,
    required: [true, 'Price in ETH is required'],
    validate: {
      validator: function(v) {
        return /^\d+(\.\d+)?$/.test(v) && parseFloat(v) > 0;
      },
      message: 'Price must be a valid positive number'
    }
  },
  fileHash: {
    type: String,
    required: [true, 'File hash is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return validateFileHash(v);
      },
      message: 'File hash must be a valid 64-character hexadecimal string'
    }
  },
  sellerAddress: {
    type: String,
    required: [true, 'Seller address is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return validateEthAddress(v);
      },
      message: 'Seller address must be a valid Ethereum address'
    }
  },
  contractModelId: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'Other'
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
modelSchema.index({ type: 1 });
modelSchema.index({ sellerAddress: 1 });
modelSchema.index({ price: 1 });
modelSchema.index({ createdAt: -1 });
modelSchema.index({ name: 'text', description: 'text' });

// Virtual for formatted price
modelSchema.virtual('formattedPrice').get(function() {
  return `${this.price} ETH`;
});

// Pre-save middleware
modelSchema.pre('save', function(next) {
  if (this.isModified('sellerAddress')) {
    this.sellerAddress = this.sellerAddress.toLowerCase();
  }
  next();
});

module.exports = mongoose.model('Model', modelSchema);