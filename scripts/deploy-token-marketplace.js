import hardhat from "hardhat";
const { ethers } = hardhat;
import { updateEnvFiles } from "./update-env.js";
import fs from 'fs/promises';

async function main() {
  console.log("🚀 Starting deployment of AINexus Token and Marketplace...");

  // Check if private key is set
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY environment variable is not set!");
    console.log("📝 Please set your private key in the .env file:");
    console.log("   PRIVATE_KEY=your_private_key_here");
    console.log("   HOLESKY_RPC_URL=https://ethereum-holesky.publicnode.com");
    process.exit(1);
  }

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    console.error("❌ No deployer account found!");
    console.log("📝 Please check your hardhat configuration and ensure PRIVATE_KEY is set correctly.");
    process.exit(1);
  }
  
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Get the account balance using the provider
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance));

  // Deploy AINexus Token first
  console.log("\n🔧 Deploying AINexus Token...");
  const AINexusToken = await ethers.getContractFactory("AINexusToken");
  const token = await AINexusToken.deploy();
  await token.waitForDeployment(); // Wait for deployment to be confirmed
  console.log("✅ AINexus Token deployed to:", token.target);

  // Deploy Marketplace
  console.log("\n🔧 Deploying AINexus Marketplace...");
  const AINexusMarketplace = await ethers.getContractFactory("AINexusMarketplace");
  const marketplace = await AINexusMarketplace.deploy();
  await marketplace.waitForDeployment(); // Wait for deployment to be confirmed
  console.log("✅ AINexus Marketplace deployed to:", marketplace.target);

  // Verify ownership before setting payment token
  console.log("\n🔍 Verifying contract ownership...");
  const marketplaceOwner = await marketplace.owner();
  console.log("Marketplace owner:", marketplaceOwner);
  console.log("Deployer address:", deployer.address);
  
  if (marketplaceOwner !== deployer.address) {
    console.error("❌ Deployer is not the marketplace owner!");
    console.log("Expected owner:", deployer.address);
    console.log("Actual owner:", marketplaceOwner);
    process.exit(1);
  }
  console.log("✅ Ownership verified!");

  // Set the payment token in the marketplace
  console.log("\n🔧 Setting payment token in marketplace...");
  
  // Check if payment token is already set
  const currentPaymentToken = await marketplace.paymentToken();
  if (currentPaymentToken !== ethers.ZeroAddress) {
    console.log("⚠️  Payment token already set to:", currentPaymentToken);
    if (currentPaymentToken === token.target) {
      console.log("✅ Payment token is already correctly set!");
    } else {
      console.log("❌ Payment token is set to a different address!");
      console.log("   Expected:", token.target);
      console.log("   Current:", currentPaymentToken);
      process.exit(1);
    }
  } else {
    try {
      const setTokenTx = await marketplace.setPaymentToken(token.target);
      console.log("⏳ Waiting for transaction confirmation...");
      await setTokenTx.wait();
      console.log("✅ Payment token set in marketplace");
    } catch (error) {
      console.error("❌ Failed to set payment token:", error.message);
      console.log("📝 Transaction details:");
      console.log("   Token address:", token.target);
      console.log("   Marketplace address:", marketplace.target);
      console.log("   Deployer address:", deployer.address);
      console.log("   Marketplace owner:", await marketplace.owner());
      throw error;
    }
  }

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