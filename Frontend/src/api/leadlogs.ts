import { USE_MOCKS, MOCK_DATA, getApiUrl, API_ENDPOINTS } from '@/config/api';

// Type for lead log
export interface LeadLog {
  id?: number;
  action: string;
  user: string;
  lead_id: number;
  timestamp: string;
  name?: string;
  contact?: string;
  email?: string;
  lead_type?: string;
  source?: string;
  [key: string]: unknown;
}

// Initialize localStorage with mock data if empty
function initializeMockData() {
  if (typeof window === 'undefined') return;
  
  const existingLogs = localStorage.getItem("leadlogs");
  if (!existingLogs || existingLogs === "[]") {
    localStorage.setItem("leadlogs", JSON.stringify(MOCK_DATA.LEAD_LOGS));
  }
}

export async function fetchLeadLogs(params: Record<string, string | number | undefined> = { page: 1, limit: 20 }): Promise<any> {
  if (USE_MOCKS) {
    initializeMockData();
    return JSON.parse(localStorage.getItem("leadlogs") || "[]");
  } else {
    try {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).map(([k, v]) => [k, v !== undefined ? String(v) : ''])
        )
      ).toString();
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl(API_ENDPOINTS.LEAD_LOGS) + '?' + query, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch lead logs: ${res.status} ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("Error fetching lead logs:", error);
      throw new Error("Failed to fetch lead logs. Please check your connection.");
    }
  }
}

export async function addLeadLog(log: LeadLog): Promise<LeadLog> {
  if (USE_MOCKS) {
    const logs = JSON.parse(localStorage.getItem("leadlogs") || "[]");
    const newLog = { 
      ...log, 
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem("leadlogs", JSON.stringify(logs));
    return newLog;
  } else {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.LEAD_LOGS), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      });
      if (!res.ok) {
        throw new Error(`Failed to add lead log: ${res.status} ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("Error adding lead log:", error);
      throw new Error("Failed to add lead log. Please check your connection.");
    }
  }
}
