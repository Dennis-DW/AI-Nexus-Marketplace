import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  type: string;
  price: string;
  image?: string;
  seller: string;
  contractModelId?: number;
  isContractModel: boolean;
  addedAt?: Date;
  metadata?: {
    description?: string;
    tags?: string[];
    category?: string;
  };
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
  cartVersion: string;
}

interface CartAnalytics {
  totalItems: number;
  totalValue: number;
  contractModelsCount: number;
  databaseModelsCount: number;
  averagePrice: number;
  categories: { [key: string]: number };
  sellers: { [key: string]: number };
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'MOVE_ITEM_TO_TOP'; payload: string }
  | { type: 'SORT_CART'; payload: 'name' | 'price' | 'type' | 'addedAt' | 'seller' }
  | { type: 'FILTER_CART'; payload: { type?: string; seller?: string; minPrice?: number; maxPrice?: number } };

const initialState: CartState = {
  items: [],
  isCartOpen: false,
  isLoading: false,
  lastUpdated: null,
  cartVersion: '1.0.0',
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // Item already in cart
      }
      return {
        ...state,
        items: [{ ...action.payload, addedAt: new Date() }, ...state.items],
        lastUpdated: new Date(),
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        lastUpdated: new Date(),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        lastUpdated: new Date(),
      };

    case 'SET_CART_OPEN':
      return {
        ...state,
        isCartOpen: action.payload,
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.map(item => ({
          ...item,
          addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
        })),
        lastUpdated: new Date(),
      };

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
          lastUpdated: new Date(),
        };
      }
      // For AI models, quantity is always 1, but keeping this for future use
      return state;

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
        lastUpdated: new Date(),
      };

    case 'MOVE_ITEM_TO_TOP':
      const itemToMove = state.items.find(item => item.id === action.payload);
      if (!itemToMove) return state;
      
      return {
        ...state,
        items: [itemToMove, ...state.items.filter(item => item.id !== action.payload)],
        lastUpdated: new Date(),
      };

    case 'SORT_CART':
      const sortedItems = [...state.items].sort((a, b) => {
        switch (action.payload) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return parseFloat(a.price) - parseFloat(b.price);
          case 'type':
            return a.type.localeCompare(b.type);
          case 'addedAt':
            return (a.addedAt?.getTime() || 0) - (b.addedAt?.getTime() || 0);
          case 'seller':
            return a.seller.localeCompare(b.seller);
          default:
            return 0;
        }
      });
      return {
        ...state,
        items: sortedItems,
        lastUpdated: new Date(),
      };

    case 'FILTER_CART':
      // This action type is prepared for future filtering functionality
      return state;

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  moveItemToTop: (id: string) => void;
  sortCart: (criteria: 'name' | 'price' | 'type' | 'addedAt' | 'seller') => void;
  isInCart: (id: string) => boolean;
  getTotalPrice: () => number;
  getItemCount: () => number;
  getContractModelsCount: () => number;
  getDatabaseModelsCount: () => number;
  getCartAnalytics: () => CartAnalytics;
  exportCart: () => string;
  importCart: (cartData: string) => boolean;
  getCartItem: (id: string) => CartItem | undefined;
  getItemsByType: (type: string) => CartItem[];
  getItemsBySeller: (seller: string) => CartItem[];
  getItemsByPriceRange: (minPrice: number, maxPrice: number) => CartItem[];
  isCartEmpty: boolean;
  cartAnalytics: CartAnalytics;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ainexus-cart-v2';
