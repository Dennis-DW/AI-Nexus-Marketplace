import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ANX_TOKEN_ABI } from '../config/tokenABI';
import { ANX_TOKEN_ADDRESS, MARKETPLACE_ADDRESS } from '../config/contracts';
import { Contract, BrowserProvider, parseUnits, formatUnits, parseEther } from 'ethers';
import { useNotification } from './NotificationContext';

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
      const contract = await getTokenContract();
      const balance = await contract.balanceOf(address);
      setTokenBalance(formatUnits(balance, 18));
    } catch (e: any) {
      // Only log errors that are not related to contract deployment
      if (!e.message.includes('could not decode result data') && 
          !e.message.includes('BAD_DATA') &&
          e.message !== 'Please connect your wallet first') {
        console.error('Error refreshing balance:', e);
      }
      setTokenBalance('0');
      // Don't show notification for contract not deployed errors
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
      const contract = await getTokenContract();
      const allowance = await contract.allowance(address, spender);
      setIsApproved(BigInt(allowance) >= parseUnits(minAmount, 18));
    } catch (e: any) {
      console.error('Error checking approval:', e);
      setIsApproved(false);
      // Don't show notification for contract not deployed errors
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

      const contract = await getTokenContract();
      const tx = await contract.approve(spender, parseUnits(amount, 18));
      
      showNotification({
        type: 'pending',
        title: 'Approval Pending',
        message: 'Waiting for approval transaction to be confirmed...',
        autoClose: false
      });

      await tx.wait();
      
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

      showNotification({
        type: 'pending',
        title: 'Buying Tokens',
        message: 'Processing your token purchase...',
        autoClose: false
      });

      const contract = await getTokenContract();
      console.log('Buying tokens with ETH amount:', ethAmount);
      console.log('Token contract address:', ANX_TOKEN_ADDRESS);
      
      const tx = await contract.buyTokens({ value: requiredAmount });
      
      showNotification({
        type: 'pending',
        title: 'Transaction Pending',
        message: 'Your token purchase is being processed on the blockchain...',
        autoClose: false
      });
      
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed');
      
      showNotification({
        type: 'success',
        title: 'Tokens Purchased Successfully!',
        message: `You have received ${(parseFloat(ethAmount) * 1000).toFixed(0)} ANX tokens.`,
        autoClose: true
      });
      
      await refreshBalance();
    } catch (e: any) {
      console.error('Error buying tokens:', e);
      showNotification({
        type: 'error',
        title: 'Token Purchase Failed',
        message: e.message || 'Failed to buy tokens. Please try again.'
      });
      throw new Error(e.message || 'Failed to buy tokens');
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

  useEffect(() => {
    if (isConnected && address) {
      refreshBalance();
      // Check approval for marketplace contract
      if (MARKETPLACE_ADDRESS) {
        checkApproval(MARKETPLACE_ADDRESS, '1000000');
      }
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