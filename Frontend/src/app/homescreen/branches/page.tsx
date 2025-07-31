"use client";
import { useState, useEffect } from "react";
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Table from '@/components/Table';
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { BranchService, Branch } from '@/api/branches';
import { toast } from 'react-toastify';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await BranchService.getAllBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load branches');
      setBranches([]);
    }
  };

  const columns = [
    { key: 'name', label: 'Branch Name' },
    { key: 'location', label: 'Location' },
    { key: 'manager', label: 'Manager' },
    { key: 'createdAt', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const filteredBranches = branches.filter(branch =>
    (branch.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleCreateBranch = async (formData: { name: string; location?: string; manager?: string }) => {
    try {
      await BranchService.createBranch(formData);
      await loadBranches();
      setShowCreateForm(false);
      toast.success('Branch created successfully!');
    } catch {
      toast.error('Failed to create branch');
    }
  };

  const handleUpdateBranch = async (branchId: string, formData: { name: string; location?: string; manager?: string }) => {
    try {
      await BranchService.updateBranch(branchId, formData);
      await loadBranches();
      setEditingBranch(null);
      toast.success('Branch updated successfully!');
    } catch {
      toast.error('Failed to update branch');
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await BranchService.deleteBranch(branchId);
      await loadBranches();
      toast.success('Branch deleted successfully!');
    } catch {
      toast.error('Failed to delete branch');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold text-yellow-900 tracking-tight drop-shadow-sm">Branches</h1>
        <Button className="flex items-center gap-2 px-5 py-2 rounded-full shadow-lg border border-yellow-200 hover:scale-105 transition" onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="w-5 h-5" /> Add Branch
        </Button>
        <Input type="text" placeholder="Search branches..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-4 py-2 rounded-full border border-yellow-200 text-base focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-yellow-50 text-yellow-900 shadow" />
      </div>
      <Card className="overflow-x-auto rounded-2xl shadow-2xl border border-yellow-100 bg-white/90">
        {/* Explicitly type Table as Table<Branch> */}
        <Table<Branch> columns={columns} data={filteredBranches} actions={(branch: Branch) => (
          <div className="flex gap-2">
            <Button variant="secondary" className="rounded-full px-3 py-1" onClick={() => setEditingBranch(branch)}><PencilIcon className="w-4 h-4" /></Button>
            <Button variant="danger" className="rounded-full px-3 py-1" onClick={() => handleDeleteBranch(branch.branch_id)}><TrashIcon className="w-4 h-4" /></Button>
          </div>
        )} />
      </Card>
      {(showCreateForm || editingBranch) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowCreateForm(false); setEditingBranch(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-md mx-4 p-6">
            <h2 className="text-2xl font-bold text-yellow-900 mb-6">{editingBranch ? 'Edit Branch' : 'Create New Branch'}</h2>
            <form onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get('name') as string,
                location: formData.get('location') as string,
                manager: formData.get('manager') as string,
              };
              if (editingBranch) {
                handleUpdateBranch(editingBranch.branch_id, data);
              } else {
                handleCreateBranch(data);
              }
            }}>
              <div className="mb-4">
                <label className="block text-yellow-800 font-bold mb-2">Branch Name</label>
                <Input name="name" defaultValue={editingBranch?.name || ''} required className="w-full px-4 py-2 rounded border border-yellow-200" />
              </div>
              <div className="mb-4">
                <label className="block text-yellow-800 font-bold mb-2">Location</label>
                <Input name="location" defaultValue={editingBranch?.location || ''} className="w-full px-4 py-2 rounded border border-yellow-200" />
              </div>
              <div className="mb-4">
                <label className="block text-yellow-800 font-bold mb-2">Manager</label>
                <Input name="manager" defaultValue={editingBranch?.manager || ''} className="w-full px-4 py-2 rounded border border-yellow-200" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => { setShowCreateForm(false); setEditingBranch(null); }}>Cancel</Button>
                <Button type="submit" variant="primary">{editingBranch ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 