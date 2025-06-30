import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useToken } from '../contexts/TokenContext';
import { Coins, Plus, CheckCircle, AlertCircle, ChevronDown, User, Settings, LogOut, RefreshCw, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { MARKETPLACE_ADDRESS, ANX_TOKEN_ADDRESS } from '../config/contracts';
import { useBlockchainData } from '../hooks/useBlockchainData';

export default function TokenBalance() {
  const { address, isConnected } = useAccount();
  const { tokenBalance, isApproved, approveToken, buyTokens, loading, disconnectWallet } = useToken();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ethAmount, setEthAmount] = useState('0.01');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [previousBalance, setPreviousBalance] = useState('0');

  // Fetch blockchain data for real-time updates
  const { 
    stats: blockchainStats, 
    loading: blockchainLoading, 
    refetchAll: refetchBlockchainData 
  } = useBlockchainData();

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchBlockchainData();
      setLastUpdate(new Date());
    }, 15000); // Refresh every 15 seconds for balance updates

    return () => clearInterval(interval);
  }, [autoRefresh, refetchBlockchainData]);

  // Track balance changes
  useEffect(() => {
    if (tokenBalance !== previousBalance) {
      setPreviousBalance(tokenBalance);
    }
  }, [tokenBalance, previousBalance]);

  const handleBuyTokens = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error('Please enter a valid ETH amount');
      return;
    }

    try {
      console.log('=== BUY TOKENS DEBUG ===');
      console.log('ETH Amount:', ethAmount);
      console.log('User Address:', address);
      console.log('Token Contract Address:', ANX_TOKEN_ADDRESS);
      console.log('Marketplace Address:', MARKETPLACE_ADDRESS);
      
      await buyTokens(ethAmount);
      toast.success('Tokens purchased successfully!');
      setShowBuyModal(false);
      // Refresh blockchain data after purchase
      refetchBlockchainData();
    } catch (error: any) {
      console.error('Buy tokens error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to buy tokens';
      
      if (error.message.includes('Token contract address not configured')) {
        errorMessage = 'Token contract not configured. Please check deployment.';
      } else if (error.message.includes('Token contract not deployed')) {
        errorMessage = 'Token contract not deployed. Please deploy the contract first.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH balance for transaction';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled';
      } else if (error.message.includes('nonce too low')) {
        errorMessage = 'Transaction error. Please try again.';
      } else if (error.message.includes('gas required exceeds allowance')) {
        errorMessage = 'Insufficient gas for transaction';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Transaction failed. Please check your input.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleApprove = async () => {
    try {
      await approveToken(MARKETPLACE_ADDRESS, '1000000'); // Approve 1M tokens
      toast.success('Token approval successful!');
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(error.message || 'Failed to approve tokens');
    }
  };

  const handleDisconnect = () => {
    try {
      disconnectWallet();
      setShowDropdown(false);
      toast.success('Wallet disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleManualRefresh = async () => {
    await refetchBlockchainData();
    setLastUpdate(new Date());
  };

  if (!isConnected) {
    return null;
  }

  const currentBalance = parseFloat(tokenBalance || '0');
  const prevBalance = parseFloat(previousBalance || '0');
  const balanceChange = currentBalance - prevBalance;
  const balanceChangePercent = prevBalance > 0 ? (balanceChange / prevBalance) * 100 : 0;

  return (
    <div className="relative">
      {/* User Dropdown Trigger */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <span>{currentBalance.toFixed(2)} ANX</span>
              {balanceChange !== 0 && (
                <span className={`flex items-center text-xs ${
                  balanceChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {balanceChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(balanceChange).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            {/* Real-time status */}
            <div className="flex items-center justify-between mb-4 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live balance</span>
              </div>
              <span>{lastUpdate.toLocaleTimeString()}</span>
            </div>

            {/* Token Balance Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Token Balance</h4>
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-blue-600" />
                  <button
                    onClick={handleManualRefresh}
                    disabled={blockchainLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    title="Refresh balance"
                  >
                    <RefreshCw className={`h-3 w-3 ${blockchainLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">
                  {currentBalance.toFixed(2)} ANX
                </div>
                <div className="text-sm text-blue-600">
                  Available for purchases
                </div>
                {balanceChange !== 0 && (
                  <div className={`text-xs mt-1 flex items-center space-x-1 ${
                    balanceChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {balanceChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>
                      {balanceChange > 0 ? '+' : ''}{balanceChange.toFixed(2)} ANX 
                      ({balanceChangePercent > 0 ? '+' : ''}{balanceChangePercent.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain Transaction Summary */}
            {blockchainStats && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <h5 className="font-medium text-gray-900 text-sm">Recent Activity</h5>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Purchases:</span>
                    <span className="font-medium ml-1">{blockchainStats.totalPurchases}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sales:</span>
                    <span className="font-medium ml-1">{blockchainStats.totalSales}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">ETH Spent:</span>
                    <span className="font-medium ml-1">{(blockchainStats.totalETHSpent || 0).toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">ETH Received:</span>
                    <span className="font-medium ml-1">{(blockchainStats.totalETHReceived || 0).toFixed(4)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Marketplace Approval</span>
                {isApproved ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs">Approved</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs">Not Approved</span>
                  </div>
                )}
              </div>
              
              {!isApproved && (
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full mt-2 bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded text-sm text-orange-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Approving...' : 'Approve Tokens'}
                </button>
              )}
            </div>

            {/* Buy Tokens Section */}
            <div className="mb-4">
              <button
                onClick={() => setShowBuyModal(true)}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-green-100 hover:bg-green-200 px-3 py-2 rounded text-sm text-green-800 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Buy ANX Tokens</span>
              </button>
            </div>

            {/* Auto-refresh toggle */}
            <div className="mb-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 hover:bg-green-200 text-green-800' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={handleDisconnect}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Tokens Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 min-h-screen overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto transform transition-all my-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Buy AINexus Tokens</h3>
              <p className="text-sm text-gray-600">
                1 ETH = 1000 ANX tokens
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ETH Amount
              </label>
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.01"
              />
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700">
                You will receive: <span className="font-bold text-blue-800 text-lg">{(parseFloat(ethAmount) * 1000).toFixed(0)} ANX</span>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBuyTokens}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Buy Tokens'}
              </button>
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
} 