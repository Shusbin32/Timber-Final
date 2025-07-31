import { getApiUrl, API_ENDPOINTS, isMockMode, MOCK_DATA } from '@/config/api';

// Updated Lead type to match backend expectations
export type Lead = {
  lead_id?: number;
  name: string;
  contact: string;
  address?: string;
  email?: string;
  gender?: string;
  city?: string;
  landmark?: string;
  lead_type?: string;
  source?: string;
  category?: string;
  pan_vat?: string;
  company_name?: string;
  branch?: string;
  tentetive_visit_date?: string;
  tentetive_purchase_date?: string;
  division_id?: number; // renamed for backend
  subdivision_id?: number; // renamed for backend
  assign_to?: string | null;
  is_customer?: boolean;
  remarks: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string; // Add field to show who created the lead
  user_id?: number; // Add field for user ID
};

// Utility to map frontend fields to backend fields
function mapLeadToBackend(lead: Lead & { division?: string; subdivision?: string; assign_to?: string | null }) {
  const { division, subdivision, division_id, subdivision_id, assign_to, ...rest } = lead;
  
  // Ensure division_id and subdivision_id are properly handled
  let mappedDivisionId = null;
  let mappedSubdivisionId = null;
  
  if (division !== undefined) {
    mappedDivisionId = division === "" ? null : Number(division);
  } else if (division_id !== undefined) {
    mappedDivisionId = division_id;
  }
  
  if (subdivision !== undefined) {
    mappedSubdivisionId = subdivision === "" ? null : Number(subdivision);
  } else if (subdivision_id !== undefined) {
    mappedSubdivisionId = subdivision_id;
  }
  
  // Handle assign_to field - convert to user_id if it's a valid number
  let userId = null;
  if (assign_to !== undefined && assign_to !== null && assign_to !== '') {
    const assignToNum = Number(assign_to);
    if (!isNaN(assignToNum)) {
      userId = assignToNum;
    }
  }
  
  const mappedLead = {
    ...rest,
    division_id: mappedDivisionId,
    subdivision_id: mappedSubdivisionId,
    // Map assign_to to user_id for backend
    user_id: userId,
  };
  
  console.log('mapLeadToBackend: Input lead:', lead);
  console.log('mapLeadToBackend: Mapped lead:', mappedLead);
  
  return mappedLead;
}

// Utility to remove empty string or undefined fields
function removeEmptyFields(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      // Keep boolean values (including false) as they are valid
      if (typeof value === 'boolean') return true;
      // Remove empty strings and undefined values
      return value !== "" && value !== undefined;
    })
  );
}

export async function fetchLeads(): Promise<Lead[]> {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.LEADS), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch leads: ${res.status} ${res.statusText}`);
    }
    const result = await res.json();
    console.log('🔍 Debug - fetchLeads API response:', result);
    
    // Handle different backend response shapes
    if (Array.isArray(result)) return result;
    if (result.leads && Array.isArray(result.leads)) return result.leads;
    if (result.data && Array.isArray(result.data)) return result.data; // This matches your API response
    if (result.data && Array.isArray(result.data.leads)) return result.data.leads;
    return [];
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to fetch leads. Please check your connection.");
  }
}

export async function addLead(lead: Lead): Promise<Lead> {
  // Validate required fields
  if (!lead.name || lead.name.trim() === "") {
    throw new Error("Name is required.");
  }
  if (!lead.contact || lead.contact.toString().length !== 10) {
    throw new Error("Contact is required and must be 10 digits.");
  }
  if (!lead.remarks || lead.remarks.trim() === "") {
    throw new Error("Remarks is required.");
  }
  // Map fields for backend and remove empty fields
  const backendLead = removeEmptyFields(mapLeadToBackend(lead));
  console.log('addLead: Data being sent to backend:', backendLead); // <-- Log the payload
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.CREATE_LEAD), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(backendLead),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = errorData?.message || `Failed to add lead: ${res.status} ${res.statusText}`;
      throw new Error(errorMsg);
    }
    return res.json();
  } catch (error) {
    console.error("Error adding lead:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to add lead. Please check your connection.");
  }
}

export async function fetchLeadById(id: number): Promise<Lead> {
  const token = localStorage.getItem('token');
  const res = await fetch(getApiUrl(API_ENDPOINTS.LEAD_DETAILS(id)), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch lead: ${res.status} ${res.statusText}`);
  const result = await res.json();
  // Return only the lead object
  return result.data?.lead || result.lead || result;
}

