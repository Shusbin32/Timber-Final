"use client";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Table from '@/components/Table';
import { 
  XMarkIcon, 
  FunnelIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filterDate, setFilterDate] = useState('any');
  const [filterStatus, setFilterStatus] = useState('any');
  const [filterAssigned, setFilterAssigned] = useState('any');
  const [filterType, setFilterType] = useState('any');
  
  // Example users list (replace with real data if available)
  const users = [
    { id: 'any', name: 'Any User' },
    { id: '1', name: 'SONU' },
    { id: '2', name: 'MAMTA' },
    { id: '3', name: 'ALISHA' },
    { id: '4', name: 'NISHA' },
  ];
  
  const followupTypes = [
    { value: 'any', label: 'Any Type' },
    { value: 'General', label: 'General' },
    { value: 'Payment', label: 'Payment' },
    { value: 'AFTER VISIT followup', label: 'After Visit' },
    { value: 'BEFORE VISIT FOLLOW-UP', label: 'Before Visit' },
    { value: 'RAW DATA FOLLOW-UP', label: 'Raw Data' },
  ];
  
  const [leads, setLeads] = useState<FollowupRow[]>([]);
  const [selectedLead, setSelectedLead] = useState<FollowupRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      setIsLoading(true);
      setError(null);
      let data: FollowupRow[] = [];

      // Build filters for API
      const filters: Record<string, string | number | undefined> = {};
      if (search) filters.name = search;
      if (filterAssigned && filterAssigned !== 'any') filters.assign_to = filterAssigned;

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
        
        if (Array.isArray(raw) && raw.length > 0) {
          const firstItem = raw[0];
          if (typeof firstItem === 'object' && firstItem !== null && 'followup' in firstItem) {
            allLeads = raw as unknown as LeadWithFollowupApi[];
          } else {
            allLeads = raw.map((f: Followup) => ({
              lead_id: f.lead_id,
              name: '',
              followup: { all: [f] },
            }));
          }
        } else {
          allLeads = [];
        }
        
        data = allLeads.flatMap(lead =>
          (lead.followup?.all || []).map(f => ({
            ...f,
            lead_id: lead.lead_id,
            lead_name: lead.name,
            name: lead.name,
          }))
        ).filter((f) => f.followup_type === 'completed');
      }
        
      // Improved deduplication logic
        const uniqueFollowups = data.filter((followup, index, self) => {
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
        
        setLeads(uniqueFollowups);
    } catch (error) {
      console.error('Error loading followups:', error);
      setError('Failed to load followups. Please try again.');
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, filterAssigned, search]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("followups");
    }
    loadFollowups();
  }, [loadFollowups]);

  const columns = [
    { key: 'name' as keyof Followup, label: 'Lead Name' },
    { key: 'followup_type' as keyof Followup, label: 'Followup Type' },
    { key: 'status' as keyof Followup, label: 'Status' },
    { key: 'assign_to' as keyof Followup, label: 'Assigned To' },
    { key: 'tentetive_visit_date' as keyof Followup, label: 'Followup Date' },
    { key: 'remarks' as keyof Followup, label: 'Notes' },
  ];

  // Calculate summary statistics
  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayFollowups = leads.filter(lead => {
      const followupDate = lead.followup_date || lead.tentetive_visit_date;
      return followupDate && typeof followupDate === 'string' && followupDate.startsWith(today);
    }).length;
    
    const overdueFollowups = leads.filter(lead => lead.status === 'overdue' || lead.followup_type === 'overdue').length;
    const completedFollowups = leads.filter(lead => lead.status === 'completed' || lead.followup_type === 'completed').length;
    
    return {
      today: todayFollowups,
      overdue: overdueFollowups,
      completed: completedFollowups,
      total: leads.length
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 flex items-center justify-center p-8">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-0 flex">
      {/* Sidebar Filters */}
      {showFilters && (
        <aside className="w-80 p-0 flex flex-col z-30">
          <div className="m-4 animate-filter-panel rounded-3xl shadow-2xl border border-yellow-300 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 relative">
            <div className="flex items-center justify-between p-6 border-b border-yellow-200">
              <h3 className="font-extrabold text-2xl text-yellow-900 flex items-center gap-3 tracking-tight">
                <FunnelIcon className="w-7 h-7 text-yellow-500" /> 
                Advanced Filters
              </h3>
              <button
                className="text-yellow-700 hover:text-white hover:bg-red-500 text-2xl font-bold focus:outline-none bg-yellow-100 hover:bg-red-500 rounded-full p-2 shadow border border-yellow-300 transition-all duration-200"
                onClick={() => setShowFilters(false)}
                aria-label="Close filter sidebar"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <Button
                variant="gradient"
              onClick={() => {
                setFilterDate('any');
                setFilterStatus('any');
                setFilterAssigned('any');
                setFilterType('any');
              }}
                className="w-full"
              >
                Clear All Filters
              </Button>
              
              {/* Date Filter */}
              <div className="space-y-3">
                <h4 className="font-bold text-yellow-800 text-lg">Followup Date</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-yellow-200 rounded-lg px-3 py-2 transition">
                    <input 
                      type="radio" 
                      name="date" 
                      value="any" 
                      checked={filterDate === 'any'} 
                      onChange={() => setFilterDate('any')} 
                      className="accent-yellow-600 scale-110" 
                    /> 
                    <span className="font-medium text-black">All Dates</span>
              </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-yellow-200 rounded-lg px-3 py-2 transition">
                    <input 
                      type="radio" 
                      name="date" 
                      value="today" 
                      checked={filterDate === 'today'} 
                      onChange={() => setFilterDate('today')} 
                      className="accent-yellow-600 scale-110" 
                    /> 
                    <span className="font-medium text-black">Today Only</span>
              </label>
            </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <h4 className="font-bold text-yellow-800 text-lg">Status</h4>
                <div className="space-y-2">
                  {[
                    { value: 'any', label: 'All Statuses' },
                    { value: 'overdue-upcoming', label: 'Overdue & Upcoming' },
                    { value: 'overdue', label: 'Overdue' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'completed', label: 'Completed' }
                  ].map(status => (
                    <label key={status.value} className="flex items-center gap-3 cursor-pointer hover:bg-yellow-200 rounded-lg px-3 py-2 transition">
                      <input 
                        type="radio" 
                        name="status" 
                        value={status.value} 
                        checked={filterStatus === status.value} 
                        onChange={() => setFilterStatus(status.value)} 
                        className="accent-yellow-600 scale-110" 
                      /> 
                      <span className="font-medium text-black">{status.label}</span>
              </label>
                  ))}
                </div>
            </div>

              {/* Assigned To Filter */}
              <div className="space-y-3">
                <h4 className="font-bold text-yellow-800 text-lg">Assigned To</h4>
              <select
                  className="w-full rounded-xl border-2 border-yellow-200 py-3 px-4 text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-200 font-semibold shadow-lg hover:border-yellow-400 transition-all duration-200"
                value={filterAssigned}
                onChange={e => setFilterAssigned(e.target.value)}
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

              {/* Followup Type Filter */}
              <div className="space-y-3">
                <h4 className="font-bold text-yellow-800 text-lg">Followup Type</h4>
                <div className="space-y-2">
              {followupTypes.map(type => (
                    <label key={type.value} className="flex items-center gap-3 cursor-pointer hover:bg-yellow-200 rounded-lg px-3 py-2 transition">
                      <input 
                        type="radio" 
                        name="type" 
                        value={type.value} 
                        checked={filterType === type.value} 
                        onChange={() => setFilterType(type.value)} 
                        className="accent-yellow-600 scale-110" 
                      /> 
                      <span className="font-medium text-black">{type.label}</span>
                </label>
              ))}
                </div>
              </div>
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
        {/* Header Section */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-yellow-900 tracking-tight">
                    Followups Dashboard
                  </h1>
                  <p className="text-yellow-700 font-medium">
                    Manage and track all your follow-up activities
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="gradient"
              onClick={() => setShowFilters(f => !f)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg"
            >
                <FunnelIcon className="w-5 h-5" /> 
                {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
              
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg border border-yellow-200">
                <span className="text-yellow-800 font-bold">Total:</span>
                <span className="text-2xl font-extrabold text-yellow-900">{filteredLeads.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <Card className="mb-8 p-6 bg-white/90 border border-yellow-100 shadow-xl rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Search followups..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="pl-10 pr-4 py-3 rounded-xl border border-yellow-200 text-base focus:ring-2 focus:ring-yellow-400 bg-yellow-50"
                  />
          </div>
        </div>
        
              <div className="flex items-center gap-3 flex-wrap">
                <Button 
                  variant="secondary" 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-yellow-200 hover:bg-yellow-300"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-yellow-200 hover:bg-yellow-300"
                >
                  <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-yellow-200 hover:bg-yellow-300"
                >
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Import
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Followup Type Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              onClick={() => window.location.href = '/homescreen/followup/all'} 
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <div className="text-center p-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CalendarIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-800 mb-2">All Followups</div>
                  <div className="text-sm text-blue-600 font-medium">View all followup activities</div>
                  <div className="text-3xl font-extrabold text-blue-900 mt-3">{stats.total}</div>
              </div>
            </Card>
          </div>
            
            <div 
              onClick={() => window.location.href = '/homescreen/followup/overdue'} 
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all duration-300 border-2 border-red-200 hover:border-red-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <div className="text-center p-6">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-red-800 mb-2">Overdue</div>
                  <div className="text-sm text-red-600 font-medium">Urgent followups requiring attention</div>
                  <div className="text-3xl font-extrabold text-red-900 mt-3">{stats.overdue}</div>
              </div>
            </Card>
          </div>
            
            <div 
              onClick={() => window.location.href = '/homescreen/followup/pending'} 
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 border-2 border-yellow-200 hover:border-yellow-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <div className="text-center p-6">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ClockIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-800 mb-2">Pending</div>
                  <div className="text-sm text-yellow-600 font-medium">Scheduled followups</div>
                  <div className="text-3xl font-extrabold text-yellow-900 mt-3">{stats.today}</div>
              </div>
            </Card>
          </div>
            
            <div 
              onClick={() => window.location.href = '/homescreen/followup/completed'} 
              className="cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 border-2 border-green-200 hover:border-green-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <div className="text-center p-6">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-800 mb-2">Completed</div>
                  <div className="text-sm text-green-600 font-medium">Finished followups</div>
                  <div className="text-3xl font-extrabold text-green-900 mt-3">{stats.completed}</div>
              </div>
            </Card>
          </div>
        </div>

          {/* Loading State */}
          {isLoading && (
            <Card className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
              <p className="text-yellow-700 font-medium text-lg">Loading followups...</p>
            </Card>
          )}

          {/* Table Section */}
          {!isLoading && (
            <Card className="overflow-hidden rounded-2xl shadow-2xl border border-yellow-100 bg-white/90">
              <div className="p-6 border-b border-yellow-100 bg-yellow-50">
                <h2 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                  <UserIcon className="w-6 h-6" />
                  Followup List
                </h2>
                <p className="text-yellow-700 mt-1">
                  Showing {filteredLeads.length} of {leads.length} followups
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
              console.log('Received updated followup:', updated);
              
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