const mongoose = require('mongoose');

const cookieSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    trim: true
  },
  necessary: {
    type: Boolean,
    default: true,
    required: true
  },
  analytics: {
    type: Boolean,
    default: false
  },
  marketing: {
    type: Boolean,
    default: false
  },
  preferences: {
    type: Boolean,
    default: false
  },
  consentDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
cookieSchema.index({ userId: 1 }, { unique: true });
cookieSchema.index({ consentDate: 1 });

module.exports = mongoose.model('Cookie', cookieSchema);