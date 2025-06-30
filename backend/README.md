# AI Nexus Marketplace Backend

A robust Node.js/Express backend for the AI Nexus Marketplace DApp, providing RESTful APIs for managing AI models, users, transactions, and marketplace functionality.

## 🚀 Features

- **RESTful API**: Complete CRUD operations for all entities
- **Blockchain Integration**: Support for Ethereum and testnet transactions
- **Real-time Analytics**: Market statistics and transaction tracking
- **User Management**: Profile management and activity tracking
- **Content Management**: Blog posts and newsletter functionality
- **Security**: Input validation, error handling, and CORS protection
- **Scalability**: Pagination, indexing, and efficient database queries

## 📁 Project Structure

```
backend/
├── config/
│   └── constants.js          # Platform configuration and utilities
├── controllers/
│   ├── blogController.js     # Blog post management
│   ├── contactController.js  # Contact form and newsletter
│   ├── cookieController.js   # Cookie preferences
│   ├── marketController.js   # Market analytics
│   ├── modelController.js    # AI model management
│   ├── purchaseController.js # Transaction handling
│   └── userController.js     # User management
├── middleware/
│   ├── errorHandler.js       # Centralized error handling
│   └── validation.js         # Input validation middleware
├── models/
│   ├── Blog.js              # Blog post schema
│   ├── Contact.js           # Contact form schema
│   ├── Cookie.js            # Cookie preferences schema
│   ├── Model.js             # AI model schema
│   ├── Newsletter.js        # Newsletter subscription schema
│   ├── Purchase.js          # Purchase transaction schema
│   ├── Transaction.js       # Transaction details schema
│   └── User.js              # User profile schema
├── routes/
│   ├── blogRoutes.js        # Blog API routes
│   ├── contactRoutes.js     # Contact API routes
│   ├── cookieRoutes.js      # Cookie API routes
│   ├── marketRoutes.js      # Market API routes
│   ├── modelRoutes.js       # Model API routes
│   ├── purchaseRoutes.js    # Purchase API routes
│   └── userRoutes.js        # User API routes
├── scripts/
│   └── seedData.js          # Database seeding script
├── utils/
│   └── connectDB.js         # Database connection utility
├── index.js                 # Main application entry point
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/ai-nexus-marketplace
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Configuration

### Platform Constants (`config/constants.js`)

The application uses centralized configuration for:
- Platform fee percentage (2.5%)
- Network configurations (Holesky, Ethereum, Local)
- Validation patterns
- Transaction types
- Model types
- Status values

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ai-nexus-marketplace` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 📊 API Endpoints

### Health Check
- `GET /health` - Server health status

### Models
- `GET /api/models` - Get all models with filtering
- `GET /api/models/trending` - Get trending models
- `GET /api/models/featured` - Get featured models
- `GET /api/models/:id` - Get model by ID
- `POST /api/models` - Add new model

### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile/:address` - Get user profile
- `PUT /api/users/profile/:address` - Update user profile
- `GET /api/users/dashboard/:address` - Get user dashboard
- `GET /api/users/activity/:address` - Get user activity

### Purchases
- `POST /api/purchase` - Log a purchase
- `POST /api/purchase/token` - Log a token purchase
- `GET /api/purchase` - Get all purchases with filtering
- `GET /api/purchase/stats` - Get purchase statistics
- `GET /api/purchase/user/:walletAddress` - Get user purchase history

### Market
- `GET /api/market/stats` - Get market statistics
- `GET /api/market/chart-data` - Get chart data
- `GET /api/market/trends` - Get market trends

### Blog
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/featured` - Get featured blog posts
- `GET /api/blog/:slug` - Get blog post by slug

### Contact
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

## 🔒 Security Features

### Input Validation
- Ethereum address validation
- Transaction hash validation
- File hash validation
- Pagination limits
- Search query validation
- Date range validation

### Error Handling
- Centralized error handling middleware
- Detailed error logging
- Proper HTTP status codes
- Development vs production error responses

### CORS Protection
- Configurable allowed origins
- Credential support
- Method restrictions
- Header restrictions

## 🗄️ Database

### MongoDB Collections
- **models**: AI model information
- **users**: User profiles and preferences
- **purchases**: Purchase transactions
- **transactions**: Detailed transaction data
- **blogs**: Blog posts and content
- **contacts**: Contact form submissions
- **newsletters**: Newsletter subscriptions
- **cookies**: Cookie preferences

### Indexing
- Text search indexes on model names and descriptions
- Compound indexes for efficient filtering
- Timestamp indexes for sorting

## 🧪 Testing

### Database Seeding
```bash
node scripts/seedData.js
```

This will populate the database with sample data for testing.

## 📈 Performance Optimizations

- **Pagination**: All list endpoints support pagination
- **Indexing**: Strategic database indexes for common queries
- **Caching**: Response caching for static data
- **Compression**: Body size limits and compression
- **Connection Pooling**: Optimized database connections

## 🔄 Recent Improvements

### v1.0.0 (Latest)
- ✅ Centralized configuration management
- ✅ Removed hardcoded platform fees
- ✅ Enhanced input validation
- ✅ Improved error handling
- ✅ Added request logging
- ✅ Removed unused dependencies
- ✅ Better CORS configuration
- ✅ Enhanced security middleware

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set up proper CORS origins
- [ ] Enable request logging
- [ ] Configure error monitoring
- [ ] Set up health checks
- [ ] Configure load balancing

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api` endpoint
- Review the health check at `/health` endpoint 