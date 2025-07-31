"use client";

import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Table from '@/components/Table';
import { PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import { toast } from 'react-toastify';
import { DealerService } from '@/api/dealers';
import Modal from '@/components/Modal';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';

interface Dealer {
  [key: string]: unknown;
  dealer_id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  landmark: string;
  state: string;
  pincode: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export default function DealerPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<Dealer>({
    dealer_id: '',
    name: '',
    email: '',
    contact: '',
    address: '',
    city: '',
    landmark: '',
    state: '',
    pincode: '',
    country: '',
    status: 'active',
  });
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState<Dealer | null>(null);

  const fetchDealers = useCallback(async () => {
    try {
      const res = await DealerService.getAll(); // returns data (array)
      if (Array.isArray(res)) {
        setDealers(res.map((dealer) => ({
          ...dealer,
          dealer_id: String(dealer.dealer_id ?? ''),
          name: dealer.name ?? '',
          email: dealer.email ?? '',
          contact: dealer.contact ?? '',
          address: dealer.address ?? '',
          city: dealer.city ?? '',
          landmark: dealer.landmark ?? '',
          state: dealer.state ?? '',
          pincode: dealer.pincode ?? '',
          country: dealer.country ?? '',
          status: dealer.status ?? 'active',
          createdAt: dealer.createdAt ?? '',
        })));
      } else if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as { data: Dealer[] }).data)) {
        setDealers((res as { data: Dealer[] }).data.map((dealer) => ({
          ...dealer,
          dealer_id: String(dealer.dealer_id ?? ''),
          name: dealer.name ?? '',
          email: dealer.email ?? '',
          contact: dealer.contact ?? '',
          address: dealer.address ?? '',
          city: dealer.city ?? '',
          landmark: dealer.landmark ?? '',
          state: dealer.state ?? '',
          pincode: dealer.pincode ?? '',
          country: dealer.country ?? '',
          status: dealer.status ?? 'active',
          createdAt: dealer.createdAt ?? '',
        })));
      } else {
        setDealers([]);
      }
    } catch {
      toast.error('Failed to fetch dealers');
    }
  }, []);
  

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  const mainColumns = [
    { key: 'dealer_id', label: 'Dealer ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'contact', label: 'Contact' },
    { key: 'actions', label: 'Actions' },
  ];

  const allColumns = [
    { key: 'dealer_id', label: 'Dealer ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'contact', label: 'Contact' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'landmark', label: 'Landmark' },
    { key: 'state', label: 'State' },
    { key: 'pincode', label: 'Pincode' },
    { key: 'country', label: 'Country' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const filteredDealers = searchAndFilterItems(
    dealers,
    searchTerm,
    SEARCH_CONFIGS.dealers.searchFields as (keyof Dealer)[],
    {}
  );

  const handleOpenCreate = () => {
    setEditingDealer(null);
    setForm({
      dealer_id: '',
      name: '',
      email: '',
      contact: '',
      address: '',
      city: '',
      landmark: '',
      state: '',
      pincode: '',
      country: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (dealer: Dealer) => {
    setEditingDealer(dealer);
    setForm({
      ...dealer,
      dealer_id: String(dealer.dealer_id ?? ''),
      name: dealer.name ?? '',
      email: dealer.email ?? '',
      contact: dealer.contact ?? '',
      address: dealer.address ?? '',
      city: dealer.city ?? '',
      landmark: dealer.landmark ?? '',
      state: dealer.state ?? '',
      pincode: dealer.pincode ?? '',
      country: dealer.country ?? '',
      status: dealer.status ?? 'active',
      createdAt: dealer.createdAt ?? '',
    });
    setShowModal(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Remove dealer_id required check for creation
    if (!editingDealer && form.dealer_id && form.dealer_id.trim() !== '') {
      // If editing, dealer_id is required, but not for creation
      // (No check needed for creation)
    }
    // Check for duplicate dealer_id on creation (skip if auto-generated)
    // if (!editingDealer && dealers.some(d => String(d.dealer_id) === String(form.dealer_id))) {
    //   toast.error('Dealer ID already exists. Please use a unique Dealer ID.');
    //   return;
    // }
    try {
      if (editingDealer) {
        await DealerService.update(String(form.dealer_id).trim(), { ...form, dealer_id: String(form.dealer_id).trim() });
        toast.success('Dealer updated successfully');
        setShowModal(false);
        fetchDealers();
      } else {
        const { dealer_id: _dealer_id, ...payload } = form; // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log('Creating dealer with payload:', payload);
        try {
          await DealerService.create(payload);
          toast.success('Dealer created successfully');
          setShowModal(false);
          fetchDealers();
        } catch (err: unknown) {
          console.error('Dealer creation error:', err);
          toast.error('Failed to create dealer. ' + (err instanceof Error ? err.message : ''));
        }
      }
    } catch {
      toast.error('Failed to save dealer');
    }
  };

  const handleDeleteDealer = (dealer: Dealer) => {
    setDealerToDelete(dealer);
  };

  const confirmDeleteDealer = async () => {
    if (!dealerToDelete) return;
    console.log('Deleting dealer with dealer_id:', dealerToDelete.dealer_id);
    if (!dealerToDelete.dealer_id) {
      toast.error('Dealer ID is missing. Cannot delete.');
      setDealerToDelete(null);
      return;
    }
    try {
      await DealerService.delete(String(dealerToDelete.dealer_id));
      toast.success('Dealer deleted successfully');
      fetchDealers();
    } catch (err: unknown) {
      console.error('Delete dealer error:', err);
      let errorMsg = 'Failed to delete dealer';
      
      // Type guard for error with response property
      if (err && typeof err === 'object' && 'response' in err) {
        const errorWithResponse = err as { response?: { data?: unknown } };
        if (errorWithResponse.response?.data) {
          console.log('Backend error data:', errorWithResponse.response.data);
          
          if (typeof errorWithResponse.response.data === 'object' && errorWithResponse.response.data && 'message' in errorWithResponse.response.data) {
            errorMsg = String((errorWithResponse.response.data as { message: unknown }).message);
          } else if (typeof errorWithResponse.response.data === 'string') {
            try {
              const parsed = JSON.parse(errorWithResponse.response.data);
              if (parsed.message) errorMsg = parsed.message;
            } catch {
              errorMsg = errorWithResponse.response.data;
            }
          } else {
            errorMsg = JSON.stringify(errorWithResponse.response.data);
          }
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = String((err as { message: unknown }).message);
      }
      
      toast.error(errorMsg);
      // Delay modal close to ensure toast is visible
      setTimeout(() => setDealerToDelete(null), 2000);
      return;
    }
    setDealerToDelete(null);
  };

  const cancelDeleteDealer = () => {
    setDealerToDelete(null);
  };

  const renderActions = (dealer: Dealer) => (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={() => handleOpenEdit(dealer)}
        className="p-1"
      >
        <PencilIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="danger"
        onClick={() => handleDeleteDealer(dealer)}
        className="p-1"
      >
        <span className="text-lg font-bold">&times;</span>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-yellow-900 mb-2">Dealer Management</h1>
            <p className="text-yellow-700">Manage system dealers and their details</p>
          </div>
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Dealer
          </Button>
        </div>

        <Card className="mb-6 p-4">
          <div className="flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search dealers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary">Filter</Button>
          </div>
        </Card>

        <Card className="mb-6">
          <Table
            data={filteredDealers as unknown as Record<string, unknown>[]}
            columns={(showAllColumns ? allColumns : mainColumns).map(col => ({ key: col.key, label: col.label }))}
            actions={(row) => renderActions(row as unknown as Dealer)}
          />
          <div className="flex justify-end mt-2">
            <Button variant="secondary" onClick={() => setShowAllColumns(v => !v)}>
              {showAllColumns ? 'Show Less' : 'View All'}
            </Button>
          </div>
        </Card>
        {/* Delete Confirmation Modal */}
        {dealerToDelete && (
          <Modal open={true} onClose={cancelDeleteDealer} title="Confirm Delete">
            <div className="flex flex-col gap-4">
              <span className="text-black">Are you sure you want to delete dealer <b>{dealerToDelete.name}</b>?</span>
              <div className="flex gap-4 justify-end">
                <Button variant="danger" onClick={confirmDeleteDealer}>OK</Button>
                <Button variant="secondary" onClick={cancelDeleteDealer}>No</Button>
              </div>
            </div>
          </Modal>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-yellow-900 mb-6">
                {editingDealer ? 'Edit Dealer' : 'Create New Dealer'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Name" name="name" value={form.name} onChange={handleChange} required placeholder="Enter name" className="placeholder-black text-black border-black" />
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Enter email address" className="placeholder-black text-black border-black" />
                <Input label="Contact" name="contact" value={form.contact} onChange={handleChange} required placeholder="Enter contact number" className="placeholder-black text-black border-black" />
                <Input label="Address" name="address" value={form.address} onChange={handleChange} required placeholder="Enter address" className="placeholder-black text-black border-black" />
                <Input label="City" name="city" value={form.city} onChange={handleChange} required placeholder="Enter city" className="placeholder-black text-black border-black" />
                <Input label="Landmark" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Enter landmark" className="placeholder-black text-black border-black" />
                <Input label="State" name="state" value={form.state} onChange={handleChange} required placeholder="Enter state" className="placeholder-black text-black border-black" />
                <Input label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} required placeholder="Enter pincode" className="placeholder-black text-black border-black" />
                <Input label="Country" name="country" value={form.country} onChange={handleChange} required placeholder="Enter country" className="placeholder-black text-black border-black" />
                <div>
                  <label className="block font-medium mb-1 text-black">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-black rounded px-3 py-2 text-black bg-white placeholder-black focus:ring-2 focus:ring-yellow-300"
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-6">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingDealer ? 'Update Dealer' : 'Create Dealer'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
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
