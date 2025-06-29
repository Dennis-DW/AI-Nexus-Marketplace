import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Model {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  fileHash: string;
  sellerAddress: string;
  contractModelId?: number;
  isActive: boolean;
  tags: string[];
  category: string;
  downloads: number;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  isVerified: boolean;
  reputation: number;
  totalSales: number;
  totalPurchases: number;
  joinedAt: string;
  lastActive: string;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    publicProfile: boolean;
  };
}

export interface Purchase {
  _id: string;
  modelId: string;
  contractModelId: number;
  walletAddress: string;
  sellerAddress: string;
  txHash: string;
  priceInETH: string;
  priceInTokens?: string;
  priceInUSD: number;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  transactionType: 'eth_purchase' | 'token_purchase' | 'database_model_purchase' | 'contract_model_purchase';
  tokenContractAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  createdAt: string;
  formattedPrice?: string;
  paymentMethod?: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  category: string;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  readTime: number;
  publishedAt: string;
  createdAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  walletAddress?: string;
  createdAt: string;
}

export interface Newsletter {
  _id: string;
  email: string;
  isActive: boolean;
  preferences: {
    weeklyDigest: boolean;
    productUpdates: boolean;
    marketingEmails: boolean;
  };
  source: string;
  createdAt: string;
}

export interface MarketStats {
  totalModels: number;
  totalPurchases: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  totalRevenue: string;
  totalRevenueUSD: string;
  totalTokenRevenue?: string;
  topCategories: Array<{ _id: string; count: number }>;
  recentActivity: {
    purchases: number;
    newModels: number;
  };
}

export interface ChartData {
  date: string;
  volume: number;
  transactions: number;
  volumeUSD: number;
}

export interface CookiePreferences {
  _id: string;
  userId: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consentDate: string;
  createdAt: string;
  updatedAt: string;
}

// Model API functions
export const modelAPI = {
  // Get all models with filtering
  getModels: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    sellerAddress?: string;
  }) => {
    const response = await api.get('/api/models', { params });
    return response.data;
  },

  // Get trending models
  getTrendingModels: async (limit = 5) => {
    const response = await api.get('/api/models/trending', { params: { limit } });
    return response.data;
  },

  // Get model by ID
  getModelById: async (id: string) => {
    const response = await api.get(`/api/models/${id}`);
    return response.data;
  },

  // Get models by seller
  getModelsBySeller: async (sellerAddress: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/api/models/seller/${sellerAddress}`, { params });
    return response.data;
  },

  // Create new model
  createModel: async (modelData: Partial<Model>) => {
    const response = await api.post('/api/models', modelData);
    return response.data;
  },

  // Add model (alias for createModel)
  addModel: async (modelData: Partial<Model>) => {
    const response = await api.post('/api/models', modelData);
    return response.data;
  },

  // Update model
  updateModel: async (id: string, modelData: Partial<Model>) => {
    const response = await api.put(`/api/models/${id}`, modelData);
    return response.data;
  },

  // Delete model
  deleteModel: async (id: string) => {
    const response = await api.delete(`/api/models/${id}`);
    return response.data;
  },

  // Get model categories
  getCategories: async () => {
    const response = await api.get('/api/models/categories');
    return response.data;
  },

  // Search models
  searchModels: async (query: string) => {
    const response = await api.get('/api/models/search', {
      params: { query },
    });
    return response.data;
  }
};

// User API functions
export const userAPI = {
  // Get all users
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  // Get user profile
  getUserProfile: async (walletAddress: string) => {
    const response = await api.get(`/api/users/profile/${walletAddress}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (walletAddress: string, profileData: Partial<User>) => {
    const response = await api.put(`/api/users/profile/${walletAddress}`, profileData);
    return response.data;
  },

  // Get user dashboard
  getUserDashboard: async (walletAddress: string) => {
    const response = await api.get(`/api/users/dashboard/${walletAddress}`);
    return response.data;
  },

  // Get user activity
  getUserActivity: async (walletAddress: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/api/users/activity/${walletAddress}`, { params });
    return response.data;
  },

  // Get user's models
  getUserModels: async (walletAddress: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/api/users/${walletAddress}/models`, { params });
    return response.data;
  },

  // Get user's purchases
  getUserPurchases: async (walletAddress: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/api/users/${walletAddress}/purchases`, { params });
    return response.data;
  }
};

// Blog API functions
export const blogAPI = {
  // Get all blog posts
  getBlogPosts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/api/blog', { params });
    return response.data;
  },

  // Get blog post by slug
  getBlogPost: async (slug: string) => {
    const response = await api.get(`/api/blog/${slug}`);
    return response.data;
  },

  // Get featured blog posts
  getFeaturedPosts: async (limit: number = 5) => {
    const response = await api.get('/api/blog/featured', { params: { limit } });
    return response.data;
  },

  // Get blog categories
  getCategories: async () => {
    const response = await api.get('/api/blog/categories');
    return response.data;
  }
};

// Purchase API functions
export const purchaseAPI = {
  // Create purchase record
  createPurchase: async (purchaseData: Partial<Purchase>) => {
    const response = await api.post('/api/purchase', purchaseData);
    return response.data;
  },

  // Log token purchase
  logTokenPurchase: async (purchaseData: Partial<Purchase>) => {
    const response = await api.post('/api/purchase/token', purchaseData);
    return response.data;
  },

  // Get purchase transactions
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    walletAddress?: string;
    modelId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/api/purchase/transactions', { params });
    return response.data;
  },

  // Get transaction history (alias for getTransactions)
  getTransactionHistory: async (params?: {
    page?: number;
    limit?: number;
    walletAddress?: string;
    modelId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/api/purchase/transactions', { params });
    return response.data;
  },

  // Get user purchase history
  getUserPurchaseHistory: async (walletAddress: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/api/purchase/user/${walletAddress}`, { params });
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (id: string) => {
    const response = await api.get(`/api/purchase/transactions/${id}`);
    return response.data;
  },

  // Update transaction status
  updateTransactionStatus: async (id: string, status: string) => {
    const response = await api.put(`/api/purchase/transactions/${id}/status`, { status });
    return response.data;
  },

  // Get purchase statistics
  getPurchaseStats: async () => {
    const response = await api.get('/api/purchase/stats');
    return response.data;
  }
};

