"use client";
import React, { useEffect, useState } from "react";
import { fetchIsCustomerLeads } from "@/api/leads";
import Avatar from "@/components/Avatar";
import { Lead } from "@/api/leads";

export default function CustomersPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchIsCustomerLeads()
      .then(setLeads)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-yellow-900 mb-8 tracking-tight">Customer Leads</h1>
        {loading && <div className="mb-4 text-yellow-700">Loading...</div>}
        {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>}
        <div className="shadow-xl rounded-3xl bg-white/95 border border-yellow-200 overflow-x-auto">
          <table className="min-w-full rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-yellow-100 text-yellow-900 font-bold sticky top-0 z-10">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Lead Type</th>
                <th className="px-4 py-3 text-left">Remarks User</th>
                <th className="px-4 py-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.lead_id} className="even:bg-yellow-50 hover:bg-yellow-100 transition">
                  <td className="px-4 py-3 text-black truncate">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        name={lead.name} 
                        size="sm" 
                        showTooltip={true}
                      />
                      <span className="truncate">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-black truncate">{lead.contact}</td>
                  <td className="px-4 py-3 text-black truncate">{lead.email}</td>
                  <td className="px-4 py-3 text-black truncate">{lead.lead_type}</td>
                  <td className="px-4 py-3 text-black truncate">{(lead as any).remarks_detail?.user || "—"}</td>
                  <td className="px-4 py-3 text-black truncate">{(lead as any).remarks_detail?.remarks || "—"}</td>
                </tr>
              ))}
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No customer leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 