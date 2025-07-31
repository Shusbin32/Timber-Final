import { getApiUrl, API_ENDPOINTS } from '@/config/api';

export interface Branch {
  branch_id: string;
  name: string;
  location?: string;
  manager?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export const BranchService = {
  async createBranch(data: Partial<Branch>): Promise<Branch> {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_BRANCH), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create branch');
    const res = await response.json();
    return res.data || res;
  },
  
  async getAllBranches(): Promise<Branch[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.BRANCHES), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch branches');
    const res = await response.json();
    return res.data || res;
  },
  
  async getBranchById(branchId: string): Promise<Branch> {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.BRANCH_BY_ID(Number(branchId))), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch branch');
    const res = await response.json();
    return res.data || res;
  },
  
  async updateBranch(branchId: string, data: Partial<Branch>): Promise<Branch> {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.UPDATE_BRANCH(Number(branchId))), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update branch');
    const res = await response.json();
    return res.data || res;
  },
  
  async deleteBranch(branchId: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.DELETE_BRANCH(Number(branchId))), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to delete branch');
  },
}; 