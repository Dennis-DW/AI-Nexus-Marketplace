import { useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ABI, CONTRACT_ADDRESSES } from '../config/contracts';
import { useChains } from 'wagmi';
import { purchaseAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import toast from 'react-hot-toast';

export function useContract() {
  const availableChains = useChains();
  const { showNotification } = useNotification();
  
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

  // Debug log for raw contract models
  console.log('Raw contract models:', models);

  // Write contract functions
  const { writeContract, isPending: isWriting } = useWriteContract();

  // Helper functions for contract interactions
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
      const result: any = await writeContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'listModel',
        args: [name, modelType, description, priceInWei],
      });
      // Wait for transaction confirmation
      if (result && result.hash) {
        showNotification({
          type: 'pending',
          title: 'Transaction Pending',
          message: 'Waiting for transaction confirmation...',
          autoClose: false
        });
        // Wait for the transaction to be mined
        await result.wait();
      }
      showNotification({
        type: 'success',
        title: 'Model Listed Successfully!',
        message: 'Your model has been successfully listed on the marketplace.',
        autoClose: true
      });
      // Refresh models list
      await refetchModels();
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
      showNotification({
        type: 'success',
        title: 'Token Purchase Successful!',
        message: 'Your model has been purchased with tokens successfully.',
        autoClose: true
      });
      return result;
    } catch (error: any) {
      console.error('Error purchasing model with tokens:', error);
      showNotification({
        type: 'error',
        title: 'Token Purchase Failed',
        message: error.message || 'Failed to purchase model with tokens. Please check your token balance and approval.'
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
        args: [modelId, sellerAddress as `0x${string}`, priceInWei, BigInt(contractModelId)],
      });
      showNotification({
        type: 'success',
        title: 'Token Database Purchase Successful!',
        message: 'Your database model has been purchased with tokens successfully.',
        autoClose: true
      });
      return result;
    } catch (error: any) {
      console.error('Error purchasing database model with tokens:', error);
      showNotification({
        type: 'error',
        title: 'Token Database Purchase Failed',
        message: error.message || 'Failed to purchase database model with tokens. Please check your token balance and approval.'
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
      const result = await writeContract({
        address: contractAddress,
        abi: ABI,
        functionName: 'updatePurchaseTxHash',
      args: [modelId, BigInt(purchaseIndex), txHash],
    });

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
      name: model.name,
      modelType: model.modelType,
      description: model.description,
      price: formatEther(model.price),
      seller: model.seller,
      sellerAddress: model.seller,
      sold: model.sold,
      active: model.active,
      createdAt: Number(model.createdAt),
      totalSales: Number(model.totalSales),
    }));
  };

  return {
    // Contract data
    models: formatModels(models),
    refetchModels,
    
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