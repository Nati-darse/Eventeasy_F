const axios = require('axios');

const checkBackendEnv = async () => {
  try {
    console.log('🔍 Checking deployed backend environment...');
    
    // Try to get some info from the backend
    const response = await axios.get('https://event-easy.onrender.com/Event-Easy/health');
    console.log('✅ Backend is responding');
    console.log('📊 Response:', response.data);
    
  } catch (error) {
    console.log('❌ Backend health check failed');
    console.log('📊 Error status:', error.response?.status);
    console.log('📄 Error data:', error.response?.data);
  }
};

checkBackendEnv(); 