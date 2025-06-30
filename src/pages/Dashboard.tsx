import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity, Zap, Clock, Star, Calendar, Download, Package, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { userAPI, modelAPI, purchaseAPI } from '../services/api';
import { useBlockchainData } from '../hooks/useBlockchainData';
import { useMarketStats, useChartData } from '../hooks/useMarketData';
import { useRevenue } from '../hooks/useRevenue';
import { formatEther } from 'viem';
import { format } from 'date-fns';

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  // Fetch blockchain data
  const { stats: blockchainStats, loading: blockchainLoading, tokenBalance } = useBlockchainData();

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', address],
    queryFn: () => address ? userAPI.getUserProfile(address) : null,
    enabled: !!address,
  });

  // Fetch user dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['userDashboard', address],
    queryFn: () => address ? userAPI.getUserDashboard(address) : null,
    enabled: !!address,
  });

  // Fetch user's listed models
  const { data: listedModelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['userModels', address],
    queryFn: () => address ? modelAPI.getModels({ sellerAddress: address }) : null,
    enabled: !!address,
  });

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your dashboard</p>
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

  // Get recent activity from blockchain data
  const recentActivity = [
    ...purchases.map((purchase: any) => ({
      type: 'purchase',
      title: `Purchased ${purchase.modelId || `Model ${purchase.contractModelId}`}`,
      amount: `${parseFloat(formatEther(BigInt(purchase.price || '0'))).toFixed(4)} ETH`,
      timestamp: purchase.timestamp * 1000,
      txHash: purchase.txHash,
      icon: ShoppingCart,
      color: 'text-green-600',
    })),
    ...sales.map((sale: any) => ({
      type: 'sale',
      title: `Sold ${sale.modelId || `Model ${sale.contractModelId}`}`,
      amount: `${parseFloat(formatEther(BigInt(sale.sellerAmount || '0'))).toFixed(4)} ETH`,
      timestamp: sale.timestamp * 1000,
      txHash: sale.txHash,
      icon: DollarSign,
      color: 'text-blue-600',
    })),
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Token Balance',
      value: `${parseFloat(tokenBalance || '0').toFixed(2)} ANX`,
      subValue: `Current balance`,
      change: '+12.5%',
      changeType: 'positive',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: ShoppingCart,
      label: 'Models Purchased',
      value: blockchainStats?.totalPurchases || 0,
      subValue: `Total purchases`,
      change: '+8.2%',
      changeType: 'positive',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: DollarSign,
      label: 'Models Sold',
      value: blockchainStats?.totalSales || 0,
      subValue: `Total sales`,
      change: '+15.3%',
      changeType: 'positive',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Activity,
      label: 'ETH Spent',
      value: `${(blockchainStats?.totalETHSpent || 0).toFixed(4)} ETH`,
      subValue: `Total spent`,
      change: '+22.1%',
      changeType: 'positive',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  if (blockchainLoading || profileLoading || dashboardLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username || user?.displayName || 'User'}!
          </h1>
          <p className="text-gray-600">Here's your AI Nexus Marketplace overview</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                {stat.subValue}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full bg-white ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{activity.amount}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {activity.txHash.slice(0, 8)}...{activity.txHash.slice(-6)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500 mt-2">Your transactions will appear here</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions & Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/marketplace"
                  className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-900 font-medium">Browse Marketplace</span>
                </a>
                <a
                  href="/marketplace?tab=list"
                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Star className="h-5 w-5 text-green-600" />
                  <span className="text-green-900 font-medium">List New Model</span>
                </a>
                <a
                  href="/profile"
                  className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-900 font-medium">View Profile</span>
                </a>
              </div>
            </div>

            {/* Blockchain Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total ETH Spent:</span>
                  <span className="font-semibold">{(blockchainStats?.totalETHSpent || 0).toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Token Volume:</span>
                  <span className="font-semibold">{(blockchainStats?.totalTokenVolume || 0).toFixed(0)} ANX</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-semibold">{(blockchainStats?.totalPurchases || 0) + (blockchainStats?.totalSales || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Models Listed:</span>
                  <span className="font-semibold">{listedModels.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Models */}
            {listedModels.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Models</h3>
                <div className="space-y-3">
                  {listedModels.slice(0, 3).map((model: any) => (
                    <div key={model._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900">{model.name}</div>
                      <div className="text-sm text-gray-600">{model.modelType}</div>
                      <div className="text-sm font-semibold text-green-600">
                        {parseFloat(model.price).toFixed(4)} ETH
                      </div>
                    </div>
                  ))}
                  {listedModels.length > 3 && (
                    <div className="text-center">
                      <a href="/profile?tab=models" className="text-blue-600 hover:text-blue-700 text-sm">
                        View all {listedModels.length} models
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 