import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useToken } from '../contexts/TokenContext';
import { Coins, Plus, CheckCircle, AlertCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { MARKETPLACE_ADDRESS } from '../config/contracts';

export default function TokenBalance() {
  const { address, isConnected } = useAccount();
  const { tokenBalance, isApproved, approveToken, buyTokens, loading, disconnectWallet } = useToken();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ethAmount, setEthAmount] = useState('0.01');

  const handleBuyTokens = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error('Please enter a valid ETH amount');
      return;
    }

    try {
      await buyTokens(ethAmount);
      toast.success('Tokens purchased successfully!');
      setShowBuyModal(false);
    } catch (error: any) {
      console.error('Buy tokens error:', error);
      toast.error(error.message || 'Failed to buy tokens');
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
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  if (!isConnected) {
    return null;
  }

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
            <div className="text-xs text-gray-500">
              {parseFloat(tokenBalance).toFixed(2)} ANX
            </div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            {/* Token Balance Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Token Balance</h4>
                <Coins className="h-4 w-4 text-blue-600" />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">
                  {parseFloat(tokenBalance).toFixed(2)} ANX
                </div>
                <div className="text-sm text-blue-600">
                  Available for purchases
                </div>
              </div>
            </div>

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