import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useDisconnect, useReadContract, useWriteContract } from 'wagmi';
import { ANX_TOKEN_ABI } from '../config/tokenABI';
import { ANX_TOKEN_ADDRESS, MARKETPLACE_ADDRESS } from '../config/contracts';
import { Contract, BrowserProvider, parseUnits, formatUnits, parseEther } from 'ethers';
import { useNotification } from './NotificationContext';
import { parseEther as viemParseEther } from 'viem';

interface TokenContextProps {
  tokenBalance: string;
  isApproved: boolean;
  approveToken: (spender: string, amount: string) => Promise<void>;
  buyTokens: (ethAmount: string) => Promise<void>;
  refreshBalance: () => void;
  loading: boolean;
  disconnectWallet: () => void;
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { showNotification } = useNotification();
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use wagmi hooks for better contract interaction
  const { writeContractAsync: writeTokenContract } = useWriteContract();

  // Read token balance using wagmi
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: ANX_TOKEN_ADDRESS as `0x${string}`,
    abi: ANX_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read allowance using wagmi
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: ANX_TOKEN_ADDRESS as `0x${string}`,
    abi: ANX_TOKEN_ABI,
    functionName: 'allowance',
    args: address && MARKETPLACE_ADDRESS ? [address, MARKETPLACE_ADDRESS as `0x${string}`] : undefined,
    query: {
      enabled: !!address && isConnected && !!MARKETPLACE_ADDRESS,
    },
  });

  const getTokenContract = async () => {
    if (!window.ethereum) throw new Error('MetaMask not found');
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new Contract(ANX_TOKEN_ADDRESS, ANX_TOKEN_ABI, signer);
    } catch (error: any) {
      // Handle wallet connection errors gracefully
      if (error.code === -32002) {
        throw new Error('Please connect your wallet first');
      }
      throw error;
    }
  };

  const refreshBalance = async () => {
    if (!address || !isConnected) return;
    setLoading(true);
    try {
      await refetchBalance();
      await refetchAllowance();
    } catch (e: any) {
        console.error('Error refreshing balance:', e);
      setTokenBalance('0');
      if (e.message !== 'Please connect your wallet first' && 
          !e.message.includes('could not decode result data') &&
          !e.message.includes('BAD_DATA')) {
        showNotification({
          type: 'error',
          title: 'Balance Update Failed',
          message: 'Failed to refresh token balance. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const checkApproval = async (spender: string, minAmount: string) => {
    if (!address || !isConnected) return false;
    try {
      await refetchAllowance();
    } catch (e: any) {
      console.error('Error checking approval:', e);
      setIsApproved(false);
      if (e.message !== 'Please connect your wallet first' && 
          !e.message.includes('could not decode result data') &&
          !e.message.includes('BAD_DATA')) {
        showNotification({
          type: 'error',
          title: 'Approval Check Failed',
          message: 'Failed to check token approval status.'
        });
      }
    }
  };

  const approveToken = async (spender: string, amount: string) => {
    setLoading(true);
    try {
      showNotification({
        type: 'pending',
        title: 'Approving Tokens',
        message: 'Approving tokens for marketplace spending...',
        autoClose: false
      });

      await writeTokenContract({
        address: ANX_TOKEN_ADDRESS as `0x${string}`,
        abi: ANX_TOKEN_ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, parseUnits(amount, 18)],
      });
      
      showNotification({
        type: 'success',
        title: 'Approval Successful!',
        message: 'Tokens have been approved for marketplace spending.',
        autoClose: true
      });

      await checkApproval(spender, amount);
    } catch (e: any) {
      console.error('Error approving tokens:', e);
      showNotification({
        type: 'error',
        title: 'Approval Failed',
        message: e.message || 'Failed to approve tokens. Please try again.'
      });
      throw new Error(e.message || 'Failed to approve tokens');
    } finally {
      setLoading(false);
    }
  };

  const buyTokens = async (ethAmount: string) => {
    setLoading(true);
    try {
      // Validate ETH amount
      const ethValue = parseFloat(ethAmount);
      if (isNaN(ethValue) || ethValue <= 0) {
        throw new Error('Please enter a valid ETH amount greater than 0');
      }

      // Check if user has enough ETH
      if (!window.ethereum) throw new Error('MetaMask not found');
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address!);
      const requiredAmount = parseEther(ethAmount);
      
      if (balance < requiredAmount) {
        throw new Error('Insufficient ETH balance');
      }

      // Validate contract address
      if (!ANX_TOKEN_ADDRESS || ANX_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('Token contract address not configured');
      }

      // Check if contract exists
      const contractCode = await provider.getCode(ANX_TOKEN_ADDRESS);
      if (contractCode === '0x') {
        throw new Error('Token contract not deployed at the specified address');
      }

      showNotification({
        type: 'pending',
        title: 'Buying Tokens',
        message: 'Processing your token purchase...',
        autoClose: false
      });

      console.log('Buying tokens with ETH amount:', ethAmount);
      console.log('Token contract address:', ANX_TOKEN_ADDRESS);
      console.log('Required amount in wei:', requiredAmount.toString());
      
      // Use wagmi writeContract for better error handling
      const result = await writeTokenContract({
        address: ANX_TOKEN_ADDRESS as `0x${string}`,
        abi: ANX_TOKEN_ABI,
        functionName: 'buyTokens',
        value: viemParseEther(ethAmount),
      });
      
      showNotification({
        type: 'pending',
        title: 'Transaction Pending',
        message: 'Your token purchase is being processed on the blockchain...',
        autoClose: false
      });
      
      console.log('Transaction sent:', result);
      
      showNotification({
        type: 'success',
        title: 'Tokens Purchased Successfully!',
        message: `You have received ${(parseFloat(ethAmount) * 1000).toFixed(0)} ANX tokens.`,
        autoClose: true
      });
      
      await refreshBalance();
    } catch (e: any) {
      console.error('Error buying tokens:', e);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to buy tokens. Please try again.';
      
      if (e.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH balance for transaction';
      } else if (e.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (e.message.includes('nonce too low')) {
        errorMessage = 'Transaction nonce error. Please try again.';
      } else if (e.message.includes('gas required exceeds allowance')) {
        errorMessage = 'Insufficient gas for transaction';
      } else if (e.message.includes('execution reverted')) {
        errorMessage = 'Transaction failed. Please check your input and try again.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      showNotification({
        type: 'error',
        title: 'Token Purchase Failed',
        message: errorMessage
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    // Reset token state
    setTokenBalance('0');
    setIsApproved(false);
    setLoading(false);
    
    // Disconnect wallet
    disconnect();
    
    showNotification({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'Your wallet has been disconnected successfully.',
      autoClose: true
    });
  };

  // Update balance and approval when data changes
  useEffect(() => {
    if (balanceData) {
      setTokenBalance(formatUnits(balanceData, 18));
    }
  }, [balanceData]);

  useEffect(() => {
    if (allowanceData && MARKETPLACE_ADDRESS) {
      setIsApproved(BigInt(allowanceData) >= parseUnits('1000000', 18));
    }
  }, [allowanceData]);

  useEffect(() => {
    if (isConnected && address) {
      refreshBalance();
    } else {
      // Reset state when disconnected
      setTokenBalance('0');
      setIsApproved(false);
      setLoading(false);
    }
  }, [address, isConnected]);

  return (
    <TokenContext.Provider value={{ 
      tokenBalance, 
      isApproved, 
      approveToken, 
      buyTokens, 
      refreshBalance, 
      loading,
      disconnectWallet 
    }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useToken must be used within a TokenProvider');
  return ctx;
}; 