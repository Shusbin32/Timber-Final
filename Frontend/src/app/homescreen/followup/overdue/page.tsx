"use client";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Table from '@/components/Table';
import { 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import QuickFollowupDrawer from '@/components/QuickFollowupDrawer';
import { Followup, fetchUserOverdueFollowup } from '@/api/followups';
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

      const leadsWithFollowups: LeadWithFollowupApi[] = await fetchUserOverdueFollowup({});
      
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
      
      // Client-side filtering to ensure completed followups are excluded
      data = data.filter(followup => {
        const status = typeof followup.status === 'string' ? followup.status.toLowerCase() : '';
        const followupType = typeof followup.followup_type === 'string' ? followup.followup_type.toLowerCase() : '';
        const leadType = typeof followup.lead_type === 'string' ? followup.lead_type.toLowerCase() : '';
        
        // Exclude if status is completed or followup_type/lead_type is completed
        const isCompleted = status === 'completed' || 
                           followupType === 'completed' || 
                           leadType === 'completed';
        
        if (isCompleted) {
          console.log('Filtering out completed followup:', followup);
        }
        
        return !isCompleted;
      });
      
      setLeads(data);
    } catch (error) {
      console.error('Error loading overdue followups:', error);
      setError('Failed to load overdue followups. Please try again.');
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
    { key: 'followup_date', label: 'Overdue Date' },
    { key: 'followup_type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'assign_to', label: 'Assigned To' },
    { key: 'followup_remarks', label: 'Remarks' },
  ];

  // Calculate summary statistics
  const stats = React.useMemo(() => {
    const criticalOverdue = leads.filter(lead => {
      const followupDate = lead.followup_date || lead.tentetive_visit_date;
      if (!followupDate || typeof followupDate !== 'string') return false;
      const daysOverdue = Math.floor((new Date().getTime() - new Date(followupDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysOverdue > 7;
    }).length;
    
    const needsAttention = leads.filter(lead => {
      const followupDate = lead.followup_date || lead.tentetive_visit_date;
      if (!followupDate || typeof followupDate !== 'string') return false;
      const daysOverdue = Math.floor((new Date().getTime() - new Date(followupDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysOverdue <= 7 && daysOverdue > 3;
    }).length;
    
    const totalOverdue = leads.length;
    
    return {
      total: totalOverdue,
      critical: criticalOverdue,
      needsAttention: needsAttention
    };
  }, [leads]);

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    if (typeof window !== 'undefined') {
      localStorage.removeItem("followups");
      localStorage.removeItem("leads");
      console.log('Cleared all caches during manual refresh');
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
      <div className="min-h-screen bg-gradient-to-br from-red-200 via-orange-100 to-red-50 flex items-center justify-center p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-red-200 via-orange-100 to-red-50 p-0 flex">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-red-900 tracking-tight">
                    Overdue Followups
                  </h1>
                  <p className="text-red-700 font-medium">
                    Urgent followups requiring immediate attention
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg border border-red-200">
                <span className="text-red-800 font-bold">Total:</span>
                <span className="text-2xl font-extrabold text-red-900">{filteredLeads.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <Card className="mb-8 p-6 bg-white/90 border border-red-100 shadow-xl rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Search overdue followups..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="pl-10 pr-4 py-3 rounded-xl border border-red-200 text-base focus:ring-2 focus:ring-red-400 bg-red-50"
                  />
                </div>
        </div>
        
              <div className="flex items-center gap-3 flex-wrap">
                <Button 
                  variant="secondary" 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-red-200 hover:bg-red-300"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-red-200 hover:bg-red-300"
                >
                  <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={async () => {
                    console.log('Force refresh triggered');
                if (typeof window !== 'undefined') {
                      localStorage.clear(); // Clear all localStorage
                      console.log('Cleared all localStorage');
                }
                await loadFollowups();
              }}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-red-200 hover:bg-red-300"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Force Refresh
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl shadow border border-red-200 hover:bg-red-300"
                >
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Import
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 hover:border-red-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-red-800 mb-2">Total Overdue</div>
                <div className="text-sm text-red-600 font-medium">All overdue followups</div>
                <div className="text-3xl font-extrabold text-red-900 mt-3">{stats.total}</div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 hover:border-orange-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ClockIcon className="w-7 h-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-800 mb-2">Critical</div>
                <div className="text-sm text-orange-600 font-medium">Over 7 days overdue</div>
                <div className="text-3xl font-extrabold text-orange-900 mt-3">{stats.critical}</div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:border-yellow-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <UserIcon className="w-7 h-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-yellow-800 mb-2">Needs Attention</div>
                <div className="text-sm text-yellow-600 font-medium">3-7 days overdue</div>
                <div className="text-3xl font-extrabold text-yellow-900 mt-3">{stats.needsAttention}</div>
          </div>
            </Card>
        </div>
        
        {/* Loading State */}
        {loading && (
            <Card className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
              <p className="text-red-700 font-medium text-lg">Loading overdue followups...</p>
            </Card>
          )}

          {/* Table Section */}
          {!loading && (
            <Card className="overflow-hidden rounded-2xl shadow-2xl border border-red-100 bg-white/90">
              <div className="p-6 border-b border-red-100 bg-red-50">
                <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  Overdue Followups List
                </h2>
                <p className="text-red-700 mt-1">
                  Showing {filteredLeads.length} of {leads.length} overdue followups
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
              
              // Check if the followup was marked as completed
              const isCompleted = updated.status === 'completed' || updated.followup_type === 'completed';
              
              console.log('Followup update - isCompleted:', isCompleted, 'updated:', updated);
              
              setLeads(prev => {
                console.log('Previous leads count:', prev.length);
                
                if (isCompleted) {
                  // If completed, remove it from the overdue list entirely
                  const filteredLeads = prev.filter(l => {
                    // Try multiple ways to identify the followup
                    let shouldRemove = false;
                    
                    // Method 1: Check by ID if available
                    if (l && 'id' in l && 'id' in updated && l.id && updated.id && l.id === updated.id) {
                      shouldRemove = true;
                  }
                  
                    // Method 2: Check by lead_id and followup details
                  if (l && 'lead_id' in l && 'lead_id' in updated && l.lead_id === updated.lead_id) {
                      // Compare followup details to ensure it's the same followup
                      const lFollowupDate = l.followup_date || l.tentetive_visit_date;
                      const uFollowupDate = updated.followup_date || updated.tentetive_visit_date;
                      const lFollowupType = l.followup_type || l.lead_type;
                      const uFollowupType = updated.followup_type || updated.lead_type;
                      
                      if (lFollowupDate === uFollowupDate && lFollowupType === uFollowupType) {
                        shouldRemove = true;
                      }
                    }
                    
                    // Method 3: Check by name and lead_id (fallback)
                    if (l && 'name' in l && 'name' in updated && l.name === updated.name && 
                        'lead_id' in l && 'lead_id' in updated && l.lead_id === updated.lead_id) {
                      shouldRemove = true;
                    }
                    
                    if (shouldRemove) {
                      console.log('Removing followup:', l);
                      return false; // Remove this followup
                    }
                    return true; // Keep other followups
                  });
                    
                  console.log('Filtered leads count:', filteredLeads.length);
                  return filteredLeads;
                } else {
                  // If not completed, update the existing entry
                  const updatedLeads = prev.map(l => {
                    // Try multiple ways to identify the followup
                    let shouldUpdate = false;
                    
                    // Method 1: Check by ID if available
                    if (l && 'id' in l && 'id' in updated && l.id && updated.id && l.id === updated.id) {
                      shouldUpdate = true;
                    }
                    
                    // Method 2: Check by lead_id and followup details
                    if (l && 'lead_id' in l && 'lead_id' in updated && l.lead_id === updated.lead_id) {
                      const lFollowupDate = l.followup_date || l.tentetive_visit_date;
                      const uFollowupDate = updated.followup_date || updated.tentetive_visit_date;
                      const lFollowupType = l.followup_type || l.lead_type;
                      const uFollowupType = updated.followup_type || updated.lead_type;
                      
                      if (lFollowupDate === uFollowupDate && lFollowupType === uFollowupType) {
                        shouldUpdate = true;
                      }
                    }
                    
                    if (shouldUpdate) {
                      const mergedData = { ...l, ...updated };
                      console.log('Updating followup:', mergedData);
                      return mergedData;
                  }
                  return l;
                });
                
                  return updatedLeads;
                }
              });
              
                            // Close the drawer if the followup was completed
              if (isCompleted) {
                setDrawerOpen(false);
                toast.success('Followup completed and removed from overdue list!');
                  
                // Refresh data to get updated server-side information
                setTimeout(async () => {
                  try {
                    console.log('Refreshing data after completion...');
                    await loadFollowups();
              } catch (error) {
                    console.warn('Failed to refresh data after completion:', error);
                  }
                }, 1000); // Reduced delay since we now have proper backend API
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 