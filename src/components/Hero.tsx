import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketStats } from '../hooks/useMarketData';

export default function Hero() {
  const { data: stats } = useMarketStats();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-black uppercase tracking-wider">
              Decentralized AI Revolution
            </span>
            <Sparkles className="h-6 w-6 text-yellow-500 ml-2" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">AI Models</span>
            <br />
            <span className="text-black">Meet Web3</span>
          </h1>

          <p className="text-xl md:text-2xl text-black mb-8 max-w-3xl mx-auto">
            The world's first decentralized marketplace for AI models. Buy, sell, and trade 
            cutting-edge AI solutions with complete ownership and transparency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>

            <Link to="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center space-x-2"
              >
                <Zap className="h-5 w-5" />
                <span>List Your Model</span>
              </motion.button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-black">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{stats?.totalModels || 0} Active Models</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>{parseFloat(stats?.totalRevenue || '0').toFixed(2)} ETH Volume</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>{((stats?.uniqueBuyers || 0) + (stats?.uniqueSellers || 0))} Developers</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}