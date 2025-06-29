import { ethers } from 'ethers';

// AINexusToken ABI (minimal version for testing)
const ANX_TOKEN_ABI = [
  { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }
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
    
    // Test decimals
    try {
      const decimals = await tokenContract.decimals();
      console.log('✅ Decimals:', decimals);
    } catch (error) {
      console.log('❌ Decimals call failed:', error.message);
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
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTokenContract(); 