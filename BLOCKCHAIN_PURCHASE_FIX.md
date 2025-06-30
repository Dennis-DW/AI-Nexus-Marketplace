# Blockchain Purchase Issues - Fix Guide

## Problem Description
When buying blockchain models, transactions appear successful but fail to complete properly. No tokens are deducted and the transaction is not properly recorded on-chain.

## Root Causes Identified

### 1. Payment Token Not Set
The main issue is that the marketplace contract requires a payment token to be set before token-based purchases can work. The contract has a `paymentToken` variable that must be initialized.

**Error**: `"Payment token not set"`

### 2. Transaction Flow Issues
The frontend was not properly handling transaction confirmation and error states from the smart contract.

### 3. Missing Error Handling
Generic error messages made it difficult to diagnose specific issues.

## Solutions Implemented

### 1. Set Payment Token Script
Created `scripts/set-payment-token.js` to configure the payment token in the marketplace contract.

**Usage**:
```bash
npx hardhat run scripts/set-payment-token.js --network localhost
```

### 2. Enhanced Error Handling
Updated the purchase functions in `src/hooks/useContract.ts` to provide specific error messages for different failure scenarios:

- Payment token not set
- Insufficient allowance
- Insufficient token balance
- Already purchased
- Cannot buy own model
- Model not active
- Model does not exist
- Invalid model ID

### 3. Improved Transaction Flow
- Removed incorrect transaction waiting logic that was incompatible with wagmi
- Added proper error handling and user feedback
- Enhanced backend logging after successful transactions

### 4. Contract Utility Functions
Added utility functions in `src/utils/contractUtils.ts`:
- `isPaymentTokenSet()` - Check if payment token is configured
- `getPaymentTokenAddress()` - Get the configured payment token address

## Step-by-Step Fix Process

### Step 1: Deploy Contracts (if not already done)
```bash
npx hardhat run scripts/deploy-token-marketplace.js --network localhost
```

### Step 2: Set Payment Token
```bash
npx hardhat run scripts/set-payment-token.js --network localhost
```

### Step 3: Verify Configuration
Check that the payment token is properly set:
```javascript
// In browser console or contract interaction
const marketplace = await ethers.getContractAt("AINexusMarketplace", MARKETPLACE_ADDRESS);
const paymentToken = await marketplace.paymentToken();
console.log("Payment token:", paymentToken);
```

### Step 4: Test Token Purchase
1. Buy tokens using the token contract
2. Approve tokens for marketplace spending
3. Attempt to purchase a model

## Contract Requirements

### For Token Purchases to Work:
1. **Payment Token Set**: `marketplace.paymentToken()` must return a valid token address
2. **Token Balance**: User must have sufficient tokens
3. **Token Allowance**: User must approve marketplace to spend tokens
4. **Model Active**: Model must be active and not already purchased
5. **Valid Model**: Model must exist and be valid

### Smart Contract Functions:
- `buyModelWithToken(uint256 _modelId)` - Purchase contract models with tokens
- `buyDatabaseModelWithToken(string _modelId, address _seller, uint256 _price, uint256 _contractModelId)` - Purchase database models with tokens

## Testing the Fix

### 1. Check Payment Token Status
```javascript
// In browser console
const { isPaymentTokenSet } = await import('./src/utils/contractUtils.ts');
const isSet = await isPaymentTokenSet(publicClient);
console.log("Payment token set:", isSet);
```

### 2. Test Purchase Flow
1. Connect wallet
2. Buy tokens (if needed)
3. Approve tokens for marketplace
4. Attempt to purchase a model
5. Check transaction status and token balance

### 3. Verify Transaction
- Check blockchain explorer for transaction
- Verify token balance reduction
- Confirm purchase record in contract

## Common Issues and Solutions

### Issue: "Payment token not set"
**Solution**: Run the set-payment-token script

### Issue: "Insufficient allowance"
**Solution**: Approve more tokens for marketplace spending

### Issue: "Insufficient token balance"
**Solution**: Buy more tokens using the token contract

### Issue: "Already purchased"
**Solution**: Check if user has already purchased this model

### Issue: "Cannot buy your own model"
**Solution**: User cannot purchase their own listed models

## Monitoring and Debugging

### Frontend Debugging
- Check browser console for detailed error messages
- Use React DevTools to inspect component state
- Monitor network requests for API calls

### Contract Debugging
- Use Hardhat console to interact with contracts
- Check contract events for purchase confirmations
- Verify contract state variables

### Backend Debugging
- Check server logs for purchase API calls
- Verify database records are created
- Monitor transaction status updates

## Prevention Measures

1. **Pre-flight Checks**: Always verify payment token is set before allowing purchases
2. **User Feedback**: Provide clear error messages for different failure scenarios
3. **Transaction Monitoring**: Track transaction status and provide updates
4. **Fallback Mechanisms**: Handle partial failures gracefully
5. **Testing**: Regular testing of purchase flows with different scenarios

## Future Improvements

1. **Automatic Payment Token Setup**: Include payment token setup in deployment script
2. **Transaction Status Tracking**: Real-time transaction status updates
3. **Retry Mechanisms**: Automatic retry for failed transactions
4. **Better Error Recovery**: Graceful handling of network issues
5. **User Education**: Better onboarding for token purchases 