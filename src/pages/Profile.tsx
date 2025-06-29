import { motion } from 'framer-motion';
import { User, TrendingUp, Download, Star, Calendar, Wallet, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { userAPI, purchaseAPI, modelAPI } from '../services/api';
import ModelCard from '../components/ModelCard';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');

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

  // Fetch user purchases
  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ['userPurchases', address],
    queryFn: () => address ? purchaseAPI.getUserPurchaseHistory(address) : null,
    enabled: !!address,
    refetchInterval: 5000, // Refetch every 5 seconds to get latest purchases
  });

  // Fetch user's listed models
  const { data: listedModelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['userModels', address],
    queryFn: () => address ? modelAPI.getModels({ sellerAddress: address }) : null,
    enabled: !!address,
  });

  // Fetch user's sales history
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['userSales', address],
    queryFn: () => address ? userAPI.getUserSalesHistory(address) : null,
    enabled: !!address,
  });

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  const user = userProfile?.data;
  const dashboard = dashboardData?.data;
  const purchases = Array.isArray(purchasesData?.data?.docs) ? purchasesData.data.docs : [];
  const listedModels = Array.isArray(listedModelsData?.data) ? listedModelsData.data : [];
  const sales = Array.isArray(salesData?.data?.sales) ? salesData.data.sales : [];

  // Calculate total ETH spent on tokens from purchase history
  const totalETHSpentOnTokens = purchases.reduce((total: number, purchase: any) => {
    // Check if this is a token purchase (either by transaction type or by having priceInTokens)
    const isTokenPurchase = purchase.transactionType === 'token_purchase' || 
                           purchase.transactionType === 'contract_model_purchase' ||
                           purchase.transactionType === 'database_model_purchase' ||
                           (purchase.priceInTokens && parseFloat(purchase.priceInTokens) > 0);
    
    if (isTokenPurchase) {
      // Use the priceInETH field which should contain the ETH equivalent
      let ethAmount = parseFloat(purchase.priceInETH || '0');
      
      // If priceInETH is 0 but we have priceInTokens, calculate ETH equivalent
      // (assuming 1000 tokens = 1 ETH as per the conversion rate used in ModelCard)
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
  }, 0);

  // Debug logging
  console.log('Profile Debug:', {
    address,
    purchasesData: purchasesData?.data,
    purchases,
    purchasesLoading,
    totalETHSpentOnTokens,
    purchaseCount: purchases.length,
    tokenPurchases: purchases.filter((p: any) => {
      const isTokenPurchase = p.transactionType === 'token_purchase' || 
                             p.transactionType === 'contract_model_purchase' ||
                             p.transactionType === 'database_model_purchase' ||
                             (p.priceInTokens && parseFloat(p.priceInTokens) > 0);
      return isTokenPurchase;
    }).map((p: any) => ({
      id: p._id,
      modelName: p.modelId?.name,
      priceInETH: p.priceInETH,
      priceInTokens: p.priceInTokens,
      transactionType: p.transactionType,
      calculatedETH: p.priceInETH === '0' ? parseFloat(p.priceInTokens || '0') / 1000 : parseFloat(p.priceInETH || '0')
    }))
  });

  // Show loading state for purchases
  if (purchasesLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Token Earnings',
      value: `${dashboard?.stats?.totalTokenEarnings || '0'} ANX`,
      subValue: `Token Sales: ${dashboard?.stats?.tokenSales || '0'}`,
      color: 'text-purple-600',
    },
    {
      icon: Download,
      label: 'Models Listed',
      value: dashboard?.stats?.totalListings || 0,
      color: 'text-blue-600',
    },
    {
      icon: Star,
      label: 'Models Purchased',
      value: dashboard?.stats?.totalPurchases || 0,
      color: 'text-yellow-600',
    },
    {
      icon: Wallet,
      label: 'ETH Spent on Tokens',
      value: `${totalETHSpentOnTokens.toFixed(4)} ETH`,
      subValue: `Total spent on ANX tokens`,
      color: 'text-green-600',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'models', label: 'My Models', icon: TrendingUp },
    { id: 'purchases', label: 'Purchases', icon: Download },
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={user?.avatar || `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {user?.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-zinc-800 rounded-full p-1">
                  <Star className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.username || user?.displayName || 'Anonymous User'}
                </h1>
                {user?.isVerified && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    Verified
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-3">
                {user?.bio || 'AI enthusiast and blockchain developer'}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Recently'}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card p-6 text-center"
            >
              <div className={`flex justify-center mb-3`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              {stat.subValue && (
                <div className="text-sm text-gray-600 mb-2">{stat.subValue}</div>
              )}
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Earnings Summary */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Earnings Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h4 className="font-semibold text-purple-800">Token Earnings</h4>
                    </div>
                    <div className="text-2xl font-bold text-purple-900 mb-1">
                      {dashboard?.stats?.totalTokenEarnings || '0'} ANX
                    </div>
                    <div className="text-sm text-purple-700">
                      Token sales revenue
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      {dashboard?.stats?.tokenSales || 0} token sales
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold text-green-800">ETH Spent on Tokens</h4>
                    </div>
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {totalETHSpentOnTokens.toFixed(4)} ETH
                    </div>
                    <div className="text-sm text-green-700">
                      Total spent on ANX tokens
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {purchases.filter((p: any) => {
                        const isTokenPurchase = p.transactionType === 'token_purchase' || 
                                               p.transactionType === 'contract_model_purchase' ||
                                               p.transactionType === 'database_model_purchase' ||
                                               (p.priceInTokens && parseFloat(p.priceInTokens) > 0);
                        return isTokenPurchase;
                      }).length} token purchases
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {Array.isArray(dashboard?.recentActivity) && dashboard.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-gray-900">
                            {activity.type === 'purchase' ? 'Purchased' : 'Listed'} model: {activity.modelId?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {activity.priceInETH} ETH
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No recent activity</p>
                )}
              </div>

              {/* Top Models */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Models</h3>
                {listedModels.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listedModels.slice(0, 3).map((model: any) => (
                      <ModelCard key={model._id} model={model} displayMode="grid" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No models listed yet</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'earnings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Earnings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {dashboard?.stats?.totalTokenEarnings || '0'}
                  </div>
                  <div className="text-gray-600 mb-1">Total ANX Earned</div>
                  <div className="text-sm text-purple-600">
                    {dashboard?.stats?.tokenSales || 0} token sales
                  </div>
                </div>
                
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {totalETHSpentOnTokens.toFixed(4)}
                  </div>
                  <div className="text-gray-600 mb-1">ETH Spent on Tokens</div>
                  <div className="text-sm text-green-600">
                    Total spent on ANX tokens
                  </div>
                </div>
                
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {dashboard?.stats?.tokenSales || 0}
                  </div>
                  <div className="text-gray-600 mb-1">Token Transactions</div>
                  <div className="text-sm text-blue-600">
                    ANX token purchases
                  </div>
                </div>
              </div>

              {/* Token Earnings Summary */}
              <div className="card p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Token Earnings Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {dashboard?.stats?.totalTokenEarnings || '0'} ANX
                    </div>
                    <div className="text-gray-600">Total ANX Tokens Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {totalETHSpentOnTokens.toFixed(4)} ETH
                    </div>
                    <div className="text-gray-600">Total ETH Spent on ANX</div>
                  </div>
                </div>
              </div>

              {/* Sales History */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sales History</h3>
                {salesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : sales.length > 0 ? (
                  <div className="space-y-4">
                    {sales.map((sale: any) => {
                      const isTokenSale = sale.transactionType === 'token_purchase' || 
                                         (sale.priceInTokens && parseFloat(sale.priceInTokens) > 0);
                      const saleAmount = isTokenSale 
                        ? `${sale.priceInTokens || '0'} ANX`
                        : `${sale.priceInETH || '0'} ETH`;
                      
                      return (
                        <div key={sale._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {sale.modelId?.name || 'Unknown Model'}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isTokenSale 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {isTokenSale ? 'Token Sale' : 'ETH Sale'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Sold to {sale.walletAddress?.slice(0, 6)}...{sale.walletAddress?.slice(-4)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              isTokenSale ? 'text-purple-600' : 'text-green-600'
                            }`}>
                              +{saleAmount}
                            </div>
                            <div className="text-sm text-gray-600">
                              ${sale.priceInUSD || '0'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sales yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'models' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">My Listed Models</h3>
                <span className="text-gray-600">{listedModels.length} models</span>
              </div>
              
              {modelsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : listedModels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listedModels.map((model: any) => (
                    <ModelCard key={model._id} model={model} displayMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No models listed yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'purchases' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Purchase History</h3>
                <span className="text-gray-600">{purchases.length} purchases</span>
              </div>
              
              {/* Debug info - commented out for production
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
                  <p className="text-sm text-yellow-700">
                    Address: {address}<br/>
                    Purchases Count: {purchases.length}<br/>
                    Total ETH Spent: {totalETHSpentOnTokens.toFixed(4)} ETH<br/>
                    Token Purchases: {purchases.filter((p: any) => {
                      const isTokenPurchase = p.transactionType === 'token_purchase' || 
                                             p.transactionType === 'contract_model_purchase' ||
                                             p.transactionType === 'database_model_purchase' ||
                                             (p.priceInTokens && parseFloat(p.priceInTokens) > 0);
                      return isTokenPurchase;
                    }).length}<br/>
                    <br/>
                    <strong>Purchase Details:</strong><br/>
                    {purchases.map((p: any, index: number) => (
                      <div key={p._id} className="mt-2 p-2 bg-yellow-100 rounded">
                        {index + 1}. {p.modelId?.name}<br/>
                        - Price in ETH: {p.priceInETH}<br/>
                        - Price in Tokens: {p.priceInTokens}<br/>
                        - Type: {p.transactionType}<br/>
                        - Calculated ETH: {p.priceInETH === '0' ? (parseFloat(p.priceInTokens || '0') / 1000).toFixed(4) : p.priceInETH} ETH
                      </div>
                    ))}
                  </p>
                </div>
              )}
              */}
              
              {purchasesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.map((purchase: any) => {
                    // Determine payment method and amount
                    const isTokenPurchase = purchase.transactionType === 'token_purchase' || 
                                           (purchase.priceInTokens && parseFloat(purchase.priceInTokens) > 0);
                    const paymentAmount = isTokenPurchase 
                      ? `${purchase.priceInTokens || '0'} ANX`
                      : `${purchase.priceInETH || '0'} ETH`;
                    const paymentMethod = isTokenPurchase ? 'Token' : 'ETH';
                    
                    return (
                    <div key={purchase._id} className="card p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                            {purchase.modelId?.name || 'Unknown Model'}
                          </h4>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isTokenPurchase 
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {paymentMethod} Payment
                              </span>
                            </div>
                          <p className="text-gray-600 mb-2">
                            {purchase.modelId?.description || 'No description available'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Purchased: {new Date(purchase.createdAt).toLocaleDateString()}</span>
                              <span className="font-medium">Price: {paymentAmount}</span>
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {purchase.txHash?.slice(0, 10)}...{purchase.txHash?.slice(-8)}
                              </span>
                              {purchase.status && (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  purchase.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800'
                                    : purchase.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {purchase.status}
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${
                            isTokenPurchase ? 'text-purple-600' : 'text-blue-600'
                          }`}>
                              {paymentAmount}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${purchase.priceInUSD || '0'}
                            </div>
                            {purchase.transactionType && (
                              <div className="text-xs text-gray-500 mt-1">
                                {purchase.transactionType.replace(/_/g, ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No purchases yet</p>
                  <p className="text-sm text-gray-500">
                    Start exploring the marketplace to find AI models to purchase
                  </p>
                  <a 
                    href="/marketplace" 
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Marketplace
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}