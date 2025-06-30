import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, ABI } from '../config/contracts';
import { ANX_TOKEN_ABI } from '../config/tokenABI';

// Constants from contracts
export const TOKENS_PER_ETH = 1000; // From Token.sol contract
export const MAX_FEE_PERCENTAGE = 10; // From AINexusMarketplace.sol contract (1000 basis points = 10%)

// USD conversion rate (you can update this or fetch from an API)
export const ETH_USD_RATE = 3500; // Current ETH price in USD (update as needed)

export interface ContractRevenue {
  totalRevenue: string;
  totalRevenueUSD: string;
  platformFees: string;
  platformFeesUSD: string;
  totalTransactions: number;
  averageTransactionValue: string;
  averageTransactionValueUSD: string;
  platformFeePercentage: number;
}

export interface TokenConversion {
  ethAmount: string;
  tokenAmount: string;
  usdValue: string;
}

export interface USDConversion {
  ethAmount: string;
  usdAmount: string;
  tokenAmount: string;
}

export interface ContractConfig {
  platformFeePercentage: number;
  maxFeePercentage: number;
  paymentTokenAddress: string;
  contractBalance: string;
  isPaused: boolean;
}

// Get contract instance
export const getContractInstance = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.localhost.marketplace, ABI, signerOrProvider);
};

// Get token contract instance
export const getTokenContractInstance = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.localhost.token, ANX_TOKEN_ABI, signerOrProvider);
};

// Get contract configuration from blockchain
export const getContractConfig = async (publicClient: any): Promise<ContractConfig> => {
  try {
    const contract = getContractInstance(publicClient);
    
    const [platformFeePercentage, maxFeePercentage, paymentTokenAddress, contractBalance, isPaused] = await Promise.all([
      contract.platformFeePercentage(),
      contract.MAX_FEE_PERCENTAGE(),
      contract.paymentToken(),
      contract.getContractBalance(),
      contract.paused()
    ]);
    
    return {
      platformFeePercentage: parseFloat(platformFeePercentage.toString()) / 100, // Convert from basis points to percentage
      maxFeePercentage: parseFloat(maxFeePercentage.toString()) / 100, // Convert from basis points to percentage
      paymentTokenAddress: paymentTokenAddress.toString(),
      contractBalance: ethers.formatEther(contractBalance.toString()),
      isPaused: isPaused
    };
  } catch (error) {
    console.error('Error getting contract config:', error);
    throw error;
  }
};

// Check if payment token is set in the marketplace contract
export const isPaymentTokenSet = async (publicClient: any): Promise<boolean> => {
  try {
    const contract = getContractInstance(publicClient);
    const paymentTokenAddress = await contract.paymentToken();
    return paymentTokenAddress !== ethers.ZeroAddress;
  } catch (error) {
    console.error('Error checking payment token:', error);
    return false;
  }
};

// Get payment token address from marketplace contract
export const getPaymentTokenAddress = async (publicClient: any): Promise<string> => {
  try {
    const contract = getContractInstance(publicClient);
    const paymentTokenAddress = await contract.paymentToken();
    return paymentTokenAddress.toString();
  } catch (error) {
    console.error('Error getting payment token address:', error);
    return ethers.ZeroAddress;
  }
};

// Convert ETH to tokens using contract rate
export const ethToTokens = (ethAmount: string): string => {
  const ethValue = parseFloat(ethAmount);
  const tokenValue = ethValue * TOKENS_PER_ETH;
  return ethers.parseEther(tokenValue.toString()).toString();
};

// Convert tokens to ETH using contract rate
export const tokensToEth = (tokenAmount: string): string => {
  const tokenValue = parseFloat(ethers.formatEther(tokenAmount));
  const ethValue = tokenValue / TOKENS_PER_ETH;
  return ethValue.toString();
};

// Convert ETH to USD
export const ethToUSD = (ethAmount: string): string => {
  const ethValue = parseFloat(ethAmount);
  const usdValue = ethValue * ETH_USD_RATE;
  return usdValue.toFixed(2);
};

