import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, DollarSign, Activity, Calendar, Star, Download, Package, BarChart3, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useMarketStats, useChartData } from '../hooks/useMarketData';
import { useQuery } from '@tanstack/react-query';
import { modelAPI, purchaseAPI } from '../services/api';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useMarketStats();
  const { data: chartData, isLoading: chartLoading } = useChartData(30);

  // Fetch all purchases to calculate total ETH spent on tokens
  const { data: allPurchases } = useQuery({
    queryKey: ['allPurchases'],
    queryFn: async () => {
      const response = await purchaseAPI.getAllPurchases();
      return response.data?.docs || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calculate total ETH spent on tokens from all purchases
  const totalETHSpentOnTokens = allPurchases ? allPurchases.reduce((total: number, purchase: any) => {
    // Check if this is a token purchase
    const isTokenPurchase = purchase.transactionType === 'token_purchase' || 
                           purchase.transactionType === 'contract_model_purchase' ||
                           purchase.transactionType === 'database_model_purchase' ||
                           (purchase.priceInTokens && parseFloat(purchase.priceInTokens) > 0);
    
    if (isTokenPurchase) {
      let ethAmount = parseFloat(purchase.priceInETH || '0');
      
      // If priceInETH is 0 but we have priceInTokens, calculate ETH equivalent
      if (ethAmount === 0 && purchase.priceInTokens) {
        const tokenAmount = parseFloat(purchase.priceInTokens);
        ethAmount = tokenAmount / 1000; // Convert tokens to ETH
      }
      
      return total + ethAmount;
    }
    return total;
  }, 0) : 0;

  // Calculate total revenue from all transactions
  const totalRevenue = allPurchases ? allPurchases.reduce((total: number, purchase: any) => {
    return total + parseFloat(purchase.priceInETH || '0');
  }, 0) : 0;

  // Fetch additional model analytics
  const { data: modelAnalytics } = useQuery({
    queryKey: ['modelAnalytics'],
    queryFn: async () => {
      const [modelsResponse, purchasesResponse] = await Promise.all([
        modelAPI.getModels({ limit: 1000 }),
        purchaseAPI.getAllPurchases({ limit: 1000 })
      ]);
      
      const models = modelsResponse.data || [];
      const purchases = purchasesResponse.data?.docs || [];
      
      // Calculate model performance metrics
      const modelPerformance = models.map(model => {
        const modelPurchases = purchases.filter(p => p.modelId === model._id);
        const totalRevenue = modelPurchases.reduce((sum, p) => sum + parseFloat(p.priceInETH || '0'), 0);
        const totalDownloads = model.downloads || 0;
        const avgRating = model.rating || 0;
        
        return {
          name: model.name,
          revenue: totalRevenue,
          downloads: totalDownloads,
          rating: avgRating,
          category: model.category || 'AI Model'
        };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

      // Calculate category distribution
      const categoryData = models.reduce((acc, model) => {
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
        totalRevenue: purchases.reduce((sum, p) => sum + parseFloat(p.priceInETH || '0'), 0)
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const statCards = [
    {
      icon: TrendingUp,
      title: 'Total AI Models Listed',
      value: stats?.totalModels || 0,
      change: '+12%',
      color: 'text-blue-600',
      description: 'Available models in marketplace'
    },
    {
      icon: Users,
      title: 'Active Users',
      value: (stats?.uniqueBuyers || 0) + (stats?.uniqueSellers || 0),
      change: '+8%',
      color: 'text-green-600',
      description: 'Buyers & sellers combined'
    },
    {
      icon: Zap,
      title: 'Total ETH Spent on ANX Tokens',
      value: `${totalETHSpentOnTokens.toFixed(4)} ETH`,
      change: '+24%',
      color: 'text-purple-600',
      description: 'All user token purchases'
    },
    {
      icon: DollarSign,
      title: 'Total Platform Revenue',
      value: `${totalRevenue.toFixed(4)} ETH`,
      change: '+18%',
      color: 'text-yellow-600',
      description: 'Combined transaction volume'
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">AI Nexus </span>
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive analytics and insights for the AI Nexus marketplace. Track models, transactions, and user activity.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-gray-900 font-semibold mb-1">{stat.title}</div>
              <div className="text-sm text-gray-600">{stat.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Volume Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
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
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Top Model Revenue</h3>
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            
            {modelAnalytics?.topModels && modelAnalytics.topModels.length > 0 ? (
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
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No model data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Model Categories</h3>
              <Package className="h-5 w-5 text-green-600" />
            </div>
            
            {modelAnalytics?.categoryDistribution && modelAnalytics.categoryDistribution.length > 0 ? (
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
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No category data available
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Model Listed</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-600">+1</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Token Purchase</p>
                    <p className="text-xs text-gray-600">4 hours ago</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">+0.05 ETH</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New User Joined</p>
                    <p className="text-xs text-gray-600">6 hours ago</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-purple-600">+1</span>
              </div>
            </div>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Platform Statistics</h3>
              <BarChart3 className="h-5 w-5 text-yellow-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-semibold text-gray-900">{stats?.totalPurchases || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Price</span>
                <span className="font-semibold text-gray-900">
                  {stats?.totalPurchases && stats?.totalRevenue ? 
                    (parseFloat(stats.totalRevenue) / stats.totalPurchases).toFixed(4) : '0'} ETH
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">98.5%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Models</span>
                <span className="font-semibold text-gray-900">{stats?.totalModels || 0}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 