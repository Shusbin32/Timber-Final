// API Configuration
// Set this to true to use mock data and localStorages
// Set this to false to use real backend API calls
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Backend API URL (used when USE_MOCKS is false)
// Force localhost for testing - override any environment variable
export const API_BASE_URL = "http://127.0.0.1:8000";

// Debug logging
console.log('🔧 Config Debug - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔧 Config Debug - API_BASE_URL resolved to:', API_BASE_URL);
console.log('🔧 Config Debug - FORCED to localhost for testing');

// Production environment check
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// API endpoints - Updated to match Django URL patterns exactly
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/user/login',
  LOGOUT: '/api/user/logout',
  
  // Lead endpoints - Updated to match Django URLs
  LEADS: '/api/services/getallleads',
  CREATE_LEAD: '/api/services/createlead',
  LEAD_DETAILS: (id: number) => `/api/services/getlead/${id}`,
  LEAD_UPDATE: (id: number) => `/api/services/updatelead/${id}`,
  IMPORT_LEADS: '/api/services/importleads', // Add missing import endpoint
  
  // Specialized lead endpoints - Updated to match Django URLs
  RAW_LEADS: '/api/services/getrawleads',
  RAW_LEAD_BY_ID: (id: number) => `/api/services/getrawleadbyid/${id}`,
  COMPLETED_LEADS: '/api/services/getcompletedleads',
  COMPLETED_LEAD_BY_ID: (id: number) => `/api/services/getcompletedleadbyid/${id}`,
  AFTER_VISIT_LEADS: '/api/services/getaftervisitleads',
  AFTER_VISIT_LEAD_BY_ID: (id: number) => `/api/services/getaftervisitleadbyid/${id}`,
  BEFORE_VISIT_LEADS: '/api/services/getbeforevisitleads',
  BEFORE_VISIT_LEAD_BY_ID: (id: number) => `/api/services/getbeforevisitleadbyid/${id}`,
  
  // Customer endpoints
  CUSTOMERS: '/api/services/getallcustomers',
  CUSTOMER_BY_ID: (id: number) => `/api/services/getcustomerbyid/${id}`,
  
  // Assignment endpoints
  ASSIGNED_LEADS: '/api/services/getallassignleads',
  ASSIGN_LEAD: (id: number) => `/api/services/getassignlead/${id}`,
  LEADS_BY_USER: '/api/services/getleadsaccordingtouser',
  LEADS_BY_USER_ALT: '/api/services/getallleads', // Alternative endpoint with user filtering
  
  // Followup endpoints - Updated to match Django URLs
  FOLLOWUPS: '/api/services/getallfollowup',
  FOLLOWUP_BY_ID: (id: number) => `/api/services/getfollowupbyid/${id}`,
  ALL_COMPLETED_FOLLOWUP: '/api/services/getallcompletedfollowup',
  COMPLETED_FOLLOWUP_BY_ID: (id: number) => `/api/services/getcompletedfollowupbyid/${id}`,
  ALL_OVERDUE_FOLLOWUP: '/api/services/getalloverduefollowup',
  OVERDUE_FOLLOWUP_BY_ID: (id: number) => `/api/services/getoverduefollowupbyid/${id}`,
  ALL_PENDING_FOLLOWUP: '/api/services/getallpendingfollowup',
  PENDING_FOLLOWUP_BY_ID: (id: number) => `/api/services/getpendingfollowupbyid/${id}`,
  RESCHEDULE_FOLLOWUP: (id: number) => `/api/services/updatefollowup/${id}`,
  
  // Lead logs endpoints
  LEAD_LOGS: '/api/services/allleadlogdetails',
  LEAD_LOG_DETAILS: (id: number) => `/api/services/leadlogdetails/${id}`,
  
  // Division endpoints
  DIVISIONS: '/api/services/getalldivisions',
  DIVISION_BY_ID: (id: number) => `/api/services/getdivision/${id}`,
  CREATE_DIVISION: '/api/services/createdivision',
  UPDATE_DIVISION: (id: number) => `/api/services/updatedivision/${id}`,
  DELETE_DIVISION: (id: number) => `/api/services/deletedivision/${id}`,
  
  // Subdivision endpoints
  SUBDIVISIONS: '/api/services/getallsubdivisions',
  SUBDIVISION_BY_ID: (id: number) => `/api/services/getsubdivision/${id}`,
  CREATE_SUBDIVISION: '/api/services/createsubdivision',
  UPDATE_SUBDIVISION: (id: number) => `/api/services/updatesubdivision/${id}`,
  DELETE_SUBDIVISION: (id: number) => `/api/services/deletesubdivision/${id}`,
  
  // Branch endpoints
  BRANCHES: '/api/services/getallbranches',
  BRANCH_BY_ID: (id: number) => `/api/services/getbranch/${id}`,
  CREATE_BRANCH: '/api/services/createbranch',
  UPDATE_BRANCH: (id: number) => `/api/services/updatebranch/${id}`,
  DELETE_BRANCH: (id: number) => `/api/services/deletebranch/${id}`,
};

