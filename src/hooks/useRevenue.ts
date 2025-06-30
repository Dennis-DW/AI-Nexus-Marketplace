import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { 
  getContractRevenue, 
  getRevenueFromEvents, 
  getUserPurchasesFromContract,
  getUserSalesFromContract,
  getContractConfig,
  getConversion,
  getUSDConversion,
  ethToTokens,
  tokensToEth,
  ethToUSD,
  tokensToUSD,
  formatETH,
  formatUSD,
  formatTokens,
  getCurrentETHPrice,
  updateETHPrice,
  TOKENS_PER_ETH,
  MAX_FEE_PERCENTAGE,
  ETH_USD_RATE
} from '../utils/contractUtils';

export function useRevenue() {
  const publicClient = usePublicClient();

  // Get contract configuration
  const { data: contractConfig, isLoading: isLoadingConfig, error: configError } = useQuery({
    queryKey: ['contractConfig'],
    queryFn: async () => {
      if (!publicClient) throw new Error('No public client available');
      return await getContractConfig(publicClient);
    },
    enabled: !!publicClient,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000, // Consider data stale after 4 minutes
  });

  // Get contract revenue
  const { data: contractRevenue, isLoading: isLoadingRevenue, error: revenueError } = useQuery({
    queryKey: ['contractRevenue'],
    queryFn: async () => {
      if (!publicClient) throw new Error('No public client available');
      return await getContractRevenue(publicClient);
    },
    enabled: !!publicClient,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Get revenue from events (more detailed)
  const { data: eventRevenue, isLoading: isLoadingEventRevenue, error: eventRevenueError } = useQuery({
    queryKey: ['eventRevenue'],
    queryFn: async () => {
      if (!publicClient) throw new Error('No public client available');
      // Get events from last 30 days
      const blockNumber = await publicClient.getBlockNumber();
      const fromBlock = Math.max(0, Number(blockNumber) - 10000);
      return await getRevenueFromEvents(publicClient, fromBlock, 'latest');
    },
    enabled: !!publicClient,
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  });

  // Get current ETH price
  const { data: currentETHPrice, isLoading: isLoadingETHPrice } = useQuery({
    queryKey: ['ethPrice'],
    queryFn: getCurrentETHPrice,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000, // Consider data stale after 4 minutes
  });

  // Update ETH price manually
  const updatePrice = async () => {
    await updateETHPrice();
  };

  return {
    // Contract configuration
    contractConfig,
    isLoadingConfig,
    configError,
    
    // Revenue data
    contractRevenue,
    eventRevenue,
    isLoadingRevenue,
    isLoadingEventRevenue,
    revenueError,
    eventRevenueError,
    
    // ETH price
    currentETHPrice: currentETHPrice || ETH_USD_RATE,
    isLoadingETHPrice,
    updatePrice,
    
    // Conversion utilities
    ethToTokens,
    tokensToEth,
    ethToUSD,
    tokensToUSD,
    getConversion,
    getUSDConversion,
    
    // Formatting utilities
    formatETH,
    formatUSD,
    formatTokens,
    
    // Constants
    TOKENS_PER_ETH,
    MAX_FEE_PERCENTAGE,
    ETH_USD_RATE
  };
}

export function useUserRevenue(walletAddress?: string) {
  const publicClient = usePublicClient();
  const { currentETHPrice } = useRevenue();

  // Get user purchases from contract
  const { data: userPurchases, isLoading: isLoadingPurchases, error: purchasesError } = useQuery({
    queryKey: ['userPurchases', walletAddress],
    queryFn: async () => {
      if (!publicClient || !walletAddress) throw new Error('No public client or wallet address available');
      return await getUserPurchasesFromContract(publicClient, walletAddress);
    },
    enabled: !!publicClient && !!walletAddress,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 120000, // Consider data stale after 2 minutes
  });

  // Get user sales from contract
  const { data: userSales, isLoading: isLoadingSales, error: salesError } = useQuery({
    queryKey: ['userSales', walletAddress],
    queryFn: async () => {
      if (!publicClient || !walletAddress) throw new Error('No public client or wallet address available');
      return await getUserSalesFromContract(publicClient, walletAddress);
    },
    enabled: !!publicClient && !!walletAddress,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 120000, // Consider data stale after 2 minutes
  });

  // Calculate user revenue statistics
  const userRevenueStats = userPurchases && userSales ? {
    totalSpent: userPurchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.price), 0).toFixed(6),
    totalSpentUSD: userPurchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.price) * (currentETHPrice || ETH_USD_RATE), 0).toFixed(2),
    totalEarned: userSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.sellerAmount), 0).toFixed(6),
    totalEarnedUSD: userSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.sellerAmount) * (currentETHPrice || ETH_USD_RATE), 0).toFixed(2),
    totalFeesPaid: userPurchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.platformFee), 0).toFixed(6),
    totalFeesPaidUSD: userPurchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.platformFee) * (currentETHPrice || ETH_USD_RATE), 0).toFixed(2),
    totalFeesEarned: userSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.platformFee), 0).toFixed(6),
    totalFeesEarnedUSD: userSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.platformFee) * (currentETHPrice || ETH_USD_RATE), 0).toFixed(2),
    purchaseCount: userPurchases.length,
    saleCount: userSales.length,
    averagePurchaseValue: userPurchases.length > 0 ? (userPurchases.reduce((sum: number, purchase: any) => sum + parseFloat(purchase.price), 0) / userPurchases.length).toFixed(6) : '0',
    averageSaleValue: userSales.length > 0 ? (userSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.sellerAmount), 0) / userSales.length).toFixed(6) : '0'
  } : null;

  return {
    userPurchases,
    userSales,
    userRevenueStats,
    isLoadingPurchases,
    isLoadingSales,
    purchasesError,
    salesError
  };
}

export function useTokenConversion() {
  const { currentETHPrice } = useRevenue();

  const convertETHToTokens = (ethAmount: string) => {
    return ethToTokens(ethAmount);
  };

  const convertTokensToETH = (tokenAmount: string) => {
    return tokensToEth(tokenAmount);
  };

  const convertETHToUSD = (ethAmount: string) => {
    return ethToUSD(ethAmount);
  };

  const convertTokensToUSD = (tokenAmount: string) => {
    return tokensToUSD(tokenAmount);
  };

  const getFullConversion = (ethAmount: string) => {
    return getConversion(ethAmount);
  };

  const getUSDConversion = (ethAmount: string) => {
    return getUSDConversion(ethAmount);
  };

  return {
    convertETHToTokens,
    convertTokensToETH,
    convertETHToUSD,
    convertTokensToUSD,
    getFullConversion,
    getUSDConversion,
    currentETHPrice: currentETHPrice || ETH_USD_RATE,
    TOKENS_PER_ETH
  };
} 