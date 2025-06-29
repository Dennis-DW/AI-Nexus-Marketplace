import { motion } from 'framer-motion';
import { User, Edit, Settings, Trophy, TrendingUp, Download, Star, Calendar, Wallet, Mail, Globe, Github, Twitter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { userAPI, purchaseAPI, modelAPI } from '../services/api';
import { useContract } from '../hooks/useContract';
import ModelCard from '../components/ModelCard';
import toast from 'react-hot-toast';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
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
  });

  // Fetch user's listed models
  const { data: listedModelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['userModels', address],
    queryFn: () => address ? modelAPI.getModels({ sellerAddress: address }) : null,
    enabled: !!address,
  });

  const { models: contractModels } = useContract();

  useEffect(() => {
    if (userProfile?.data) {
      setEditForm({
        username: userProfile.data.username || '',
        email: userProfile.data.email || '',
        bio: userProfile.data.bio || '',
        avatar: userProfile.data.avatar || '',
      });
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    if (!address) return;

    try {
      await userAPI.updateUserProfile(address, editForm);
      await refetchProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

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
  const purchases = purchasesData?.data || [];
  const listedModels = listedModelsData?.data || [];

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Earnings',
      value: `${dashboard?.stats?.totalEarnings || '0'} ETH`,
      subValue: `$${dashboard?.stats?.totalEarningsUSD || '0'}`,
      color: 'text-green-600',
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
      color: 'text-purple-600',
    },
    {
      icon: Trophy,
      label: 'Reputation',
      value: user?.reputation || 0,
      color: 'text-yellow-600',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'models', label: 'My Models', icon: TrendingUp },
    { id: 'purchases', label: 'Purchases', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
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

            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
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
              {/* Recent Activity */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {dashboard?.recentActivity?.length > 0 ? (
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isTokenPurchase 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {paymentMethod}
                              </span>
                            </div>
                          <p className="text-gray-600 mb-2">
                            {purchase.modelId?.description || 'No description available'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Purchased: {new Date(purchase.createdAt).toLocaleDateString()}</span>
                              <span>Price: {paymentAmount}</span>
                              <span className="font-mono">{purchase.txHash?.slice(0, 10)}...</span>
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
                          <div className="text-lg font-semibold text-gray-900">
                              {paymentAmount}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${purchase.priceInUSD || '0'}
                            </div>
                            {purchase.transactionType && (
                              <div className="text-xs text-gray-500 mt-1">
                                {purchase.transactionType.replace('_', ' ')}
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
                  <p className="text-gray-600">No purchases yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="input-field"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      className="input-field"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications about your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={user?.preferences?.notifications || false}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Newsletter</h4>
                      <p className="text-sm text-gray-600">Receive our weekly newsletter</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={user?.preferences?.newsletter || false}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Public Profile</h4>
                      <p className="text-sm text-gray-600">Make your profile visible to others</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={user?.preferences?.publicProfile || false}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}