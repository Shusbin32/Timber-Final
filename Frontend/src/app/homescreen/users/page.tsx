"use client";
import { useState, useEffect, useCallback } from "react";
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Table from '@/components/Table';
import { PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import { getUsers, createUser, updateUser, getAllRoles } from '@/api/users';
import { toast } from 'react-hot-toast';
import DealerService from '@/api/dealers';
import type { Dealer } from '@/types/dealer';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';

interface User extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface Role {
  role_id: number;
  role_name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dealers, setDealers] = useState<Pick<Dealer, 'dealer_id' | 'name'>[]>([]);

  // Fetch users helper
  const fetchUsers = useCallback(async (rolesList = roles) => {
    try {
      const usersData = await getUsers();
      console.log('Raw usersData:', usersData.data); // Debug: backend response
      const mappedUsers = usersData.data.map((u: Record<string, unknown>) => {
        let role_id: number | undefined;
        let role_name: string = '';
        if (typeof u.role === 'number') {
          role_id = u.role;
        } else if (typeof u.role === 'string') {
          // Try to find by name
          const found = rolesList.find(r => r.role_name === u.role);
          if (found) {
            role_id = found.role_id;
            role_name = found.role_name;
          }
        } else if (u.role && typeof u.role === 'object' && 'role_id' in u.role && 'role_name' in u.role) {
          role_id = (u.role as { role_id: number }).role_id;
          role_name = (u.role as { role_name: string }).role_name;
        }
        const roleObj = rolesList.find(r => r.role_id === role_id);
        return {
          id: u.user_id as number,
          name: u.full_name as string,
          email: u.email as string,
          phone: u.contact ? String(u.contact) : "",
          role: roleObj ? roleObj.role_name : role_name || (typeof u.role === 'string' ? u.role : ''),
          role_id: role_id ?? (roleObj ? roleObj.role_id : undefined),
          password: u.password as string,
          createdAt: u.date_joined as string,
        };
      });
      console.log('Mapped users:', mappedUsers); // Debug: mapped users
      setUsers(mappedUsers);
    } catch {
      toast.error('Failed to fetch users');
    }
  }, [roles]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getAllRoles();
        const rolesArr = Array.isArray(rolesData.data) ? rolesData.data : [];
        setRoles(rolesArr);
        // Fetch users after roles are set
        fetchUsers(rolesArr);
      } catch {
        toast.error('Failed to fetch roles');
      }
    };
    fetchRoles();
    // Fetch dealers for dropdown
    const fetchDealers = async () => {
      try {
        const res = await DealerService.getAll();
        let dealerList: Dealer[] = [];
        if (Array.isArray(res)) {
          dealerList = res as Dealer[];
        } else if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as { data: Dealer[] }).data)) {
          dealerList = (res as { data: Dealer[] }).data;
        }
        setDealers(
          dealerList.map((d) => ({
            dealer_id: String(d.dealer_id ?? ''),
            name: d.name ?? '',
          }))
        );
      } catch {
        // ignore
      }
    };
    fetchDealers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const columns = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role' },
    { key: 'createdAt', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const filteredUsers = searchAndFilterItems(
    users,
    searchTerm,
    SEARCH_CONFIGS.users.searchFields as (keyof User)[],
    {}
  );

  // Update handleCreateUser signature
  type CreateUserFormData = { name: string; email: string; phone?: string; role_id: number; password: string; dealer_id?: string; gender?: string; country?: string };

  const handleCreateUser = async (formData: CreateUserFormData) => {
    try {
      const dealerIdStr = String(formData.dealer_id).trim();
      console.log('Selected dealer_id for user:', dealerIdStr, typeof dealerIdStr);
      const data = {
        full_name: formData.name,
        email: formData.email,
        contact: formData.phone,
        role_id: formData.role_id,
        password: formData.password,
        dealer_id: dealerIdStr, // always send as string
        gender: formData.gender || "male",
        country: formData.country || "Nepal",
        status: "active",
      };
      await createUser(data);
      setShowCreateForm(false);
      await fetchUsers();
      toast.success('User created successfully');
    } catch {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (updatePayload: Record<string, unknown>) => {
    if (!editingUser) return;
    const userId = typeof editingUser.id === 'string' ? parseInt(editingUser.id, 10) : editingUser.id; // Ensure number
    console.log('Updating user with id:', userId); // Debug: id used for update
    await updateUser(userId, updatePayload);
    setEditingUser(null);
    await fetchUsers();
    toast.success('User updated successfully');
  };

  const renderActions = (user: User) => (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={() => setEditingUser(user)}
        className="p-1"
      >
        <PencilIcon className="w-4 h-4" />
      </Button>
      {/* Delete button removed */}
    </div>
  );



  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-yellow-900 mb-2">User Management</h1>
            <p className="text-yellow-700">Manage system users and their roles</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary">Filter</Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="mb-6">
          <Table
            data={filteredUsers}
            columns={columns.map(col => ({
              key: col.key,
              label: col.label
            }))}
            actions={renderActions}
          />
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateForm || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowCreateForm(false);
              setEditingUser(null);
            }} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-md mx-4 p-6">
              <h2 className="text-2xl font-bold text-yellow-900 mb-6">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              
                             <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 const data = {
                   name: formData.get('name') as string,
                   email: formData.get('email') as string,
                   phone: formData.get('phone') as string,
                   role_id: Number(formData.get('role')),
                   password: formData.get('password') as string,
                   dealer_id: formData.get('dealer_id') as string // include dealer_id
                 };
                 
                 if (editingUser) {
                   // Map to backend fields and role ID
                   const updatePayload: Record<string, unknown> = {
                     full_name: data.name,
                     email: data.email,
                     contact: data.phone,
                     role_id: data.role_id,
                     dealer_id: data.dealer_id, // include dealer_id
                   };
                   if (data.password && data.password.trim() !== "") updatePayload.password = data.password;
                   handleUpdateUser(updatePayload);
                 } else {
                   handleCreateUser(data);
                 }
               }}>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    name="name"
                    defaultValue={editingUser?.name}
                    required
                    placeholder="Enter full name"
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={editingUser?.email}
                    required
                    placeholder="Enter email address"
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    defaultValue={editingUser?.phone}
                    placeholder="Enter phone number"
                  />
                  {/* Role Dropdown */}
                  <div className="flex flex-col gap-1 mb-2">
                    <label className="font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      defaultValue={editingUser && typeof editingUser.role_id !== 'undefined' ? String(editingUser.role_id) : ""}
                      required
                      className="border rounded-xl px-4 py-3 text-black shadow-sm focus:ring-2 focus:ring-yellow-300"
                    >
                      <option value="">Select role</option>
                      {roles.map(role => (
                        <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Dealer Dropdown */}
                  <div className="flex flex-col gap-1 mb-2">
                    <label className="font-medium text-gray-700 mb-1">Dealer</label>
                    <select
                      name="dealer_id"
                      defaultValue={editingUser?.dealer_id ? String(editingUser.dealer_id) : ''}
                      className="border rounded-xl px-4 py-3 text-black shadow-sm focus:ring-2 focus:ring-yellow-300"
                    >
                      <option value="">Select dealer</option>
                      {dealers.map(dealer => (
                        <option key={dealer.dealer_id} value={dealer.dealer_id}>{dealer.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      defaultValue=""
                      required={!editingUser}
                      placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-500"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingUser(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 