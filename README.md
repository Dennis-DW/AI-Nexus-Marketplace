# AI Nexus Marketplace

A complete decentralized AI model marketplace built with React, Node.js, MongoDB, and Solidity smart contracts.

## 🏗️ Project Structure

```
ai-nexus-marketplace/
├── frontend/          # React + TypeScript frontend
├── backend/           # Node.js + Express API server
├── blockchain/        # Smart contracts + Hardhat
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- Git

### 1. Install All Dependencies
```bash
npm run install:all
```

### 2. Environment Setup

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
# Edit with your configuration
```

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Add your MongoDB URI and other settings
```

**Blockchain (.env)**
```bash
cd blockchain
cp .env.example .env
# Add your private key and RPC URLs
```

### 3. Start Development

**Option A: Start All Services**
```bash
npm run start:all
```

**Option B: Start Services Individually**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend

# Terminal 3 - Blockchain (optional)
npm run dev:blockchain
```

### 4. Deploy Smart Contracts

```bash
# Compile contracts
npm run compile:contracts

# Deploy to localhost
npm run deploy:localhost

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## 📁 Detailed Structure

### Frontend (`/frontend`)
- **React + TypeScript** with Vite
- **RainbowKit + Wagmi** for Web3 integration
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching

### Backend (`/backend`)
- **Node.js + Express** REST API
- **MongoDB + Mongoose** for data storage
- **CORS** enabled for cross-origin requests
- **Real-time market analytics**

### Blockchain (`/blockchain`)
- **Solidity 0.8.19** smart contracts
- **Hardhat** development framework
- **OpenZeppelin** security contracts
- **Multi-network deployment support**

## 🔧 Available Scripts

### Root Level
- `npm run install:all` - Install all dependencies
- `npm run start:all` - Start backend + frontend
- `npm run clean` - Clean all node_modules
- `npm run clean:build` - Clean all build artifacts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Blockchain
- `npm run compile` - Compile contracts
- `npm run test` - Run contract tests
- `npm run node` - Start local Hardhat node
- `npm run deploy:localhost` - Deploy to localhost
- `npm run deploy:sepolia` - Deploy to Sepolia

## 🌐 API Endpoints

### Models
- `POST /api/models` - Add new AI model
- `GET /api/models` - Get all models
- `GET /api/models/:id` - Get model details

### Purchases
- `POST /api/purchase` - Log purchase
- `GET /api/purchases/:address` - Get user purchases

### Market Data
- `GET /api/market/stats` - Market statistics
- `GET /api/market/chart-data` - Chart data

## 🔐 Smart Contract Functions

- `listModel()` - List new AI model
- `buyModel()` - Purchase model
- `getModels()` - Get all models
- `ownsModel()` - Check ownership

## 🛡️ Security Features

- **Smart Contract**: ReentrancyGuard, Ownable, Pausable
- **Backend**: Input validation, CORS protection
- **Frontend**: Wallet connection security

## 📊 Features

- ✅ Decentralized model marketplace
- ✅ Real-time market analytics
- ✅ Dynamic chart data
- ✅ Wallet integration (MetaMask, WalletConnect)
- ✅ Responsive design
- ✅ Multi-network support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ by the AI Nexus Team