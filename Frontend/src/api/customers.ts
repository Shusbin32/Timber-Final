import { getApiUrl, API_ENDPOINTS } from '@/config/api';

export type Customer = {
  id?: number;
  name: string;
  contact?: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
};

export async function fetchCustomers(): Promise<Customer[]> {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.CUSTOMERS), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch customers: ${res.status} ${res.statusText}`);
    }
    const result = await res.json();
    console.log('🔍 Debug - Customers API response:', result);
    
    // Handle different backend response shapes
    if (Array.isArray(result)) return result;
    if (result.customers && Array.isArray(result.customers)) return result.customers;
    if (result.data && Array.isArray(result.data.customers)) return result.data.customers;
    if (result.data && Array.isArray(result.data)) return result.data;
    return [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    // Return empty array as fallback
    return [];
  }
} 