import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, DollarSign, Activity, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useMarketStats, useChartData } from '../hooks/useMarketData';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useMarketStats();
  const { data: chartData, isLoading: chartLoading } = useChartData(30);

  const statCards = [
    {
      icon: TrendingUp,
      title: 'Total Models',
      value: stats?.totalModels || 0,
      change: '+12%',
      color: 'text-blue-600',
    },
    {
      icon: Users,
      title: 'Active Users',
      value: (stats?.uniqueBuyers || 0) + (stats?.uniqueSellers || 0),
      change: '+8%',
      color: 'text-green-600',
    },
    {
      icon: Zap,
      title: 'ETH Volume',
      value: `${parseFloat(stats?.totalRevenue || '0').toFixed(4)} ETH`,
      change: '+24%',
      color: 'text-purple-600',
    },
    {
      icon: DollarSign,
      title: 'Token Volume',
      value: `${parseFloat(stats?.totalTokenRevenue || '0').toFixed(0)} ANX`,
      change: '+18%',
      color: 'text-yellow-600',
    },
  ];

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
            Welcome to your AI Nexus dashboard. Track your models, sales, and marketplace activity.
          </p>
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
              className="card p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-500 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-black">{stat.title}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Volume Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Trading Volume</h3>
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

          {/* Transactions Chart */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Daily Transactions</h3>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
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
                  />
                  <Bar 
                    dataKey="transactions" 
                    fill="#8b5cf6"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}