// Convert USD to ETH
export const usdToEth = (usdAmount: string): string => {
  const usdValue = parseFloat(usdAmount);
  const ethValue = usdValue / ETH_USD_RATE;
  return ethValue.toFixed(6);
};

// Convert tokens to USD
export const tokensToUSD = (tokenAmount: string): string => {
  const ethAmount = tokensToEth(tokenAmount);
  return ethToUSD(ethAmount);
};

// Get comprehensive conversion
export const getConversion = (ethAmount: string): TokenConversion => {
  const tokenAmount = ethToTokens(ethAmount);
  const usdValue = ethToUSD(ethAmount);
  
  return {
    ethAmount,
    tokenAmount,
    usdValue
  };
};

// Get USD conversion
export const getUSDConversion = (ethAmount: string): USDConversion => {
  const tokenAmount = ethToTokens(ethAmount);
  const usdAmount = ethToUSD(ethAmount);
  
  return {
    ethAmount,
    usdAmount,
    tokenAmount
  };
};

// Calculate platform fee for a given amount
export const calculatePlatformFee = (amount: string, feePercentage: number): string => {
  const amountValue = parseFloat(amount);
  const fee = (amountValue * feePercentage) / 100;
  return fee.toFixed(6);
};

// Calculate seller amount after platform fee
export const calculateSellerAmount = (amount: string, feePercentage: number): string => {
  const amountValue = parseFloat(amount);
  const fee = (amountValue * feePercentage) / 100;
  const sellerAmount = amountValue - fee;
  return sellerAmount.toFixed(6);
};

// Get contract revenue from blockchain
export const getContractRevenue = async (publicClient: any): Promise<ContractRevenue> => {
  try {
    const contract = getContractInstance(publicClient);
    
    // Get contract configuration
    const config = await getContractConfig(publicClient);
    
    // Get contract balance (total ETH received)
    const contractBalance = await contract.getContractBalance();
    const totalRevenue = ethers.formatEther(contractBalance.toString());
    
    // Calculate platform fees using contract fee percentage
    const platformFees = calculatePlatformFee(totalRevenue, config.platformFeePercentage);
    
    // Convert to USD
    const totalRevenueUSD = ethToUSD(totalRevenue);
    const platformFeesUSD = ethToUSD(platformFees);
    
    // Get total transactions from events
    const purchaseEvents = await contract.queryFilter(
      contract.filters.ModelPurchased(),
      0,
      'latest'
    );
    
    const databasePurchaseEvents = await contract.queryFilter(
      contract.filters.DatabaseModelPurchased(),
      0,
      'latest'
    );
    
    const totalTransactions = purchaseEvents.length + databasePurchaseEvents.length;
    const averageTransactionValue = totalTransactions > 0 ? (parseFloat(totalRevenue) / totalTransactions).toFixed(6) : '0';
    
    return {
      totalRevenue,
      totalRevenueUSD,
      platformFees,
      platformFeesUSD,
      totalTransactions,
      averageTransactionValue,
      averageTransactionValueUSD: ethToUSD(averageTransactionValue),
      platformFeePercentage: config.platformFeePercentage
    };
  } catch (error) {
    console.error('Error getting contract revenue:', error);
    throw error;
  }
};