const CART_VERSION = '1.0.0';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          
          // Version check for migration
          if (parsed.version === CART_VERSION && parsed.items) {
            dispatch({ type: 'LOAD_CART', payload: parsed.items });
          } else {
            // Migrate old cart format
            const oldCart = localStorage.getItem('ainexus-cart');
            if (oldCart) {
              const oldItems = JSON.parse(oldCart);
              dispatch({ type: 'LOAD_CART', payload: oldItems });
              localStorage.removeItem('ainexus-cart');
            }
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted cart data
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem('ainexus-cart');
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    const saveCart = () => {
      try {
        const cartData = {
          items: state.items,
          version: CART_VERSION,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    };

    if (state.items.length > 0 || state.lastUpdated) {
      saveCart();
    }
  }, [state.items, state.lastUpdated]);

  // Memoized cart analytics
  const cartAnalytics = useMemo((): CartAnalytics => {
    const totalItems = state.items.length;
    const totalValue = state.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const contractModelsCount = state.items.filter(item => item.isContractModel).length;
    const databaseModelsCount = state.items.filter(item => !item.isContractModel).length;
    const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;

    const categories: { [key: string]: number } = {};
    const sellers: { [key: string]: number } = {};

    state.items.forEach(item => {
      categories[item.type] = (categories[item.type] || 0) + 1;
      sellers[item.seller] = (sellers[item.seller] || 0) + 1;
    });

    return {
      totalItems,
      totalValue,
      contractModelsCount,
      databaseModelsCount,
      averagePrice,
      categories,
      sellers,
    };
  }, [state.items]);

  const addToCart = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setIsCartOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: isOpen });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  }, []);

  const moveItemToTop = useCallback((id: string) => {
    dispatch({ type: 'MOVE_ITEM_TO_TOP', payload: id });
  }, []);

  const sortCart = useCallback((criteria: 'name' | 'price' | 'type' | 'addedAt' | 'seller') => {
    dispatch({ type: 'SORT_CART', payload: criteria });
  }, []);

  const isInCart = useCallback((id: string) => {
    return state.items.some(item => item.id === id);
  }, [state.items]);

  const getTotalPrice = useCallback(() => {
    return state.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
  }, [state.items]);

  const getItemCount = useCallback(() => {
    return state.items.length;
  }, [state.items]);

  const getContractModelsCount = useCallback(() => {
    return state.items.filter(item => item.isContractModel).length;
  }, [state.items]);

  const getDatabaseModelsCount = useCallback(() => {
    return state.items.filter(item => !item.isContractModel).length;
  }, [state.items]);

  const getCartAnalytics = useCallback(() => {
    return cartAnalytics;
  }, [cartAnalytics]);

  const exportCart = useCallback(() => {
    return JSON.stringify({
      items: state.items,
      version: CART_VERSION,
      exportedAt: new Date().toISOString(),
    });
  }, [state.items]);

  const importCart = useCallback((cartData: string): boolean => {
    try {
      const parsed = JSON.parse(cartData);
      if (parsed.items && Array.isArray(parsed.items)) {
        dispatch({ type: 'LOAD_CART', payload: parsed.items });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing cart:', error);
      return false;
    }
  }, []);

  const getCartItem = useCallback((id: string) => {
    return state.items.find(item => item.id === id);
  }, [state.items]);

  const getItemsByType = useCallback((type: string) => {
    return state.items.filter(item => item.type === type);
  }, [state.items]);

  const getItemsBySeller = useCallback((seller: string) => {
    return state.items.filter(item => item.seller === seller);
  }, [state.items]);

  const getItemsByPriceRange = useCallback((minPrice: number, maxPrice: number) => {
    return state.items.filter(item => {
      const price = parseFloat(item.price);
      return price >= minPrice && price <= maxPrice;
    });
  }, [state.items]);

  const isCartEmpty = useMemo(() => state.items.length === 0, [state.items]);

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    clearCart,
    setIsCartOpen,
    updateQuantity,
    updateItem,
    moveItemToTop,
    sortCart,
    isInCart,
    getTotalPrice,
    getItemCount,
    getContractModelsCount,
    getDatabaseModelsCount,
    getCartAnalytics,
    exportCart,
    importCart,
    getCartItem,
    getItemsByType,
    getItemsBySeller,
    getItemsByPriceRange,
    isCartEmpty,
    cartAnalytics,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Export the CartItem type for use in other components
export type { CartItem, CartAnalytics }; 