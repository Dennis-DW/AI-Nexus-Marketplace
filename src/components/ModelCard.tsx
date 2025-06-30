import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Download, Play, ShoppingCart, ExternalLink, Calendar, User, Heart } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { purchaseAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useToken } from '../contexts/TokenContext';
import toast from 'react-hot-toast';
import { parseEther } from 'viem';

interface Model {
  _id: string;
  id?: string;
  name: string;
  type: string;
  description: string;
  price: string;
  fileHash: string;
  sellerAddress?: string;
  seller?: string;
  contractModelId?: number;
  isActive?: boolean;
  active?: boolean;
  sold?: boolean;
  tags: string[];
  category: string;
  downloads: number;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
  modelType?: string;
  image?: string;
  totalSales?: number;
  author?: string;
}

interface ModelCardProps {
  model: Model;
  isContractModel?: boolean;
  displayMode?: 'grid' | 'list';
}

export default function ModelCard({ model, isContractModel = false, displayMode = 'grid' }: ModelCardProps) {
  const { address } = useAccount();
  const { purchaseModelWithToken, purchaseDatabaseModelWithToken, models: contractModels, totalModels, contractBalance, platformFeePercentage } = useContract();
  const { addToCart, isInCart, removeFromCart } = useCart();
  const { tokenBalance, buyTokens, approveToken, isApproved } = useToken();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debug function to help identify blockchain purchase issues
  const debugPurchase = () => {
    console.log('=== MODEL CARD DEBUG ===');
    console.log('Model:', {
      id: model.id,
      _id: model._id,
      name: model.name,
      contractModelId: model.contractModelId,
      isContractModel: !!model.contractModelId,
      price: model.price,
      seller: model.seller,
      sellerAddress: model.sellerAddress,
      active: model.active,
      sold: model.sold
    });
    
    console.log('User:', {
      address: address,
      tokenBalance: tokenBalance,
      isApproved: isApproved
    });
    
    console.log('Contract state:', {
      totalModels: totalModels,
      contractBalance: contractBalance,
      platformFeePercentage: platformFeePercentage,
      contractModelsCount: contractModels?.length || 0
    });
    
    console.log('Blockchain vs Database comparison:');
    console.log('Blockchain models require:');
    console.log('- Model to exist in smart contract');
    console.log('- Model to be active');
    console.log('- User to have sufficient token balance');
    console.log('- User to have sufficient token allowance');
    console.log('- User to not have already purchased the model');
    console.log('- User to not be the model seller');
    console.log('- Payment token to be set in contract');
    
    console.log('Database models require:');
    console.log('- Model to exist in database');
    console.log('- Valid seller address');
    console.log('- User to have sufficient token balance');
    console.log('- User to have sufficient token allowance');
    console.log('- User to not have already purchased the model');
    console.log('- User to not be the model seller');
    
    // Check if this model exists in contract
    if (model.contractModelId && contractModels) {
      const contractModel = contractModels.find(m => m.id === model.contractModelId);
      console.log('Contract model found:', contractModel);
    }
  };

  // Calculate price in tokens (convert ETH price to tokens)
  const priceInTokens = parseFloat(model.price) * 1000;

  const handleAddToCart = () => {
    // Check if user is trying to add their own model to cart
    const sellerAddress = model.seller || model.sellerAddress || '';
    if (address && address.toLowerCase() === sellerAddress.toLowerCase()) {
      toast.error('You cannot add your own model to cart');
      return;
    }

    const cartItem = {
      id: model._id || model.id?.toString() || '',
      name: model.name,
      type: model.category || model.modelType || model.type || 'AI Model',
      price: model.price.includes('ETH') ? model.price.replace(' ETH', '') : model.price,
      image: model.image || '',
      seller: model.seller || model.sellerAddress || '',
      contractModelId: model.contractModelId,
      isContractModel,
    };

    if (isInCart(cartItem.id)) {
      removeFromCart(cartItem.id);
      toast.success('Removed from cart', {
        icon: '🗑️',
        style: {
          borderRadius: '10px',
          background: '#fef2f2',
          color: '#dc2626',
        },
      });
    } else {
      addToCart(cartItem);
      toast.success('Added to cart!', {
        icon: '🛒',
        style: {
          borderRadius: '10px',
          background: '#f0f9ff',
          color: '#2563eb',
        },
      });
    }
  };

  const handleTokenPurchase = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!tokenBalance || parseFloat(tokenBalance) < parseFloat(model.price.replace(' ETH', '')) * 1000) {
      toast.error('Insufficient token balance');
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== MODEL CARD PURCHASE DEBUG ===');
      console.log('Model details:', model);
      console.log('Is contract model:', !!model.contractModelId);
      console.log('Contract model ID:', model.contractModelId);
      console.log('Model ID:', model._id);
      console.log('User address:', address);
      console.log('Token balance:', tokenBalance);
      console.log('Model price:', model.price);
      console.log('Price in tokens:', parseFloat(model.price.replace(' ETH', '')) * 1000);

      if (model.contractModelId) {
        console.log('Attempting blockchain model purchase...');
        // For contract models, use the blockchain purchase function
        await purchaseModelWithToken(model.contractModelId);
        
        console.log('Blockchain purchase completed');
        
        // Log the purchase to backend after successful blockchain transaction
        console.log('Logging blockchain purchase to backend...');
        await purchaseAPI.logTokenPurchase({
          modelId: model._id,
          contractModelId: Number(model.contractModelId) || 0,
          walletAddress: address,
          sellerAddress: model.sellerAddress || model.seller || '',
          txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`,
          priceInETH: model.price.replace(' ETH', ''),
          priceInTokens: (parseFloat(model.price.replace(' ETH', '')) * 1000).toString(),
          priceInUSD: parseFloat(model.price.replace(' ETH', '')) * 2000,
          network: 'localhost',
          transactionType: 'contract_model_purchase',
          tokenContractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
          tokenSymbol: 'ANX',
          tokenDecimals: 18,
          status: 'confirmed',
          isContractModel: true
        });
        console.log('Blockchain purchase logged to backend successfully');
      } else {
        console.log('Attempting database model purchase...');
        // Purchase database model with tokens
        await purchaseDatabaseModelWithToken(
          model._id,
          model.sellerAddress || model.seller || '',
          (parseFloat(model.price.replace(' ETH', '')) * 1000).toString(),
          model.contractModelId || 0
        );
        
        console.log('Database purchase completed');
        
        // Log the purchase to backend after successful blockchain transaction
        console.log('Logging database purchase to backend...');
        await purchaseAPI.logTokenPurchase({
          modelId: model._id,
          contractModelId: Number(model.contractModelId) || 0,
          walletAddress: address,
          sellerAddress: model.sellerAddress || model.seller || '',
          txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`,
          priceInETH: model.price.replace(' ETH', ''),
          priceInTokens: (parseFloat(model.price.replace(' ETH', '')) * 1000).toString(),
          priceInUSD: parseFloat(model.price.replace(' ETH', '')) * 2000,
          network: 'localhost',
          transactionType: 'database_model_purchase',
          tokenContractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
          tokenSymbol: 'ANX',
          tokenDecimals: 18,
          status: 'confirmed',
          isContractModel: false
        });
        console.log('Database purchase logged to backend successfully');
      }

      toast.success(`Successfully purchased ${model.name} with tokens!`);
    } catch (error: any) {
      console.error('=== MODEL CARD PURCHASE ERROR ===');
      console.error('Purchase error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error data:', error.data);
      console.error('Error reason:', error.reason);
      
      // Check if this is a blockchain model purchase error
      if (model.contractModelId) {
        console.error('This was a blockchain model purchase that failed');
        console.error('Model contract ID:', model.contractModelId);
        console.error('Model database ID:', model._id);
        
        // Log the difference between blockchain and database models
        console.log('=== BLOCKCHAIN VS DATABASE MODEL COMPARISON ===');
        console.log('Blockchain models require:');
        console.log('- Model to exist in smart contract');
        console.log('- Model to be active');
        console.log('- User to have sufficient token balance');
        console.log('- User to have sufficient token allowance');
        console.log('- User to not have already purchased the model');
        console.log('- User to not be the model seller');
        console.log('- Payment token to be set in contract');
        
        console.log('Database models require:');
        console.log('- Model to exist in database');
        console.log('- Valid seller address');
        console.log('- User to have sufficient token balance');
        console.log('- User to have sufficient token allowance');
        console.log('- User to not have already purchased the model');
        console.log('- User to not be the model seller');
      }
      
      toast.error(error.message || 'Failed to purchase item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = () => {
    toast.success(`Testing ${model.name}...`);
  };

  const displayPrice = model.price.includes('ETH') ? model.price : `${model.price} ETH`;
  const displayCategory = model.category || model.modelType || model.type || 'AI Model';
  const displayRating = model.rating || 4.5;
  const displayDownloads = model.downloads || model.totalSales || 0;
  const displayAuthor = model.author || model.seller || model.sellerAddress || 'Anonymous';
  const displayTags = model.tags || [];
  const itemId = model._id || model.id?.toString() || '';
  
  // Check if current user is the seller
  const sellerAddress = model.seller || model.sellerAddress || '';
  const isOwnModel = address && address.toLowerCase() === sellerAddress.toLowerCase();

  if (displayMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
      >
        <div className="flex items-center space-x-6">
          <img
            src={model.image || `https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=200`}
            alt={model.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{model.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-black mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{displayCategory}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{displayRating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{displayDownloads.toLocaleString()}</span>
                  </div>
                  {model.createdAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <p className="text-black text-sm mb-3 line-clamp-2">{model.description}</p>
                {displayTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {displayTags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-black px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-2">{displayPrice}</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleTest}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all duration-200"
                    title="Test Model"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  {isContractModel && (
                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all duration-200"
                      title="View on Blockchain"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={handleAddToCart}
                    className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                      isInCart(itemId)
                        ? 'bg-red-100 text-red-600 hover:bg-red-200 shadow-md'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm hover:shadow-md'
                    }`}
                    title={isInCart(itemId) ? 'Remove from Cart' : 'Add to Cart'}
                  >
                    <ShoppingCart className={`h-4 w-4 transition-transform duration-200 ${
                      isInCart(itemId) ? 'scale-110' : 'scale-100'
                    }`} />
                  </button>
                  <button
                    onClick={handleTokenPurchase}
                    disabled={isLoading || isOwnModel}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isOwnModel 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                    title={isOwnModel ? 'You cannot buy your own model' : 'Buy with tokens'}
                  >
                    {isLoading ? 'Buying...' : isOwnModel ? 'Your Model' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
    >
      <div className="relative mb-4">
        <img
          src={model.image || `https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400`}
          alt={model.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isContractModel 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isContractModel ? 'On-Chain' : 'Database'}
          </span>
        </div>
        <button className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors">
          <Heart className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.name}</h3>
        <div className="flex items-center space-x-4 text-black text-sm mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{displayCategory}</span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span>{displayRating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>{displayDownloads.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-black text-sm mb-4 line-clamp-2">{model.description}</p>

        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {displayTags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-black px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-black">
          <User className="h-4 w-4" />
          <span className="truncate max-w-24" title={displayAuthor}>
            {displayAuthor}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900">{displayPrice}</div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddToCart}
            className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              isInCart(itemId)
                ? 'bg-red-100 text-red-600 hover:bg-red-200 shadow-md'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm hover:shadow-md'
            }`}
            title={isInCart(itemId) ? 'Remove from Cart' : 'Add to Cart'}
          >
            <ShoppingCart className={`h-4 w-4 transition-transform duration-200 ${
              isInCart(itemId) ? 'scale-110' : 'scale-100'
            }`} />
          </button>
          <button
            onClick={handleTokenPurchase}
            disabled={isLoading || isOwnModel}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isOwnModel 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title={isOwnModel ? 'You cannot buy your own model' : 'Buy with tokens'}
          >
            {isLoading ? 'Buying...' : isOwnModel ? 'Your Model' : 'Buy Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}