import { motion } from 'framer-motion';
import { User, TrendingUp, Download, Star, Calendar, Wallet, Mail, RefreshCw, Clock, CheckCircle, XCircle, Activity, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';
import { userAPI, purchaseAPI, modelAPI } from '../services/api';
import { useBlockchainData } from '../hooks/useBlockchainData';
import ModelCard from '../components/ModelCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch blockchain data with real-time updates
  const { 
    stats: blockchainStats, 
    loading: blockchainLoading, 
    tokenBalance, 
    refetchAll: refetchBlockchainData 
  } = useBlockchainData();

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', address],
    queryFn: () => address ? userAPI.getUserProfile(address) : null,
    enabled: !!address,
  });

  // Fetch user dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['userDashboard', address],
    queryFn: () => address ? userAPI.getUserDashboard(address) : null,
    enabled: !!address,
  });

  // Fetch user's listed models
  const { data: listedModelsData, isLoading: modelsLoading, refetch: refetchModels } = useQuery({
    queryKey: ['userModels', address],
    queryFn: () => address ? modelAPI.getModels({ sellerAddress: address }) : null,
    enabled: !!address,
  });

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchBlockchainData();
      refetchProfile();
      refetchDashboard();
      refetchModels();
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchBlockchainData, refetchProfile, refetchDashboard, refetchModels]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    await Promise.all([
      refetchBlockchainData(),
      refetchProfile(),
      refetchDashboard(),
      refetchModels()
    ]);
    setLastUpdate(new Date());
  };

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  const user = userProfile?.data;
  const dashboard = dashboardData?.data;
  const listedModels = Array.isArray(listedModelsData?.data) ? listedModelsData.data : [];

  // Use blockchain data for purchases and stats
  const purchases = blockchainStats?.purchaseHistory || [];
  const sales = blockchainStats?.salesHistory || [];

  // Debug logging
  console.log('Profile Blockchain Debug:', {
    address,
    blockchainStats,
    blockchainLoading,
    tokenBalance,
    purchaseCount: purchases.length,
    salesCount: sales.length,
    totalETHSpent: blockchainStats?.totalETHSpent,
    totalTokenVolume: blockchainStats?.totalTokenVolume,
  });

  // Show loading state for blockchain data
  if (blockchainLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  // Prepare transaction data for charts
  const transactionData = [
    ...purchases.map((purchase: any) => ({
      date: new Date(purchase.timestamp * 1000).toLocaleDateString(),
      amount: parseFloat(formatEther(BigInt(purchase.price || '0'))),
      type: 'Purchase',
      timestamp: purchase.timestamp * 1000
    })),
    ...sales.map((sale: any) => ({
      date: new Date(sale.timestamp * 1000).toLocaleDateString(),
      amount: parseFloat(formatEther(BigInt(sale.sellerAmount || '0'))),
      type: 'Sale',
      timestamp: sale.timestamp * 1000
    }))
  ].sort((a, b) => a.timestamp - b.timestamp);

  // Group transactions by date for chart
  const chartData = transactionData.reduce((acc: any[], tx) => {
    const existing = acc.find(item => item.date === tx.date);
    if (existing) {
      existing.purchases += tx.type === 'Purchase' ? tx.amount : 0;
      existing.sales += tx.type === 'Sale' ? tx.amount : 0;
      existing.total += tx.amount;
    } else {
      acc.push({
        date: tx.date,
        purchases: tx.type === 'Purchase' ? tx.amount : 0,
        sales: tx.type === 'Sale' ? tx.amount : 0,
        total: tx.amount
      });
    }
    return acc;
  }, []);

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Token Balance',
      value: `${parseFloat(tokenBalance || '0').toFixed(2)} ANX`,
      subValue: `Current token balance`,
      color: 'text-purple-600',
      realTime: true
    },
    {
      icon: Download,
      label: 'Models Listed',
      value: dashboard?.stats?.totalListings || 0,
      color: 'text-blue-600',
      realTime: false
    },
    {
      icon: Star,
      label: 'Models Purchased',
      value: blockchainStats?.totalPurchases || 0,
      color: 'text-yellow-600',
      realTime: true
    },
    {
      icon: Wallet,
      label: 'ETH Spent on Tokens',
      value: `${(blockchainStats?.totalETHSpent || 0).toFixed(4)} ETH`,
      subValue: `Total spent on blockchain transactions`,
      color: 'text-green-600',
      realTime: true
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'models', label: 'My Models', icon: TrendingUp },
    { id: 'purchases', label: 'Purchases', icon: Download },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={user?.avatar || `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {user?.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-zinc-800 rounded-full p-1">
                  <Star className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.username || user?.displayName || 'Anonymous User'}
                </h1>
                {user?.isVerified && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    Verified
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-3">
                {user?.bio || 'AI enthusiast and blockchain developer'}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Recently'}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleManualRefresh}
                disabled={blockchainLoading}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${blockchainLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 hover:bg-green-200 text-green-800' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card p-6 text-center relative"
            >
              {/* Real-time indicator */}
              {stat.realTime && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse" title="Real-time data"></div>
              )}
              
              <div className={`flex justify-center mb-3`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              {stat.subValue && (
                <div className="text-sm text-gray-600 mb-2">{stat.subValue}</div>
              )}
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Earnings Summary */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Earnings Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h4 className="font-semibold text-purple-800">Token Earnings</h4>
                    </div>
                    <div className="text-2xl font-bold text-purple-900 mb-1">
                      {dashboard?.stats?.totalTokenEarnings || '0'} ANX
                    </div>
                    <div className="text-sm text-purple-700">
                      Token sales revenue
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {dashboard?.stats?.tokenSales || 0} token sales
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold text-green-800">ETH Spent on Tokens</h4>
                    </div>
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {(blockchainStats?.totalETHSpent || 0).toFixed(4)} ETH
                    </div>
                    <div className="text-sm text-green-700">
                      Total spent on blockchain transactions
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {purchases.length} token purchases
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {Array.isArray(dashboard?.recentActivity) && dashboard.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-gray-900">
                            {activity.type === 'purchase' ? 'Purchased' : 'Listed'} model: {activity.modelId?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {activity.priceInETH} ETH
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No recent activity</p>
                )}
              </div>

              {/* Top Models */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Models</h3>
                {listedModels.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listedModels.slice(0, 3).map((model: any) => (
                      <ModelCard key={model._id} model={model} displayMode="grid" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No models listed yet</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'earnings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Earnings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {dashboard?.stats?.totalTokenEarnings || '0'}
                  </div>
                  <div className="text-gray-600 mb-1">Total ANX Earned</div>
                  <div className="text-sm text-purple-600">
                    {dashboard?.stats?.tokenSales || 0} token sales
                  </div>
                </div>
                
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {(blockchainStats?.totalETHSpent || 0).toFixed(4)}
                  </div>
                  <div className="text-gray-600 mb-1">ETH Spent on Tokens</div>
                  <div className="text-sm text-green-600">
                    Total spent on blockchain transactions
                  </div>
                </div>
                
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {dashboard?.stats?.tokenSales || 0}
                  </div>
                  <div className="text-gray-600 mb-1">Token Transactions</div>
                  <div className="text-sm text-blue-600">
                    ANX token purchases
                  </div>
                </div>
              </div>

              {/* Token Earnings Summary */}
              <div className="card p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Token Earnings Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {dashboard?.stats?.totalTokenEarnings || '0'} ANX
                    </div>
                    <div className="text-gray-600">Total ANX Tokens Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {(blockchainStats?.totalETHSpent || 0).toFixed(4)} ETH
                    </div>
                    <div className="text-gray-600">Total ETH Spent on ANX</div>
                  </div>
                </div>
              </div>

              {/* Sales History */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sales History</h3>
                {sales.length > 0 ? (
                  <div className="space-y-4">
                    {sales.map((sale: any) => {
                      const isTokenSale = sale.transactionType === 'token_purchase' || 
                                         (sale.priceInTokens && parseFloat(sale.priceInTokens) > 0);
                      const saleAmount = isTokenSale 
                        ? `${sale.priceInTokens || '0'} ANX`
                        : `${sale.priceInETH || '0'} ETH`;
                      
                      return (
                        <div key={sale._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {sale.modelId || 'Unknown Model'}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isTokenSale 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {isTokenSale ? 'Token Sale' : 'ETH Sale'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Sold to {sale.walletAddress?.slice(0, 6)}...{sale.walletAddress?.slice(-4)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              isTokenSale ? 'text-purple-600' : 'text-green-600'
                            }`}>
                              +{saleAmount}
                            </div>
                            <div className="text-sm text-gray-600">
                              ${sale.priceInUSD || '0'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sales yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'models' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">My Listed Models</h3>
                <span className="text-gray-600">{listedModels.length} models</span>
              </div>
              
              {modelsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : listedModels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listedModels.map((model: any) => (
                    <ModelCard key={model._id} model={model} displayMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No models listed yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'purchases' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Purchase History</h3>
                <span className="text-gray-600">{purchases.length} purchases</span>
              </div>
              
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.map((purchase: any, index: number) => {
                    const purchaseDate = new Date(purchase.timestamp * 1000);
                    const priceInETH = parseFloat(formatEther(BigInt(purchase.price || '0')));
                    const platformFeeInETH = parseFloat(formatEther(BigInt(purchase.platformFee || '0')));
                    const sellerAmountInETH = parseFloat(formatEther(BigInt(purchase.sellerAmount || '0')));
                    
                    return (
                      <div key={index} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        {/* Header with model info and total price */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {purchase.modelId || `Model ${purchase.contractModelId}`}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                purchase.isDatabaseModel 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {purchase.isDatabaseModel ? 'Database Model' : 'Contract Model'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Purchased from {purchase.seller.slice(0, 6)}...{purchase.seller.slice(-4)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {purchaseDate.toLocaleDateString()} at {purchaseDate.toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600 text-xl">
                              {priceInETH.toFixed(4)} ETH
                            </div>
                            <div className="text-sm text-gray-600">Total Price</div>
                          </div>
                        </div>

                        {/* Transaction breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              {sellerAmountInETH.toFixed(4)} ETH
                            </div>
                            <div className="text-xs text-gray-600">Seller Amount</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-orange-600">
                              {platformFeeInETH.toFixed(4)} ETH
                            </div>
                            <div className="text-xs text-gray-600">Platform Fee</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {((platformFeeInETH / priceInETH) * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600">Fee Rate</div>
                          </div>
                        </div>

                        {/* Transaction details */}
                        <div className="border-t pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Transaction Hash:</span>
                                <span className="font-mono text-gray-900">
                                  {purchase.txHash.slice(0, 8)}...{purchase.txHash.slice(-6)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Block Number:</span>
                                <span className="font-mono text-gray-900">{purchase.blockNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Buyer:</span>
                                <span className="font-mono text-gray-900">
                                  {purchase.buyer.slice(0, 6)}...{purchase.buyer.slice(-4)}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Seller:</span>
                                <span className="font-mono text-gray-900">
                                  {purchase.seller.slice(0, 6)}...{purchase.seller.slice(-4)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Model ID:</span>
                                <span className="font-mono text-gray-900">
                                  {purchase.contractModelId || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Type:</span>
                                <span className="text-gray-900">
                                  {purchase.isDatabaseModel ? 'Database' : 'Smart Contract'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No purchases found</p>
                  <p className="text-sm text-gray-500 mt-2">Your purchase history will appear here</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction History Chart */}
                <div className="card p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h3>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(0,0,0,0.6)"
                        />
                        <YAxis stroke="rgba(0,0,0,0.6)" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            color: '#1f2937'
                          }}
                          formatter={(value: any) => [`${parseFloat(value).toFixed(4)} ETH`, 'Amount']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <p>No transaction data available</p>
                    </div>
                  )}
                </div>

                {/* Purchase vs Sales Chart */}
                <div className="card p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Purchases vs Sales</h3>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(0,0,0,0.6)"
                        />
                        <YAxis stroke="rgba(0,0,0,0.6)" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            color: '#1f2937'
                          }}
                          formatter={(value: any) => [`${parseFloat(value).toFixed(4)} ETH`, 'Amount']}
                        />
                        <Bar dataKey="purchases" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <p>No transaction data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Statistics */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Transaction Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{purchases.length}</div>
                    <div className="text-sm text-gray-600">Total Purchases</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{sales.length}</div>
                    <div className="text-sm text-gray-600">Total Sales</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(blockchainStats?.totalETHSpent || 0).toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600">ETH Spent</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(blockchainStats?.totalETHReceived || 0).toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600">ETH Received</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}