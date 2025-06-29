const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    trim: true,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  author: {
    name: {
      type: String,
      required: true
    },
    avatar: String,
    bio: String
  },
  category: {
    type: String,
    required: true,
    enum: ['AI Technology', 'Blockchain', 'Tutorials', 'News', 'Research', 'Community']
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number,
    default: 5
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ category: 1 });
blogSchema.index({ isPublished: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ title: 'text', content: 'text' });

// Pre-save middleware
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Blog', blogSchema);