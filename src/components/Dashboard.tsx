import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, DollarSign, Activity, Calendar, Star, Download, Package, BarChart3, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useMarketStats, useChartData } from '../hooks/useMarketData';
import { useRevenue } from '../hooks/useRevenue';
import { useQuery } from '@tanstack/react-query';
import { modelAPI, purchaseAPI } from '../services/api';
import { format } from 'date-fns';
import { useAccount } from 'wagmi';
import { useBlockchainData } from '../hooks/useBlockchainData';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: stats, isLoading: statsLoading } = useMarketStats();
  const { data: chartData, isLoading: chartLoading } = useChartData(30);
  
  // Get contract revenue data
  const { 
    contractRevenue, 
    eventRevenue, 
    isLoadingRevenue,
    currentETHPrice,
    formatETH,
    formatUSD,
    TOKENS_PER_ETH
  } = useRevenue();

  // Fetch blockchain data for real-time updates
  const { 
    stats: blockchainStats, 
    loading: blockchainLoading, 
    tokenBalance, 
    refetchAll: refetchBlockchainData 
  } = useBlockchainData();

  // Fetch additional model analytics
  const { data: modelAnalytics, refetch: refetchModelAnalytics } = useQuery({
    queryKey: ['modelAnalytics'],
    queryFn: async () => {
      const [modelsResponse, purchasesResponse] = await Promise.all([
        modelAPI.getModels({ limit: 1000 }),
        purchaseAPI.getAllPurchases({ limit: 1000 })
      ]);
      
      const models = modelsResponse.data || [];
      const purchases = purchasesResponse.data?.docs || [];
      
      // Calculate model performance metrics
      const modelPerformance = models.map((model: any) => {
        const modelPurchases = purchases.filter((p: any) => p.modelId === model._id);
        const totalRevenue = modelPurchases.reduce((sum: number, p: any) => sum + parseFloat(p.priceInETH || '0'), 0);
        const totalDownloads = model.downloads || 0;
        const avgRating = model.rating || 0;
        
        return {
          name: model.name,
          revenue: totalRevenue,
          downloads: totalDownloads,
          rating: avgRating,
          category: model.category || 'AI Model'
        };
      }).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 10);

      // Calculate category distribution
      const categoryData = models.reduce((acc: Record<string, number>, model: any) => {
        const category = model.category || 'AI Model';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const pieData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value
      }));

      return {
        topModels: modelPerformance,
        categoryDistribution: pieData,
        totalModels: models.length,
        totalRevenue: purchases.reduce((sum: number, p: any) => sum + parseFloat(p.priceInETH || '0'), 0)
      };
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refetch every 30 seconds if auto-refresh is enabled
  });

  // Auto-refresh blockchain data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchBlockchainData();
      refetchModelAnalytics();
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchBlockchainData, refetchModelAnalytics]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    await Promise.all([
      refetchBlockchainData(),
      refetchModelAnalytics()
    ]);
    setLastUpdate(new Date());
  };

  // Prioritize contract data for revenue statistics
  const revenue = eventRevenue || contractRevenue;
  const contractTotalRevenue = revenue ? parseFloat(revenue.totalRevenue) : 0;
  const contractTotalRevenueUSD = revenue ? parseFloat(revenue.totalRevenueUSD) : 0;
  
  // Use API data for additional stats not available in contracts
  const apiTotalRevenue = stats ? parseFloat(stats.totalRevenue || '0') : 0;
  const totalTokenRevenue = stats ? parseFloat(stats.totalTokenRevenue || '0') : 0;
  
  // Use the higher value between contract and API data for display
  const displayTotalRevenue = Math.max(contractTotalRevenue, apiTotalRevenue);

  // Get real-time transaction data
  const recentTransactions = blockchainStats?.purchaseHistory?.slice(0, 5) || [];
  const recentSales = blockchainStats?.salesHistory?.slice(0, 5) || [];

  const statCards = [
    {
      icon: TrendingUp,
      title: 'Total Models',
      value: stats?.totalModels || 0,
      change: '+12%',
      color: 'text-blue-600',
      source: 'API',
      realTime: false
    },
    {
      icon: Users,
      title: 'Active Users',
      value: (stats?.uniqueBuyers || 0) + (stats?.uniqueSellers || 0),
      change: '+8%',
      color: 'text-green-600',
      source: 'API',
      realTime: false
    },
    {
      icon: Zap,
      title: 'ETH Volume',
      value: `${formatETH(displayTotalRevenue.toString(), 4)} ETH`,
      subValue: `$${formatUSD(contractTotalRevenueUSD.toString())}`,
      change: '+24%',
      color: 'text-purple-600',
      source: revenue ? 'Contract' : 'API',
      realTime: true
    },
    {
      icon: DollarSign,
      title: 'Token Volume',
      value: `${totalTokenRevenue.toFixed(0)} ANX`,
      change: '+18%',
      color: 'text-yellow-600',
      source: 'API',
      realTime: false
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <section className="py-20 relative bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Market </span>
            <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Welcome to your AI Nexus dashboard. Track your models, sales, and marketplace activity with detailed analytics.
          </p>
          
          {/* Real-time status and controls */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-4 text-sm">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Contract Data
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              API Data
            </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                Real-time
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleManualRefresh}
                disabled={blockchainLoading}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${blockchainLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 hover:bg-green-200 text-green-800' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 hover:shadow-xl transition-all duration-300 relative"
            >
              {/* Data source indicator */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                stat.source === 'Contract' ? 'bg-green-500' : 'bg-blue-500'
              }`} title={`Data from ${stat.source}`}></div>
              
              {/* Real-time indicator */}
              {stat.realTime && (
                <div className="absolute top-2 left-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse" title="Real-time data"></div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              {stat.subValue && (
                <div className="text-sm text-gray-600 mb-1">{stat.subValue}</div>
              )}
              <div className="text-black">{stat.title}</div>
            </motion.div>
          ))}
        </div>

        {/* Real-time Transaction Feed */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Live Transaction Feed</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Purchases */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  Recent Purchases
                </h4>
                <div className="space-y-3">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-900">
                              {tx.modelId || `Model ${tx.contractModelId}`}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {tx.buyer?.slice(0, 6)}...{tx.buyer?.slice(-4)} → {tx.seller?.slice(0, 6)}...{tx.seller?.slice(-4)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {parseFloat(formatEther(BigInt(tx.price || '0'))).toFixed(4)} ETH
                          </div>
                          <div className="text-xs text-gray-500">
                            Block #{tx.blockNumber}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>No recent purchases</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Sales */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  Recent Sales
                </h4>
                <div className="space-y-3">
                  {recentSales.length > 0 ? (
                    recentSales.map((sale: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-900">
                              {sale.modelId || `Model ${sale.contractModelId}`}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {sale.buyer?.slice(0, 6)}...{sale.buyer?.slice(-4)} → {sale.seller?.slice(0, 6)}...{sale.seller?.slice(-4)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(sale.timestamp * 1000).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {parseFloat(formatEther(BigInt(sale.sellerAmount || '0'))).toFixed(4)} ETH
                          </div>
                          <div className="text-xs text-gray-500">
                            Block #{sale.blockNumber}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>No recent sales</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Volume Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Trading Volume Trend</h3>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(0,0,0,0.6)"
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis stroke="rgba(0,0,0,0.6)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    formatter={(value: any) => [`${parseFloat(value).toFixed(4)} ETH`, 'Volume']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Model Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Top Model Revenue</h3>
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            
            {!modelAnalytics ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelAnalytics.topModels.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(0,0,0,0.6)"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="rgba(0,0,0,0.6)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                    formatter={(value: any) => [`${parseFloat(value).toFixed(4)} ETH`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Additional Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Model Categories</h3>
              <Package className="h-5 w-5 text-green-600" />
            </div>
            
            {!modelAnalytics ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={modelAnalytics.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {modelAnalytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Model Downloads Trend */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Model Downloads</h3>
              <Download className="h-5 w-5 text-orange-600" />
            </div>
            
            {!modelAnalytics ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={modelAnalytics.topModels.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(0,0,0,0.6)"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="rgba(0,0,0,0.6)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="downloads" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Model Ratings */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Model Ratings</h3>
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            
            {!modelAnalytics ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={modelAnalytics.topModels.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(0,0,0,0.6)"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="rgba(0,0,0,0.6)" domain={[0, 5]} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: '#1f2937'
                    }}
                    formatter={(value: any) => [`${parseFloat(value).toFixed(1)}/5`, 'Rating']}
                  />
                  <Bar 
                    dataKey="rating" 
                    fill="#eab308"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Recent Activity */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 card p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity (Last 7 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.recentActivity?.purchases || 0}</div>
                  <div className="text-black">New Purchases</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.recentActivity?.newModels || 0}</div>
                  <div className="text-black">New Models Listed</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{modelAnalytics?.totalModels || 0}</div>
                  <div className="text-black">Total Models</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {modelAnalytics?.totalRevenue ? parseFloat(modelAnalytics.totalRevenue).toFixed(4) : '0'} ETH
                  </div>
                  <div className="text-black">Total Revenue</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}