// Mock data for offline functionality
export const MOCK_DATA = {
  // Mock leads for initial data
  LEADS: [
    {
      lead_id: 1,
      name: "Sandipa khadka",
      contact: "9810264883",
      address: "Kathmandu, Nepal",
      email: "sandipa@example.com",
      gender: "Female",
      city: "Kathmandu",
      landmark: "Near Central Park",
      lead_type: "Raw Data",
      source: "WhatsApp",
      category: "Residential",
      pan_vat: "PAN123456",
      company_name: "Timber Group",
      branch: "Main Branch",
      tentetive_visit_date: "2024-12-15",
      tentetive_purchase_date: "2024-12-20",
      division: "Timber",
      subdivision: "Hardwood",
      assign_to: "Sandipa",
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
    },
    {
      lead_id: 2,
      name: "Kedar sir",
      contact: "9876543210",
      address: "Pokhara, Nepal",
      email: "kedar@example.com",
      gender: "Male",
      city: "Pokhara",
      landmark: "Near Lake Side",
      lead_type: "Complete",
      source: "Referral",
      category: "Commercial",
      pan_vat: "PAN789012",
      company_name: "Kedar Enterprises",
      branch: "Pokhara Branch",
      tentetive_visit_date: "2024-12-18",
      tentetive_purchase_date: "2024-12-25",
      division: "Timber",
      subdivision: "Softwood",
      assign_to: "Kedar",
      created_at: "2024-12-02T11:00:00Z",
      updated_at: "2024-12-02T11:00:00Z",
    },
  ],
  
  // Mock lead logs
  LEAD_LOGS: [
    {
      id: 1,
      action: "added",
      user: "Sandipa",
      lead_id: 1,
      timestamp: "2024-12-01T10:00:00Z",
      name: "Sandipa khadka",
      contact: "9810264883",
      email: "sandipa@example.com",
      lead_type: "Raw Data",
      source: "WhatsApp",
    },
    {
      id: 2,
      action: "updated",
      user: "Kedar",
      lead_id: 2,
      timestamp: "2024-12-02T11:00:00Z",
      name: "Kedar sir",
      contact: "9876543210",
      email: "kedar@example.com",
      lead_type: "Complete",
      source: "Referral",
    },
  ],
  
  // Mock customer leads
  CUSTOMER_LEADS: [
    {
      lead_id: 3,
      name: "Customer One",
      contact: "9876543211",
      address: "Customer Address 1",
      email: "customer1@example.com",
      gender: "Male",
      city: "Customer City",
      landmark: "Customer Landmark",
      lead_type: "Complete",
      source: "Direct",
      category: "Residential",
      pan_vat: "CUST123456",
      company_name: "Customer Company",
      branch: "Customer Branch",
      tentetive_visit_date: "2024-12-15",
      tentetive_purchase_date: "2024-12-20",
      division: "Customer Division",
      subdivision: "Customer Subdivision",
      assign_to: "Customer Assignee",
      created_at: "2024-12-03T10:00:00Z",
      updated_at: "2024-12-03T10:00:00Z",
      is_customer: true,
      remarks: "This is a customer lead",
      remarks_detail: {
        user: "Admin",
        remarks: "Customer converted successfully"
      }
    },
    {
      lead_id: 4,
      name: "Customer Two",
      contact: "9876543212",
      address: "Customer Address 2",
      email: "customer2@example.com",
      gender: "Female",
      city: "Customer City 2",
      landmark: "Customer Landmark 2",
      lead_type: "Complete",
      source: "Website",
      category: "Commercial",
      pan_vat: "CUST789012",
      company_name: "Customer Company 2",
      branch: "Customer Branch 2",
      tentetive_visit_date: "2024-12-18",
      tentetive_purchase_date: "2024-12-25",
      division: "Customer Division 2",
      subdivision: "Customer Subdivision 2",
      assign_to: "Customer Assignee 2",
      created_at: "2024-12-04T11:00:00Z",
      updated_at: "2024-12-04T11:00:00Z",
      is_customer: true,
      remarks: "Another customer lead",
      remarks_detail: {
        user: "Manager",
        remarks: "High-value customer"
      }
    },
  ],
  
  // Mock followups
  FOLLOWUPS: [
    {
      id: 1,
      lead_id: 1,
      followup_date: "2024-12-10",
      notes: "Initial contact made",
      status: "Scheduled",
      created_at: "2024-12-01T10:00:00Z",
    },
    {
      id: 2,
      lead_id: 2,
      followup_date: "2024-12-12",
      notes: "Product demonstration scheduled",
      status: "Completed",
      created_at: "2024-12-02T11:00:00Z",
    },
  ],
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

// Helper function to check if we're in mock mode
export function isMockMode(): boolean {
  return USE_MOCKS;
}