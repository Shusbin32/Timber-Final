"use client";
import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import React from "react";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Table from '@/components/Table';
import { fetchLeads, type Lead } from '@/api/leads';
import { format } from 'date-fns';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const leadsPerPage = 4;

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const leadsData = await fetchLeads();
        setLeads(leadsData);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load leads. Check your connection.");
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    loadLeads();
  }, []);

  const filteredLeads = leads.filter(l => {
    const searchLower = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(searchLower) ||
      l.contact.toLowerCase().includes(searchLower) ||
      (l.city && l.city.toLowerCase().includes(searchLower))
    );
  });

  const paginatedLeads = filteredLeads.slice((page - 1) * leadsPerPage, page * leadsPerPage);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  function handleExport() { alert('Exporting leads...'); }
  function handleImport() { alert('Importing leads...'); }
  function handleAddLead() { alert('Add Lead modal would open.'); }

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'lead_type', label: 'Category', render: (val: string) =>
        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">{val}</span>
    },
    { key: 'contact', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    {
      key: 'source', label: 'Source', render: (val: string) =>
        <span className="text-sm text-yellow-700 font-medium">{val}</span>
    },
    { key: 'assign_to', label: 'Owner' },
    {
      key: 'created_at', label: 'Date', render: (val: string) =>
        <span className="text-sm text-gray-500">{format(new Date(val), 'dd MMM yyyy')}</span>
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-yellow-800">Leads</h1>
            <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              {filteredLeads.length} total records
            </span>
            <Button variant="secondary" onClick={handleExport}>Export</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="text"
              placeholder="Search by name, phone, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 border border-yellow-200 bg-yellow-50 text-yellow-900 rounded text-sm w-60"
            />
            <Button variant="primary" onClick={handleAddLead}>
              <PlusIcon className="w-5 h-5 mr-1" /> Add Lead
            </Button>
            <Button variant="secondary" onClick={handleImport}>Import</Button>
          </div>
        </div>

        {/* Error State */}
        {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>}

        {/* Table */}
        <Card className="overflow-x-auto rounded-xl border border-yellow-100">
          <Table
            columns={columns as any} // Type assertion to bypass type error
            data={paginatedLeads}
            actions={() => (
              <Button variant="secondary" className="text-blue-600 hover:underline">View</Button>
            )}
          />
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 px-2 text-sm text-yellow-800">
          <span>Showing {(page - 1) * leadsPerPage + 1}–{Math.min(page * leadsPerPage, filteredLeads.length)} of {filteredLeads.length}</span>
          <div className="flex gap-1">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>&lt;</Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button key={i} variant={page === i + 1 ? 'primary' : 'secondary'} onClick={() => setPage(i + 1)}>{i + 1}</Button>
            ))}
            <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>&gt;</Button>
          </div>
        </div>

        {/* Empty State */}
        {!loading && filteredLeads.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-lg">
            No leads match your search.
          </div>
        )}
      </div>
    </div>
  );
}
