import hardhat from "hardhat";
const { ethers } = hardhat;
import { updateEnvFiles } from "./update-env.js";
import fs from 'fs/promises';

async function main() {
  console.log("🚀 Starting deployment of AINexus Token and Marketplace...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Get the account balance using the provider
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance));

  // Deploy AINexus Token first
  console.log("\n🔧 Deploying AINexus Token...");
  const AINexusToken = await ethers.getContractFactory("AINexusToken");
  const token = await AINexusToken.deploy();
  console.log("✅ AINexus Token deployed to:", token.target);

  // Deploy Marketplace
  console.log("\n🔧 Deploying AINexus Marketplace...");
  const AINexusMarketplace = await ethers.getContractFactory("AINexusMarketplace");
  const marketplace = await AINexusMarketplace.deploy();
  console.log("✅ AINexus Marketplace deployed to:", marketplace.target);

  // Set the payment token in the marketplace
  console.log("\n🔧 Setting payment token in marketplace...");
  const setTokenTx = await marketplace.setPaymentToken(token.target);
  await setTokenTx.wait();
  console.log("✅ Payment token set in marketplace");

  // Verify the setup
  console.log("\n🔍 Verifying deployment...");
  const marketplaceTokenAddress = await marketplace.paymentToken();
  
  console.log("Marketplace's payment token address:", marketplaceTokenAddress);
  
  if (marketplaceTokenAddress === token.target) {
    console.log("✅ Contract addresses are correctly linked!");
  } else {
    console.log("❌ Contract addresses are not correctly linked!");
  }

  // Get initial token balance for deployer
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log("\n💰 Deployer token balance:", ethers.formatEther(deployerBalance), "ANX");

  // Test token purchase functionality
  console.log("\n🧪 Testing token purchase functionality...");
  const ethAmount = ethers.parseEther("0.01"); // 0.01 ETH
  const buyTokensTx = await token.buyTokens({ value: ethAmount });
  await buyTokensTx.wait();
  
  const newBalance = await token.balanceOf(deployer.address);
  console.log("✅ Token purchase test successful!");
  console.log("💰 New token balance:", ethers.formatEther(newBalance), "ANX");

  // Test token approval
  console.log("\n🧪 Testing token approval...");
  const approveTx = await token.approve(marketplace.target, ethers.parseEther("1000000"));
  await approveTx.wait();
  
  const allowance = await token.allowance(deployer.address, marketplace.target);
  console.log("✅ Token approval test successful!");
  console.log("💰 Allowance:", ethers.formatEther(allowance), "ANX");

  // Deploy a test model
  console.log("\n🧪 Deploying a test model...");
  const modelName = "Test AI Model";
  const modelType = "GPT";
  const description = "A test AI model for deployment verification";
  const price = ethers.parseEther("0.1"); // 0.1 ETH
  
  const listModelTx = await marketplace.listModel(modelName, modelType, description, price);
  await listModelTx.wait();
  
  const models = await marketplace.getModels();
  console.log("✅ Test model deployed successfully!");
  console.log("📊 Total models:", models.length);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    tokenAddress: token.target,
    marketplaceAddress: marketplace.target,
    deploymentTime: new Date().toISOString(),
    contracts: {
      token: {
        address: token.target,
        name: "AINexusToken",
        symbol: "ANX",
        decimals: 18
      },
      marketplace: {
        address: marketplace.target,
        name: "AINexusMarketplace",
        tokenAddress: token.target
      }
    }
  };

  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Token Address:", deploymentInfo.tokenAddress);
  console.log("Marketplace Address:", deploymentInfo.marketplaceAddress);
  console.log("Deployment Time:", deploymentInfo.deploymentTime);

  // Save to file
  const deploymentPath = './deployment-info.json';
  await fs.writeFile(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Update .env files with contract addresses
  await updateEnvFiles(marketplace.target, token.target);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. ✅ Contract addresses have been automatically updated in .env files");
  console.log("2. Test the marketplace functionality");
  console.log("3. Verify contracts on block explorer (if on testnet/mainnet)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });