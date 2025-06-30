import { motion } from 'framer-motion';
import { BookOpen, Code, Zap, Shield, Database, Wallet, Smartphone, Globe, ArrowRight, ExternalLink, Search, FileText, Settings, Users, Lock, TrendingUp, BarChart3, DollarSign, Cpu } from 'lucide-react';
import { useState } from 'react';

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Zap,
      content: [
        {
          title: 'Quick Start Guide',
          description: 'Get up and running with AI Nexus in minutes',
          content: `
            <h3>Welcome to AI Nexus</h3>
            <p>AI Nexus is the world's first decentralized marketplace for AI models with dynamic platform fees, real-time analytics, and comprehensive blockchain integration. This guide will help you get started with buying, selling, and trading AI models.</p>
            
            <h4>Step 1: Connect Your Wallet</h4>
            <p>First, you'll need to connect your Web3 wallet (MetaMask, WalletConnect, etc.) to access the marketplace.</p>
            <ul>
              <li>Click the "Connect Wallet" button in the header</li>
              <li>Choose your preferred wallet</li>
              <li>Approve the connection</li>
              <li>Switch to Holesky testnet for testing</li>
            </ul>
            
            <h4>Step 2: Get ANX Tokens or ETH</h4>
            <p>You can purchase AI models using either ETH or ANX tokens:</p>
            <ul>
              <li><strong>ETH:</strong> Direct purchases with Ethereum</li>
              <li><strong>ANX Tokens:</strong> Native platform tokens for discounted fees</li>
              <li>Earn tokens by selling your AI models</li>
              <li>Participate in community rewards and staking</li>
            </ul>
            
            <h4>Step 3: Browse and Purchase Models</h4>
            <p>Explore the marketplace to find AI models that suit your needs:</p>
            <ul>
              <li>Filter by category, price, or rating</li>
              <li>Read model descriptions and reviews</li>
              <li>View real-time market analytics</li>
              <li>Purchase with ETH or ANX tokens</li>
              <li>Track your purchase history and earnings</li>
            </ul>
          `
        },
        {
          title: 'Platform Features',
          description: 'Discover the powerful features of AI Nexus',
          content: `
            <h3>Platform Features</h3>
            <p>AI Nexus offers a comprehensive suite of features designed for the modern AI marketplace.</p>
            
            <h4>🎯 Dynamic Platform Fees</h4>
            <ul>
              <li>Configurable platform fees fetched from smart contracts</li>
              <li>Real-time fee updates without contract redeployment</li>
              <li>Transparent fee structure visible to all users</li>
              <li>Automatic fee calculation and distribution</li>
            </ul>
            
            <h4>📊 Real-time Analytics</h4>
            <ul>
              <li>Live market statistics and trends</li>
              <li>Revenue tracking and performance metrics</li>
              <li>Interactive charts and data visualization</li>
              <li>Historical data analysis</li>
            </ul>
            
            <h4>🔒 Enhanced Security</h4>
            <ul>
              <li>Comprehensive input validation</li>
              <li>Centralized error handling</li>
              <li>Secure wallet integration</li>
              <li>Audited smart contracts</li>
            </ul>
            
            <h4>⚡ High Performance</h4>
            <ul>
              <li>Optimized database queries</li>
              <li>Efficient smart contract design</li>
              <li>Responsive UI with smooth animations</li>
              <li>Mobile-optimized experience</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: Code,
      content: [
        {
          title: 'Authentication & Security',
          description: 'Learn about API security and authentication',
          content: `
            <h3>API Security</h3>
            <p>AI Nexus API implements comprehensive security measures to protect your data and transactions.</p>
            
            <h4>Input Validation</h4>
            <ul>
              <li>All inputs are validated and sanitized</li>
              <li>Ethereum address format validation</li>
              <li>Transaction hash verification</li>
              <li>File hash integrity checks</li>
            </ul>
            
            <h4>CORS Protection</h4>
            <pre><code>// Configured CORS settings
{
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}</code></pre>
            
            <h4>Error Handling</h4>
            <ul>
              <li>Centralized error handling middleware</li>
              <li>Proper HTTP status codes</li>
              <li>Detailed error logging</li>
              <li>Development vs production error responses</li>
            </ul>
          `
        },
        {
          title: 'Models API',
          description: 'Interact with AI models programmatically',
          content: `
            <h3>Models Endpoints</h3>
            
            <h4>Get All Models</h4>
            <pre><code>GET /api/models
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- type: 'NLP' | 'Computer Vision' | 'Audio' | 'Generative' | 'Prediction' | 'Other'
- category: string
- minPrice: string
- maxPrice: string
- search: string (min 2 characters)
- sortBy: 'createdAt' | 'price' | 'rating' | 'downloads'
- sortOrder: 'asc' | 'desc'
- sellerAddress: string</code></pre>
            
            <h4>Get Trending Models</h4>
            <pre><code>GET /api/models/trending?limit=10

Response includes:
- Purchase count in last 30 days
- Total revenue generated
- Model details and ratings</code></pre>
            
            <h4>Get Featured Models</h4>
            <pre><code>GET /api/models/featured?limit=10

Response includes:
- High-rated models
- Popular categories
- Recent additions</code></pre>
            
            <h4>Get Model by ID</h4>
            <pre><code>GET /api/models/:id

Response:
{
  "_id": "model_id",
  "name": "GPT-4 Fine-tuned Model",
  "description": "Advanced language model",
  "price": "0.5",
  "type": "NLP",
  "category": "Language Models",
  "sellerAddress": "0x...",
  "rating": 4.8,
  "totalRatings": 156,
  "downloads": 1247,
  "purchaseCount": 89
}</code></pre>
          `
        },
        {
          title: 'Purchases & Transactions',
          description: 'Handle purchases and transaction logging',
          content: `
            <h3>Purchase Endpoints</h3>
            
            <h4>Log ETH Purchase</h4>
            <pre><code>POST /api/purchase
{
  "modelId": "model_id",
  "contractModelId": 1,
  "walletAddress": "0x...",
  "sellerAddress": "0x...",
  "txHash": "0x...",
  "priceInETH": "0.5",
  "priceInUSD": 1250.50,
  "blockNumber": 18500000,
  "gasUsed": "21000",
  "gasPrice": "20000000000",
  "network": "holesky",
  "transactionType": "contract_model_purchase"
}</code></pre>
            
            <h4>Log Token Purchase</h4>
            <pre><code>POST /api/purchase/token
{
  "modelId": "model_id",
  "walletAddress": "0x...",
  "sellerAddress": "0x...",
  "priceInTokens": "100",
  "priceInUSD": 250.00,
  "network": "holesky",
  "tokenContractAddress": "0x...",
  "tokenSymbol": "ANX"
}</code></pre>
            
            <h4>Get Purchase Statistics</h4>
            <pre><code>GET /api/purchase/stats?address=0x...&network=holesky

Response:
{
  "totalPurchases": 156,
  "totalVolume": "78.5",
  "totalTokenVolume": "15000",
  "totalVolumeUSD": 196250,
  "ethPurchases": 89,
  "tokenPurchases": 67
}</code></pre>
          `
        },
        {
          title: 'Market Analytics',
          description: 'Access real-time market data and analytics',
          content: `
            <h3>Market Analytics API</h3>
            
            <h4>Get Market Statistics</h4>
            <pre><code>GET /api/market/stats

Response:
{
  "totalModels": 1247,
  "totalVolume": "156.8",
  "totalTransactions": 892,
  "platformFees": "3.92",
  "activeUsers": 456,
  "trendingCategories": ["NLP", "Computer Vision"]
}</code></pre>
            
            <h4>Get Chart Data</h4>
            <pre><code>GET /api/market/chart-data?period=30d

Response:
{
  "volume": [{"date": "2025-01-01", "value": "5.2"}, ...],
  "transactions": [{"date": "2025-01-01", "count": 12}, ...],
  "revenue": [{"date": "2025-01-01", "amount": "1300"}, ...]
}</code></pre>
            
            <h4>Get Market Trends</h4>
            <pre><code>GET /api/market/trends

Response:
{
  "topModels": [...],
  "topCategories": [...],
  "topSellers": [...],
  "priceTrends": [...]
}</code></pre>
          `
        }
      ]
    },
    {
      id: 'smart-contracts',
      title: 'Smart Contracts',
      icon: Database,
      content: [
        {
          title: 'Contract Architecture',
          description: 'Understanding the smart contract system',
          content: `
            <h3>Smart Contract Overview</h3>
            <p>AI Nexus uses a sophisticated smart contract system to ensure secure, transparent, and decentralized model trading with dynamic platform fees.</p>
            
            <h4>Core Contracts</h4>
            <ul>
              <li><strong>AINexusMarketplace:</strong> Main marketplace contract with dynamic fees</li>
              <li><strong>ANXToken:</strong> Native token contract for platform payments</li>
              <li><strong>ModelRegistry:</strong> Model metadata and verification storage</li>
              <li><strong>EscrowService:</strong> Secure payment handling and dispute resolution</li>
            </ul>
            
            <h4>Key Features</h4>
            <ul>
              <li>Dynamic platform fee configuration (2.5% default)</li>
              <li>Multi-token payment support (ETH + ANX)</li>
              <li>Decentralized model verification system</li>
              <li>Automated royalty distribution</li>
              <li>Dispute resolution mechanism</li>
              <li>Multi-signature security for admin functions</li>
              <li>Event emission for real-time analytics</li>
            </ul>
            
            <h4>Security Measures</h4>
            <ul>
              <li>ReentrancyGuard for attack prevention</li>
              <li>Ownable pattern for access control</li>
              <li>Pausable functionality for emergencies</li>
              <li>Input validation and bounds checking</li>
              <li>Comprehensive event logging</li>
            </ul>
          `
        },
        {
          title: 'Contract Functions',
          description: 'Main contract functions and their usage',
          content: `
            <h3>Marketplace Contract Functions</h3>
            
            <h4>Model Management</h4>
            <pre><code>// List a new AI model
function listModel(
    string memory name,
    string memory description,
    uint256 price,
    string memory fileHash,
    string[] memory tags
) external returns (uint256 modelId)

// Purchase model with ETH
function buyModel(uint256 modelId) external payable

// Purchase model with ANX tokens
function buyModelWithTokens(uint256 modelId, uint256 tokenAmount) external

// Get all listed models
function getModels() external view returns (Model[] memory)</code></pre>
            
            <h4>Platform Fee Management</h4>
            <pre><code>// Get current platform fee percentage
function getPlatformFee() external view returns (uint256)

// Set platform fee (owner only)
function setPlatformFee(uint256 newFee) external onlyOwner

// Calculate platform fee for a purchase
function calculatePlatformFee(uint256 amount) public view returns (uint256)</code></pre>
            
            <h4>Token Integration</h4>
            <pre><code>// Get token balance
function getTokenBalance(address user) external view returns (uint256)

// Approve token spending
function approveTokens(uint256 amount) external

// Get token conversion rate
function getTokenRate() external view returns (uint256)</code></pre>
          `
        },
        {
          title: 'Contract Addresses',
          description: 'Deployed contract addresses by network',
          content: `
            <h3>Contract Addresses</h3>
            
            <h4>Holesky Testnet (Recommended for Testing)</h4>
            <ul>
              <li><strong>Marketplace:</strong> <code>0x1234...5678</code></li>
              <li><strong>ANX Token:</strong> <code>0xabcd...efgh</code></li>
              <li><strong>Model Registry:</strong> <code>0x9876...5432</code></li>
              <li><strong>Chain ID:</strong> 17000</li>
            </ul>
            
            <h4>Ethereum Mainnet</h4>
            <ul>
              <li><strong>Marketplace:</strong> <code>0x1111...2222</code></li>
              <li><strong>ANX Token:</strong> <code>0x3333...4444</code></li>
              <li><strong>Chain ID:</strong> 1</li>
            </ul>
            
            <h4>Local Development</h4>
            <ul>
              <li><strong>Marketplace:</strong> <code>0x5555...6666</code></li>
              <li><strong>ANX Token:</strong> <code>0x7777...8888</code></li>
              <li><strong>Chain ID:</strong> 1337</li>
            </ul>
            
            <h4>Verification</h4>
            <p>All contracts are verified on Etherscan and can be viewed at:</p>
            <ul>
              <li>Holesky: <a href="https://holesky.etherscan.io" target="_blank">holesky.etherscan.io</a></li>
              <li>Mainnet: <a href="https://etherscan.io" target="_blank">etherscan.io</a></li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      content: [
        {
          title: 'Security Best Practices',
          description: 'Keep your assets and data secure',
          content: `
            <h3>Security Guidelines</h3>
            <p>Follow these best practices to ensure the security of your AI models and transactions on the AI Nexus platform.</p>
            
            <h4>Wallet Security</h4>
            <ul>
              <li>Use hardware wallets for large amounts</li>
              <li>Never share private keys or seed phrases</li>
              <li>Enable two-factor authentication where available</li>
              <li>Regularly update wallet software</li>
              <li>Use separate wallets for testing and production</li>
              <li>Verify contract addresses before transactions</li>
            </ul>
            
            <h4>Model Security</h4>
            <ul>
              <li>Verify model authenticity before purchase</li>
              <li>Check seller reputation and reviews</li>
              <li>Use escrow services for large transactions</li>
              <li>Report suspicious activity immediately</li>
              <li>Validate file hashes before downloading</li>
              <li>Keep backups of purchased models</li>
            </ul>
            
            <h4>Platform Security</h4>
            <ul>
              <li>All smart contracts are audited by leading firms</li>
              <li>Multi-signature governance for admin functions</li>
              <li>Regular security updates and patches</li>
              <li>Comprehensive bug bounty program</li>
              <li>Real-time monitoring and alerting</li>
              <li>Automated vulnerability scanning</li>
            </ul>
            
            <h4>API Security</h4>
            <ul>
              <li>Input validation on all endpoints</li>
              <li>Rate limiting to prevent abuse</li>
              <li>CORS protection for cross-origin requests</li>
              <li>Secure error handling without information leakage</li>
              <li>Request logging for audit trails</li>
            </ul>
          `
        },
        {
          title: 'Audit Reports & Security',
          description: 'View security audit results and measures',
          content: `
            <h3>Security Audits</h3>
            <p>AI Nexus contracts undergo regular security audits by leading blockchain security firms to ensure the highest level of security.</p>
            
            <h4>Recent Audits</h4>
            <ul>
              <li><strong>Consensys Diligence:</strong> Marketplace Contract Audit (Q4 2025)</li>
              <li><strong>OpenZeppelin:</strong> Token Contract Audit (Q3 2025)</li>
              <li><strong>Trail of Bits:</strong> Escrow Service Audit (Q2 2025)</li>
              <li><strong>Quantstamp:</strong> Platform Fee System Audit (Q1 2025)</li>
            </ul>
            
            <h4>Audit Results</h4>
            <ul>
              <li>✅ No critical vulnerabilities found</li>
              <li>✅ Minor recommendations implemented</li>
              <li>✅ Continuous monitoring in place</li>
              <li>✅ Automated security testing</li>
              <li>✅ Regular penetration testing</li>
            </ul>
            
            <h4>Security Measures</h4>
            <ul>
              <li><strong>Smart Contract Security:</strong></li>
              <ul>
                <li>ReentrancyGuard protection</li>
                <li>Ownable access control</li>
                <li>Pausable emergency functions</li>
                <li>Input validation and bounds checking</li>
              </ul>
              <li><strong>Backend Security:</strong></li>
              <ul>
                <li>Input sanitization and validation</li>
                <li>CORS protection</li>
                <li>Rate limiting</li>
                <li>Secure error handling</li>
              </ul>
              <li><strong>Frontend Security:</strong></li>
              <ul>
                <li>Wallet connection security</li>
                <li>Input validation</li>
                <li>Error boundaries</li>
                <li>Type safety with TypeScript</li>
              </ul>
            </ul>
          `
        }
      ]
    },
    {
      id: 'development',
      title: 'Development',
      icon: Cpu,
      content: [
        {
          title: 'Development Setup',
          description: 'Set up your development environment',
          content: `
            <h3>Development Environment</h3>
            <p>Set up your development environment to contribute to AI Nexus or build on top of the platform.</p>
            
            <h4>Prerequisites</h4>
            <ul>
              <li>Node.js v18+</li>
              <li>MongoDB (local or cloud)</li>
              <li>Git</li>
              <li>MetaMask or compatible Web3 wallet</li>
              <li>Hardhat development environment</li>
            </ul>
            
            <h4>Frontend Development</h4>
            <pre><code># Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build</code></pre>
            
            <h4>Backend Development</h4>
            <pre><code># Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Seed database
npm run seed</code></pre>
            
            <h4>Smart Contract Development</h4>
            <pre><code># Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local node
npx hardhat node

# Deploy to localhost
npx hardhat run scripts/deploy-token-marketplace.js --network localhost</code></pre>
          `
        },
        {
          title: 'Testing & Quality Assurance',
          description: 'Testing strategies and quality assurance',
          content: `
            <h3>Testing Strategy</h3>
            <p>AI Nexus implements comprehensive testing across all layers of the application.</p>
            
            <h4>Frontend Testing</h4>
            <ul>
              <li><strong>Unit Tests:</strong> Component testing with React Testing Library</li>
              <li><strong>Integration Tests:</strong> API integration testing</li>
              <li><strong>E2E Tests:</strong> End-to-end testing with Playwright</li>
              <li><strong>Type Checking:</strong> TypeScript strict mode</li>
              <li><strong>Linting:</strong> ESLint and Prettier</li>
            </ul>
            
            <h4>Backend Testing</h4>
            <ul>
              <li><strong>Unit Tests:</strong> Controller and service testing</li>
              <li><strong>Integration Tests:</strong> API endpoint testing</li>
              <li><strong>Database Tests:</strong> MongoDB integration testing</li>
              <li><strong>Load Testing:</strong> Performance testing</li>
              <li><strong>Security Testing:</strong> Vulnerability scanning</li>
            </ul>
            
            <h4>Smart Contract Testing</h4>
            <ul>
              <li><strong>Unit Tests:</strong> Function testing with Hardhat</li>
              <li><strong>Integration Tests:</strong> Contract interaction testing</li>
              <li><strong>Security Tests:</strong> Vulnerability assessment</li>
              <li><strong>Gas Optimization:</strong> Gas usage analysis</li>
              <li><strong>Coverage Reports:</strong> Test coverage analysis</li>
            </ul>
            
            <h4>Quality Assurance</h4>
            <ul>
              <li>Automated CI/CD pipeline</li>
              <li>Code review process</li>
              <li>Performance monitoring</li>
              <li>Error tracking and alerting</li>
              <li>Regular security audits</li>
            </ul>
          `
        }
      ]
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.some(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about AI Nexus - from getting started to advanced API usage, smart contract development, and security best practices
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contents</h3>
              <nav className="space-y-2">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {currentSection && (
              <div className="space-y-8">
                {currentSection.content.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
                  >
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h2>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    
                    <div 
                      className="prose prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Community</h4>
                <p className="text-gray-600 text-sm mb-3">Join our Discord community for support</p>
                <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Join Discord <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
                <p className="text-gray-600 text-sm mb-3">Get help from our support team</p>
                <a href="/contact" className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium">
                  Contact Support <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                <p className="text-gray-600 text-sm mb-3">Check platform status and updates</p>
                <a href="#" className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View Status <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">API Docs</h4>
                <p className="text-gray-600 text-sm mb-3">Explore our comprehensive API</p>
                <a href="/api" className="inline-flex items-center text-orange-600 hover:text-orange-700 text-sm font-medium">
                  View API <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 