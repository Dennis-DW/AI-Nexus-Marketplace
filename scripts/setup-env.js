import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnv() {
  console.log('🔧 Setting up environment variables for deployment...\n');
  
  const envContent = [];
  
  // Private Key
  const privateKey = await question('Enter your wallet private key (without 0x prefix): ');
  if (privateKey) {
    envContent.push(`PRIVATE_KEY=${privateKey}`);
  }
  
  // RPC URLs
  const holeskyRpc = await question('Enter Holesky RPC URL (or press Enter for default): ');
  envContent.push(`HOLESKY_RPC_URL=${holeskyRpc || 'https://ethereum-holesky.publicnode.com'}`);
  
  const mainnetRpc = await question('Enter Mainnet RPC URL (optional): ');
  if (mainnetRpc) {
    envContent.push(`MAINNET_RPC_URL=${mainnetRpc}`);
  }
  
  const polygonRpc = await question('Enter Polygon RPC URL (or press Enter for default): ');
  envContent.push(`POLYGON_RPC_URL=${polygonRpc || 'https://polygon-rpc.com/'}`);
  
  const mumbaiRpc = await question('Enter Mumbai RPC URL (or press Enter for default): ');
  envContent.push(`MUMBAI_RPC_URL=${mumbaiRpc || 'https://rpc-mumbai.maticvigil.com/'}`);
  
  // API Keys
  const etherscanKey = await question('Enter Etherscan API Key (optional): ');
  if (etherscanKey) {
    envContent.push(`ETHERSCAN_API_KEY=${etherscanKey}`);
  }
  
  const polygonscanKey = await question('Enter Polygonscan API Key (optional): ');
  if (polygonscanKey) {
    envContent.push(`POLYGONSCAN_API_KEY=${polygonscanKey}`);
  }
  
  // Gas reporting
  envContent.push('REPORT_GAS=true');
  
  try {
    const envPath = path.join(__dirname, '..', '.env');
    await fs.writeFile(envPath, envContent.join('\n') + '\n');
    console.log('\n✅ Environment variables saved to .env file');
    console.log('🚀 You can now run the deployment script!');
  } catch (error) {
    console.error('❌ Error creating .env file:', error);
  } finally {
    rl.close();
  }
}

setupEnv().catch(console.error); 