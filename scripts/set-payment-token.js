import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  console.log("🔧 Setting payment token in marketplace...");

  // Check if private key is set
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY environment variable is not set!");
    process.exit(1);
  }

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Contract addresses (you can modify these as needed)
  const marketplaceAddress = process.env.MARKETPLACE_ADDRESS || "0x41B6DbE994D292332332B3bE7F6322D6724a7BaB";
  const tokenAddress = process.env.TOKEN_ADDRESS || "0xaC7291CB22BC05ACe8C3F3591CAcE2a2Cc45a492";

  console.log("Marketplace address:", marketplaceAddress);
  console.log("Token address:", tokenAddress);

  // Get contract instances
  const marketplace = await ethers.getContractAt("AINexusMarketplace", marketplaceAddress);
  const token = await ethers.getContractAt("AINexusToken", tokenAddress);

  // Verify ownership
  const marketplaceOwner = await marketplace.owner();
  console.log("Marketplace owner:", marketplaceOwner);
  console.log("Deployer address:", deployer.address);

  if (marketplaceOwner !== deployer.address) {
    console.error("❌ Deployer is not the marketplace owner!");
    process.exit(1);
  }

  // Check current payment token
  const currentPaymentToken = await marketplace.paymentToken();
  console.log("Current payment token:", currentPaymentToken);

  if (currentPaymentToken === tokenAddress) {
    console.log("✅ Payment token is already correctly set!");
    return;
  }

  // Set payment token
  try {
    console.log("⏳ Setting payment token...");
    const tx = await marketplace.setPaymentToken(tokenAddress);
    console.log("Transaction hash:", tx.hash);
    
    console.log("⏳ Waiting for confirmation...");
    await tx.wait();
    
    console.log("✅ Payment token set successfully!");
    
    // Verify
    const newPaymentToken = await marketplace.paymentToken();
    console.log("New payment token:", newPaymentToken);
    
    if (newPaymentToken === tokenAddress) {
      console.log("✅ Verification successful!");
    } else {
      console.log("❌ Verification failed!");
    }
  } catch (error) {
    console.error("❌ Failed to set payment token:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 