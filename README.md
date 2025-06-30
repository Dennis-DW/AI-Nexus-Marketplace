# AI Nexus Marketplace

A complete decentralized AI model marketplace built with React, TypeScript, Node.js, MongoDB, and Solidity smart contracts. The platform enables secure, transparent trading of AI models with dynamic pricing, real-time analytics, and comprehensive blockchain integration.

## 🌟 Key Features

- **🔗 Decentralized Marketplace**: Secure peer-to-peer AI model trading
- **💰 Dynamic Platform Fees**: Configurable platform fees fetched from smart contracts
- **📊 Real-time Analytics**: Live market statistics and revenue tracking
- **🎯 Multi-token Support**: ETH and native ANX token payments
- **🔒 Enhanced Security**: Comprehensive input validation and error handling
- **📱 Responsive Design**: Modern UI with smooth animations
- **⚡ High Performance**: Optimized for speed and scalability
- **🌐 Multi-network Support**: Ethereum, Holesky, and local networks

## 🏗️ Project Structure

```
ai-nexus-marketplace/
├── src/                    # React + TypeScript frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── backend/               # Node.js + Express API server
│   ├── controllers/       # API controllers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration
│   └── utils/            # Utility functions
├── contracts/            # Solidity smart contracts
├── scripts/              # Deployment and utility scripts
└── public/               # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- Git
- MetaMask or compatible Web3 wallet

### 1. Clone and Install
```bash
git clone <repository-url>
cd ai-nexus-marketplace
npm install
```

### 2. Environment Setup

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
VITE_CHAIN_ID=17000
```

**Backend (.env)**
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ai-nexus-marketplace
FRONTEND_URL=http://localhost:5173
```

**Blockchain (.env)**
```env
PRIVATE_KEY=your_private_key
HOLESKY_RPC_URL=https://ethereum-holesky.publicnode.com
ETHERSCAN_API_KEY=your_etherscan_key
```

### 3. Start Development

**Start All Services**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Blockchain (optional)
npx hardhat node
```

### 4. Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to localhost
npx hardhat run scripts/deploy-token-marketplace.js --network localhost

# Deploy to Holesky testnet
npx hardhat run scripts/deploy-token-marketplace.js --network holesky
```

## 📊 Features Overview

### Frontend Features
- **🎨 Modern UI/UX**: Beautiful, responsive design with Framer Motion animations
- **🔗 Web3 Integration**: Seamless wallet connection with RainbowKit
- **📈 Real-time Analytics**: Live charts and market statistics
- **🛒 Shopping Cart**: Persistent cart with local storage
- **📱 Mobile Optimized**: Fully responsive design
- **🌙 Dark Mode**: Toggle between light and dark themes
- **🔍 Advanced Search**: Filter models by category, price, and rating
- **📊 Dashboard**: User dashboard with purchase history and analytics

### Backend Features
- **🔒 Enhanced Security**: Input validation, CORS protection, error handling
- **⚙️ Centralized Configuration**: Dynamic platform fees and network settings
- **📊 Real-time Analytics**: Market statistics and transaction tracking
- **🔍 Advanced Filtering**: Pagination, search, and sorting
- **📈 Performance Optimized**: Database indexing and query optimization
- **🧪 Testing Infrastructure**: Automated testing and health checks
- **📚 Comprehensive API**: RESTful endpoints with detailed documentation

### Smart Contract Features
- **💰 Dynamic Platform Fees**: Configurable fees fetched from contract
- **🎯 Multi-token Support**: ETH and ANX token payments
- **🔒 Security**: ReentrancyGuard, Ownable, Pausable
- **📊 Analytics**: Event emission for real-time tracking
- **⚡ Gas Optimized**: Efficient contract design

## 🔧 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Backend
```bash
cd backend
npm run dev          # Start with nodemon
npm start            # Start production server
npm test             # Run backend tests
npm run seed         # Seed database with sample data
```

### Blockchain
```bash
npx hardhat compile  # Compile contracts
npx hardhat test     # Run contract tests
npx hardhat node     # Start local node
npx hardhat run scripts/deploy-token-marketplace.js --network holesky
```

## 🌐 API Endpoints

### Core Endpoints
- `GET /health` - Server health check
- `GET /api` - API documentation

### Models
- `GET /api/models` - Get all models with filtering
- `GET /api/models/trending` - Get trending models
- `GET /api/models/featured` - Get featured models
- `GET /api/models/:id` - Get model details
- `POST /api/models` - Add new model

### Purchases
- `POST /api/purchase` - Log ETH purchase
- `POST /api/purchase/token` - Log token purchase
- `GET /api/purchase/stats` - Get purchase statistics
- `GET /api/purchase/user/:address` - Get user purchases

### Market Analytics
- `GET /api/market/stats` - Market statistics
- `GET /api/market/chart-data` - Chart data
- `GET /api/market/trends` - Market trends

### Users
- `GET /api/users/profile/:address` - Get user profile
- `PUT /api/users/profile/:address` - Update profile
- `GET /api/users/dashboard/:address` - Get dashboard data

## 🔐 Smart Contract Functions

### Marketplace Contract
- `listModel()` - List new AI model
- `buyModel()` - Purchase model with ETH
- `buyModelWithTokens()` - Purchase model with ANX tokens
- `getModels()` - Get all listed models
- `getPlatformFee()` - Get current platform fee
- `setPlatformFee()` - Update platform fee (owner only)

### Token Contract
- `mint()` - Mint ANX tokens
- `transfer()` - Transfer tokens
- `balanceOf()` - Check token balance
- `approve()` - Approve token spending

## 🛡️ Security Features

### Smart Contracts
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for admin functions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive parameter validation
- **Event Logging**: Transparent transaction logging

### Backend
- **Input Validation**: All inputs validated and sanitized
- **CORS Protection**: Configurable cross-origin settings
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Comprehensive request/response logging
- **Rate Limiting**: Protection against abuse

### Frontend
- **Wallet Security**: Secure wallet connection handling
- **Input Sanitization**: Client-side input validation
- **Error Boundaries**: Graceful error handling
- **Type Safety**: Full TypeScript coverage

## 📈 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: Optimized images and icons
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Local storage and session caching

### Backend
- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Connection Pooling**: Optimized database connections
- **Response Caching**: Cached responses for static data

### Smart Contracts
- **Gas Optimization**: Efficient contract design
- **Batch Operations**: Reduced transaction costs
- **Event Optimization**: Minimal event data

## 🧪 Testing

### Frontend Testing
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

### Backend Testing
```bash
cd backend
npm test              # Run API tests
npm run test:coverage # Generate coverage report
```

### Smart Contract Testing
```bash
npx hardhat test      # Run contract tests
npx hardhat coverage  # Generate coverage report
```

## 📚 Documentation

- **[API Documentation](./backend/README.md)** - Complete backend API guide
- **[Smart Contract Docs](./contracts/README.md)** - Contract architecture and functions
- **[Frontend Guide](./src/README.md)** - Frontend development guide
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code style
- **Prettier**: Automatic code formatting
- **Testing**: Unit tests for all new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.ainexus.com](https://docs.ainexus.com)
- **Discord**: [Join our community](https://discord.gg/ainexus)
- **Email**: support@ainexus.com
- **Issues**: [GitHub Issues](https://github.com/ainexus/marketplace/issues)

## 🚨 Deployment Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot read properties of undefined (reading 'address')" Error

**Problem**: This error occurs when the `PRIVATE_KEY` environment variable is not set.

**Solution**:
```bash
# Option 1: Use the setup script
npm run setup:env