// Contact API functions
export const contactAPI = {
  // Submit contact form
  submitContact: async (contactData: Partial<Contact>) => {
    const response = await api.post('/api/contact', contactData);
    return response.data;
  },

  // Get all contacts (admin)
  getAllContacts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/api/contact', { params });
    return response.data;
  },

  // Subscribe to newsletter
  subscribeNewsletter: async (subscriptionData: {
    email: string;
    preferences?: {
      weeklyDigest?: boolean;
      productUpdates?: boolean;
      marketingEmails?: boolean;
    };
    source?: string;
  }) => {
    const response = await api.post('/api/newsletter/subscribe', subscriptionData);
    return response.data;
  },

  // Unsubscribe from newsletter
  unsubscribeNewsletter: async (email: string) => {
    const response = await api.post('/api/newsletter/unsubscribe', { email });
    return response.data;
  },

  // Get newsletter subscribers (admin)
  getNewsletterSubscribers: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    source?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/api/newsletter/subscribers', { params });
    return response.data;
  },
};

// Cookie API functions
export const cookieAPI = {
  // Get cookie preferences
  getPreferences: async (userId: string) => {
    const response = await api.get(`/api/cookies/preferences/${userId}`);
    return response.data;
  },

  // Update cookie preferences
  updatePreferences: async (userId: string, preferences: Partial<CookiePreferences>) => {
    const response = await api.put(`/api/cookies/preferences/${userId}`, preferences);
    return response.data;
  },

  // Get cookie consent status
  getCookieConsent: async (userId: string) => {
    const response = await api.get(`/api/cookies/consent/${userId}`);
    return response.data;
  },

  // Clear all cookies
  clearAllCookies: async (userId: string) => {
    const response = await api.delete(`/api/cookies/clear/${userId}`);
    return response.data;
  },
};

// Market API functions
export const marketAPI = {
  // Get market statistics
  getStats: async () => {
    const response = await api.get('/api/market/stats');
    return response.data;
  },

  // Get chart data
  getChartData: async (days = 30) => {
    const response = await api.get('/api/market/chart-data', { params: { days } });
    return response.data;
  },

  // Get top sellers
  getTopSellers: async (limit = 5) => {
    const response = await api.get('/api/market/top-sellers', { params: { limit } });
    return response.data;
  },

  // Get market trends
  getMarketTrends: async () => {
    const response = await api.get('/api/market/trends');
    return response.data;
  }
};

export default api;