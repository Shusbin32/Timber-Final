// Test script to verify API connection
import axios from 'axios';

async function testAPI() {
  const baseURL = 'http://127.0.0.1:8000';
  
  console.log('Testing API connection...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test the users endpoint
    const response = await axios.get(`${baseURL}/api/user/getusers`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });
    
    console.log('✅ API connection successful!');
    console.log('Status:', response.status);
    console.log('Data length:', response.data?.data?.length || response.data?.length || 0);
    
  } catch (error) {
    console.error('❌ API connection failed!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Check if backend is running on port 8000');
    }
  }
}

testAPI(); 