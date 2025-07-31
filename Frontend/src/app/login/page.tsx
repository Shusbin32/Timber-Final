"use client";


import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Button from '@/components/Button';
import Input from '@/components/Input';
import { login } from '@/api/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isClient, setIsClient] = useState(false); // Used in conditional rendering to prevent hydration mismatch

  // Check if user is already logged in
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.replace('/homescreen');
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 2) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      console.log('🔍 Debug - Login API response:', data);
      console.log('🔍 Debug - Data type:', typeof data);
      console.log('🔍 Debug - Data keys:', Object.keys(data || {}));
      console.log('🔍 Debug - Role from API:', data?.role);
      console.log('🔍 Debug - Token from API:', data?.token ? 'Present' : 'Missing');
      console.log('🔍 Debug - User ID from API:', data?.user_id);
      
      if (data?.token) {
        localStorage.setItem("token", data.token);
        
        // Handle different possible role field names and locations
        const role = data.data?.role || data.role || data.user_role || data.role_name || data.role_id;
        console.log('🔍 Debug - Final role value to store:', role);
        localStorage.setItem("role", role);
        
        if (data.data?.user_id || data.user_id) {
          localStorage.setItem("user_id", (data.data?.user_id || data.user_id).toString());
        }
        
        // Store user name from the response
        const userName = data.data?.full_name || data.data?.name || data.data?.username || data.full_name || data.name || data.username || 'User';
        localStorage.setItem("userName", userName);
        
        console.log('🔍 Debug - User name stored:', userName);
        
        console.log('🔍 Debug - Stored in localStorage:');
        console.log('  - token:', localStorage.getItem('token') ? 'Present' : 'Missing');
        console.log('  - role:', localStorage.getItem('role'));
        console.log('  - user_id:', localStorage.getItem('user_id'));
        
        // Set token in cookie for middleware (expires in 7 days)
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        router.push("/homescreen");
      } else {
        console.log('🔍 Debug - No token in response, showing error');
        setError("Invalid response from server.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Show loading while checking authentication (only on client)
  if (!isClient || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin"></div>
          <p className="text-yellow-800 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center w-full max-w-sm relative">
        {/* Door Illustration */}
        <div className="w-24 h-40 bg-gradient-to-b from-yellow-300 to-orange-200 rounded-lg border-4 border-yellow-600 flex flex-col items-center justify-end mb-8 relative">
          <div className="w-6 h-6 bg-yellow-600 rounded-full absolute left-2 bottom-8"></div>
          <div className="w-8 h-2 bg-yellow-700 rounded-b-lg mb-0.5"></div>
        </div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-600 via-orange-400 to-yellow-300 bg-clip-text text-transparent">Login to 5D World</h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            className="px-4 py-2 rounded border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-yellow-700 text-black"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            className="px-4 py-2 rounded border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-yellow-700 text-black"
          />
          {error && (
            <div className="text-red-600 text-sm font-medium -mt-2 mb-2 text-center">{error}</div>
          )}
          <Button
            type="submit"
            className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-full shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={loading}
          >
            <span className="inline-block w-4 h-4 bg-yellow-700 rounded-full mr-2"></span>
            {loading ? "Logging in..." : "Get into the 5D world"}
          </Button>
        </form>
      </div>
    </div>
  );
} 