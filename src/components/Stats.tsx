import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, DollarSign, ShoppingCart, Star, Clock, Globe, Activity, BarChart3 } from 'lucide-react';
import { useMarketStats } from '../hooks/useMarketData';
import { useQuery } from '@tanstack/react-query';
import { purchaseAPI } from '../services/api';

export default function Stats() {
  const { data: stats, isLoading, error } = useMarketStats();
  
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
      
      // Ensure we have a valid ETH amount
      if (ethAmount > 0) {
        return total + ethAmount;
      }
    }
    return total;
  }, 0) : 0;

  // Calculate total revenue from all transactions
  const totalRevenue = allPurchases ? allPurchases.reduce((total: number, purchase: any) => {
    return total + parseFloat(purchase.priceInETH || '0');
  }, 0) : 0;

  // Calculate total ANX token volume
  const totalANXVolume = allPurchases ? allPurchases.reduce((total: number, purchase: any) => {
    return total + parseFloat(purchase.priceInTokens || '0');
  }, 0) : 0;
  
  // Calculate additional metrics
  const averagePrice = stats?.totalRevenue && stats?.totalModels ? 
    parseFloat(stats.totalRevenue) / stats.totalModels : 0;
  
  const transactionVolume = stats?.totalRevenue ? parseFloat(stats.totalRevenue) : 0;
  const userEngagement = stats?.uniqueBuyers && stats?.uniqueSellers ? 
    (stats.uniqueBuyers + stats.uniqueSellers) / 2 : 0;

  const statItems = [
    {
      icon: TrendingUp,
      value: stats?.totalModels || 0,
      label: 'AI Models Listed',
      subLabel: 'Total available models',
      change: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Users,
      value: (stats?.uniqueBuyers || 0) + (stats?.uniqueSellers || 0),
      label: 'Active Users',
      subLabel: 'Buyers & sellers',
      change: '+8%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Zap,
      value: `${totalETHSpentOnTokens.toFixed(4)}`,
      label: 'Total ETH Spent on Tokens',
      subLabel: 'All user ANX token purchases',
      change: '+24%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: DollarSign,
      value: `${totalANXVolume.toFixed(0)}`,
      label: 'Total ANX Token Volume',
      subLabel: 'Combined token transactions',
      change: '+18%',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      icon: ShoppingCart,
      value: stats?.totalPurchases || 0,
      label: 'Total Transactions',
      subLabel: 'Completed purchases',
      change: '+15%',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      icon: Star,
      value: totalRevenue.toFixed(4),
      label: 'Total Platform Revenue',
      subLabel: 'ETH from all transactions',
      change: '+5%',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      icon: Activity,
      value: `${transactionVolume.toFixed(2)}`,
      label: 'Transaction Volume',
      subLabel: 'Total ETH traded',
      change: '+22%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      icon: Globe,
      value: userEngagement.toFixed(0),
      label: 'User Engagement',
      subLabel: 'Active participants',
      change: '+10%',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
  ];

  if (error) {
    return (
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Failed to load statistics. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="card p-6 text-center animate-pulse">
                <div className="w-8 h-8 bg-gray-800 rounded mx-auto mb-4"></div>
                <div className="h-8 bg-gray-800 rounded mb-2"></div>
                <div className="h-4 bg-gray-800 rounded mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Platform </span>
            <span className="gradient-text">Statistics</span>
          </h2>
          <p className="text-xl text-black max-w-4xl mx-auto">
            Comprehensive real-time statistics and insights from the AI Nexus Marketplace. 
            Track market performance, user engagement, and transaction volumes across the decentralized AI ecosystem.
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {statItems.slice(0, 4).map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`card p-6 text-center border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex justify-center mb-4">
                <stat.icon className={`h-10 w-10 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-black font-semibold mb-1">{stat.label}</div>
              <div className="text-gray-600 text-sm mb-2">{stat.subLabel}</div>
              <div className="text-green-500 text-sm font-medium">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {statItems.slice(4, 8).map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 4) * 0.1 }}
              viewport={{ once: true }}
              className={`card p-6 text-center border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex justify-center mb-4">
                <stat.icon className={`h-10 w-10 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-black font-semibold mb-1">{stat.label}</div>
              <div className="text-gray-600 text-sm mb-2">{stat.subLabel}</div>
              <div className="text-green-500 text-sm font-medium">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Additional Detailed Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Market Activity */}
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center mb-4">
                <Activity className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Purchases (7 days)</span>
                  <span className="font-semibold text-blue-600">
                    {stats.recentActivity?.purchases || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Models</span>
                  <span className="font-semibold text-green-600">
                    {stats.recentActivity?.newModels || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-purple-600">
                    {stats.uniqueBuyers || 0}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Top Categories */}
            <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
              </div>
              <div className="space-y-3">
                {stats.topCategories?.slice(0, 3).map((category: any, index: number) => (
                  <div key={category._id} className="flex justify-between items-center">
                    <span className="text-gray-600">{category._id}</span>
                    <span className="font-semibold text-green-600">{category.count} models</span>
                  </div>
                ))}
                {(!stats.topCategories || stats.topCategories.length === 0) && (
                  <div className="text-gray-500 text-sm">No category data available</div>
                )}
              </div>
            </div>
            
            {/* Market Performance */}
            <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Market Performance</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-purple-600">
                    {totalRevenue.toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ANX Token Volume</span>
                  <span className="font-semibold text-green-600">
                    {totalANXVolume.toFixed(0)} ANX
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ETH Spent on Tokens</span>
                  <span className="font-semibold text-blue-600">
                    {totalETHSpentOnTokens.toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Market Insights */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="card p-8 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Market Insights</h3>
              <p className="text-gray-600">Key metrics and trends from the AI Nexus ecosystem</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {stats?.totalModels || 0}
                </div>
                <div className="text-gray-600 text-sm">Total Models Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats?.uniqueBuyers || 0}
                </div>
                <div className="text-gray-600 text-sm">Unique Buyers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {stats?.uniqueSellers || 0}
                </div>
                <div className="text-gray-600 text-sm">Active Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {stats?.totalPurchases || 0}
                </div>
                <div className="text-gray-600 text-sm">Total Transactions</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}