require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./utils/connectDB');
const modelRoutes = require('./routes/modelRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactRoutes = require('./routes/contactRoutes');
const cookieRoutes = require('./routes/cookieRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const marketRoutes = require('./routes/marketRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://localhost:5173'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', modelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api', contactRoutes);
app.use('/api/cookies', cookieRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/market', marketRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI Nexus Marketplace Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'Connected'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'AI Nexus Marketplace API',
    version: '1.0.0',
    description: 'Backend API for AI Nexus Marketplace DApp',
    endpoints: {
      models: {
        'GET /api/models': 'Get all models with filtering',
        'GET /api/models/trending': 'Get trending models',
        'GET /api/models/featured': 'Get featured models',
        'GET /api/models/:id': 'Get model by ID',
        'POST /api/models': 'Add new model'
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/profile/:address': 'Get user profile',
        'PUT /api/users/profile/:address': 'Update user profile',
        'GET /api/users/dashboard/:address': 'Get user dashboard',
        'GET /api/users/activity/:address': 'Get user activity'
      },
      blog: {
        'GET /api/blog': 'Get all blog posts',
        'GET /api/blog/featured': 'Get featured blog posts',
        'GET /api/blog/recent': 'Get recent blog posts',
        'GET /api/blog/popular': 'Get popular blog posts',
        'GET /api/blog/categories': 'Get blog categories',
        'GET /api/blog/:slug': 'Get blog post by slug'
      },
      contact: {
        'POST /api/contact': 'Submit contact form',
        'GET /api/contact': 'Get all contact submissions',
        'POST /api/newsletter/subscribe': 'Subscribe to newsletter',
        'POST /api/newsletter/unsubscribe': 'Unsubscribe from newsletter',
        'GET /api/newsletter/subscribers': 'Get newsletter subscribers'
      },
      cookies: {
        'GET /api/cookies/preferences/:userId': 'Get cookie preferences',
        'PUT /api/cookies/preferences/:userId': 'Update cookie preferences',
        'GET /api/cookies/consent/:userId': 'Get cookie consent status',
        'DELETE /api/cookies/clear/:userId': 'Clear all cookies'
      },
      market: {
        'GET /api/market/stats': 'Get market statistics',
        'GET /api/market/chart-data': 'Get chart data',
        'GET /api/market/trends': 'Get market trends',
        'GET /api/market/top-models': 'Get top performing models',
        'GET /api/market/insights': 'Get market insights'
      },
      purchases: {
        'POST /api/purchase': 'Log a purchase',
        'POST /api/purchase/token': 'Log a token purchase',
        'GET /api/purchase': 'Get all purchases with filtering',
        'GET /api/purchase/stats': 'Get purchase statistics',
        'GET /api/purchase/user/:walletAddress': 'Get user purchase history',
        'GET /api/purchase/:address': 'Get purchases by address',
        'GET /api/purchase/transactions': 'Get transaction history',
        'GET /api/purchase/transactions/:txHash': 'Get transaction by hash',
        'PUT /api/purchase/transactions/:txHash/status': 'Update transaction status',
        'GET /api/purchase/transactions/stats': 'Get transaction statistics'
      }
    },
    documentation: 'https://docs.ainexus.com'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /api',
      'GET /health',
      'GET /api/models',
      'GET /api/users/profile/:walletAddress',
      'GET /api/blog',
      'POST /api/contact',
      'GET /api/cookies/preferences/:userId',
      'POST /api/purchase',
      'GET /api/purchase/transactions',
      'GET /api/market/stats',
      'GET /api/market/chart-data'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Nexus Marketplace Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
  console.log(`🔗 Database: ${process.env.MONGODB_URI ? 'Remote MongoDB' : 'Local MongoDB'}`);
});

module.exports = app;