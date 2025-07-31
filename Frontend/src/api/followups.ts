import { USE_MOCKS, MOCK_DATA, getApiUrl } from '@/config/api';
import { fetchLeadsByUser, Lead } from './leads';

// Type for followup
export interface Followup {
  id?: number;
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
      };
      
      console.log('Followup update payload:', followupUpdatePayload);
      
      // Try to update the lead with followup information
      const res = await fetch(getApiUrl(`/api/services/updatelead/${leadId}`), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(followupUpdatePayload),
      });
      
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
      const response = await fetch(getApiUrl(`/api/services/followupleadreschedule/${leadId}`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reschedule followup: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Refresh followup data after successful reschedule
      await refreshFollowupData();
      
      return result.data || result;
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