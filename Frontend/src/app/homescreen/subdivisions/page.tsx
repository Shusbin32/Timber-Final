"use client";
import { useState, useEffect, ReactNode, useCallback } from "react";
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Table from '@/components/Table';
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { fetchSubDivisions, createSubDivision, updateSubDivision as apiUpdateSubDivision, deleteSubDivision } from '@/api/subdivisions';
import { fetchDivisions, Division } from '@/api/divisions';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';

interface SubDivision extends Record<string, unknown> {
  id: string;
  name: string;
  division: string;
  division_id: string;
  description: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export default function SubDivisionsPage() {
  const [subDivisions, setSubDivisions] = useState<SubDivision[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSubDivision, setEditingSubDivision] = useState<SubDivision | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [formState, setFormState] = useState({ name: '', division: '' });

  // Remove divisions from dependencies here
  const loadSubDivisions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const backendData: unknown = await fetchSubDivisions();
      const array = Array.isArray(backendData)
        ? backendData
        : (backendData as Record<string, unknown>).data || [];
      const mapped: SubDivision[] = (array as Array<unknown>).map((item) => {
        const obj = item as Record<string, unknown>;
        let divisionName = '';
        // Prefer division_name from backend if present
        if (obj.division_name) {
          divisionName = String(obj.division_name);
        } else if (typeof obj.division === 'object' && obj.division !== null && 'name' in obj.division) {
          divisionName = String((obj.division as Record<string, unknown>).name);
        } else if (obj.division_id != null && Array.isArray(divisions)) {
          const found = divisions.find((d) => String(d.id) === String(obj.division_id));
          divisionName = found ? found.name : String(obj.division_name);
        } else {
          divisionName = obj.division_id == null ? '' : String(obj.division_id);
        }
        return {
          id: String(obj.subdivision_id ?? obj.id),
          name: String(obj.subdivision_name ?? obj.name ?? ''),
          division: divisionName,
          division_id: obj.division_id == null ? '' : String(obj.division_id),
          description: String(obj.description ?? ''),
          createdAt: String(obj.created_at ?? ''),
          status: 'active',
        };
      });
      setSubDivisions(mapped);
    } catch {
      setError('Failed to load subdivisions');
      setSubDivisions([]);
    } finally {
      setLoading(false);
    }
  }, [divisions]); // keep divisions here for mapping

  // Fetch divisions only once on mount
  useEffect(() => {
    fetchDivisions().then(setDivisions).catch(() => setDivisions([]));
  }, []);

  // Fetch subdivisions when divisions change
  useEffect(() => {
    loadSubDivisions();
  }, [loadSubDivisions]);

  useEffect(() => {
    if (editingSubDivision) {
      setFormState({
        name: editingSubDivision.name,
        division: editingSubDivision.division_id,
      });
    } else {
      setFormState({ name: '', division: '' });
    }
  }, [editingSubDivision]);

  const columns = [
    { key: 'name', label: 'Sub Division Name' },
    { key: 'division', label: 'Division' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const filteredSubDivisions = searchAndFilterItems(
    subDivisions,
    searchTerm,
    SEARCH_CONFIGS.subdivisions.searchFields as (keyof SubDivision)[],
    {}
  );
  console.log('Table data:', filteredSubDivisions);

  const handleCreateSubDivision = async (formData: { name: string; division: string }) => {
    try {
      await createSubDivision({
        name: formData.name,
        division: formData.division, // division_id
      });
      setShowCreateForm(false);
      await loadSubDivisions();
    } catch {
      setError('Failed to create subdivision');
    }
  };

  const handleUpdateSubDivision = async (formData: { name: string; division: string }) => {
    if (!editingSubDivision) return;
    try {
      // Always send both name and division_id
      const payload: Record<string, unknown> = {
        name: formData.name,
        division_id: formData.division,
      };
      await apiUpdateSubDivision(Number(editingSubDivision.id), payload);
      setEditingSubDivision(null);
      await loadSubDivisions();
    } catch {
      setError('Failed to update subdivision');
    }
  };

  const handleDeleteSubDivision = async (subDivisionId: string) => {
    try {
      await deleteSubDivision(Number(subDivisionId));
      await loadSubDivisions();
    } catch {
      setError('Failed to delete subdivision');
    }
  };

  const renderActions = (row: Record<string, unknown>): ReactNode => {
    const subDivision = row as SubDivision;
    return (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setEditingSubDivision(subDivision)}
          className="p-1"
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="danger"
          onClick={() => handleDeleteSubDivision(subDivision.id)}
          className="p-1"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    );
  };

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
            <h1 className="text-4xl font-extrabold text-yellow-900 mb-2">Sub Division Management</h1>
            <p className="text-yellow-700">Manage sub divisions within organizational divisions</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Sub Division
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search sub divisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary">Filter</Button>
          </div>
        </Card>

        {/* Sub Divisions Table */}
        <Card className="mb-6">
          <Table
            data={filteredSubDivisions as Record<string, unknown>[]}
            columns={columns.map(col => ({
              key: col.key,
              label: col.label,
              render: col.key === 'status' ? (value: unknown) => renderStatus(String(value)) : undefined
            }))}
            actions={renderActions}
          />
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateForm || editingSubDivision) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
              setShowCreateForm(false);
              setEditingSubDivision(null);
            }} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-md mx-4 p-6">
              <h2 className="text-2xl font-bold text-yellow-900 mb-6">
                {editingSubDivision ? 'Edit Sub Division' : 'Create New Sub Division'}
              </h2>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (editingSubDivision) {
                  await handleUpdateSubDivision(formState);
                } else {
                  await handleCreateSubDivision(formState);
                }
              }}>
                <div className="space-y-4">
                  <Input
                    label="Sub Division Name"
                    name="name"
                    value={formState.name}
                    onChange={e => setFormState(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Enter sub division name"
                    className="text-black"
                  />
                  {/* Division Dropdown */}
                  <label className="block text-sm font-medium text-black">Division</label>
                  <select
                    name="division"
                    value={formState.division}
                    onChange={e => setFormState(f => ({ ...f, division: e.target.value }))}
                    required
                    className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200 text-black"
                  >
                    <option value="" disabled>Select a division</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-6">
                  <Button type="submit" variant="primary" className="flex-1 text-black">
                    {editingSubDivision ? 'Update Sub Division' : 'Create Sub Division'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingSubDivision(null);
                    }}
                    className="flex-1 text-black"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {loading && <div className="text-yellow-700 mt-4">Loading...</div>}
        {error && <div className="text-red-600 bg-red-100 p-3 rounded mt-4">{error}</div>}
      </div>
    </div>
  );
}