import { getApiUrl, API_ENDPOINTS } from '@/config/api';

export interface SubDivision {
  id: number;
  name: string;
  division: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubDivisionData {
  name: string;
  division: string;
  description?: string;
}

export interface UpdateSubDivisionData {
  name?: string;
  division_id?: string;
  description?: string;
}

export async function fetchSubDivisions(): Promise<unknown> {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(API_ENDPOINTS.SUBDIVISIONS), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch subdivisions');
  return response.json(); // Return the whole response object
}

export async function createSubDivision(data: CreateSubDivisionData): Promise<SubDivision> {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_SUBDIVISION), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create subdivision');
  const res = await response.json();
  return res.subdivision || res;
}

export async function fetchSubDivision(id: number): Promise<SubDivision> {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(API_ENDPOINTS.SUBDIVISION_BY_ID(id)), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch subdivision');
  const res = await response.json();
  return res.subdivision || res;
}

export async function updateSubDivision(id: number, data: UpdateSubDivisionData): Promise<SubDivision> {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(API_ENDPOINTS.UPDATE_SUBDIVISION(id)), {
    method: 'PUT', // Use PUT for updates
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update subdivision');
  const res = await response.json();
  return res.subdivision || res;
}

export async function deleteSubDivision(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(API_ENDPOINTS.DELETE_SUBDIVISION(id)), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to delete subdivision');
  // No return value needed
} 