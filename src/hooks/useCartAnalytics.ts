import { useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../contexts/CartContext';

export interface CartInsights {
  // Basic analytics
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  
  // Model type breakdown
  contractModelsCount: number;
  databaseModelsCount: number;
  contractModelsValue: number;
  databaseModelsValue: number;
  
  // Category analysis
  categories: { [key: string]: { count: number; value: number; percentage: number } };
  topCategories: Array<{ name: string; count: number; value: number; percentage: number }>;
  
  // Seller analysis
  sellers: { [key: string]: { count: number; value: number; percentage: number } };
  topSellers: Array<{ address: string; count: number; value: number; percentage: number }>;
  
  // Price analysis
  priceRange: { min: number; max: number; range: number };
  priceDistribution: {
    low: number; // 0-0.01 ETH
    medium: number; // 0.01-0.1 ETH
    high: number; // 0.1+ ETH
  };
  
  // Time analysis
  recentItems: CartItem[];
  oldestItems: CartItem[];
  averageAge: number; // in days
  
  // Recommendations
  recommendations: {
    similarItems: CartItem[];
    popularCategories: string[];
    priceOptimization: {
      canSave: boolean;
      potentialSavings: number;
      suggestions: string[];
    };
  };
}

export function useCartAnalytics(): CartInsights {
  const { state, cartAnalytics } = useCart();
  
  return useMemo((): CartInsights => {
    const { items } = state;
    
    if (items.length === 0) {
      return {
        totalItems: 0,
        totalValue: 0,
        averagePrice: 0,
        contractModelsCount: 0,
        databaseModelsCount: 0,
        contractModelsValue: 0,
        databaseModelsValue: 0,
        categories: {},
        topCategories: [],
        sellers: {},
        topSellers: [],
        priceRange: { min: 0, max: 0, range: 0 },
        priceDistribution: { low: 0, medium: 0, high: 0 },
        recentItems: [],
        oldestItems: [],
        averageAge: 0,
        recommendations: {
          similarItems: [],
          popularCategories: [],
          priceOptimization: {
            canSave: false,
            potentialSavings: 0,
            suggestions: [],
          },
        },
      };
    }

    // Basic calculations
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const averagePrice = totalValue / totalItems;

    // Model type breakdown
    const contractModels = items.filter(item => item.isContractModel);
    const databaseModels = items.filter(item => !item.isContractModel);
    const contractModelsCount = contractModels.length;
    const databaseModelsCount = databaseModels.length;
    const contractModelsValue = contractModels.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const databaseModelsValue = databaseModels.reduce((sum, item) => sum + parseFloat(item.price), 0);

    // Category analysis
    const categories: { [key: string]: { count: number; value: number; percentage: number } } = {};
    items.forEach(item => {
      if (!categories[item.type]) {
        categories[item.type] = { count: 0, value: 0, percentage: 0 };
      }
      categories[item.type].count++;
      categories[item.type].value += parseFloat(item.price);
    });

    // Calculate percentages
    Object.keys(categories).forEach(category => {
      categories[category].percentage = (categories[category].count / totalItems) * 100;
    });

    const topCategories = Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Seller analysis
    const sellers: { [key: string]: { count: number; value: number; percentage: number } } = {};
    items.forEach(item => {
      if (!sellers[item.seller]) {
        sellers[item.seller] = { count: 0, value: 0, percentage: 0 };
      }
      sellers[item.seller].count++;
      sellers[item.seller].value += parseFloat(item.price);
    });

    Object.keys(sellers).forEach(seller => {
      sellers[seller].percentage = (sellers[seller].count / totalItems) * 100;
    });

    const topSellers = Object.entries(sellers)
      .map(([address, data]) => ({ address, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Price analysis
    const prices = items.map(item => parseFloat(item.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = { min: minPrice, max: maxPrice, range: maxPrice - minPrice };

    const priceDistribution = {
      low: items.filter(item => parseFloat(item.price) <= 0.01).length,
      medium: items.filter(item => parseFloat(item.price) > 0.01 && parseFloat(item.price) <= 0.1).length,
      high: items.filter(item => parseFloat(item.price) > 0.1).length,
    };

    // Time analysis
    const now = new Date();
    const itemsWithAge = items.map(item => ({
      ...item,
      age: item.addedAt ? (now.getTime() - item.addedAt.getTime()) / (1000 * 60 * 60 * 24) : 0,
    }));

    const recentItems = [...itemsWithAge]
      .sort((a, b) => (b.addedAt?.getTime() || 0) - (a.addedAt?.getTime() || 0))
      .slice(0, 5);

    const oldestItems = [...itemsWithAge]
      .sort((a, b) => (a.addedAt?.getTime() || 0) - (b.addedAt?.getTime() || 0))
      .slice(0, 5);

    const averageAge = itemsWithAge.reduce((sum, item) => sum + item.age, 0) / totalItems;

    // Recommendations
    const similarItems = items
      .filter(item => 
        topCategories.some(cat => cat.name === item.type) && 
        parseFloat(item.price) <= averagePrice
      )
      .slice(0, 3);

    const popularCategories = topCategories.map(cat => cat.name);

    // Price optimization suggestions
    const expensiveItems = items.filter(item => parseFloat(item.price) > averagePrice * 1.5);
    const potentialSavings = expensiveItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) - averagePrice), 0
    );

    const suggestions: string[] = [];
    if (expensiveItems.length > 0) {
      suggestions.push(`Consider alternatives for ${expensiveItems.length} expensive items`);
    }
    if (contractModelsCount > databaseModelsCount) {
      suggestions.push('Mix of contract and database models can optimize costs');
    }
    if (topCategories.length > 3) {
      suggestions.push('Consider focusing on fewer categories for better deals');
    }

    const priceOptimization = {
      canSave: potentialSavings > 0,
      potentialSavings,
      suggestions,
    };

    return {
      totalItems,
      totalValue,
      averagePrice,
      contractModelsCount,
      databaseModelsCount,
      contractModelsValue,
      databaseModelsValue,
      categories,
      topCategories,
      sellers,
      topSellers,
      priceRange,
      priceDistribution,
      recentItems,
      oldestItems,
      averageAge,
      recommendations: {
        similarItems,
        popularCategories,
        priceOptimization,
      },
    };
  }, [state.items, cartAnalytics]);
}

// Utility hook for cart operations
export function useCartOperations() {
  const cart = useCart();
  
  const operations = {
    // Batch operations
    addMultipleItems: (items: CartItem[]) => {
      items.forEach(item => cart.addToCart(item));
    },
    
    removeMultipleItems: (ids: string[]) => {
      ids.forEach(id => cart.removeFromCart(id));
    },
    
    // Smart operations
    addIfNotExists: (item: CartItem) => {
      if (!cart.isInCart(item.id)) {
        cart.addToCart(item);
        return true;
      }
      return false;
    },
    
    // Cart management
    clearAndAdd: (item: CartItem) => {
      cart.clearCart();
      cart.addToCart(item);
    },
    
    // Export/Import with validation
    exportCartWithMetadata: () => {
      const cartData = cart.exportCart();
      const metadata = {
        exportedAt: new Date().toISOString(),
        totalItems: cart.getItemCount(),
        totalValue: cart.getTotalPrice(),
        version: '1.0.0',
      };
      return JSON.stringify({ cartData, metadata });
    },
    
    importCartWithValidation: (data: string) => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.cartData) {
          return cart.importCart(parsed.cartData);
        }
        return cart.importCart(data);
      } catch {
        return false;
      }
    },
  };
  
  return operations;
}