export async function updateLead(lead: Lead): Promise<Lead> {
  const token = localStorage.getItem('token');
  
  // Validate required fields
  if (!lead.lead_id) {
    throw new Error("Lead ID is required for update.");
  }
  if (!lead.name || lead.name.trim() === "") {
    throw new Error("Name is required.");
  }
  if (!lead.contact || lead.contact.toString().length !== 10) {
    throw new Error("Contact is required and must be 10 digits.");
  }
  // Make remarks optional for updates since it might not be included in edit data
  if (!lead.remarks) {
    console.warn("Remarks field is missing, using empty string as default");
    lead.remarks = "";
  }
  
  // Map fields for backend and remove empty fields (like addLead)
  const backendLead = removeEmptyFields(mapLeadToBackend(lead));
  console.log('updateLead: Data being sent to backend:', backendLead);
  console.log('updateLead: API URL:', getApiUrl(API_ENDPOINTS.LEAD_UPDATE(lead.lead_id)));
  
  // Ensure all required fields are present and properly formatted
  const sanitizedLead = {
    ...backendLead,
    // Ensure these fields are properly formatted
    name: (backendLead.name as string)?.trim() || '',
    contact: (backendLead.contact as string)?.toString() || '',
    remarks: (backendLead.remarks as string)?.trim() || '',
    // Handle optional fields that might be causing issues
    division_id: backendLead.division_id || null,
    subdivision_id: backendLead.subdivision_id || null,
    assign_to: backendLead.assign_to || null,
    is_customer: backendLead.is_customer || false,
    // Ensure date fields are properly formatted
    created_at: backendLead.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  console.log('updateLead: Sanitized data:', sanitizedLead);
  
  try {
    console.log('updateLead: Making request to:', getApiUrl(API_ENDPOINTS.LEAD_UPDATE(lead.lead_id)));
    console.log('updateLead: Request headers:', {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token ? '***' : 'NO TOKEN'}`
    });
    
    const res = await fetch(getApiUrl(API_ENDPOINTS.LEAD_UPDATE(lead.lead_id)), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(sanitizedLead),
    });
    
    console.log('updateLead: Response status:', res.status);
    console.log('updateLead: Response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('updateLead: Error response text:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      const errorMsg = errorData?.message || errorData?.detail || errorData?.error || `Failed to update lead: ${res.status} ${res.statusText}`;
      console.error('Update lead error response:', errorData);
      throw new Error(errorMsg);
    }
    
    const result = await res.json();
    console.log('updateLead: Response received:', result);
    return result.data?.lead || result.lead || result;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update lead. Please check your connection.");
  }
}

export async function deleteLead(lead_id: number): Promise<void> {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.LEAD_DETAILS(lead_id)), {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to delete lead: ${res.status} ${res.statusText}`);
    }
    return;
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw new Error("Failed to delete lead. Please check your connection.");
  }
}

/**
 * Fetch customer leads by filtering all leads where is_customer is true
 * Since there's no dedicated customer endpoint, we fetch all leads and filter
 */