# Option 2: Create .env file manually
echo "PRIVATE_KEY=your_private_key_here" > .env
echo "HOLESKY_RPC_URL=https://ethereum-holesky.publicnode.com" >> .env
```

**Important**: Never commit your private key to version control!

#### 2. "No deployer account found" Error

**Problem**: The private key is invalid or the account has no funds.

**Solution**:
- Verify your private key is correct (64 characters, no 0x prefix)
- Ensure your wallet has sufficient ETH for deployment
- For testnets, get test ETH from a faucet

#### 3. "Network timeout" Error

**Problem**: RPC endpoint is slow or unreachable.

**Solution**:
```bash
# Try alternative RPC endpoints
HOLESKY_RPC_URL=https://rpc.ankr.com/eth_holesky
# or
HOLESKY_RPC_URL=https://ethereum-holesky.blockpi.network/v1/rpc/public
```

#### 4. "Gas estimation failed" Error

**Problem**: Insufficient gas or network congestion.

**Solution**:
- Increase gas limit in hardhat.config.cjs
- Wait for lower network congestion
- Use a different network (localhost for testing)

### Quick Deployment Guide

```bash
# 1. Set up environment
npm run setup:env

# 2. Compile contracts
npm run compile

# 3. Deploy to localhost (for testing)
npm run deploy:localhost

# 4. Deploy to Holesky testnet
npm run deploy:holesky
```

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PRIVATE_KEY` | ✅ | Your wallet private key | `abc123...` |
| `HOLESKY_RPC_URL` | ✅ | Holesky testnet RPC | `https://ethereum-holesky.publicnode.com` |
| `ETHERSCAN_API_KEY` | ❌ | For contract verification | `ABC123...` |
| `MAINNET_RPC_URL` | ❌ | Mainnet RPC (for mainnet deployment) | `https://eth-mainnet...` |

### Getting Test ETH

For Holesky testnet:
- [Holesky Faucet](https://holesky-faucet.pk910.de/)
- [Chainlink Faucet](https://faucets.chain.link/holesky)

## 🙏 Acknowledgments

- **OpenZeppelin**: Smart contract security libraries
- **RainbowKit**: Web3 wallet integration
- **Framer Motion**: Animation library
- **Tailwind CSS**: Utility-first CSS framework
- **Hardhat**: Ethereum development environment

---

Built with ❤️ by the AI Nexus Team

**Version**: 1.0.0  
**Last Updated**: January 2024