import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  Clock, 
  Filter, 
  SortAsc, 
  Download, 
  Upload,
  Save,
  RefreshCw,
  Lightbulb,
  Target,
  PieChart,
  Activity
} from 'lucide-react';
import { useCartAnalytics, useCartOperations, useCartPersistence } from '../hooks/useCartAnalytics';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

export default function CartAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'operations' | 'insights'>('overview');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'type' | 'addedAt' | 'seller'>('addedAt');
  
  const cart = useCart();
  const analytics = useCartAnalytics();
  const operations = useCartOperations();
  const persistence = useCartPersistence();

  const handleSort = (criteria: typeof sortBy) => {
    setSortBy(criteria);
    cart.sortCart(criteria);
    toast.success(`Cart sorted by ${criteria}`);
  };

  const handleExportCart = () => {
    const cartData = operations.exportCartWithMetadata();
    const blob = new Blob([cartData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Cart exported successfully!');
  };

  const handleImportCart = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (operations.importCartWithValidation(content)) {
          toast.success('Cart imported successfully!');
        } else {
          toast.error('Invalid cart file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleBackupCart = () => {
    if (persistence.saveToStorage('localStorage')) {
      toast.success('Cart backed up to localStorage');
    } else {
      toast.error('Failed to backup cart');
    }
  };

  const handleRestoreCart = () => {
    if (persistence.loadFromStorage('localStorage')) {
      toast.success('Cart restored from backup');
    } else {
      toast.error('No backup found');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(4)} ETH`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (cart.isCartEmpty) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Cart Analytics</h3>
          <p className="text-gray-500">Add items to your cart to see analytics and insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Cart Analytics</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {cart.getItemCount()} items
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBackupCart}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Backup</span>
            </button>
            <button
              onClick={handleRestoreCart}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Restore</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'operations', label: 'Operations', icon: Package },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Value</p>
                    <p className="text-2xl font-bold text-blue-900">{formatPrice(analytics.totalValue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Contract Models</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.contractModelsCount}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Database Models</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.databaseModelsCount}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Avg Price</p>
                    <p className="text-2xl font-bold text-orange-900">{formatPrice(analytics.averagePrice)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Price Distribution */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.priceDistribution.low}</div>
                  <div className="text-sm text-gray-600">Low (≤0.01 ETH)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{analytics.priceDistribution.medium}</div>
                  <div className="text-sm text-gray-600">Medium (0.01-0.1 ETH)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analytics.priceDistribution.high}</div>
                  <div className="text-sm text-gray-600">High (&gt;0.1 ETH)</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Additions</h3>
              <div className="space-y-2">
                {analytics.recentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || 'https://via.placeholder.com/40'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(parseFloat(item.price))}</p>
                      <p className="text-xs text-gray-500">
                        {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Categories</h3>
              <div className="space-y-2">
                {analytics.topCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{category.count} items</p>
                      <p className="text-sm text-gray-500">{formatPrice(category.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Sellers */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Sellers</h3>
              <div className="space-y-2">
                {analytics.topSellers.map((seller) => (
                  <div key={seller.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-mono text-sm text-gray-900">{formatAddress(seller.address)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{seller.count} models</p>
                      <p className="text-sm text-gray-500">{formatPrice(seller.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Range</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Minimum</p>
                  <p className="text-xl font-bold text-green-600">{formatPrice(analytics.priceRange.min)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Maximum</p>
                  <p className="text-xl font-bold text-red-600">{formatPrice(analytics.priceRange.max)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Range</p>
                  <p className="text-xl font-bold text-blue-600">{formatPrice(analytics.priceRange.range)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="space-y-6">
            {/* Sort Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sort Cart</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'name', label: 'Name', icon: SortAsc },
                  { value: 'price', label: 'Price', icon: DollarSign },
                  { value: 'type', label: 'Type', icon: Package },
                  { value: 'addedAt', label: 'Date Added', icon: Clock },
                  { value: 'seller', label: 'Seller', icon: Users },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                      sortBy === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Export/Import */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Export Cart</h4>
                <p className="text-sm text-gray-600 mb-3">Download your cart data as a JSON file</p>
                <button
                  onClick={handleExportCart}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Cart</span>
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Import Cart</h4>
                <p className="text-sm text-gray-600 mb-3">Import cart data from a JSON file</p>
                <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>Import Cart</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportCart}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Cart Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cart Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    operations.clearAndAdd(cart.state.items[0]);
                    toast.success('Cart cleared and first item re-added');
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Clear & Keep First
                </button>
                <button
                  onClick={() => {
                    const expensiveItems = cart.state.items.filter(item => parseFloat(item.price) > analytics.averagePrice);
                    operations.removeMultipleItems(expensiveItems.map(item => item.id));
                    toast.success(`Removed ${expensiveItems.length} expensive items`);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove Expensive Items
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Price Optimization */}
            {analytics.recommendations.priceOptimization.canSave && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">Price Optimization</h3>
                    <p className="text-green-800 mb-2">
                      You could save up to {formatPrice(analytics.recommendations.priceOptimization.potentialSavings)} by optimizing your cart.
                    </p>
                    <ul className="text-sm text-green-700 space-y-1">
                      {analytics.recommendations.priceOptimization.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Categories</h3>
              <div className="flex flex-wrap gap-2">
                {analytics.recommendations.popularCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Similar Items */}
            {analytics.recommendations.similarItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Similar Items in Cart</h3>
                <div className="space-y-2">
                  {analytics.recommendations.similarItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image || 'https://via.placeholder.com/40'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatPrice(parseFloat(item.price))}</p>
                        <p className="text-xs text-green-600">Good value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Health Score */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cart Health Score</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Diversity</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.topCategories.length > 2 ? 'Good' : 'Could be better'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price Balance</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.priceDistribution.low > 0 && analytics.priceDistribution.high > 0 ? 'Balanced' : 'Skewed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Model Types</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.contractModelsCount > 0 && analytics.databaseModelsCount > 0 ? 'Mixed' : 'Single Type'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 