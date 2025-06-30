import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  console.log("🔍 Verifying deployment...");

  // Contract addresses from the failed deployment
  const marketplaceAddress = "0x41B6DbE994D292332332B3bE7F6322D6724a7BaB";
  const tokenAddress = "0xaC7291CB22BC05ACe8C3F3591CAcE2a2Cc45a492";

  try {
    // Get contract instances
    const marketplace = await ethers.getContractAt("AINexusMarketplace", marketplaceAddress);
    const token = await ethers.getContractAt("AINexusToken", tokenAddress);

    console.log("✅ Contracts found on network");

    // Check marketplace owner
    const marketplaceOwner = await marketplace.owner();
    console.log("Marketplace owner:", marketplaceOwner);

    // Check payment token
    const paymentToken = await marketplace.paymentToken();
    console.log("Payment token:", paymentToken);

    // Check token details
    const tokenName = await token.name();
    const tokenSymbol = await token.symbol();
    console.log("Token name:", tokenName);
    console.log("Token symbol:", tokenSymbol);

    // Check if deployer is owner
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Is deployer owner?", marketplaceOwner === deployer.address);

    // Check deployer token balance
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("Deployer token balance:", ethers.formatEther(deployerBalance));

    // Check marketplace balance
    const marketplaceBalance = await ethers.provider.getBalance(marketplaceAddress);
    console.log("Marketplace ETH balance:", ethers.formatEther(marketplaceBalance));

    // Check if payment token is set
    if (paymentToken === ethers.ZeroAddress) {
      console.log("⚠️  Payment token is not set");
      console.log("📝 You can set it using: npm run set-payment-token");
    } else {
      console.log("✅ Payment token is set");
    }

  } catch (error) {
    console.error("❌ Error verifying deployment:", error.message);
    
    // Check if contracts exist
    const code = await ethers.provider.getCode(marketplaceAddress);
    if (code === "0x") {
      console.log("❌ Marketplace contract not found at address:", marketplaceAddress);
    } else {
      console.log("✅ Marketplace contract exists at address:", marketplaceAddress);
    }

    const tokenCode = await ethers.provider.getCode(tokenAddress);
    if (tokenCode === "0x") {
      console.log("❌ Token contract not found at address:", tokenAddress);
    } else {
      console.log("✅ Token contract exists at address:", tokenAddress);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 