// Get revenue from purchase events
export const getRevenueFromEvents = async (
  publicClient: any,
  fromBlock: number = 0,
  toBlock: number | string = 'latest'
): Promise<ContractRevenue> => {
  try {
    const contract = getContractInstance(publicClient);
    
    // Get contract configuration
    const config = await getContractConfig(publicClient);
    
    // Get ModelPurchased events
    const purchaseEvents = await contract.queryFilter(
      contract.filters.ModelPurchased(),
      fromBlock,
      toBlock
    );
    
    // Get DatabaseModelPurchased events
    const databasePurchaseEvents = await contract.queryFilter(
      contract.filters.DatabaseModelPurchased(),
      fromBlock,
      toBlock
    );
    
    let totalRevenue = 0;
    let totalPlatformFees = 0;
    
    // Process contract model purchases
    purchaseEvents.forEach((event: any) => {
      const price = parseFloat(ethers.formatEther(event.args?.price?.toString() || '0'));
      const platformFee = parseFloat(ethers.formatEther(event.args?.platformFee?.toString() || '0'));
      
      totalRevenue += price;
      totalPlatformFees += platformFee;
    });
    
    // Process database model purchases
    databasePurchaseEvents.forEach((event: any) => {
      const price = parseFloat(ethers.formatEther(event.args?.price?.toString() || '0'));
      const platformFee = parseFloat(ethers.formatEther(event.args?.platformFee?.toString() || '0'));
      
      totalRevenue += price;
      totalPlatformFees += platformFee;
    });
    
    const totalRevenueStr = totalRevenue.toFixed(6);
    const platformFeesStr = totalPlatformFees.toFixed(6);
    const totalTransactions = purchaseEvents.length + databasePurchaseEvents.length;
    
    return {
      totalRevenue: totalRevenueStr,
      totalRevenueUSD: ethToUSD(totalRevenueStr),
      platformFees: platformFeesStr,
      platformFeesUSD: ethToUSD(platformFeesStr),
      totalTransactions,
      averageTransactionValue: totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(6) : '0',
      averageTransactionValueUSD: totalTransactions > 0 ? ethToUSD((totalRevenue / totalTransactions).toFixed(6)) : '0',
      platformFeePercentage: config.platformFeePercentage
    };
  } catch (error) {
    console.error('Error getting revenue from events:', error);
    throw error;
  }
};

// Get user's purchase history from contract
export const getUserPurchasesFromContract = async (
  publicClient: any,
  userAddress: string
) => {
  try {
    const contract = getContractInstance(publicClient);
    
    // Get user purchases
    const userPurchases = await contract.getUserPurchases(userAddress);
    
    return userPurchases.map((purchase: any) => ({
      modelId: purchase.modelId,
      contractModelId: purchase.contractModelId.toString(),
      buyer: purchase.buyer,
      seller: purchase.seller,
      price: ethers.formatEther(purchase.price.toString()),
      platformFee: ethers.formatEther(purchase.platformFee.toString()),
      sellerAmount: ethers.formatEther(purchase.sellerAmount.toString()),
      blockNumber: purchase.blockNumber.toString(),
      timestamp: new Date(parseInt(purchase.timestamp.toString()) * 1000).toISOString(),
      txHash: purchase.txHash,
      isDatabaseModel: purchase.isDatabaseModel
    }));
  } catch (error) {
    console.error('Error getting user purchases:', error);
    throw error;
  }
};

// Get user's sales history from contract
export const getUserSalesFromContract = async (
  publicClient: any,
  userAddress: string
) => {
  try {
    const contract = getContractInstance(publicClient);
    
    // Get user sales
    const userSales = await contract.getUserSales(userAddress);
    
    return userSales.map((sale: any) => ({
      modelId: sale.modelId,
      contractModelId: sale.contractModelId.toString(),
      buyer: sale.buyer,
      seller: sale.seller,
      price: ethers.formatEther(sale.price.toString()),
      platformFee: ethers.formatEther(sale.platformFee.toString()),
      sellerAmount: ethers.formatEther(sale.sellerAmount.toString()),
      blockNumber: sale.blockNumber.toString(),
      timestamp: new Date(parseInt(sale.timestamp.toString()) * 1000).toISOString(),
      txHash: sale.txHash,
      isDatabaseModel: sale.isDatabaseModel
    }));
  } catch (error) {
    console.error('Error getting user sales:', error);
    throw error;
  }
};

// Format ETH amount
export const formatETH = (amount: string, decimals: number = 6): string => {
  return parseFloat(amount).toFixed(decimals);
};

// Format USD amount
export const formatUSD = (amount: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(parseFloat(amount));
};

// Format token amount
export const formatTokens = (amount: string, decimals: number = 2): string => {
  return parseFloat(amount).toFixed(decimals);
};

// Get current ETH price from API
export const getCurrentETHPrice = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return ETH_USD_RATE; // Fallback to default rate
  }
};

// Update ETH price (placeholder for future implementation)
export const updateETHPrice = async (): Promise<void> => {
  // This could be implemented to update a global state or cache
  console.log('ETH price update requested');
}; 