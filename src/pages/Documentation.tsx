import { motion } from 'framer-motion';
import { BookOpen, Code, Zap, Shield, Database, Wallet, Smartphone, Globe, ArrowRight, ExternalLink, Search, FileText, Settings, Users, Lock } from 'lucide-react';
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
            <p>AI Nexus is the world's first decentralized marketplace for AI models. This guide will help you get started with buying, selling, and trading AI models.</p>
            
            <h4>Step 1: Connect Your Wallet</h4>
            <p>First, you'll need to connect your Web3 wallet (MetaMask, WalletConnect, etc.) to access the marketplace.</p>
            <ul>
              <li>Click the "Connect Wallet" button in the header</li>
              <li>Choose your preferred wallet</li>
              <li>Approve the connection</li>
            </ul>
            
            <h4>Step 2: Get ANX Tokens</h4>
            <p>ANX tokens are used for purchasing AI models on the platform. You can:</p>
            <ul>
              <li>Purchase tokens directly from the marketplace</li>
              <li>Earn tokens by selling your AI models</li>
              <li>Participate in community rewards</li>
            </ul>
            
            <h4>Step 3: Browse and Purchase Models</h4>
            <p>Explore the marketplace to find AI models that suit your needs:</p>
            <ul>
              <li>Filter by category, price, or rating</li>
              <li>Read model descriptions and reviews</li>
              <li>Purchase with ETH or ANX tokens</li>
            </ul>
          `
        },
        {
          title: 'Wallet Setup',
          description: 'Configure your wallet for optimal experience',
          content: `
            <h3>Wallet Configuration</h3>
            <p>Proper wallet setup ensures smooth transactions and secure interactions with the AI Nexus marketplace.</p>
            
            <h4>Supported Networks</h4>
            <ul>
              <li><strong>Ethereum Mainnet:</strong> Primary network for all transactions</li>
              <li><strong>Polygon:</strong> Lower gas fees for testing and small transactions</li>
              <li><strong>Arbitrum:</strong> High-speed transactions with lower costs</li>
            </ul>
            
            <h4>Recommended Settings</h4>
            <ul>
              <li>Set gas limit to 500,000 for model purchases</li>
              <li>Enable auto-confirmation for better UX</li>
              <li>Keep sufficient ETH for gas fees</li>
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
          title: 'Authentication',
          description: 'Learn how to authenticate API requests',
          content: `
            <h3>API Authentication</h3>
            <p>All API requests require authentication using your wallet signature or API key.</p>
            
            <h4>Wallet Authentication</h4>
            <pre><code>// Sign message with wallet
const message = "Authenticate with AI Nexus API";
const signature = await wallet.signMessage(message);

// Include in headers
headers: {
  'Authorization': \`Bearer \${signature}\`,
  'Wallet-Address': walletAddress
}</code></pre>
            
            <h4>API Key Authentication</h4>
            <pre><code>headers: {
  'X-API-Key': 'your-api-key-here',
  'Content-Type': 'application/json'
}</code></pre>
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
- limit: number (default: 20)
- category: string
- minPrice: string
- maxPrice: string
- search: string
- sortBy: 'price' | 'rating' | 'createdAt'
- sortOrder: 'asc' | 'desc'</code></pre>
            
            <h4>Get Model by ID</h4>
            <pre><code>GET /api/models/:id

Response:
{
  "_id": "model_id",
  "name": "GPT-4 Fine-tuned Model",
  "description": "Advanced language model",
  "price": "0.5",
  "category": "Language Models",
  "sellerAddress": "0x...",
  "rating": 4.8,
  "totalRatings": 156
}</code></pre>
            
            <h4>Purchase Model</h4>
            <pre><code>POST /api/purchase
{
  "modelId": "model_id",
  "paymentMethod": "eth" | "token",
  "walletAddress": "0x..."
}</code></pre>
          `
        },
        {
          title: 'User API',
          description: 'Manage user profiles and preferences',
          content: `
            <h3>User Management</h3>
            
            <h4>Get User Profile</h4>
            <pre><code>GET /api/users/:walletAddress/profile</code></pre>
            
            <h4>Update Profile</h4>
            <pre><code>PUT /api/users/:walletAddress/profile
{
  "username": "new_username",
  "email": "user@example.com",
  "bio": "AI enthusiast"
}</code></pre>
            
            <h4>Get Purchase History</h4>
            <pre><code>GET /api/purchase/user/:walletAddress</code></pre>
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
            <p>AI Nexus uses a sophisticated smart contract system to ensure secure, transparent, and decentralized model trading.</p>
            
            <h4>Core Contracts</h4>
            <ul>
              <li><strong>AINexusMarketplace:</strong> Main marketplace contract</li>
              <li><strong>ANXToken:</strong> Native token contract</li>
              <li><strong>ModelRegistry:</strong> Model metadata storage</li>
              <li><strong>EscrowService:</strong> Secure payment handling</li>
            </ul>
            
            <h4>Key Features</h4>
            <ul>
              <li>Decentralized model verification</li>
              <li>Automated royalty distribution</li>
              <li>Dispute resolution system</li>
              <li>Multi-signature security</li>
            </ul>
          `
        },
        {
          title: 'Contract Addresses',
          description: 'Deployed contract addresses by network',
          content: `
            <h3>Contract Addresses</h3>
            
            <h4>Ethereum Mainnet</h4>
            <ul>
              <li><strong>Marketplace:</strong> 0x1234...5678</li>
              <li><strong>ANX Token:</strong> 0xabcd...efgh</li>
              <li><strong>Model Registry:</strong> 0x9876...5432</li>
            </ul>
            
            <h4>Polygon</h4>
            <ul>
              <li><strong>Marketplace:</strong> 0x1111...2222</li>
              <li><strong>ANX Token:</strong> 0x3333...4444</li>
            </ul>
            
            <h4>Arbitrum</h4>
            <ul>
              <li><strong>Marketplace:</strong> 0x5555...6666</li>
              <li><strong>ANX Token:</strong> 0x7777...8888</li>
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
            <p>Follow these best practices to ensure the security of your AI models and transactions.</p>
            
            <h4>Wallet Security</h4>
            <ul>
              <li>Use hardware wallets for large amounts</li>
              <li>Never share private keys or seed phrases</li>
              <li>Enable two-factor authentication</li>
              <li>Regularly update wallet software</li>
            </ul>
            
            <h4>Model Security</h4>
            <ul>
              <li>Verify model authenticity before purchase</li>
              <li>Check seller reputation and reviews</li>
              <li>Use escrow services for large transactions</li>
              <li>Report suspicious activity immediately</li>
            </ul>
            
            <h4>Platform Security</h4>
            <ul>
              <li>All smart contracts are audited</li>
              <li>Multi-signature governance</li>
              <li>Regular security updates</li>
              <li>Bug bounty program</li>
            </ul>
          `
        },
        {
          title: 'Audit Reports',
          description: 'View security audit results',
          content: `
            <h3>Security Audits</h3>
            <p>AI Nexus contracts undergo regular security audits by leading blockchain security firms.</p>
            
            <h4>Recent Audits</h4>
            <ul>
              <li><strong>Consensys Diligence:</strong> Marketplace Contract Audit (Q4 2024)</li>
              <li><strong>OpenZeppelin:</strong> Token Contract Audit (Q3 2024)</li>
              <li><strong>Trail of Bits:</strong> Escrow Service Audit (Q2 2024)</li>
            </ul>
            
            <h4>Audit Results</h4>
            <ul>
              <li>No critical vulnerabilities found</li>
              <li>Minor recommendations implemented</li>
              <li>Continuous monitoring in place</li>
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
            Everything you need to know about AI Nexus - from getting started to advanced API usage
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 