"use client";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Table from '@/components/Table';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import QuickFollowupDrawer from '@/components/QuickFollowupDrawer';
import { useSearchParams } from 'next/navigation';
import { fetchFollowups, refreshFollowupData, Followup, fetchUserCompletedFollowup, fetchUserPendingFollowup, fetchUserOverdueFollowup } from '@/api/followups';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';

// Type for a followup row in the table (flattened followup + lead info)
type FollowupTableRow = Followup & { lead_id: number; lead_name: string };
type FollowupRow = Followup | FollowupTableRow;

// Type for a lead as returned by the API (with nested followup)
type LeadWithFollowupApi = {
  lead_id: number;
  name: string;
  followup?: { all?: Followup[] };
  // ...other fields
};

export default function FollowupPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  // Filter state
  const [filterDate, setFilterDate] = useState('any');
  const [filterStatus, setFilterStatus] = useState('any');
  const [filterAssigned, setFilterAssigned] = useState('any');
  const [filterType, setFilterType] = useState('any');
  // Example users list (replace with real data if available)
  const users = [
    { id: 'any', name: 'Any' },
    { id: '1', name: 'SONU' },
    { id: '2', name: 'MAMTA' },
    { id: '3', name: 'ALISHA' },
    { id: '4', name: 'NISHA' },
    // ...add more users as needed
  ];
  const followupTypes = [
    { value: 'any', label: 'Any' },
    { value: 'General', label: 'General' },
    { value: 'Payment', label: 'Payment' },
    { value: 'AFTER VISIT followup', label: 'AFTER VISIT followup' },
    { value: 'BEFORE VISIT FOLLOW-UP', label: 'BEFORE VISIT FOLLOW-UP' },
    { value: 'RAW DATA FOLLOW-UP', label: 'RAW DATA FOLLOW-UP' },
  ];
  const [leads, setLeads] = useState<FollowupRow[]>([]);
  const [selectedLead, setSelectedLead] = useState<FollowupRow | null>(null);

  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  // Apply search and filtering to the leads data
  const filteredLeads = React.useMemo(() => {
    let filtered = searchAndFilterItems(
      leads,
      search,
      SEARCH_CONFIGS.followups.searchFields as (keyof FollowupRow)[],
      {}
    );

    // Apply date filter
    if (filterDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(lead => {
        const followupDate = lead.followup_date || lead.tentetive_visit_date;
        return followupDate && typeof followupDate === 'string' && followupDate.startsWith(today);
      });
    }

    // Apply status filter
    if (filterStatus !== 'any') {
      filtered = filtered.filter(lead => {
        if (filterStatus === 'overdue-upcoming') {
          return lead.status === 'overdue' || lead.status === 'upcoming';
        }
        return lead.status === filterStatus || lead.followup_type === filterStatus;
      });
    }

    // Apply assigned filter
    if (filterAssigned !== 'any') {
      filtered = filtered.filter(lead => lead.assign_to === filterAssigned);
    }

    // Apply type filter
    if (filterType !== 'any') {
      filtered = filtered.filter(lead => lead.followup_type === filterType);
    }

    return filtered;
  }, [leads, search, filterDate, filterStatus, filterAssigned, filterType]);

  const loadFollowups = useCallback(async () => {
    try {
      let data: FollowupRow[] = [];

      // Build filters for API
      const filters: Record<string, string | number | undefined> = {};
      if (search) filters.name = search;
      if (filterAssigned && filterAssigned !== 'any') filters.assign_to = filterAssigned;
      // Add more filters as needed (city, division_id, etc)

      if (type === 'completed') {
        const leadsWithFollowups: LeadWithFollowupApi[] = await fetchUserCompletedFollowup(filters);
        data = leadsWithFollowups.flatMap(lead =>
          (lead.followup?.all || []).map(f => ({
            ...f,
            lead_id: lead.lead_id,
            lead_name: lead.name,
            name: lead.name,
          }))
        ).filter((f) => f.followup_type === 'completed');
      } else if (type === 'overdue') {
        const leadsWithFollowups: LeadWithFollowupApi[] = await fetchUserOverdueFollowup(filters);
        data = leadsWithFollowups.flatMap(lead =>
          (lead.followup?.all || []).map(f => ({
            ...f,
            lead_id: lead.lead_id,
            lead_name: lead.name,
            name: lead.name,
          }))
        ).filter((f) => f.followup_type === 'overdue');
      } else if (type === 'pending') {
        const leadsWithFollowups: LeadWithFollowupApi[] = await fetchUserPendingFollowup(filters);
        data = leadsWithFollowups.flatMap(lead =>
          (lead.followup?.all || []).map(f => ({
            ...f,
            lead_id: lead.lead_id,
            lead_name: lead.name,
            name: lead.name,
          }))
        ).filter((f) => f.followup_type === 'pending');
      } else {
        // For "all" followups, only show leads that are completed
        const raw = await fetchFollowups();
        let allLeads: LeadWithFollowupApi[];
        
        // Handle the case where fetchFollowups returns Followup[] (which doesn't have name property)
        if (Array.isArray(raw) && raw.length > 0) {
          // Check if the first item has a followup property (indicating LeadWithFollowupApi structure)
          const firstItem = raw[0];
          if (typeof firstItem === 'object' && firstItem !== null && 'followup' in firstItem) {
            allLeads = raw as unknown as LeadWithFollowupApi[];
          } else {
            // Convert Followup[] to LeadWithFollowupApi[] structure
            allLeads = raw.map((f: Followup) => ({
              lead_id: f.lead_id,
              name: '', // Followup doesn't have name, we'll need to get it from lead data
              followup: { all: [f] },
            }));
          }
        } else {
          allLeads = [];
        }
        
        // Only include leads that are completed (have followup_type === 'completed')
        data = allLeads.flatMap(lead =>
          (lead.followup?.all || []).map(f => ({
            ...f,
            lead_id: lead.lead_id,
            lead_name: lead.name,
            name: lead.name,
          }))
        ).filter((f) => f.followup_type === 'completed');
      }
      
              console.log('Flattened followups:', data);
        console.log('Sample followup structure:', data.length > 0 ? data[0] : 'No data');
        console.log('Raw data count:', data.length);
        
      // Improved deduplication logic
        const uniqueFollowups = data.filter((followup, index, self) => {
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
            console.log('Removing duplicate followup:', followup);
          }
          
        return isFirstOccurrence;
        });
        
        console.log('Unique followups count:', uniqueFollowups.length);
        console.log('Removed duplicates:', data.length - uniqueFollowups.length);
        setLeads(uniqueFollowups);
    } catch (error) {
      console.error('Error loading followups:', error);
      setLeads([]);
    }
  }, [type, filterAssigned, search]);

  useEffect(() => {
    // Clear cached data on page load to ensure fresh data
    if (typeof window !== 'undefined') {
      localStorage.removeItem("followups");
    }
    loadFollowups();
  }, [loadFollowups]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns = [
    { key: 'name' as keyof Followup, label: 'Name' },
    { key: 'followup_type' as keyof Followup, label: 'Followup Type' },
    { key: 'status' as keyof Followup, label: 'Status' },
    { key: 'assign_to' as keyof Followup, label: 'Owner' },
    { key: 'tentetive_visit_date' as keyof Followup, label: 'Date' },
    { key: 'remarks' as keyof Followup, label: 'Notes' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-0 flex">
      {/* Sidebar Filters (show only if showFilters is true) */}
      {showFilters && (
        <aside className="w-56 p-0 flex flex-col z-30">
          <div className="m-2 animate-filter-panel rounded-3xl shadow-2xl border border-yellow-300 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 relative" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.12)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-2xl text-yellow-900 flex items-center gap-3 tracking-tight drop-shadow-lg">
                <FunnelIcon className="w-7 h-7 text-yellow-500 drop-shadow" /> Filters
              </h3>
              <button
                className="text-yellow-700 hover:text-white hover:bg-red-500 text-2xl font-bold focus:outline-none bg-yellow-100 hover:bg-red-500 rounded-full p-2 shadow border border-yellow-300 transition-all duration-200"
                onClick={() => setShowFilters(false)}
                aria-label="Close filter sidebar"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <button
              className="mb-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-500 hover:to-yellow-400 text-yellow-900 font-extrabold py-2 px-4 rounded-2xl border-2 border-yellow-400 shadow-xl text-base tracking-wide transition-all duration-200 active:scale-95"
              onClick={() => {
                setFilterDate('any');
                setFilterStatus('any');
                setFilterAssigned('any');
                setFilterType('any');
              }}
            >
              Reset Filters
            </button>
            <div className="mb-5 p-4 rounded-2xl bg-white/60 border border-yellow-100 shadow-lg backdrop-blur-md">
              <div className="font-extrabold text-yellow-800 mb-3 text-lg tracking-tight">Followup Date</div>
              <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-yellow-200 rounded-lg px-2 py-2 transition text-black font-medium">
                <input type="radio" name="date" value="any" checked={filterDate === 'any'} onChange={() => setFilterDate('any')} className="accent-yellow-600 scale-110" /> Any
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-yellow-200 rounded-lg px-2 py-2 transition text-black font-medium">
                <input type="radio" name="date" value="today" checked={filterDate === 'today'} onChange={() => setFilterDate('today')} className="accent-yellow-600 scale-110" /> Today
              </label>
            </div>
            <div className="mb-5 p-4 rounded-2xl bg-white/60 border border-yellow-100 shadow-lg backdrop-blur-md">
              <div className="font-extrabold text-yellow-800 mb-3 text-lg tracking-tight">Status</div>
              <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-yellow-200 rounded-lg px-2 py-2 transition text-black font-medium">
                <input type="radio" name="status" value="any" checked={filterStatus === 'any'} onChange={() => setFilterStatus('any')} className="accent-yellow-600 scale-110" /> Any
              </label>
              <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-yellow-200 rounded-lg px-2 py-2 transition text-black font-medium">
                <input type="radio" name="status" value="overdue-upcoming" checked={filterStatus === 'overdue-upcoming'} onChange={() => setFilterStatus('overdue-upcoming')} className="accent-yellow-600 scale-110" /> Overdue & Upcoming
              </label>
              <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-yellow-200 rounded-lg px-2 py-2 transition text-black font-medium">
                <input type="radio" name="status" value="overdue" checked={filterStatus === 'overdue'} onChange={() => setFilterStatus('overdue')} className="accent-yellow-600 scale-110" /> Overdue
              </label>
              <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-yellow-200 rounded-lg px-2 py-2 transition text-black font-medium">
                <input type="radio" name="status" value="upcoming" checked={filterStatus === 'upcoming'} onChange={() => setFilterStatus('upcoming')} className="accent-yellow-600 scale-110" /> Upcoming
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-yellow-200 rounded-lg px-2 py-2 transition text-black font-medium">
                <input type="radio" name="status" value="completed" checked={filterStatus === 'completed'} onChange={() => setFilterStatus('completed')} className="accent-yellow-600 scale-110" /> Completed
              </label>
            </div>
            <div className="mb-5 p-4 rounded-2xl bg-white/60 border border-yellow-100 shadow-lg backdrop-blur-md">
              <div className="font-extrabold text-yellow-800 mb-3 text-lg tracking-tight">Assigned to</div>
              <select
                className="w-full rounded-xl border-2 border-yellow-200 py-2 px-3 text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-200 font-semibold shadow-lg hover:border-yellow-400 transition-all duration-200"
                value={filterAssigned}
                onChange={e => setFilterAssigned(e.target.value)}
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-2 p-4 rounded-2xl bg-white/60 border border-yellow-100 shadow-lg backdrop-blur-md">
              <div className="font-extrabold text-yellow-800 mb-3 text-lg tracking-tight">Followup type</div>
              {followupTypes.map(type => (
                <label key={type.value} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-yellow-200 rounded-lg px-2 py-2 transition text-black font-medium">
                  <input type="radio" name="type" value={type.value} checked={filterType === type.value} onChange={() => setFilterType(type.value)} className="accent-yellow-600 scale-110" /> {type.label}
                </label>
              ))}
            </div>
            <style jsx>{`
              @keyframes filter-panel {
                0% { transform: translateX(-40px) scale(0.98); opacity: 0.2; }
                80% { transform: translateX(6px) scale(1.03); opacity: 1; }
                100% { transform: translateX(0) scale(1); opacity: 1; }
              }
              .animate-filter-panel {
                animation: filter-panel 0.5s cubic-bezier(0.4,0,0.2,1);
              }
            `}</style>
          </div>
      </aside>
      )}
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header/Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl font-extrabold text-yellow-900 tracking-tight drop-shadow-sm">Followups Dashboard</h1>
            <Button
              variant="gradient"
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 px-5 py-2 rounded-full shadow-lg border border-yellow-200 hover:scale-105 transition"
              title="Show filters"
            >
              <FunnelIcon className="w-5 h-5" /> Filter
            </Button>
            <span className="bg-yellow-100 px-4 py-2 rounded-full text-yellow-800 font-bold shadow border border-yellow-200">Total: {filteredLeads.length}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-yellow-200 hover:bg-yellow-300">Export</Button>
            <Input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 rounded-full border border-yellow-200 text-base focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-yellow-50 text-yellow-900 shadow" />
            <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-yellow-200 hover:bg-yellow-300" onClick={async () => {
              console.log('Manual refresh triggered');
              // Clear cached data and reload
              if (typeof window !== 'undefined') {
                localStorage.removeItem("followups");
              }
              await loadFollowups();
            }}>Refresh</Button>
            <Button variant="secondary" className="rounded-full px-4 py-2 shadow border border-yellow-200 hover:bg-yellow-300">Import</Button>
          </div>
        </div>
        
        {/* Followup Type Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div onClick={() => window.location.href = '/homescreen/followup/all'} className="cursor-pointer">
            <Card className="bg-yellow-100 hover:bg-yellow-200 transition-colors border-2 border-yellow-300">
              <div className="text-center p-6">
                <div className="text-3xl font-bold text-yellow-800 mb-2">All</div>
                <div className="text-sm text-yellow-600">View all followups</div>
              </div>
            </Card>
          </div>
          <div onClick={() => window.location.href = '/homescreen/followup/overdue'} className="cursor-pointer">
            <Card className="bg-red-100 hover:bg-red-200 transition-colors border-2 border-red-300">
              <div className="text-center p-6">
                <div className="text-3xl font-bold text-red-800 mb-2">Overdue</div>
                <div className="text-sm text-red-600">Urgent followups</div>
              </div>
            </Card>
          </div>
          <div onClick={() => window.location.href = '/homescreen/followup/pending'} className="cursor-pointer">
            <Card className="bg-blue-100 hover:bg-blue-200 transition-colors border-2 border-blue-300">
              <div className="text-center p-6">
                <div className="text-3xl font-bold text-blue-800 mb-2">Pending</div>
                <div className="text-sm text-blue-600">Scheduled followups</div>
              </div>
            </Card>
          </div>
          <div onClick={() => window.location.href = '/homescreen/followup/completed'} className="cursor-pointer">
            <Card className="bg-green-100 hover:bg-green-200 transition-colors border-2 border-green-300">
              <div className="text-center p-6">
                <div className="text-3xl font-bold text-green-800 mb-2">Completed</div>
                <div className="text-sm text-green-600">Finished followups</div>
              </div>
            </Card>
          </div>
        </div>
        {/* Table Structure */}
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