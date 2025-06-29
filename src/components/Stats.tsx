import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, DollarSign } from 'lucide-react';
import { useMarketStats } from '../hooks/useMarketData';

export default function Stats() {
  const { data: stats, isLoading, error } = useMarketStats();

  const statItems = [
    {
      icon: TrendingUp,
      value: stats?.totalModels || 0,
      label: 'AI Models',
      change: '+12%',
      color: 'text-blue-600',
    },
    {
      icon: Users,
      value: (stats?.uniqueBuyers || 0) + (stats?.uniqueSellers || 0),
      label: 'Active Users',
      change: '+8%',
      color: 'text-green-600',
    },
    {
      icon: Zap,
      value: `${parseFloat(stats?.totalRevenue || '0').toFixed(2)}`,
      label: 'ETH Volume',
      change: '+24%',
      color: 'text-purple-600',
    },
    {
      icon: DollarSign,
      value: `$${parseFloat(stats?.totalRevenueUSD || '0').toLocaleString()}`,
      label: 'Total Value',
      change: '+18%',
      color: 'text-yellow-600',
    },
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
            {[...Array(4)].map((_, index) => (
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
          <p className="text-xl text-black max-w-3xl mx-auto">
            Real-time statistics and insights from the AI Nexus Marketplace
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 text-center hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-black mb-2">{stat.label}</div>
              <div className="text-green-500 text-sm font-medium">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Additional Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.recentActivity?.purchases || 0}
              </div>
              <div className="text-black text-sm">Purchases (Last 7 Days)</div>
            </div>
            
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">New Models</h3>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.recentActivity?.newModels || 0}
              </div>
              <div className="text-black text-sm">Listed (Last 7 Days)</div>
            </div>
            
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Category</h3>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.topCategories?.[0]?._id || 'N/A'}
              </div>
              <div className="text-gray-700 text-sm">
                {stats.topCategories?.[0]?.count || 0} Models
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}