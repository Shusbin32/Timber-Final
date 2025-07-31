import { API_BASE_URL } from '@/config/api';

// Check token expiry
export async function checkToken(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/user/checktoken`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Token check failed');
  return res.json();
}

// Login
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

// Logout
export async function logout(user_id: string) {
  const res = await fetch(`${API_BASE_URL}/api/user/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

// Create user
export async function createUser(userData: Record<string, unknown>) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/user/createuser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Create user failed');
  return res.json();
}

// Update user
export async function updateUser(user_id: number, userData: Record<string, unknown>) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/user/updateuser/${user_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Update user failed');
  return res.json();
}

// Get all users
export async function getUsers() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/user/getusers`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) throw new Error('Get users failed');
  return res.json();
}

// Get all users except admin
export async function getAllUsersExceptAdmin() {
  const res = await fetch(`${API_BASE_URL}/api/user/allusers`);
  if (!res.ok) throw new Error('Get all users except admin failed');
  return res.json();
}

// Get one user by id
export async function getOneUser(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/user/getoneuser/${id}`);
  if (!res.ok) throw new Error('Get one user failed');
  return res.json();
}

// Get all roles
export async function getAllRoles() {
  const res = await fetch(`${API_BASE_URL}/api/user/allroles`);
  if (!res.ok) throw new Error('Get all roles failed');
  return res.json();
}

// Create role
export async function createRole(role_name: string) {
  const res = await fetch(`${API_BASE_URL}/api/user/createroles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_name }),
  });
  if (!res.ok) throw new Error('Create role failed');
  return res.json();
}

// Delete role
export async function deleteRole(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/user/deleterole/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Delete role failed');
  return res.json();
}

// Update role
export async function updateRole(id: number, role_name: string) {
  const res = await fetch(`${API_BASE_URL}/api/user/updaterole/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_name }),
  });
  if (!res.ok) throw new Error('Update role failed');
  return res.json();
}

export { deleteRole as deleteUser }; 