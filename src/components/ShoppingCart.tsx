import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ShoppingCart as IconShoppingCart, Trash2, Plus, Minus, ExternalLink, User, Tag, ArrowLeft, Package, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { purchaseAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useToken } from '../contexts/TokenContext';

interface CartItem {
  id: string;
  name: string;
  type: string;
  price: string;
  image?: string;
  seller: string;
  contractModelId?: number;
  isContractModel: boolean;
}

export default function ShoppingCart() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { address } = useAccount();
  const { purchaseModel, isBuyingModel, purchaseModelWithToken, purchaseDatabaseModelWithToken } = useContract();
  const { 
    state: { items, isCartOpen },
    setIsCartOpen,
    removeFromCart, 
    clearCart,
    getTotalPrice,
    getContractModelsCount,
    getDatabaseModelsCount
  } = useCart();
  const { tokenBalance, isApproved } = useToken();

  const totalPrice = getTotalPrice();
  const contractModels = items.filter(item => item.isContractModel);
  const databaseModels = items.filter(item => !item.isContractModel);

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handlePurchaseAll = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check if user has sufficient token balance
    const totalPriceInTokens = totalPrice * 1000; // Convert ETH price to tokens
    if (parseFloat(tokenBalance) < totalPriceInTokens) {
      toast.error(`Insufficient token balance. You need ${totalPriceInTokens.toFixed(2)} ANX tokens.`);
      return;
    }

    // Check if tokens are approved for spending
    if (!isApproved) {
      toast.error('Please approve token spending first');
      return;
    }

    setIsProcessing(true);

    try {
      for (const item of items) {
        const priceInTokens = parseFloat(item.price) * 1000; // Convert ETH price to tokens
        
        if (item.isContractModel && item.contractModelId) {
          // Purchase from smart contract with tokens
          await purchaseModelWithToken(Number(item.contractModelId));
          
          // Log purchase in backend
          await purchaseAPI.logTokenPurchase({
            modelId: item.id,
            contractModelId: Number(item.contractModelId) || 0,
            walletAddress: address,
            sellerAddress: item.seller,
            txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`,
            priceInTokens: priceInTokens.toString(),
            network: 'localhost',
            transactionType: 'contract_model_purchase',
            tokenContractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
            tokenSymbol: 'ANX',
            tokenDecimals: 18
          });
        } else {
          // Purchase database model with tokens
          await purchaseDatabaseModelWithToken(
            item.id,
            item.seller,
            priceInTokens.toString(),
            Number(item.contractModelId) || 0
          );
          
          await purchaseAPI.logTokenPurchase({
            modelId: item.id,
            contractModelId: Number(item.contractModelId) || 0,
            walletAddress: address,
            sellerAddress: item.seller,
            txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`,
            priceInTokens: priceInTokens.toString(),
            network: 'localhost',
            transactionType: 'database_model_purchase',
            tokenContractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
            tokenSymbol: 'ANX',
            tokenDecimals: 18
          });
        }
      }

      toast.success('All items purchased successfully with tokens!');
      clearCart();
      handleClose();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to complete purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchaseItem = async (item: CartItem) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check if user has sufficient token balance
    const priceInTokens = parseFloat(item.price) * 1000; // Convert ETH price to tokens
    if (parseFloat(tokenBalance) < priceInTokens) {
      toast.error(`Insufficient token balance. You need ${priceInTokens.toFixed(2)} ANX tokens.`);
      return;
    }

    // Check if tokens are approved for spending
    if (!isApproved) {
      toast.error('Please approve token spending first');
      return;
    }

    setIsProcessing(true);

    try {
      if (item.isContractModel && item.contractModelId) {
        await purchaseModelWithToken(Number(item.contractModelId));
        
        await purchaseAPI.logTokenPurchase({
          modelId: item.id,
          contractModelId: Number(item.contractModelId) || 0,
          walletAddress: address,
          sellerAddress: item.seller,
          txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`,
          priceInTokens: priceInTokens.toString(),
          network: 'localhost',
          transactionType: 'contract_model_purchase',
          tokenContractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
          tokenSymbol: 'ANX',
          tokenDecimals: 18
        });
      } else {
        // Purchase database model with tokens
        const priceInTokens = parseFloat(item.price) * 1000;
        await purchaseDatabaseModelWithToken(
          item.id,
          item.seller,
          priceInTokens.toString(),
          Number(item.contractModelId) || 0
        );
        
        await purchaseAPI.logTokenPurchase({
          modelId: item.id,
          contractModelId: Number(item.contractModelId) || 0,
          walletAddress: address,
          sellerAddress: item.seller,
          txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`,
          priceInTokens: priceInTokens.toString(),
          network: 'localhost',
          transactionType: 'database_model_purchase',
          tokenContractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
          tokenSymbol: 'ANX',
          tokenDecimals: 18
        });
      }

      removeFromCart(item.id);
      toast.success(`Successfully purchased ${item.name} with tokens!`);
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to purchase item');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getModelTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'NLP': 'bg-blue-100 text-blue-800',
      'Computer Vision': 'bg-green-100 text-green-800',
      'Audio': 'bg-purple-100 text-purple-800',
      'Generative': 'bg-pink-100 text-pink-800',
      'Prediction': 'bg-orange-100 text-orange-800',
      'AI Model': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Transition appear show={isCartOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconShoppingCart className="h-5 w-5 text-blue-600" />
                    <span>Shopping Cart ({items.length} items)</span>
                    {items.length > 0 && (
                      <span className="text-sm text-gray-500">
                        • {contractModels.length} Blockchain • {databaseModels.length} Database
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <IconShoppingCart className="h-20 w-20 text-gray-300 mx-auto" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 mb-6">Discover amazing AI models and add them to your cart</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        to="/marketplace"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Browse Marketplace
                      </Link>
                      <button
                        onClick={handleClose}
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                          <div className="relative">
                            <img
                              src={item.image || 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100'}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg shadow-sm"
                            />
                            {item.isContractModel && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">⚡</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModelTypeColor(item.type)}`}>
                                    {item.type}
                                  </span>
                                  {item.isContractModel && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Blockchain
                                    </span>
                                  )}
                                  {!item.isContractModel && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                                      <Package className="h-3 w-3 mr-1" />
                                      Database
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900 text-lg">{item.price} ETH</div>
                                <div className="text-sm text-blue-600 font-medium">
                                  ≈ {(parseFloat(item.price) * 1000).toFixed(2)} ANX
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.isContractModel ? 'Smart Contract' : 'Database Model'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>Seller: {formatAddress(item.seller)}</span>
                              </div>
                              {item.contractModelId && (
                                <div className="flex items-center space-x-1">
                                  <Tag className="h-4 w-4" />
                                  <span>ID: {item.contractModelId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handlePurchaseItem(item)}
                              disabled={isProcessing || isBuyingModel}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                              {isProcessing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-1" />
                                  Buy Now
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-semibold text-gray-900">
                          <div>Total ({items.length} items): {totalPrice.toFixed(4)} ETH</div>
                          <div className="text-sm text-blue-600 font-medium">
                            ≈ {(totalPrice * 1000).toFixed(2)} ANX tokens
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={clearCart}
                            className="text-gray-500 hover:text-gray-700 text-sm flex items-center space-x-1 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Clear Cart</span>
                          </button>
                          <button
                            onClick={handlePurchaseAll}
                            disabled={isProcessing || isBuyingModel || items.length === 0}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Purchase All ({(totalPrice * 1000).toFixed(2)} ANX)
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Cart Stats */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{contractModels.length}</div>
                          <div className="text-xs">Blockchain Models</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{databaseModels.length}</div>
                          <div className="text-xs">Database Models</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{items.length}</div>
                          <div className="text-xs">Total Items</div>
                        </div>
                      </div>
                      
                      {/* Continue Shopping */}
                      <div className="mt-4 text-center">
                        <Link
                          to="/marketplace"
                          onClick={handleClose}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 