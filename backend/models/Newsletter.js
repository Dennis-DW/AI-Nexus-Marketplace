const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    weeklyDigest: {
      type: Boolean,
      default: true
    },
    productUpdates: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    }
  },
  source: {
    type: String,
    enum: ['website', 'blog', 'social', 'referral', 'other'],
    default: 'website'
  },
  unsubscribedAt: Date
}, {
  timestamps: true
});

// Indexes
newsletterSchema.index({ email: 1 }, { unique: true });
newsletterSchema.index({ isActive: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);