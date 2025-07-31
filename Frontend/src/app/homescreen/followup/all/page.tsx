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
import { fetchFollowups, refreshFollowupData, Followup } from '@/api/followups';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';

// Type for a followup row in the table (flattened followup + lead info)
type FollowupTableRow = Followup & { lead_id: number; lead_name: string };
type FollowupRow = Followup | FollowupTableRow;

export default function AllFollowupsPage() {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<FollowupRow[]>([]);
  const [selectedLead, setSelectedLead] = useState<FollowupRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

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
      console.log('Loading all followups...');
      
      const raw = await fetchFollowups();
      console.log('Raw followup data:', raw);
      
      // Handle different data structures
      let data: FollowupRow[] = [];
      
      if (Array.isArray(raw)) {
        // If it's a direct array of followups
        data = raw.map((followup: Followup) => ({
          ...followup,
          lead_name: (followup as Followup & { name?: string }).name || `Lead ${followup.lead_id}`,
          name: (followup as Followup & { name?: string }).name || `Lead ${followup.lead_id}`,
        }));
      } else {
        // If it's an object with data property
        const response = raw as { data?: Followup[]; followups?: Followup[] };
        const followupsArray = response.data || response.followups || [];
        data = followupsArray.map((followup: Followup) => ({
          ...followup,
          lead_name: (followup as Followup & { name?: string }).name || `Lead ${followup.lead_id}`,
          name: (followup as Followup & { name?: string }).name || `Lead ${followup.lead_id}`,
        }));
      }
      
      console.log('Processed followups:', data);
      setLeads(data);
    } catch (error) {
      console.error('Error loading followups:', error);
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

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    // Clear cached data and reload
    if (typeof window !== 'undefined') {
      localStorage.removeItem("followups");
    }
    await loadFollowups();
  };

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
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h1 className="text-4xl font-extrabold text-yellow-900 tracking-tight">All Followups</h1>
        </div>
        
        {/* Dropdown and Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="w-64">
            <FollowupTypeDropdown
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              onRefresh={handleRefresh}
              showNavigation={true}
            />
          </div>
          <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-yellow-200 hover:bg-yellow-300">Export</Button>
          <span className="bg-yellow-100 px-4 py-2 rounded-full text-yellow-800 font-bold shadow border border-yellow-200">Total: {filteredLeads.length}</span>
          <Input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 rounded-full border border-yellow-200 text-base focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-yellow-50 text-yellow-900 shadow" />
          <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-yellow-200 hover:bg-yellow-300" onClick={handleRefresh}>Refresh</Button>
          <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-yellow-200 hover:bg-yellow-300">Import</Button>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-2 text-yellow-700">Loading followups...</p>
          </div>
        )}
        
        {/* Table Structure */}
        {!loading && (
          <Card className="overflow-x-auto rounded-2xl shadow-2xl border border-yellow-100 bg-white/90">
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
          <Card className="bg-green-100 rounded-2xl p-8 text-center font-extrabold text-green-800 shadow-md border border-green-200 text-lg md:text-xl">Today Followups</Card>
          <Card className="bg-blue-100 rounded-2xl p-8 text-center font-extrabold text-blue-800 shadow-md border border-blue-200 text-lg md:text-xl">Upcoming</Card>
          <Card className="bg-yellow-100 rounded-2xl p-8 text-center font-extrabold text-yellow-800 shadow-md border border-yellow-200 text-lg md:text-xl">Completed</Card>
        </div>
      </div>
    </div>
  );
} 