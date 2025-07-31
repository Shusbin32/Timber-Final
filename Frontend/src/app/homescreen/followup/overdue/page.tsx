"use client";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Table from '@/components/Table';
import QuickFollowupDrawer from '@/components/QuickFollowupDrawer';
import FollowupTypeDropdown from '@/components/FollowupTypeDropdown';
import ExpandableData from '@/components/ExpandableData';
import { refreshFollowupData, Followup, fetchUserOverdueFollowup } from '@/api/followups';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';

// Type for a followup row in the table (flattened followup + lead info)
type FollowupTableRow = Followup & { lead_id: number; lead_name: string };
type FollowupRow = Followup | FollowupTableRow;

// Type for a lead as returned by the API (with nested followup)
type LeadWithFollowupApi = {
  lead_id: number;
  name: string;
  followup?: { all?: Followup[] };
  followups?: Followup[];
  // ...other fields
};

export default function OverdueFollowupsPage() {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<FollowupRow[]>([]);
  const [selectedLead, setSelectedLead] = useState<FollowupRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('overdue');

  // Apply search and filtering to the leads data
  const filteredLeads = searchAndFilterItems(
    leads,
    search,
    SEARCH_CONFIGS.followups.searchFields as (keyof FollowupRow)[],
    {}
  );

  const loadFollowups = useCallback(async () => {
    try {
      setLoading(true);
      let data: FollowupRow[] = [];

      const leadsWithFollowups: LeadWithFollowupApi[] = await fetchUserOverdueFollowup({});
      console.log('Raw overdue API response:', leadsWithFollowups);
      
      data = leadsWithFollowups.flatMap(lead => {
        // Handle different possible data structures
        const followups = lead.followup?.all || lead.followups || [];
        console.log(`Lead ${lead.lead_id} followups:`, followups);
        
        return followups.map((f: Followup) => ({
          ...f,
          lead_id: lead.lead_id,
          lead_name: lead.name,
          name: lead.name,
        }));
      });
      
      console.log('Overdue followups:', data);
      setLeads(data);
    } catch (error) {
      console.error('Error loading overdue followups:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear cached data on page load to ensure fresh data
    if (typeof window !== 'undefined') {
      localStorage.removeItem("followups");
    }
    loadFollowups();
  }, [loadFollowups]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'followup_date', label: 'Followup Date' },
    { key: 'followup_type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'assign_to', label: 'Assigned To' },
    { 
      key: 'followup_remarks', 
      label: 'Remarks',
      render: (value: unknown) => value ? <ExpandableData data={value} label="Remarks" /> : '—'
    },
    { key: 'actions', label: 'Actions' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h1 className="text-4xl font-extrabold text-red-900 tracking-tight">Overdue Followups</h1>
        </div>
        
        {/* Dropdown and Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="w-64">
            <FollowupTypeDropdown
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              onRefresh={async () => {
                console.log('Manual refresh triggered');
                // Clear cached data and reload
                if (typeof window !== 'undefined') {
                  localStorage.removeItem("followups");
                }
                await loadFollowups();
              }}
              showNavigation={true}
            />
          </div>
          <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-red-200 hover:bg-red-300">Export</Button>
          <span className="bg-red-100 px-4 py-2 rounded-full text-red-800 font-bold shadow border border-red-200">Total: {filteredLeads.length}</span>
          <Input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 rounded-full border border-red-200 text-base focus:outline-none focus:ring-2 focus:ring-red-200 bg-red-50 text-red-900 shadow" />
          <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-red-200 hover:bg-red-300" onClick={async () => {
            console.log('Manual refresh triggered');
            // Clear cached data and reload
            if (typeof window !== 'undefined') {
              localStorage.removeItem("followups");
            }
            await loadFollowups();
          }}>Refresh</Button>
          <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-red-200 hover:bg-red-300">Import</Button>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="mt-2 text-red-700">Loading overdue followups...</p>
          </div>
        )}
        
        {/* Table Structure */}
        {!loading && (
          <Card className="overflow-x-auto rounded-2xl shadow-2xl border border-red-100 bg-white/90">
            <Table columns={columns} data={filteredLeads} actions={(row: FollowupRow) => (
              <Button variant="primary" className="rounded-full px-4 py-1" onClick={() => { setSelectedLead(row); setDrawerOpen(true); }}>View</Button>
            )} />
            <QuickFollowupDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              followup={selectedLead}
            onUpdate={async (updated: FollowupRow) => {
              console.log('Received updated followup:', updated);
              
              // Update the selected lead with the updated data
              setSelectedLead(updated);
              
              // Update the leads array with the updated followup data
              setLeads(prev => {
                console.log('Previous leads count:', prev.length);
                console.log('Looking for followup to update:', updated);
                
                let foundAndUpdated = false;
                
                // Find and update the specific followup entry
                const updatedLeads = prev.map(l => {
                  // First try to match by ID if available
                  if (l && 'id' in l && 'id' in updated && l.id === updated.id) {
                    const mergedData = { ...l, ...updated };
                    console.log('Updated followup by ID', l.id, ':', mergedData);
                    foundAndUpdated = true;
                    return mergedData;
                  }
                  
                  // Fallback: Check if this is the same followup by comparing lead_id and other unique identifiers
                  if (l && 'lead_id' in l && 'lead_id' in updated && l.lead_id === updated.lead_id) {
                    // Create a unique identifier using multiple fields to ensure we update the correct followup
                    const originalKey = `${l.lead_id}-${l.followup_date}-${l.followup_type}-${l.followup_remarks || l.notes || ''}`;
                    const updatedKey = `${updated.lead_id}-${updated.followup_date}-${updated.followup_type}-${updated.followup_remarks || updated.notes || ''}`;
                    
                    console.log('Comparing keys:', { originalKey, updatedKey, isMatch: originalKey === updatedKey });
                    
                    // Match by the unique key (excluding followup_type since that's what we're updating)
                    const isSameFollowup = originalKey === updatedKey;
                    
                    if (isSameFollowup) {
                      // Merge the original data with the updated data to preserve all fields
                      const mergedData = { ...l, ...updated };
                      console.log('Updated followup for lead_id', l.lead_id, ':', mergedData);
                      foundAndUpdated = true;
                      return mergedData;
                    }
                  }
                  return l;
                });
                
                if (!foundAndUpdated) {
                  console.log('WARNING: No matching followup found to update!');
                  console.log('Available followups:', prev.map(l => ({
                    id: l.id,
                    lead_id: l.lead_id,
                    followup_date: l.followup_date,
                    followup_type: l.followup_type,
                    followup_remarks: l.followup_remarks,
                    notes: l.notes
                  })));
                }
                
                // Improved deduplication logic to prevent duplicates after updates
                const uniqueUpdatedLeads = updatedLeads.filter((followup, index, self) => {
                  // Create a unique key for each followup
                  const key = followup.id 
                    ? `id-${followup.id}` 
                    : `${followup.lead_id}-${followup.followup_date}-${followup.followup_type}-${followup.followup_remarks || followup.notes || ''}`;
                  
                  // Check if this is the first occurrence of this key
                  const isFirstOccurrence = index === self.findIndex(f => {
                    const fKey = f.id 
                      ? `id-${f.id}` 
                      : `${f.lead_id}-${f.followup_date}-${f.followup_type}-${f.followup_remarks || f.notes || ''}`;
                    return fKey === key;
                  });
                  
                  if (!isFirstOccurrence) {
                    console.log('Removing duplicate followup after update:', followup);
                  }
                  
                  return isFirstOccurrence;
                });
                
                console.log('Updated leads count:', uniqueUpdatedLeads.length);
                return uniqueUpdatedLeads;
              });
              
              // Refresh the followup data to ensure persistence across page reloads
              try {
                await refreshFollowupData();
                console.log('Followup data refreshed after update');
              } catch (error) {
                console.warn('Failed to refresh followup data:', error);
              }
            }}
          />
        </Card>
        )}
        
        {/* Action/Summary Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <Card className="bg-red-100 rounded-2xl p-8 text-center font-extrabold text-red-800 shadow-md border border-red-200 text-lg md:text-xl">Overdue Count</Card>
          <Card className="bg-orange-100 rounded-2xl p-8 text-center font-extrabold text-orange-800 shadow-md border border-orange-200 text-lg md:text-xl">Critical</Card>
          <Card className="bg-yellow-100 rounded-2xl p-8 text-center font-extrabold text-yellow-800 shadow-md border border-yellow-200 text-lg md:text-xl">Needs Attention</Card>
        </div>
      </div>
    </div>
  );
} 