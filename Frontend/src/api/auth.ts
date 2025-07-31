import { USE_MOCKS, getApiUrl, API_ENDPOINTS, API_BASE_URL } from '@/config/api';

export async function login(email: string, password: string) {
  console.log('🔍 Debug - Login function called with email:', email);
  
  if (USE_MOCKS) {
    console.log('🔍 Debug - Using MOCK mode');
    if (email === "demo@demo.com" && password === "password123") {
      const mockResponse = { token: "mocktoken", role: "admin", user_id: 1 };
      console.log('🔍 Debug - Mock login successful:', mockResponse);
      return mockResponse;
    }
    console.log('🔍 Debug - Mock login failed - invalid credentials');
    throw new Error("Invalid credentials");
  } else {
    try {
      const loginUrl = getApiUrl(API_ENDPOINTS.LOGIN);
      console.log('🔍 Debug - Login URL:', loginUrl);
      console.log('🔍 Debug - API_BASE_URL from config:', API_BASE_URL);
      console.log('🔍 Debug - Sending login request...');
      
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('🔍 Debug - Login response status:', res.status);
      console.log('🔍 Debug - Login response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log('🔍 Debug - Login error response:', errorText);
        throw new Error(`Login failed: ${res.status} ${res.statusText}`);
      }
      
      const responseData = await res.json();
      console.log('🔍 Debug - Login API response data:', responseData);
      console.log('🔍 Debug - Response data keys:', Object.keys(responseData));
      console.log('🔍 Debug - Role in response:', responseData.role);
      
      return responseData;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed. Please check your credentials.");
    }
  }
}

export async function logout(user_id: string) {
  if (USE_MOCKS) {
    return true;
  } else {
    try {
      const logoutUrl = getApiUrl(API_ENDPOINTS.LOGOUT);
      console.log('🔍 Debug - Logout URL:', logoutUrl);
      
      const res = await fetch(logoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });
      if (!res.ok) {
        throw new Error(`Logout failed: ${res.status} ${res.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout failed. Please try again.");
    }
  }
}