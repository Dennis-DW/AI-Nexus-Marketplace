// Backend contract configuration
const getContractAddresses = () => {
  const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
  const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
  
  if (!marketplaceAddress || !tokenAddress) {
    console.warn('Contract addresses not found in environment variables. Using fallback addresses.');
  }
  
  return {
    marketplace: marketplaceAddress || "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    token: tokenAddress || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
  };
};

module.exports = {
  CONTRACT_ADDRESSES: getContractAddresses(),
  MARKETPLACE_ADDRESS: getContractAddresses().marketplace,
  TOKEN_ADDRESS: getContractAddresses().token
}; 