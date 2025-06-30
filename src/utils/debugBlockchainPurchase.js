// Debug utility for blockchain model purchases
export const debugBlockchainPurchase = {
  // Log all models and their purchase status
  logAllModels: async (models, userAddress) => {
    console.log('=== ALL MODELS DEBUG ===');
    console.log('Total models:', models?.length || 0);
    console.log('User address:', userAddress);
    
    if (models && Array.isArray(models)) {
      models.forEach((model, index) => {
        console.log(`Model ${index + 1}:`, {
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
      });
    }
  },

  // Check specific model purchase requirements
  checkModelPurchaseRequirements: async (model, userAddress, tokenBalance, tokenAllowance) => {
    console.log('=== MODEL PURCHASE REQUIREMENTS CHECK ===');
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
      address: userAddress,
      tokenBalance: tokenBalance,
      tokenAllowance: tokenAllowance
    });

    const requirements = {
      isContractModel: !!model.contractModelId,
      hasValidModelId: !!(model.contractModelId || model._id),
      hasValidSellerAddress: !!(model.sellerAddress || model.seller),
      isNotOwnModel: userAddress?.toLowerCase() !== (model.sellerAddress || model.seller)?.toLowerCase(),
      hasSufficientBalance: parseFloat(tokenBalance || '0') >= parseFloat(model.price.replace(' ETH', '')) * 1000,
      hasSufficientAllowance: parseFloat(tokenAllowance || '0') >= parseFloat(model.price.replace(' ETH', '')) * 1000,
      modelIsActive: model.active !== false,
      modelNotSold: model.sold !== true
    };

    console.log('Requirements check:', requirements);

    const failedRequirements = Object.entries(requirements)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (failedRequirements.length > 0) {
      console.error('Failed requirements:', failedRequirements);
      return false;
    }

    console.log('All requirements met!');
    return true;
  },

  // Compare blockchain vs database model differences
  compareModelTypes: () => {
    console.log('=== BLOCKCHAIN VS DATABASE MODEL COMPARISON ===');
    
    console.log('Blockchain Models (stored in smart contract):');
    console.log('- Require model to be listed in smart contract');
    console.log('- Require model to be active in contract');
    console.log('- Require payment token to be set in contract');
    console.log('- Require user to have sufficient token balance');
    console.log('- Require user to have sufficient token allowance');
    console.log('- Prevent double purchases via contract mapping');
    console.log('- Require user to not be the model seller');
    console.log('- Use buyModelWithToken() function');
    
    console.log('\nDatabase Models (stored in database):');
    console.log('- Require model to exist in database');
    console.log('- Require valid seller address');
    console.log('- Require user to have sufficient token balance');
    console.log('- Require user to have sufficient token allowance');
    console.log('- Prevent double purchases via contract mapping');
    console.log('- Require user to not be the model seller');
    console.log('- Use buyDatabaseModelWithToken() function');
    
    console.log('\nCommon failure points for blockchain models:');
    console.log('1. Model not listed in smart contract');
    console.log('2. Payment token not set in contract');
    console.log('3. Model not active in contract');
    console.log('4. Insufficient token balance/allowance');
    console.log('5. User already purchased the model');
    console.log('6. User is the model seller');
    console.log('7. Invalid model ID format');
  },

  // Log contract state
  logContractState: async (contractAddress, models, totalModels, platformFeePercentage) => {
    console.log('=== CONTRACT STATE DEBUG ===');
    console.log('Contract address:', contractAddress);
    console.log('Total models in contract:', totalModels);
    console.log('Platform fee percentage:', platformFeePercentage);
    console.log('Models array:', models);
    
    if (models && Array.isArray(models)) {
      console.log('Contract models details:');
      models.forEach((model, index) => {
        if (model && model.id) {
          console.log(`Contract Model ${model.id}:`, {
            name: model.name,
            modelType: model.modelType,
            price: model.price?.toString(),
            seller: model.seller,
            active: model.active,
            sold: model.sold,
            totalSales: model.totalSales?.toString()
          });
        }
      });
    }
  }
};

export default debugBlockchainPurchase; 