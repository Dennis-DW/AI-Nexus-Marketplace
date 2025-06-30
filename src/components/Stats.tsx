import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity, Zap, Coins, BarChart3, Percent, Wallet, ArrowUpRight, ArrowDownRight, Database, Smartphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { marketAPI } from '../services/api';
import { useContract } from '../hooks/useContract';
import { formatEther } from 'viem';

export default function Stats() {
  const controls = useAnimation();
  const { 
    totalModels: contractTotalModels,
    contractBalance,
    platformFeePercentage,
    models: contractModels
  } = useContract();

  // Fetch market data for additional stats (fallback)
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['marketStats'],
    queryFn: () => marketAPI.getStats(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const animateStats = async () => {
      await controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      });
    };

    if (!marketLoading) {
      animateStats();
    }
  }, [controls, marketLoading]);

  // Calculate contract-based statistics
  const activeContractModels = contractModels?.filter((model: any) => model.active)?.length || 0;
  const totalContractSales = contractModels?.reduce((sum: number, model: any) => sum + (model.totalSales || 0), 0) || 0;

  // Use API data for additional stats not available in contracts
  const totalDatabaseModels = marketData?.totalModels || 0;
  const uniqueBuyers = marketData?.uniqueBuyers || 0;
  const uniqueSellers = marketData?.uniqueSellers || 0;
  const totalModels = contractTotalModels + totalDatabaseModels;

  type ChangeType = 'positive' | 'negative' | 'neutral';

  const stats = [
    {
      title: 'Total Models',
      value: totalModels.toLocaleString(),
      subValue: `${activeContractModels} active on-chain`,
      change: '+5.2%',
      changeType: 'positive' as ChangeType,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      icon: Database,
      source: 'Contract + API'
    },
    {
      title: 'Contract Balance',
      value: `${parseFloat(contractBalance).toFixed(4)} ETH`,
      subValue: 'Platform fees collected',
      change: platformFeePercentage + '%',
      changeType: 'neutral' as ChangeType,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      icon: Wallet,
      source: 'Contract'
    },
    {
      title: 'Platform Fee',
      value: `${platformFeePercentage}%`,
      subValue: 'Per transaction',
      change: 'Fixed',
      changeType: 'neutral' as ChangeType,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      icon: Percent,
      source: 'Contract'
    },
    {
      title: 'Contract Sales',
      value: totalContractSales.toLocaleString(),
      subValue: 'On-chain transactions',
      change: '+12.3%',
      changeType: 'positive' as ChangeType,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-200',
      icon: ShoppingCart,
      source: 'Contract'
    },
    {
      title: 'Unique Buyers',
      value: uniqueBuyers.toLocaleString(),
      subValue: 'Active users',
      change: '+8.7%',
      changeType: 'positive' as ChangeType,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      icon: Users,
      source: 'API'
    },
    {
      title: 'Unique Sellers',
      value: uniqueSellers.toLocaleString(),
      subValue: 'Model creators',
      change: '+15.1%',
      changeType: 'positive' as ChangeType,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      icon: Smartphone,
      source: 'API'
    }
  ];

  if (marketLoading) {
    return (
      <section id="stats-section" className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Market Statistics</h2>
            <p className="text-lg text-gray-600">Loading real-time data from smart contracts...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stats-section" className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-indigo-100/50"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Market Statistics</h2>
          <p className="text-lg text-gray-600">Real-time data from smart contracts and blockchain</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Contract Data
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              API Data
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-gray-500">{stat.source}</span>
                  {stat.changeType === 'positive' && (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  )}
                  {stat.changeType === 'negative' && (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.subValue}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">{stat.title}</span>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}