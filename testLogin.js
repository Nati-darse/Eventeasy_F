const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing super admin login...');
    
    const loginData = {
      email: 'natnaeldarsema@gmail.com',
      password: 'SuperAdmin123!'
    };

    console.log('📤 Sending login request to:', 'https://event-easy.onrender.com/Event-Easy/users/login');
    console.log('📝 Login data:', { email: loginData.email, password: '***' });

    const response = await axios.post(
      'https://event-easy.onrender.com/Event-Easy/users/login',
      loginData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Login successful!');
    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', response.data);

  } catch (error) {
    console.log('❌ Login failed!');
    console.log('📊 Error status:', error.response?.status);
    console.log('📄 Error data:', error.response?.data);
    console.log('🔍 Error message:', error.message);
  }
};

testLogin(); 