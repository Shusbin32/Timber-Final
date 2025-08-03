"use client";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Table from '@/components/Table';
import { 
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import QuickFollowupDrawer from '@/components/QuickFollowupDrawer';
import { refreshFollowupData, Followup, fetchUserPendingFollowup } from '@/api/followups';
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

export default function PendingFollowupsPage() {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<FollowupRow[]>([]);
  const [selectedLead, setSelectedLead] = useState<FollowupRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      setError(null);
      let data: FollowupRow[] = [];

      const leadsWithFollowups: LeadWithFollowupApi[] = await fetchUserPendingFollowup({});
      
      data = leadsWithFollowups.flatMap(lead => {
        // Handle different possible data structures
        const followups = lead.followup?.all || lead.followups || [];
        
        return followups.map((f: Followup) => ({
          ...f,
          lead_id: lead.lead_id,
          lead_name: lead.name,
          name: lead.name,
        }));
      });
      
      setLeads(data);
    } catch (error) {
      console.error('Error loading pending followups:', error);
      setError('Failed to load pending followups. Please try again.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("followups");
    }
    loadFollowups();
  }, [loadFollowups]);

  const columns = [
    { key: 'name', label: 'Lead Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'followup_date', label: 'Scheduled Date' },
    { key: 'followup_type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'assign_to', label: 'Assigned To' },
    { key: 'followup_remarks', label: 'Remarks' },
  ];

  // Calculate summary statistics
  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayFollowups = leads.filter(lead => {
      const followupDate = lead.followup_date || lead.tentetive_visit_date;
      return followupDate && typeof followupDate === 'string' && followupDate.startsWith(today);
    }).length;
    
    const thisWeekFollowups = leads.filter(lead => {
      const followupDate = lead.followup_date || lead.tentetive_visit_date;
      if (!followupDate || typeof followupDate !== 'string') return false;
      const followupDateObj = new Date(followupDate);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return followupDateObj >= today && followupDateObj <= weekFromNow;
    }).length;
    
    const totalPending = leads.length;
    
    return {
      total: totalPending,
      today: todayFollowups,
      thisWeek: thisWeekFollowups
    };
  }, [leads]);

  const handleRefresh = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("followups");
    }
    await loadFollowups();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import functionality to be implemented');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-blue-50 flex items-center justify-center p-8">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClockIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={handleRefresh}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-blue-50 p-0 flex">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ClockIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
                    Pending Followups
                  </h1>
                  <p className="text-blue-700 font-medium">
                    Scheduled followups awaiting action
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg border border-blue-200">
                <span className="text-blue-800 font-bold">Total:</span>
                <span className="text-2xl font-extrabold text-blue-900">{filteredLeads.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <Card className="mb-8 p-6 bg-white/90 border border-blue-100 shadow-xl rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Search pending followups..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="pl-10 pr-4 py-3 rounded-xl border border-blue-200 text-base focus:ring-2 focus:ring-blue-400 bg-blue-50"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <Button 
                  variant="secondary" 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-blue-200 hover:bg-blue-300"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-blue-200 hover:bg-blue-300"
                >
                  <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-blue-200 hover:bg-blue-300"
                >
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Import
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ClockIcon className="w-7 h-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-800 mb-2">Total Pending</div>
                <div className="text-sm text-blue-600 font-medium">All scheduled followups</div>
                <div className="text-3xl font-extrabold text-blue-900 mt-3">{stats.total}</div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 hover:border-cyan-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CalendarIcon className="w-7 h-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-cyan-800 mb-2">Today</div>
                <div className="text-sm text-cyan-600 font-medium">Followups due today</div>
                <div className="text-3xl font-extrabold text-cyan-900 mt-3">{stats.today}</div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 hover:border-indigo-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <UserIcon className="w-7 h-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-indigo-800 mb-2">This Week</div>
                <div className="text-sm text-indigo-600 font-medium">Due within 7 days</div>
                <div className="text-3xl font-extrabold text-indigo-900 mt-3">{stats.thisWeek}</div>
              </div>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-blue-700 font-medium text-lg">Loading pending followups...</p>
            </Card>
          )}

          {/* Table Section */}
          {!loading && (
            <Card className="overflow-hidden rounded-2xl shadow-2xl border border-blue-100 bg-white/90">
              <div className="p-6 border-b border-blue-100 bg-blue-50">
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6" />
                  Pending Followups List
                </h2>
                <p className="text-blue-700 mt-1">
                  Showing {filteredLeads.length} of {leads.length} pending followups
                </p>
              </div>
              
              <Table 
                columns={columns} 
                data={filteredLeads} 
                actions={(row: FollowupRow) => (
                  <Button 
                    variant="primary" 
                    className="rounded-xl px-4 py-2 shadow-lg" 
                    onClick={() => { 
                      setSelectedLead(row); 
                      setDrawerOpen(true); 
                    }}
                  >
                    View Details
                  </Button>
                )} 
              />
            </Card>
          )}

          {/* Quick Followup Drawer */}
          <QuickFollowupDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            followup={selectedLead}
            onUpdate={async (updated: FollowupRow) => {
              setSelectedLead(updated);
              
              setLeads(prev => {
                const updatedLeads = prev.map(l => {
                  if (l && 'id' in l && 'id' in updated && l.id === updated.id) {
                    const mergedData = { ...l, ...updated };
                    return mergedData;
                  }
                  
                  if (l && 'lead_id' in l && 'lead_id' in updated && l.lead_id === updated.lead_id) {
                    const originalKey = `${l.lead_id}-${l.followup_date}-${l.followup_type}-${l.followup_remarks || l.notes || ''}`;
                    const updatedKey = `${updated.lead_id}-${updated.followup_date}-${updated.followup_type}-${updated.followup_remarks || updated.notes || ''}`;
                    
                    const isSameFollowup = originalKey === updatedKey;
                    
                    if (isSameFollowup) {
                      const mergedData = { ...l, ...updated };
                      return mergedData;
                    }
                  }
                  return l;
                });
                
                const uniqueUpdatedLeads = updatedLeads.filter((followup, index, self) => {
                  const key = followup.id 
                    ? `id-${followup.id}` 
                    : `${followup.lead_id}-${followup.followup_date}-${followup.followup_type}-${followup.followup_remarks || followup.notes || ''}`;
                  
                  const isFirstOccurrence = index === self.findIndex(f => {
                    const fKey = f.id 
                      ? `id-${f.id}` 
                      : `${f.lead_id}-${f.followup_date}-${f.followup_type}-${f.followup_remarks || f.notes || ''}`;
                    return fKey === key;
                  });
                  
                  return isFirstOccurrence;
                });
                
                return uniqueUpdatedLeads;
              });
              
              try {
                await refreshFollowupData();
              } catch (error) {
                console.warn('Failed to refresh followup data:', error);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 