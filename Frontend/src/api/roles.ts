// my-next-app/src/api/roles.ts

const API_BASE_URL = "http://127.0.0.1:8000";

export interface Role {
  role_id: number;
  role_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all roles
export async function fetchRoles(): Promise<Role[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/allroles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  // Map backend keys to Role interface
  const roles = (data.data || []).map((role: any) => ({
    role_id: role.role_id,
    role_name: role.role_name,
    created_at: role.created_at,
    updated_at: role.updated_at,
  }));
  return roles;
}

// Create a new role
export async function createRole(roleData: { name: string }): Promise<Role> {
  const token = localStorage.getItem('token');
  // Send as { label: ... }
  const response = await fetch(`${API_BASE_URL}/api/user/createroles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role_name: roleData.name }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create role error response:', errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  // Map response to Role interface
  return {
    role_id: data.data?.role_id,
    role_name: data.data?.role_name,
    created_at: data.data?.created_at,
    updated_at: data.data?.updated_at,
  };
}

// Delete a role
export async function deleteRole(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/deleterole/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}

export async function updateRole(role_id: number, role_name: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/user/createroles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ role_id, role_name }),
  });
  if (!res.ok) throw new Error('Update role failed');
  return res.json();
} 