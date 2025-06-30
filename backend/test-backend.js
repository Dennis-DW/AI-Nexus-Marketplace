const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🧪 Testing AI Nexus Marketplace Backend...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('   Environment:', healthResponse.data.environment);
    console.log('   Database:', healthResponse.data.database);
    console.log('');

    // Test API info endpoint
    console.log('2. Testing API info endpoint...');
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API info retrieved successfully');
    console.log('   API Name:', apiResponse.data.name);
    console.log('   Version:', apiResponse.data.version);
    console.log('   Available endpoints:', Object.keys(apiResponse.data.endpoints).length);
    console.log('');

    // Test models endpoint
    console.log('3. Testing models endpoint...');
    const modelsResponse = await axios.get(`${BASE_URL}/api/models?limit=5`);
    console.log('✅ Models endpoint working');
    console.log('   Models found:', modelsResponse.data.data.length);
    console.log('   Total models:', modelsResponse.data.pagination.totalModels);
    console.log('');

    // Test market stats endpoint
    console.log('4. Testing market stats endpoint...');
    const marketResponse = await axios.get(`${BASE_URL}/api/market/stats`);
    console.log('✅ Market stats endpoint working');
    console.log('   Total volume:', marketResponse.data.data.totalVolume || '0');
    console.log('   Total transactions:', marketResponse.data.data.totalTransactions || '0');
    console.log('');

    // Test purchase stats endpoint
    console.log('5. Testing purchase stats endpoint...');
    const purchaseResponse = await axios.get(`${BASE_URL}/api/purchase/stats`);
    console.log('✅ Purchase stats endpoint working');
    console.log('   Total purchases:', purchaseResponse.data.data.totalPurchases || '0');
    console.log('   Total volume:', purchaseResponse.data.data.totalVolume || '0');
    console.log('');

    console.log('🎉 All backend tests passed successfully!');
    console.log('🚀 Backend is ready for production use.');

  } catch (error) {
    console.error('❌ Backend test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.message);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Connection refused. Make sure the backend server is running on port 3001.');
      console.error('   Run: npm run dev');
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testBackend(); 