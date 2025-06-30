import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Setting payment token for marketplace contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);

  // Get contract addresses from deployment
  const MARKETPLACE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with your deployed address
  const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with your deployed address

  console.log("🏪 Marketplace address:", MARKETPLACE_ADDRESS);
  console.log("🪙 Token address:", TOKEN_ADDRESS);

  // Get the marketplace contract
  const Marketplace = await ethers.getContractFactory("AINexusMarketplace");
  const marketplace = Marketplace.attach(MARKETPLACE_ADDRESS);

  // Get the token contract
  const Token = await ethers.getContractFactory("AINexusToken");
  const token = Token.attach(TOKEN_ADDRESS);

  try {
    // Check if payment token is already set
    const currentPaymentToken = await marketplace.paymentToken();
    console.log("💰 Current payment token:", currentPaymentToken);

    if (currentPaymentToken === ethers.ZeroAddress) {
      console.log("🔧 Setting payment token...");
      
      // Set the payment token
      const setTokenTx = await marketplace.setPaymentToken(TOKEN_ADDRESS);
      await setTokenTx.wait();
      
      console.log("✅ Payment token set successfully!");
      console.log("📝 Transaction hash:", setTokenTx.hash);
    } else {
      console.log("ℹ️ Payment token is already set");
    }

    // Verify the payment token is set correctly
    const newPaymentToken = await marketplace.paymentToken();
    console.log("✅ Verified payment token:", newPaymentToken);

    // Test token functionality
    console.log("\n🧪 Testing token functionality...");
    
    // Check token balance
    const balance = await token.balanceOf(deployer.address);
    console.log("💰 Token balance:", ethers.formatEther(balance), "ANX");

    // Check allowance
    const allowance = await token.allowance(deployer.address, MARKETPLACE_ADDRESS);
    console.log("✅ Token allowance:", ethers.formatEther(allowance), "ANX");

    console.log("\n🎉 Payment token setup completed successfully!");
    console.log("💡 The marketplace is now ready for token-based purchases.");

  } catch (error) {
    console.error("❌ Error setting payment token:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 