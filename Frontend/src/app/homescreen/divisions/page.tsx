"use client";
import { useState, useEffect } from "react";
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Table from '@/components/Table';
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { fetchDivisions, createDivision, updateDivision, deleteDivision, type Division } from '@/api/divisions';
import { toast } from 'react-toastify';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';

export default function DivisionsPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    try {
      const data = await fetchDivisions();
      if (Array.isArray(data)) {
        setDivisions(data);
      } else {
        console.error('Invalid divisions data:', data);
        setDivisions([]);
      }
    } catch (error) {
      console.error('Error loading divisions:', error);
      toast.error('Failed to load divisions');
      setDivisions([]);
    }
  };

  const columns = [
    { key: 'name', label: 'Division Name' },
    { key: 'createdAt', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const filteredDivisions = searchAndFilterItems(
    divisions,
    searchTerm,
    SEARCH_CONFIGS.divisions.searchFields as (keyof Division)[],
    {}
  );

  const handleCreateDivision = async (formData: { name: string }) => {
    try {
      await createDivision(formData);
      await loadDivisions(); // Always reload from backend
      setShowCreateForm(false);
      toast.success('Division created successfully!');
    } catch (error) {
      console.error('Error creating division:', error);
      toast.error('Failed to create division');
    }
  };

  const handleUpdateDivision = async (formData: { name: string }) => {
    if (!editingDivision) return;
    
    try {
      const divisionId = editingDivision.id || editingDivision.pk || editingDivision.division_id;
      console.log('Updating division with ID:', divisionId);
      console.log('Editing division object:', editingDivision);
      
      if (typeof divisionId !== 'number') {
        throw new Error('Invalid division ID for update');
      }
      
      await updateDivision(divisionId, formData);
      await loadDivisions(); // Always reload from backend
      setEditingDivision(null);
      toast.success('Division updated successfully!');
    } catch (error) {
      console.error('Error updating division:', error);
      toast.error('Failed to update division');
    }
  };

  const handleDeleteDivision = async (divisionId: number) => {
    try {
      await deleteDivision(divisionId);
      await loadDivisions(); // Always reload from backend
      toast.success('Division deleted successfully!');
    } catch (error) {
      console.error('Error deleting division:', error);
      toast.error('Failed to delete division');
    }
  };

  const renderActions = (division: Record<string, unknown>) => (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={() => setEditingDivision(division as Division)}
        className="p-1"
      >
        <PencilIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="danger"
        onClick={() => {
          // Try id first, then pk, then division_id, then log error
          const id = division.id || division.pk || division.division_id;
          if (typeof id === 'number') {
            handleDeleteDivision(id);
          } else {
            console.error('Invalid division ID:', id);
            console.error('Division object:', division);
          }
        }}
        className="p-1"
      >
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );

  const renderStatus = (status: unknown) => {
    const statusStr = String(status || 'inactive');
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusStr === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {statusStr}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-yellow-900 mb-2">Division Management</h1>
            <p className="text-yellow-700">Manage organizational divisions and departments</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Division
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search divisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary">Filter</Button>
          </div>
        </Card>

        {/* Divisions Table */}
        <Card className="mb-6">
          <Table
            data={filteredDivisions}
            columns={columns.map(col => ({
              key: col.key,
              label: col.label,
              render: col.key === 'status' ? (value: unknown) => renderStatus(String(value)) : undefined
            }))}
            actions={renderActions}
          />
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateForm || editingDivision) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowCreateForm(false);
              setEditingDivision(null);
            }} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-md mx-4 p-6">
              <h2 className="text-2xl font-bold text-yellow-900 mb-6">
                {editingDivision ? 'Edit Division' : 'Create New Division'}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                try {
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('name') as string;
                  
                  if (!name || name.trim() === '') {
                    toast.error('Division name is required');
                    return;
                  }
                  
                  const data = {
                    name: name.trim()
                  };
                  
                  if (editingDivision) {
                    handleUpdateDivision(data);
                  } else {
                    handleCreateDivision(data);
                  }
                } catch (error) {
                  console.error('Error submitting form:', error);
                  toast.error('Failed to submit form');
                }
              }}>
                <div className="space-y-4">
                  <Input
                    label="Division Name"
                    name="name"
                    defaultValue={editingDivision?.name}
                    required
                    placeholder="Enter division name"
                  />
                </div>
                
                <div className="flex gap-3 pt-6">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingDivision ? 'Update Division' : 'Create Division'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingDivision(null);
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