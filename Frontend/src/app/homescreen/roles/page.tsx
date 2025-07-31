"use client";
import { useState, useEffect } from "react";
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Table from '@/components/Table';
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { fetchRoles, createRole, deleteRole, updateRole } from '@/api/roles';
import type { Role } from '@/api/roles';
import { toast } from 'react-hot-toast';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load roles from API
  const loadRoles = async () => {
    try {
      console.log('Loading roles from API...');
      const rolesData = await fetchRoles();
      console.log('Roles loaded:', rolesData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error loading roles');
      // Do not fall back to mock data or empty array
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const columns = [
    { key: 'role_name', label: 'Role Name' },
    { key: 'created_at', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const filteredRoles = searchAndFilterItems(
    roles as unknown as Record<string, unknown>[],
    searchTerm,
    SEARCH_CONFIGS.roles.searchFields as (keyof Role)[],
    {}
  );

  const handleCreateRole = async (formData: { name: string }) => {
    try {
      await createRole(formData);
      await loadRoles();
      setShowCreateForm(false);
      toast.success("Role created successfully");
    } catch (error) {
      // Try to extract backend message
      let message = "Failed to create role";
      if (error instanceof Error && error.message && error.message.includes("{")) {
        try {
          const errObj = JSON.parse(error.message.split(" - ")[1]);
          if (errObj && errObj.message) {
            message = errObj.message;
          }
        } catch {}
      }
      toast.error(message);
      console.error("Error creating role:", error);
    }
  };

  const handleUpdateRole = async (formData: { name: string }) => {
    if (!editingRole) return;
    try {
      await updateRole(editingRole.role_id, formData.name);
      await loadRoles();
      setEditingRole(null);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      await deleteRole(roleId);
      await loadRoles();
      console.log('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error);
      await loadRoles();
    }
  };

  const renderActions = (role: Role) => (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={() => setEditingRole(role)}
        className="p-1"
      >
        <PencilIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="danger"
        onClick={() => handleDeleteRole(role.role_id)}
        className="p-1"
      >
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );

  const renderStatus = (status: string) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'active' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {status}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-yellow-900 mb-2">Role Management</h1>
            <p className="text-yellow-700">Manage user roles and permissions</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Role
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search role names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary">Filter</Button>
          </div>
        </Card>

        {/* Roles Table */}
        <Card className="mb-6">
          <Table
            data={filteredRoles as unknown as Record<string, unknown>[]}
            columns={columns.map(col => ({
              key: col.key,
              label: col.label,
              render: col.key === 'status' ? (value: unknown) => renderStatus(String(value)) : undefined
            }))}
            actions={(row: Record<string, unknown>) => renderActions(row as unknown as Role)}
          />
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateForm || editingRole) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowCreateForm(false);
              setEditingRole(null);
            }} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-md mx-4 p-6">
              <h2 className="text-2xl font-bold text-yellow-900 mb-6">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              
                             <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 const data = {
                   name: formData.get('name') as string
                 };
                 
                 if (editingRole) {
                   handleUpdateRole(data);
                 } else {
                   handleCreateRole(data);
                 }
               }}>
                 <div className="space-y-4">
                   <Input
                     label="Role Name"
                     name="name"
                     defaultValue={editingRole?.role_name ?? ''}
                    required
                    placeholder="Enter role name"
                  />
                </div>
                <div className="flex gap-3 pt-6">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingRole(null);
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