export async function fetchIsCustomerLeads(): Promise<Lead[]> {
  // Check if we're in mock mode
  if (isMockMode()) {
    console.log('Using mock customer leads data');
    return MOCK_DATA.CUSTOMER_LEADS as Lead[];
  }

  const token = localStorage.getItem('token');
  console.log('Fetching all leads to filter customers...');
  try {
    // Fetch all leads and filter for customers
    const res = await fetch(getApiUrl(API_ENDPOINTS.LEADS), {
      method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) {
      throw new Error(`Failed to fetch leads: ${res.status} ${res.statusText}`);
  }
  const result = await res.json();
    console.log('All leads API response:', result);
    
    // Handle different backend response shapes and filter for customers
    let allLeads: Lead[] = [];
    if (Array.isArray(result)) {
      allLeads = result;
    } else if (result.leads && Array.isArray(result.leads)) {
      allLeads = result.leads;
    } else if (result.data && Array.isArray(result.data)) {
      allLeads = result.data;
    } else if (result.data && Array.isArray(result.data.leads)) {
      allLeads = result.data.leads;
    }
    
    // Filter for leads where is_customer is true
    const customerLeads = allLeads.filter(lead => lead.is_customer === true);
    console.log('Filtered customer leads:', customerLeads);
    return customerLeads;
  } catch (error) {
    console.error("Error fetching customer leads:", error);
    // Fallback to mock data if API fails
    console.log('Falling back to mock customer leads data');
    return MOCK_DATA.CUSTOMER_LEADS as Lead[];
  }
}

export async function fetchLeadsByUser(): Promise<Lead[]> {
  const token = localStorage.getItem('token');
  console.log('🔍 Debug - fetchLeadsByUser called');
  console.log('🔍 Debug - Token present:', !!token);
  
  // Try multiple approaches
  const approaches = [
    // Approach 1: Direct user-specific endpoint
    async () => {
      console.log('🔍 Debug - Trying approach 1: Direct user endpoint');
      const res = await fetch(getApiUrl(API_ENDPOINTS.LEADS_BY_USER), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log('🔍 Debug - Approach 1 successful:', result);
        return result;
      }
      throw new Error(`Approach 1 failed: ${res.status}`);
    },
    
    // Approach 2: Regular leads endpoint with user_id parameter
    async () => {
      console.log('🔍 Debug - Trying approach 2: Regular leads with user_id param');
      const userId = localStorage.getItem('user_id');
      const url = `${getApiUrl(API_ENDPOINTS.LEADS)}?user_id=${userId}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log('🔍 Debug - Approach 2 successful:', result);
        return result;
      }
      throw new Error(`Approach 2 failed: ${res.status}`);
    },
    
    // Approach 3: Fallback to filtering all leads
    async () => {
      console.log('🔍 Debug - Trying approach 3: Fallback filtering');
      return await fetchLeadsByUserFallback();
    }
  ];
  
  for (let i = 0; i < approaches.length; i++) {
    try {
      const result = await approaches[i]();
      
      // Handle different backend response shapes
      if (Array.isArray(result)) return result;
      if (result.leads && Array.isArray(result.leads)) return result.leads;
      if (result.data && Array.isArray(result.data.leads)) return result.data.leads;
      if (result.data && Array.isArray(result.data)) return result.data;
      return [];
    } catch (error) {
      console.log(`🔍 Debug - Approach ${i + 1} failed:`, error);
      if (i === approaches.length - 1) {
        // Last approach failed
        console.error("All approaches failed for fetching user leads:", error);
        throw new Error("Failed to fetch user leads. Please check your connection.");
      }
    }
  }
  
  return [];
}

// Fallback function that filters regular leads by current user
async function fetchLeadsByUserFallback(): Promise<Lead[]> {
  try {
    console.log('🔍 Debug - Using fallback: fetching all leads and filtering by user');
    const allLeads = await fetchLeads();
    const currentUserId = localStorage.getItem('user_id');
    const currentUserName = localStorage.getItem('userName');
    
    console.log('🔍 Debug - Current user ID:', currentUserId);
    console.log('🔍 Debug - Current user name:', currentUserName);
    console.log('🔍 Debug - Total leads fetched:', allLeads.length);
    
    // Filter leads by user_id or created_by field
    const userLeads = allLeads.filter(lead => {
      // Check if lead has user_id field that matches current user
      if (lead.user_id && currentUserId && lead.user_id.toString() === currentUserId) {
        console.log('🔍 Debug - Lead matched by user_id:', lead.lead_id);
        return true;
      }
      
      // Check if lead has created_by field that matches current user name
      if (lead.created_by && currentUserName && lead.created_by === currentUserName) {
        console.log('🔍 Debug - Lead matched by created_by:', lead.lead_id);
        return true;
      }
      
      // Check if lead has assign_to field that matches current user
      if (lead.assign_to && currentUserId && lead.assign_to.toString() === currentUserId) {
        console.log('🔍 Debug - Lead matched by assign_to:', lead.lead_id);
        return true;
      }
      
      // If no user filtering is possible, return all leads for now
      // This is a temporary fallback until proper user filtering is implemented
      console.log('🔍 Debug - No user filtering criteria found, returning all leads');
      return true;
    });
    
    console.log('🔍 Debug - User leads after filtering:', userLeads.length);
    return userLeads;
  } catch (error) {
    console.error('🔍 Debug - Fallback also failed:', error);
    throw new Error("Failed to fetch user leads. Please check your connection.");
  }
}

export async function fetchRawLeads() {
  const token = localStorage.getItem('token');
  
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.RAW_LEADS), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('fetchRawLeads: Error response:', errorText);
      throw new Error(`Failed to fetch raw leads: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data && Array.isArray(data.leads)) {
      return data.leads;
    }
    return [];
  } catch (error) {
    console.error('fetchRawLeads: Error:', error);
    throw error;
  }
}

export async function fetchCompletedLeads() {
  const token = localStorage.getItem('token');
  const res = await fetch(getApiUrl(API_ENDPOINTS.COMPLETED_LEADS), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch completed leads');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.leads)) return data.leads;
  return [];
}

export async function fetchAfterVisitLeads() {
  const token = localStorage.getItem('token');
  const res = await fetch(getApiUrl(API_ENDPOINTS.AFTER_VISIT_LEADS), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch after visit leads');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.leads)) return data.leads;
  return [];
}

export async function fetchBeforeVisitLeads() {
  const token = localStorage.getItem('token');
  const res = await fetch(getApiUrl(API_ENDPOINTS.BEFORE_VISIT_LEADS), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch before visit leads');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.leads)) return data.leads;
  return [];
}

export async function fetchRawLeadById(id: number | string) {
  const token = localStorage.getItem('token');
  const res = await fetch(getApiUrl(API_ENDPOINTS.RAW_LEAD_BY_ID(Number(id))), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch raw lead by id');
  const data = await res.json();
  return data.data || data.lead || data;
}

export async function fetchCompletedLeadById(id: number | string) {
  const token = localStorage.getItem('token');
  const res = await fetch(getApiUrl(API_ENDPOINTS.COMPLETED_LEAD_BY_ID(Number(id))), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch completed lead by id');
  const data = await res.json();
  return data.data || data.lead || data;
}

export async function fetchAfterVisitLeadById(id: number | string) {
  const token = localStorage.getItem('token');
  const res = await fetch(getApiUrl(API_ENDPOINTS.AFTER_VISIT_LEAD_BY_ID(Number(id))), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch after visit lead by id');
  const data = await res.json();
  return data.data || data.lead || data;
}

export async function fetchBeforeVisitLeadById(id: number | string) {
  const token = localStorage.getItem('token');
  const res = await fetch(getApiUrl(API_ENDPOINTS.BEFORE_VISIT_LEAD_BY_ID(Number(id))), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch before visit lead by id');
  const data = await res.json();
  return data.data || data.lead || data;
}
