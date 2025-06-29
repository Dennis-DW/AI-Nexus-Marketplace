import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Brain, Menu, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAccount } from 'wagmi';
import ShoppingCartModal from './ShoppingCart';
import TokenBalance from './TokenBalance';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isConnected } = useAccount();
  const { 
    state: { items, isCartOpen },
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getItemCount,
    getTotalPrice
  } = useCart();

  const navItems = [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Docs', href: '/docs' },
    { name: 'Profile', href: '/profile' },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Nexus
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`transition-colors duration-200 font-medium ${
                    isActive(item.href)
                      ? 'text-blue-600'
                      : 'text-black hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Shopping Cart - Only show if connected */}
              {isConnected && (
              <div className="relative group">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-black hover:text-blue-600 transition-all duration-200 transform hover:scale-105"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {getItemCount() > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
                    >
                      {getItemCount()}
                    </motion.span>
                  )}
                </button>
                
                {/* Cart Preview Tooltip */}
                {getItemCount() > 0 && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Cart Preview</h4>
                        <span className="text-sm text-gray-500">{getItemCount()} items</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <img
                              src={item.image || 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=50'}
                              alt={item.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.price} ANX</p>
                            </div>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="text-center text-sm text-gray-500 py-2">
                            +{items.length - 3} more items
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">Total:</span>
                            <span className="font-bold text-blue-600">{getTotalPrice().toFixed(2)} ANX</span>
                        </div>
                        <button
                          onClick={() => setIsCartOpen(true)}
                          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          View Cart
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Token Balance & User Dropdown - Only show if connected */}
              {isConnected && <TokenBalance />}

              {/* Connect Wallet - Show if not connected */}
              {!isConnected && (
                <div className="flex items-center space-x-2">
              <ConnectButton />
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-gray-200"
            >
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`transition-colors duration-200 font-medium ${
                      isActive(item.href)
                        ? 'text-blue-600'
                        : 'text-black hover:text-blue-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Cart - Only show if connected */}
                {isConnected && (
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-black hover:text-blue-600 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {getItemCount() > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold"
                      >
                        {getItemCount()}
                      </motion.span>
                    )}
                  </div>
                  <span>Cart ({getItemCount()})</span>
                </button>
                )}
                
                {/* Mobile Token Balance - Only show if connected */}
                {isConnected && (
                  <div className="pt-4">
                    <TokenBalance />
                  </div>
                )}

                {/* Mobile Connect Button - Only show if not connected */}
                {!isConnected && (
                <div className="pt-4">
                  <ConnectButton />
                </div>
                )}
              </nav>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Shopping Cart Modal */}
      <ShoppingCartModal />
    </>
  );
}