// Hook for cart persistence and sync
export function useCartPersistence() {
  const cart = useCart();
  
  const persistence = {
    // Save cart to multiple storage options
    saveToStorage: (storageType: 'localStorage' | 'sessionStorage' = 'localStorage') => {
      try {
        const cartData = cart.exportCart();
        if (storageType === 'localStorage') {
          localStorage.setItem('ainexus-cart-backup', cartData);
        } else {
          sessionStorage.setItem('ainexus-cart-session', cartData);
        }
        return true;
      } catch (error) {
        console.error('Failed to save cart to storage:', error);
        return false;
      }
    },
    
    // Load cart from storage
    loadFromStorage: (storageType: 'localStorage' | 'sessionStorage' = 'localStorage') => {
      try {
        const key = storageType === 'localStorage' ? 'ainexus-cart-backup' : 'ainexus-cart-session';
        const cartData = storageType === 'localStorage' 
          ? localStorage.getItem(key)
          : sessionStorage.getItem(key);
        
        if (cartData) {
          return cart.importCart(cartData);
        }
        return false;
      } catch (error) {
        console.error('Failed to load cart from storage:', error);
        return false;
      }
    },
    
    // Clear storage
    clearStorage: (storageType: 'localStorage' | 'sessionStorage' = 'localStorage') => {
      try {
        const key = storageType === 'localStorage' ? 'ainexus-cart-backup' : 'ainexus-cart-session';
        if (storageType === 'localStorage') {
          localStorage.removeItem(key);
        } else {
          sessionStorage.removeItem(key);
        }
        return true;
      } catch (error) {
        console.error('Failed to clear storage:', error);
        return false;
      }
    },
  };
  
  return persistence;
} 