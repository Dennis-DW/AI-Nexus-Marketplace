import { ethers } from 'ethers';

// AINexusToken ABI (complete version for testing)
const ANX_TOKEN_ABI = [
  { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "buyTokens", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "TOKENS_PER_ETH", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }
];

// Test token contract functionality
async function testTokenContract() {
  try {
    // Connect to localhost network
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Get the token address from the config
    const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log('🔍 Testing token contract at:', tokenAddress);
    
    // Check if contract has code first
    const code = await provider.getCode(tokenAddress);
    if (code === '0x') {
      console.log('❌ No contract code found at address:', tokenAddress);
      console.log('💡 The token contract may not be deployed. Please run the deployment script first.');
      return;
    } else {
      console.log('✅ Contract code found at address:', tokenAddress);
    }
    
    // Create contract instance
    const tokenContract = new ethers.Contract(tokenAddress, ANX_TOKEN_ABI, provider);
    
    // Test basic contract calls
    console.log('\n📊 Testing contract calls...');
    
    // Test name
    try {
      const name = await tokenContract.name();
      console.log('✅ Token name:', name);
    } catch (error) {
      console.log('❌ Name call failed:', error.message);
    }
    
    // Test symbol
    try {
      const symbol = await tokenContract.symbol();
      console.log('✅ Token symbol:', symbol);
    } catch (error) {
      console.log('❌ Symbol call failed:', error.message);
    }
    
    // Test decimals
    try {
      const decimals = await tokenContract.decimals();
      console.log('✅ Decimals:', decimals);
    } catch (error) {
      console.log('❌ Decimals call failed:', error.message);
    }
    
    // Test total supply
    try {
      const totalSupply = await tokenContract.totalSupply();
      console.log('✅ Total supply:', ethers.formatEther(totalSupply), 'ANX');
    } catch (error) {
      console.log('❌ Total supply call failed:', error.message);
    }
    
    // Test TOKENS_PER_ETH constant
    try {
      const tokensPerEth = await tokenContract.TOKENS_PER_ETH();
      console.log('✅ Tokens per ETH:', ethers.formatEther(tokensPerEth), 'ANX');
    } catch (error) {
      console.log('❌ TOKENS_PER_ETH call failed:', error.message);
    }
    
    // Test balanceOf with a test address
    const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    try {
      const balance = await tokenContract.balanceOf(testAddress);
      console.log('✅ Balance of test address:', ethers.formatEther(balance), 'ANX');
    } catch (error) {
      console.log('❌ BalanceOf call failed:', error.message);
    }
    
    // Test allowance
    try {
      const allowance = await tokenContract.allowance(testAddress, tokenAddress);
      console.log('✅ Allowance:', ethers.formatEther(allowance), 'ANX');
    } catch (error) {
      console.log('❌ Allowance call failed:', error.message);
    }
    
    // Test buyTokens function (read-only test)
    console.log('\n🧪 Testing buyTokens function...');
    try {
      // Get a signer to test the payable function
      const signers = await provider.getSigner();
      const signerAddress = await signers.getAddress();
      console.log('✅ Signer address:', signerAddress);
      
      // Get initial balance
      const initialBalance = await tokenContract.balanceOf(signerAddress);
      console.log('✅ Initial balance:', ethers.formatEther(initialBalance), 'ANX');
      
      // Test buyTokens with 0.01 ETH
      const ethAmount = ethers.parseEther("0.01");
      console.log('💰 Attempting to buy tokens with:', ethers.formatEther(ethAmount), 'ETH');
      
      const buyTokensTx = await tokenContract.connect(signers).buyTokens({ value: ethAmount });
      console.log('📝 Transaction hash:', buyTokensTx.hash);
      
      // Wait for transaction to be mined
      await buyTokensTx.wait();
      console.log('✅ Transaction confirmed!');
      
      // Check new balance
      const newBalance = await tokenContract.balanceOf(signerAddress);
      console.log('✅ New balance:', ethers.formatEther(newBalance), 'ANX');
      
      const tokensReceived = newBalance - initialBalance;
      console.log('🎉 Tokens received:', ethers.formatEther(tokensReceived), 'ANX');
      
    } catch (error) {
      console.log('❌ BuyTokens test failed:', error.message);
      if (error.message.includes('insufficient funds')) {
        console.log('💡 The test account needs more ETH for this test');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTokenContract().then(() => {
  console.log('\n🏁 Token contract test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 