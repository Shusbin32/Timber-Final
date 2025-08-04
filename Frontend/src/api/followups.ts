import { USE_MOCKS, MOCK_DATA, getApiUrl } from '@/config/api';
import { fetchLeadsByUser, Lead } from './leads';

// Type for followup
export interface Followup {
  id?: number;
  followup_id?: number; // Add this to match server data structure
  lead_id: number;
  followup_date: string;
  followup_remarks?: string;
  followup_type?: string;
  notes: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

// Type for a lead with followups as returned by the completed/overdue/pending followup APIs
export type LeadWithFollowups = {
  lead_id: number;
  name: string;
  followups?: Followup[];
  // ...other fields as needed
};

// Initialize localStorage with mock data if empty
function initializeMockData() {
  if (typeof window === 'undefined') return;
  
  const existingFollowups = localStorage.getItem("followups");
  if (!existingFollowups || existingFollowups === "[]") {
    localStorage.setItem("followups", JSON.stringify(MOCK_DATA.FOLLOWUPS));
  }
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function fetchFollowups(): Promise<Followup[]> {
  if (USE_MOCKS) {
    initializeMockData();
    return JSON.parse(localStorage.getItem("followups") || "[]");
  } else {
    try {
      // Check if we have cached data first
      const cachedData = localStorage.getItem("followups");
      if (cachedData) {
        console.log('Using cached followup data');
        return JSON.parse(cachedData);
      }
      
      const res = await fetch(getApiUrl('/api/services/getallfollowup'), {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error('Failed to fetch followups: ' + res.status + ' ' + res.statusText);
      }
      const result = await res.json();
      const followups = Array.isArray(result) ? result : result.data || [];
      
      // Cache the fetched data
      localStorage.setItem("followups", JSON.stringify(followups));
      return followups;
    } catch (error) {
      console.error("Error fetching followups:", error);
      throw new Error("Failed to fetch followups. Please check your connection.");
    }
  }
}

export async function fetchAllCompletedFollowup(filters: Record<string, string | number | undefined> = {}): Promise<LeadWithFollowups[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const url = getApiUrl(`/api/services/getallcompletedfollowup${params.toString() ? '?' + params.toString() : ''}`);
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch all completed followup');
  const result = await res.json();
  const arr = Array.isArray(result) ? result : result.data || [];
  return arr.filter((item: unknown): item is LeadWithFollowups =>
    typeof item === 'object' && item !== null && 'lead_id' in item && 'name' in item
  );
}

export async function fetchAllOverdueFollowup(filters: Record<string, string | number | undefined> = {}): Promise<LeadWithFollowups[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const url = getApiUrl(`/api/services/getalloverduefollowup${params.toString() ? '?' + params.toString() : ''}`);
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch all overdue followup');
  const result = await res.json();
  const arr = Array.isArray(result) ? result : result.data || [];
  return arr.filter((item: unknown): item is LeadWithFollowups =>
    typeof item === 'object' && item !== null && 'lead_id' in item && 'name' in item
  );
}

export async function fetchAllPendingFollowup(filters: Record<string, string | number | undefined> = {}): Promise<LeadWithFollowups[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const url = getApiUrl(`/api/services/getallpendingfollowup${params.toString() ? '?' + params.toString() : ''}`);
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch all pending followup');
  const result = await res.json();
  const arr = Array.isArray(result) ? result : result.data || [];
  return arr.filter((item: unknown): item is LeadWithFollowups =>
    typeof item === 'object' && item !== null && 'lead_id' in item && 'name' in item
  );
}

// Function to refresh followup data after updates
export async function refreshFollowupData(): Promise<void> {
  if (USE_MOCKS) {
    // For mock mode, no need to refresh as data is in localStorage
    return;
  }
  
  try {
    // Clear any cached followup data to force fresh fetch
    if (typeof window !== 'undefined') {
      localStorage.removeItem("followups");
      console.log('Cleared cached followup data for fresh fetch');
    }
  } catch (error) {
    console.warn('Failed to clear cached followup data:', error);
  }
}

export async function updateFollowup(followup: Followup): Promise<Followup> {
  // For followups, we use the lead_id since there's no separate followup API
  const leadId = followup.lead_id;
  
  if (!leadId) {
    throw new Error('Missing lead_id. Available fields: ' + Object.keys(followup).join(', '));
  }
  
  if (USE_MOCKS) {
    // For mock mode, update localStorage
    const existingFollowups = JSON.parse(localStorage.getItem("followups") || "[]");
    const updatedFollowups = existingFollowups.map((f: Followup) => 
      f.lead_id === leadId ? { ...f, ...followup } : f
    );
    localStorage.setItem("followups", JSON.stringify(updatedFollowups));
    return followup;
  } else {
    try {
      console.log('Attempting to update followup for lead ID:', leadId);
      console.log('Followup data being sent:', followup);
      console.log('Followup ID fields:', { 
        id: followup.id, 
        followup_id: followup.followup_id,
        lead_id: followup.lead_id 
      });
      
      // Send followup data in a format that the lead update API might expect
      const updateData: Record<string, unknown> = {
        // Essential identifiers
        lead_id: followup.lead_id,
        ...(followup.id && { id: followup.id }),
        
        // Try to update the lead_type field which might be used for followup type
        lead_type: followup.followup_type,
        
        // Include followup-specific fields that might be stored with the lead
        followup_type: followup.followup_type,
        followup_date: followup.followup_date,
        followup_remarks: followup.followup_remarks,
        
        // Include any other fields that might be relevant
        status: followup.status,
        notes: followup.notes,
        remarks: followup.followup_remarks, // Alternative field name
      };
      
      // Only include other fields if they were actually modified
      if (followup.name && followup.name !== '') updateData.name = followup.name;
      if (followup.assign_to && followup.assign_to !== '') updateData.assign_to = followup.assign_to;
      
      // Try to update followup through lead API with followup_id
      console.log('Attempting to update followup through lead API');
      
      // Create a payload that includes followup_id and followup data
      const followupUpdatePayload = {
        lead_id: followup.lead_id,
        followup_id: followup.id, // Include the followup ID
        // Followup-specific data
        followup_type: followup.followup_type,
        followup_date: followup.followup_date,
        followup_remarks: followup.followup_remarks,
        status: followup.status,
        notes: followup.notes,
        // Also include as lead fields in case backend expects them there
        lead_type: followup.followup_type,
        tentetive_visit_date: followup.followup_date,
        remarks: followup.followup_remarks,
        // Add explicit followup update fields
        update_followup: true,
        followup_status: followup.status,
        followup_completion_date: new Date().toISOString(),
      };
      
      console.log('Followup update payload:', followupUpdatePayload);
      
      // Try multiple approaches to update the followup
      let res;
      let updateSuccessful = false;
      
      // Approach 1: Try to update the specific followup using the new updatefollowup endpoint
      const followupId = followup.id || followup.followup_id;
      console.log('🔍 Debug - Followup ID check:', { 
        originalId: followup.id, 
        followupId: followup.followup_id, 
        resolvedId: followupId 
      });
      
      if (followupId) {
        try {
          console.log('🚀 Trying approach 1: Update specific followup by ID', followupId);
          const requestBody = {
            followup_type: followup.followup_type,
            status: followup.status,
            followup_remarks: followup.followup_remarks,
            followup_date: followup.followup_date,
            notes: followup.notes || ''
          };
          console.log('📤 Request body:', requestBody);
          
          res = await fetch(getApiUrl(`/api/services/updatefollowup/${followupId}`), {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody),
          });
          
          console.log('📥 Response status:', res.status);
          console.log('📥 Response headers:', Object.fromEntries(res.headers.entries()));
          
          if (res.ok) {
            updateSuccessful = true;
            console.log('✅ Approach 1 (direct followup update) successful');
          } else {
            const errorText = await res.text();
            console.log('❌ Approach 1 (direct followup update) failed:', res.status, errorText);
          }
        } catch (error) {
          console.log('💥 Approach 1 (direct followup update) error:', error);
        }
      } else {
        console.log('⚠️ No followup ID found, skipping approach 1');
      }
      
      // Approach 2: Fallback to lead update API if direct followup update failed
      if (!updateSuccessful) {
        try {
          console.log('Trying approach 2: Update through lead API with followup data');
          res = await fetch(getApiUrl(`/api/services/updatelead/${leadId}`), {
        method: "PUT",
        headers: getAuthHeaders(),
            body: JSON.stringify({
              ...followupUpdatePayload,
              // Add explicit followup completion fields
              followup_completed: true,
              followup_completion_date: new Date().toISOString(),
              followup_completion_remarks: followup.followup_remarks
            }),
      });
          
          if (res.ok) {
            updateSuccessful = true;
            console.log('Approach 2 (lead update) successful');
          } else {
            console.log('Approach 2 (lead update) failed, trying approach 3');
          }
        } catch (error) {
          console.log('Approach 2 (lead update) error:', error);
        }
      }
      
      // Approach 3: Last resort - use updatefollowup endpoint to create a "completed" followup
      if (!updateSuccessful) {
        try {
          console.log('Trying approach 3: Create completed followup via updatefollowup');
          
          // First, we need to get the followup ID for this lead
          const currentFollowups = await fetchFollowups();
          const currentFollowup = currentFollowups.find(f => f.lead_id === leadId);
          
          if (currentFollowup) {
            const followupId = currentFollowup.id || currentFollowup.followup_id;
            
            if (followupId) {
              const requestBody = {
                followup_type: 'completed',
                status: 'completed',
                followup_remarks: followup.followup_remarks,
                followup_date: new Date().toISOString(),
                notes: currentFollowup.notes || ''
              };
              
              res = await fetch(getApiUrl(`/api/services/updatefollowup/${followupId}`), {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(requestBody),
              });
              
              if (res.ok) {
                updateSuccessful = true;
                console.log('Approach 3 (updatefollowup completion) successful');
              } else {
                console.log('Approach 3 (updatefollowup completion) failed');
              }
            } else {
              console.log('Approach 3: No followup ID found');
            }
          } else {
            console.log('Approach 3: No followup found for this lead');
          }
        } catch (error) {
          console.log('Approach 3 (updatefollowup completion) error:', error);
        }
      }
      
      // If both approaches failed, throw an error
      if (!updateSuccessful || !res) {
        throw new Error('All update approaches failed');
      }
      
      console.log('Response status:', res.status);
      console.log('Response status text:', res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update followup: ${res.status} ${res.statusText} - ${errorText}`);
      }
      
      const result = await res.json();
      console.log('Update successful, response:', result);
      console.log('Response data structure:', JSON.stringify(result, null, 2));
      
      // Check if the response contains the updated followup data
      const responseData = result.data || result;
      console.log('Response data:', responseData);
      console.log('Response followup_type:', responseData.followup_type);
      console.log('Response lead_type:', responseData.lead_type);
      console.log('Response type:', responseData.type);
      
      // Check if the backend actually updated the followup type
      const backendUpdatedFollowupType = responseData.followup_type || responseData.lead_type || responseData.type;
      console.log('Backend returned followup type:', backendUpdatedFollowupType);
      console.log('We sent followup type:', followup.followup_type);
      console.log('Followup type was updated:', backendUpdatedFollowupType === followup.followup_type);
      console.log('Backend returned lead_type:', responseData.lead_type);
      console.log('Backend returned tentetive_visit_date:', responseData.tentetive_visit_date);
      console.log('Backend returned remarks:', responseData.remarks);
      console.log('Backend returned followup_id:', responseData.followup_id);
      console.log('Backend returned followup_type:', responseData.followup_type);
      
      // Return the complete updated data by merging with original followup
      const updatedFollowup = {
        ...followup,
        ...responseData,
        // Ensure followup-specific fields are preserved from our request
        followup_type: followup.followup_type,
        followup_date: followup.followup_date,
        followup_remarks: followup.followup_remarks,
      };
      console.log('Returning updated followup:', updatedFollowup);
      
      // Also update the cached followup data to ensure persistence
      // This helps when the page reloads and fetches from different followup APIs
      try {
        const cachedFollowups = JSON.parse(localStorage.getItem("followups") || "[]");
        const updatedCachedFollowups = cachedFollowups.map((f: Followup) => 
          f.lead_id === leadId ? { ...f, ...updatedFollowup } : f
        );
        localStorage.setItem("followups", JSON.stringify(updatedCachedFollowups));
        console.log('Updated cached followup data for persistence');
      } catch (cacheError) {
        console.warn('Failed to update cached followup data:', cacheError);
      }
      
      return updatedFollowup;
    } catch (error) {
      console.error("Error updating followup:", error);
      throw new Error(`Failed to update followup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Reschedule followup function
export async function rescheduleFollowup(
  leadId: number,
  data: {
    followup_date: string;
    followup_remarks: string;
    followup_type: string;
  }
): Promise<Followup> {
  if (USE_MOCKS) {
    // Mock implementation for testing
    const followups = JSON.parse(localStorage.getItem("followups") || "[]");
    const followupIndex = followups.findIndex((f: Followup) => f.lead_id === leadId);
    
    if (followupIndex !== -1) {
      // Update existing followup
      followups[followupIndex] = {
        ...followups[followupIndex],
        followup_date: data.followup_date,
        followup_remarks: data.followup_remarks,
        followup_type: data.followup_type,
        status: 'pending' // Reset status when rescheduled
      };
      localStorage.setItem("followups", JSON.stringify(followups));
      return followups[followupIndex];
    } else {
      throw new Error('Followup not found for this lead');
    }
  } else {
    try {
      console.log('🔄 Debug - Reschedule followup called');
      console.log('🔄 Debug - Lead ID:', leadId);
      console.log('🔄 Debug - Reschedule data:', data);
      
      // First, we need to get the followup ID for this lead
      // We'll use the existing followups to find the current followup
      const currentFollowups = await fetchFollowups();
      const currentFollowup = currentFollowups.find(f => f.lead_id === leadId);
      
      if (!currentFollowup) {
        throw new Error('No followup found for this lead');
      }
      
      const followupId = currentFollowup.id || currentFollowup.followup_id;
      console.log('🔄 Debug - Found followup ID:', followupId);
      
      if (!followupId) {
        throw new Error('Followup ID not found');
      }
      
      // Use the new updatefollowup endpoint for rescheduling
      const requestBody = {
        followup_type: data.followup_type,
        status: data.followup_type === 'completed' ? 'completed' : 'pending',
        followup_remarks: data.followup_remarks,
        followup_date: data.followup_date,
        notes: currentFollowup.notes || ''
      };
      
      console.log('🔄 Debug - Reschedule request body:', requestBody);
      
      const response = await fetch(getApiUrl(`/api/services/updatefollowup/${followupId}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      console.log('🔄 Debug - Reschedule response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔄 Debug - Reschedule error response:', errorText);
        throw new Error(`Failed to reschedule followup: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('🔄 Debug - Reschedule successful, response:', result);
      
      // Refresh followup data after successful reschedule
      await refreshFollowupData();
      
      // Return the updated followup data
      const updatedFollowup = {
        ...currentFollowup,
        ...result.data || result,
        followup_date: data.followup_date,
        followup_remarks: data.followup_remarks,
        followup_type: data.followup_type,
        status: data.followup_type === 'completed' ? 'completed' : 'pending'
      };
      
      return updatedFollowup;
    } catch (error) {
      console.error('Error rescheduling followup:', error);
      throw error;
    }
  }
}

// User-specific followup functions
export async function fetchUserCompletedFollowup(filters: Record<string, string | number | undefined> = {}): Promise<LeadWithFollowups[]> {
  try {
    // First get user-specific leads
    const userLeads = await fetchLeadsByUser();
    
    // Then get completed followups for those leads
    const completedFollowups = await fetchAllCompletedFollowup(filters);
    
    // Filter to only include followups for leads that belong to the current user
    const userLeadIds = new Set(userLeads.map((lead: Lead) => lead.lead_id));
    const userCompletedFollowups = completedFollowups.filter(followup => 
      userLeadIds.has(followup.lead_id)
    );
    
    return userCompletedFollowups;
  } catch (error) {
    console.error('Error fetching user completed followups:', error);
    throw error;
  }
}

export async function fetchUserOverdueFollowup(filters: Record<string, string | number | undefined> = {}): Promise<LeadWithFollowups[]> {
  try {
    // First get user-specific leads
    const userLeads = await fetchLeadsByUser();
    
    // Then get overdue followups for those leads
    const overdueFollowups = await fetchAllOverdueFollowup(filters);
    
    // Filter to only include followups for leads that belong to the current user
    const userLeadIds = new Set(userLeads.map((lead: Lead) => lead.lead_id));
    const userOverdueFollowups = overdueFollowups.filter(followup => 
      userLeadIds.has(followup.lead_id)
    );
    
    return userOverdueFollowups;
  } catch (error) {
    console.error('Error fetching user overdue followups:', error);
    throw error;
  }
}

export async function fetchUserPendingFollowup(filters: Record<string, string | number | undefined> = {}): Promise<LeadWithFollowups[]> {
  try {
    // First get user-specific leads
    const userLeads = await fetchLeadsByUser();
    
    // Then get pending followups for those leads
    const pendingFollowups = await fetchAllPendingFollowup(filters);
    
    // Filter to only include followups for leads that belong to the current user
    const userLeadIds = new Set(userLeads.map((lead: Lead) => lead.lead_id));
    const userPendingFollowups = pendingFollowups.filter(followup => 
      userLeadIds.has(followup.lead_id)
    );
    
    return userPendingFollowups;
  } catch (error) {
    console.error('Error fetching user pending followups:', error);
    throw error;
  }
}

// Function to fetch a specific followup by ID
export async function fetchFollowupById(followupId: number): Promise<Followup> {
  if (USE_MOCKS) {
    const followups = JSON.parse(localStorage.getItem("followups") || "[]");
    const followup = followups.find((f: Followup) => f.id === followupId);
    if (!followup) {
      throw new Error('Followup not found');
    }
    return followup;
  } else {
    try {
      const res = await fetch(getApiUrl(`/api/services/getfollowupbyid/${followupId}`), {
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch followup: ${res.status} ${res.statusText}`);
      }
      
      const result = await res.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching followup by ID:', error);
      throw error;
    }
  }
}