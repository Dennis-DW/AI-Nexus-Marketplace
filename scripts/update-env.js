import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function updateEnvFiles(marketplaceAddress, tokenAddress) {
  console.log('🔄 Updating .env files with deployed contract addresses...');
  
  // Update frontend .env
  const frontendEnvPath = path.join(__dirname, '..', '.env');
  const frontendEnvContent = `# Contract Addresses
VITE_MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}
VITE_TOKEN_CONTRACT_ADDRESS=${tokenAddress}

# Network Configuration
VITE_NETWORK_ID=31337
VITE_NETWORK_NAME=localhost

# Backend API
VITE_API_BASE_URL=http://localhost:3001

# Environment
NODE_ENV=development
`;

  // Update backend .env
  const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
  const backendEnvContent = `# Contract Addresses
MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}
TOKEN_CONTRACT_ADDRESS=${tokenAddress}

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ainexus

# Server Configuration
PORT=3001
NODE_ENV=development
`;

  try {
    // Write frontend .env
    await fs.writeFile(frontendEnvPath, frontendEnvContent);
    console.log('✅ Frontend .env updated successfully');
    
    // Write backend .env
    await fs.writeFile(backendEnvPath, backendEnvContent);
    console.log('✅ Backend .env updated successfully');
    
    console.log('📝 Contract addresses updated:');
    console.log(`   Marketplace: ${marketplaceAddress}`);
    console.log(`   Token: ${tokenAddress}`);
    
  } catch (error) {
    console.error('❌ Error updating .env files:', error);
    throw error;
  }
}