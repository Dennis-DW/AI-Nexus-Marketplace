import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { ABI, CONTRACT_ADDRESSES, ANX_TOKEN_ADDRESS } from '../config/contracts';
import { ANX_TOKEN_ABI } from '../config/tokenABI';
import { useChains } from 'wagmi';
import { useState, useEffect } from 'react';

export interface BlockchainPurchase {
  modelId: string;
  contractModelId: number;
  buyer: string;
  seller: string;
  price: string; // in wei
  platformFee: string; // in wei
  sellerAmount: string; // in wei
  blockNumber: number;
  timestamp: number;
  txHash: string;
  isDatabaseModel: boolean;
}

export interface BlockchainStats {
  totalPurchases: number;
  totalSales: number;
  totalETHSpent: number;
  totalETHReceived: number;
  totalTokenVolume: number;
  purchaseHistory: BlockchainPurchase[];
  salesHistory: BlockchainPurchase[];
}

export function useBlockchainData() {
  const { address, isConnected } = useAccount();
  const availableChains = useChains();
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(false);

  const getContractAddress = (): `0x${string}` => {
    if (!availableChains || availableChains.length === 0) return CONTRACT_ADDRESSES.localhost.marketplace as `0x${string}`;
    
    const chain = availableChains[0];
    switch (chain.id) {
      case 1:
        return CONTRACT_ADDRESSES.mainnet.marketplace as `0x${string}`;
      case 17000: // Holesky testnet
        return CONTRACT_ADDRESSES.holesky.marketplace as `0x${string}`;
      case 1337:
      case 31337:
        return CONTRACT_ADDRESSES.localhost.marketplace as `0x${string}`;
      default:
        return CONTRACT_ADDRESSES.localhost.marketplace as `0x${string}`;
    }
  };

  const getTokenAddress = (): `0x${string}` => {
    if (!availableChains || availableChains.length === 0) return CONTRACT_ADDRESSES.localhost.token as `0x${string}`;
    
    const chain = availableChains[0];
    switch (chain.id) {
      case 1:
        return CONTRACT_ADDRESSES.mainnet.token as `0x${string}`;
      case 17000: // Holesky testnet
        return CONTRACT_ADDRESSES.holesky.token as `0x${string}`;
      case 1337:
      case 31337:
        return CONTRACT_ADDRESSES.localhost.token as `0x${string}`;
      default:
        return CONTRACT_ADDRESSES.localhost.token as `0x${string}`;
    }
  };

  const contractAddress = getContractAddress();
  const tokenAddress = getTokenAddress();

  // Fetch user purchases from blockchain
  const { data: userPurchases, refetch: refetchPurchases } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getUserPurchases',
    args: address ? [address] : undefined,
  });

  // Fetch user sales from blockchain
  const { data: userSales, refetch: refetchSales } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getUserSales',
    args: address ? [address] : undefined,
  });

  // Fetch user token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: tokenAddress,
    abi: ANX_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Fetch user purchase count
  const { data: purchaseCount, refetch: refetchPurchaseCount } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getUserTotalPurchaseCount',
    args: address ? [address] : undefined,
  });

  // Fetch user sales count
  const { data: salesCount, refetch: refetchSalesCount } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getUserDatabaseModelPurchaseCount',
    args: address ? [address] : undefined,
  });

  // Process blockchain data and calculate stats
  useEffect(() => {
    if (!address || !isConnected) {
      setStats(null);
      return;
    }

    setLoading(true);

    try {
      const purchases = Array.isArray(userPurchases) ? userPurchases : [];
      const sales = Array.isArray(userSales) ? userSales : [];

      // Calculate total ETH spent on purchases
      const totalETHSpent = purchases.reduce((total, purchase) => {
        const priceInETH = parseFloat(formatEther(BigInt(purchase.price || '0')));
        return total + priceInETH;
      }, 0);

      // Calculate total ETH received from sales
      const totalETHReceived = sales.reduce((total, sale) => {
        const sellerAmountInETH = parseFloat(formatEther(BigInt(sale.sellerAmount || '0')));
        return total + sellerAmountInETH;
      }, 0);

      // Calculate total token volume (assuming all purchases are token-based)
      const totalTokenVolume = purchases.reduce((total, purchase) => {
        const priceInTokens = parseFloat(formatEther(BigInt(purchase.price || '0')));
        return total + priceInTokens;
      }, 0);

      const blockchainStats: BlockchainStats = {
        totalPurchases: Number(purchaseCount || 0),
        totalSales: Number(salesCount || 0),
        totalETHSpent,
        totalETHReceived,
        totalTokenVolume,
        purchaseHistory: purchases.map((purchase: any) => ({
          modelId: purchase.modelId || '',
          contractModelId: Number(purchase.contractModelId || 0),
          buyer: purchase.buyer || '',
          seller: purchase.seller || '',
          price: purchase.price || '0',
          platformFee: purchase.platformFee || '0',
          sellerAmount: purchase.sellerAmount || '0',
          blockNumber: Number(purchase.blockNumber || 0),
          timestamp: Number(purchase.timestamp || 0),
          txHash: purchase.txHash || '',
          isDatabaseModel: purchase.isDatabaseModel || false,
        })),
        salesHistory: sales.map((sale: any) => ({
          modelId: sale.modelId || '',
          contractModelId: Number(sale.contractModelId || 0),
          buyer: sale.buyer || '',
          seller: sale.seller || '',
          price: sale.price || '0',
          platformFee: sale.platformFee || '0',
          sellerAmount: sale.sellerAmount || '0',
          blockNumber: Number(sale.blockNumber || 0),
          timestamp: Number(sale.timestamp || 0),
          txHash: sale.txHash || '',
          isDatabaseModel: sale.isDatabaseModel || false,
        })),
      };

      setStats(blockchainStats);
    } catch (error) {
      console.error('Error processing blockchain data:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, userPurchases, userSales, purchaseCount, salesCount]);

  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      refetchPurchases(),
      refetchSales(),
      refetchTokenBalance(),
      refetchPurchaseCount(),
      refetchSalesCount(),
    ]);
  };

  return {
    stats,
    loading,
    tokenBalance: tokenBalance ? formatEther(BigInt(tokenBalance.toString())) : '0',
    refetchAll,
    refetchPurchases,
    refetchSales,
    refetchTokenBalance,
  };
} 