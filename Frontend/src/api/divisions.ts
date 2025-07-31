import { getApiUrl, API_ENDPOINTS, isMockMode } from '@/config/api';

export interface Division extends Record<string, unknown> {
  id: number;
  name: string;
  description: string;
  manager: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDivisionData {
  name: string;
}

export interface UpdateDivisionData {
  name?: string;
}

// Get all divisions
export async function fetchDivisions(): Promise<Division[]> {
  if (isMockMode()) {
    // Return mock data for offline mode
    return [
      {
        id: 1,
        name: "Sales Division",
        description: "Handles all sales operations",
        manager: "John Doe",
        created_at: "2024-01-15"
      },
      {
        id: 2,
        name: "Marketing Division",
        description: "Manages marketing campaigns",
        manager: "Jane Smith",
        created_at: "2024-01-10"
      },
      {
        id: 3,
        name: "IT Division",
        description: "Technology and infrastructure",
        manager: "Bob Johnson",
        created_at: "2024-01-05"
      }
    ];
  }

  try {
    const token = localStorage.getItem('token');
    console.log('Fetching divisions from:', getApiUrl(API_ENDPOINTS.DIVISIONS));
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.DIVISIONS), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    // Handle different response structures
    if (data.divisions && Array.isArray(data.divisions)) {
      return data.divisions;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.success && Array.isArray(data.data)) {
      // Backend returns success with array of divisions
      console.log('Using data.data array from success response');
      return data.data.map((division: Record<string, unknown>) => {
        // Convert pk or division_id to id if needed
        if (division.pk && !division.id) {
          division.id = division.pk;
        } else if (division.division_id && !division.id) {
          division.id = division.division_id;
        }
        return division;
      });
    } else if (data && typeof data === 'object' && Object.keys(data).length === 0) {
      // Empty object response - return empty array
      console.log('Empty response from API, returning empty array');
      return [];
    } else {
      console.log('Unexpected response structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw new Error(`Failed to fetch divisions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create new division
export async function createDivision(divisionData: CreateDivisionData): Promise<Division> {
  if (isMockMode()) {
    // Simulate API call for offline mode
    const newDivision: Division = {
      id: Date.now(),
      name: divisionData.name,
      description: '',
      manager: '',
      created_at: new Date().toISOString().split('T')[0]
    };
    return newDivision;
  }

  try {
    const token = localStorage.getItem('token');
    console.log('Creating division with data:', divisionData);
    console.log('API URL:', getApiUrl(API_ENDPOINTS.CREATE_DIVISION));
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_DIVISION), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(divisionData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      
      // Try to parse JSON error message
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message && errorData.message.includes('not JSON serializable')) {
          throw new Error(`Django Backend Error: The Division model needs proper JSON serialization. Please fix the Django view to use Django REST Framework serializers or JsonResponse.`);
        }
      } catch {
        // If not JSON, use the raw error text
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('=== BACKEND RESPONSE DEBUG ===');
    console.log('Response data:', data);
    console.log('Response data type:', typeof data);
    console.log('Response data keys:', Object.keys(data));
    console.log('Response data.success:', data.success);
    console.log('Response data.data:', data.data);
    console.log('Response data.message:', data.message);
    console.log('=== END DEBUG ===');
    
    // Handle different response structures
    if (data.division) {
      console.log('Using data.division');
      return data.division;
    } else if (data && typeof data === 'object' && data.id) {
      console.log('Using data directly with id');
      return data;
    } else if (data.success && data.data === null) {
      // Backend returns success but no data - create a mock response
      console.log('Backend returned success but no data, creating mock response');
      const mockDivision: Division = {
        id: Date.now(),
        name: divisionData.name,
        description: '',
        manager: '',
        created_at: new Date().toISOString().split('T')[0]
      };
      return mockDivision;
    } else if (data.success && data.data) {
      // Backend returns success with data
      console.log('Using data.data from success response');
      const divisionData = data.data;
      
      // Convert pk or division_id to id if needed
      if (divisionData.pk && !divisionData.id) {
        divisionData.id = divisionData.pk;
      } else if (divisionData.division_id && !divisionData.id) {
        divisionData.id = divisionData.division_id;
      }
      
      return divisionData;
    } else {
      console.log('Unexpected create response structure:', data);
      console.log('Available keys:', Object.keys(data));
      throw new Error('Invalid response from create division API');
    }
  } catch (error) {
    console.error('Error creating division:', error);
    
    // If it's a serialization error, provide a helpful message
    if (error instanceof Error && error.message.includes('not JSON serializable')) {
      console.warn('Backend serialization issue detected. Using mock mode for this operation.');
      // Fallback to mock mode for this operation
      const newDivision: Division = {
        id: Date.now(),
        name: divisionData.name,
        description: '',
        manager: '',
        created_at: new Date().toISOString().split('T')[0]
      };
      return newDivision;
    }
    
    throw new Error(`Failed to create division: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get single division
export async function fetchDivision(id: number): Promise<Division> {
  if (isMockMode()) {
    // Return mock data for offline mode
    return {
      id,
      name: "Sample Division",
      description: "Sample description",
      manager: "Sample Manager",
      created_at: "2024-01-15"
    };
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.DIVISION_BY_ID(id)), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.division || data;
  } catch (error) {
    console.error('Error fetching division:', error);
    throw new Error('Failed to fetch division');
  }
}

// Update division
export async function updateDivision(id: number, divisionData: UpdateDivisionData): Promise<Division> {
  if (isMockMode()) {
    // Simulate API call for offline mode
    return {
      id,
      name: divisionData.name || "Updated Division",
      description: '',
      manager: '',
      updated_at: new Date().toISOString().split('T')[0]
    };
  }

  try {
    const token = localStorage.getItem('token');
    console.log('Updating division with data:', divisionData);
    console.log('API URL:', getApiUrl(API_ENDPOINTS.UPDATE_DIVISION(id)));
    
    const response = await fetch(getApiUrl(API_ENDPOINTS.UPDATE_DIVISION(id)), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(divisionData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('=== UPDATE RESPONSE DEBUG ===');
    console.log('Update response data:', data);
    console.log('Response data type:', typeof data);
    console.log('Response data keys:', Object.keys(data));
    console.log('Response data.success:', data.success);
    console.log('Response data.data:', data.data);
    console.log('Response data.message:', data.message);
    console.log('Response data.division:', data.division);
    console.log('=== END UPDATE DEBUG ===');
    
    // Handle different response structures
    if (data.division) {
      console.log('Using data.division');
      return data.division;
    } else if (data && typeof data === 'object' && data.id) {
      console.log('Using data directly with id');
      return data;
    } else if (data.success && data.data) {
      // Backend returns success with data
      console.log('Using data.data from success response');
      const divisionData = data.data;
      
      // Convert pk or division_id to id if needed
      if (divisionData.pk && !divisionData.id) {
        divisionData.id = divisionData.pk;
      } else if (divisionData.division_id && !divisionData.id) {
        divisionData.id = divisionData.division_id;
      }
      
      return divisionData;
    } else if (data.success && data.message) {
      // Backend returns success but no data - create a mock response
      console.log('Backend returned success but no data, creating mock response');
      const mockDivision: Division = {
        id: id,
        name: divisionData.name || 'Updated Division',
        description: '',
        manager: '',
        updated_at: new Date().toISOString().split('T')[0]
      };
      console.log('Created mock division for update:', mockDivision);
      return mockDivision;
    } else {
      console.log('Unexpected update response structure:', data);
      console.log('Available keys:', Object.keys(data));
      throw new Error('Invalid response from update division API');
    }
  } catch (error) {
    console.error('Error updating division:', error);
    throw new Error('Failed to update division');
  }
}

// Delete division
export async function deleteDivision(id: number): Promise<void> {
  if (isMockMode()) {
    // Simulate API call for offline mode
    console.log('Mock: Deleting division with ID:', id);
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.DELETE_DIVISION(id)), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting division:', error);
    throw new Error('Failed to delete division');
  }
} 