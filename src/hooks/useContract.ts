import { useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ABI, CONTRACT_ADDRESSES, ANX_TOKEN_ADDRESS } from '../config/contracts';
import { ANX_TOKEN_ABI } from '../config/tokenABI';
import { useChains } from 'wagmi';
import { purchaseAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

export function useContract() {
  const availableChains = useChains();
  const { showNotification } = useNotification();
  const { address } = useAccount();
  
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

  const contractAddress = getContractAddress();

  // Read contract data
  const { data: models, refetch: refetchModels } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getModels',
  });

  // Get total models count
  const { data: totalModels } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getTotalModels',
  });

  // Get contract balance
  const { data: contractBalance } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getContractBalance',
  });

  // Get platform fee percentage
  const { data: platformFeePercentage } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'platformFeePercentage',
  });

  // Debug log for raw contract models
  console.log('Raw contract models:', models);

  // Write contract functions
  const { writeContract, isPending: isWriting } = useWriteContract();

  // Function to log all purchased models for debugging
  const logAllPurchasedModels = async () => {
    console.log('=== LOGGING ALL PURCHASED MODELS ===');
    
    try {
      // Get user's purchase history
      if (address) {
        const userPurchases = await purchaseAPI.getUserPurchaseHistory(address);
        console.log('Database purchases for user:', userPurchases);
        
        // Get all purchases for analytics
        const allPurchases = await purchaseAPI.getAllPurchases({
          transactionType: 'contract_model_purchase'
        });
        console.log('All contract model purchases:', allPurchases);
        
        // Get all blockchain models
        if (models && Array.isArray(models)) {
          console.log('All blockchain models:', models);
          
          for (const model of models) {
            if (model && model.id) {
              console.log(`Model ${model.id} (${model.name}) - Available for purchase`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error logging purchased models:', error);
    }
  };

  // List new model function
  const listNewModel = async (
    name: string,
    modelType: string,
    description: string,
    priceInEth: string
  ) => {
    try {
      const priceInWei = parseEther(priceInEth);
      showNotification({
        type: 'pending',
        title: 'Listing Model',
        message: 'Creating your model listing...',
        autoClose: false
      });
      
      const result = await writeContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'listModel',
        args: [name, modelType, description, priceInWei],
      });
      
      showNotification({
        type: 'success',
        title: 'Model Listed Successfully!',
        message: 'Your model has been listed on the marketplace.',
        autoClose: true
      });
      
      return result;
    } catch (error: any) {
      console.error('Error listing model:', error);
      showNotification({
        type: 'error',
        title: 'Listing Failed',
        message: error.message || 'Failed to list model. Please try again.'
      });
      throw error;
    }
  };

  // Token-based purchase function
  const purchaseModelWithToken = async (modelId: number) => {
    console.log('=== BLOCKCHAIN MODEL PURCHASE DEBUG ===');
    console.log('Attempting to purchase blockchain model with ID:', modelId);
    console.log('Contract address:', contractAddress);
    console.log('Model ID type:', typeof modelId, 'Value:', modelId);
    console.log('User address:', address);
    
    if (!address) {
      console.error('No user address available');
      showNotification({
        type: 'error',
        title: 'Purchase Failed',
        message: 'Please connect your wallet first.'
      });
      return;
    }
    
    // Log all purchased models before attempting purchase
    await logAllPurchasedModels();
    
    try {
      showNotification({
        type: 'pending',
        title: 'Processing Token Purchase',
        message: 'Initiating your token-based purchase...',
        autoClose: false
      });
      
      const result = await writeContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'buyModelWithToken',
        args: [BigInt(modelId)],
      });
      
      console.log('Purchase transaction result:', result);
      
      showNotification({
        type: 'success',
        title: 'Token Purchase Successful!',
        message: 'Your model has been purchased with tokens successfully.',
        autoClose: true
      });
      
      // Log all purchased models after successful purchase
      await logAllPurchasedModels();
      
      return result;
    } catch (error: any) {
      console.error('=== BLOCKCHAIN MODEL PURCHASE ERROR ===');
      console.error('Error purchasing model with tokens:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error data:', error.data);
      console.error('Error reason:', error.reason);
      console.error('Full error object:', error);
      
      // Handle specific contract errors
      let errorMessage = 'Failed to purchase model with tokens.';
      if (error.message?.includes('Payment token not set')) {
        errorMessage = 'Payment token is not configured. Please contact the contract owner.';
      } else if (error.message?.includes('Insufficient allowance')) {
        errorMessage = 'Insufficient token allowance. Please approve more tokens.';
      } else if (error.message?.includes('Insufficient token balance')) {
        errorMessage = 'Insufficient token balance. Please buy more tokens.';
      } else if (error.message?.includes('Already purchased')) {
        errorMessage = 'You have already purchased this model.';
      } else if (error.message?.includes('Cannot buy your own model')) {
        errorMessage = 'You cannot buy your own model.';
      } else if (error.message?.includes('Model is not active')) {
        errorMessage = 'This model is not available for purchase.';
      } else if (error.message?.includes('Model does not exist')) {
        errorMessage = 'This model does not exist.';
      } else if (error.message?.includes('Invalid model ID')) {
        errorMessage = 'Invalid model ID.';
      } else if (error.message?.includes('execution reverted')) {
        errorMessage = 'Transaction reverted. Check console for detailed error information.';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees.';
      }
      
      showNotification({
        type: 'error',
        title: 'Token Purchase Failed',
        message: errorMessage
      });
      throw error;
    }
  };

  // Token-based database model purchase
  const purchaseDatabaseModelWithToken = async (
    modelId: string,
    sellerAddress: string,
    priceInTokens: string,
    contractModelId: number = 0
  ) => {
    try {
      const priceInWei = parseEther(priceInTokens);
      
      // Ensure contractModelId is a valid number
      const validContractModelId = typeof contractModelId === 'number' ? contractModelId : 0;
      
      console.log('=== DATABASE MODEL PURCHASE DEBUG ===');
      console.log('Model ID:', modelId);
      console.log('Seller Address:', sellerAddress);
      console.log('Price in Tokens:', priceInTokens);
      console.log('Contract Model ID:', validContractModelId);
      
      showNotification({
        type: 'pending',
        title: 'Processing Token Database Purchase',
        message: 'Initiating your token-based database purchase...',
        autoClose: false
      });
      
      const result = await writeContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'buyDatabaseModelWithToken',
        args: [modelId, sellerAddress as `0x${string}`, priceInWei, BigInt(validContractModelId)],
      });
      
      console.log('Database purchase transaction result:', result);
      
      showNotification({
        type: 'success',
        title: 'Token Database Purchase Successful!',
        message: 'Your database model has been purchased with tokens successfully.',
        autoClose: true
      });
      
      return result;
    } catch (error: any) {
      console.error('=== DATABASE MODEL PURCHASE ERROR ===');
      console.error('Error purchasing database model with tokens:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error data:', error.data);
      console.error('Error reason:', error.reason);
      
      // Handle specific contract errors
      let errorMessage = 'Failed to purchase database model with tokens.';
      if (error.message.includes('Payment token not set')) {
        errorMessage = 'Payment token is not configured. Please contact the contract owner.';
      } else if (error.message.includes('Insufficient allowance')) {
        errorMessage = 'Insufficient token allowance. Please approve more tokens.';
      } else if (error.message.includes('Insufficient token balance')) {
        errorMessage = 'Insufficient token balance. Please buy more tokens.';
      } else if (error.message.includes('Already purchased')) {
        errorMessage = 'You have already purchased this model.';
      } else if (error.message.includes('Cannot buy your own model')) {
        errorMessage = 'You cannot buy your own model.';
      } else if (error.message.includes('Model ID cannot be empty')) {
        errorMessage = 'Model ID is required.';
      } else if (error.message.includes('Invalid seller address')) {
        errorMessage = 'Invalid seller address.';
      } else if (error.message.includes('Price must be greater than 0')) {
        errorMessage = 'Price must be greater than 0.';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Transaction reverted. Check console for detailed error information.';
      }
      
      showNotification({
        type: 'error',
        title: 'Token Database Purchase Failed',
        message: errorMessage
      });
      throw error;
    }
  };

  const updatePurchaseTransactionHash = async (
    modelId: string,
    purchaseIndex: number,
    txHash: string
  ) => {
    try {
      // Ensure purchaseIndex is a valid number
      const validPurchaseIndex = typeof purchaseIndex === 'number' ? purchaseIndex : 0;
      
      console.log('=== UPDATE TRANSACTION HASH DEBUG ===');
      console.log('Model ID:', modelId);
      console.log('Purchase Index:', validPurchaseIndex);
      console.log('Transaction Hash:', txHash);
      
      const result = await writeContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'updatePurchaseTxHash',
        args: [modelId, BigInt(validPurchaseIndex), txHash],
    });

      console.log('Update transaction hash result:', result);

      showNotification({
        type: 'success',
        title: 'Transaction Hash Updated',
        message: 'The transaction hash has been updated successfully.',
        autoClose: true
      });
      
      return result;
    } catch (error: any) {
      console.error('Error updating transaction hash:', error);
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update transaction hash.'
      });
      throw error;
    }
  };

  // Log purchase to backend after successful transaction
  const logPurchaseToBackend = async (purchaseData: {
    modelId: string;
    contractModelId: number;
    walletAddress: string;
    sellerAddress: string;
    txHash: string;
    priceInETH: string;
    priceInUSD?: number;
    blockNumber?: number;
    gasUsed?: string;
    gasPrice?: string;
    network?: string;
    transactionType: 'database_model_purchase' | 'contract_model_purchase';
  }) => {
    try {
      console.log('Logging purchase to backend:', purchaseData);
      await purchaseAPI.createPurchase(purchaseData);
      toast.success('Purchase logged successfully!');
    } catch (error: any) {
      console.error('Failed to log purchase:', error);
      showNotification({
        type: 'warning',
        title: 'Backend Logging Failed',
        message: 'Purchase was successful but failed to log to backend. Please contact support.'
      });
    }
  };

  const formatModels = (rawModels: any) => {
    if (!rawModels || !Array.isArray(rawModels) || rawModels.length === 0) return [];
    
    return rawModels.map((model: any) => ({
      id: Number(model.id),
      _id: model.id.toString(),
      name: model.name,
      modelType: model.modelType,
      type: model.modelType,
      category: model.modelType,
      description: model.description,
      price: formatEther(model.price),
      seller: model.seller,
      sellerAddress: model.seller,
      sold: model.sold,
      active: model.active,
      createdAt: Number(model.createdAt),
      totalSales: Number(model.totalSales),
      downloads: Number(model.totalSales),
      rating: 4.5,
      author: model.seller,
      contractModelId: Number(model.id),
    }));
  };

  return {
    // Contract data
    models: formatModels(models),
    refetchModels,
    
    // Contract statistics
    totalModels: totalModels ? Number(totalModels) : 0,
    contractBalance: contractBalance ? formatEther(contractBalance) : '0',
    platformFeePercentage: platformFeePercentage ? Number(platformFeePercentage) / 100 : 2.5, // Convert from basis points to percentage
    
    // Write functions
    listNewModel,
    purchaseModelWithToken,
    purchaseDatabaseModelWithToken,
    updatePurchaseTransactionHash,
    logPurchaseToBackend,
    
    // Loading states
    isListingModel: isWriting,
    isBuyingModelWithToken: isWriting,
    isBuyingDatabaseModelWithToken: isWriting,
    isUpdatingTxHash: isWriting,
  };
}