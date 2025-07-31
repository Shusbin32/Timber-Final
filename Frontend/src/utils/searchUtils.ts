// Search utility functions for filtering data across the application

export interface SearchableItem {
  [key: string]: unknown;
}

/**
 * Generic search function that searches across multiple fields
 * @param items Array of items to search through
 * @param searchTerm Search term to look for
 * @param searchFields Array of field names to search in
 * @returns Filtered array of items
 */
export function searchItems<T extends SearchableItem>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) {
    return items;
  }

  const searchLower = searchTerm.toLowerCase();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (value == null) return false;
      
      const stringValue = String(value).toLowerCase();
      return stringValue.includes(searchLower);
    });
  });
}

/**
 * Advanced filter function with multiple filter criteria
 * @param items Array of items to filter
 * @param filters Object with filter criteria
 * @returns Filtered array of items
 */
export function filterItems<T extends SearchableItem>(
  items: T[],
  filters: Record<string, unknown>
): T[] {
  return items.filter(item => {
    for (const [key, filterValue] of Object.entries(filters)) {
      if (!filterValue || filterValue === '') continue;
      
      const itemValue = item[key];
      if (itemValue == null) return false;
      
      const itemString = String(itemValue).toLowerCase();
      const filterString = String(filterValue).toLowerCase();
      
      if (!itemString.includes(filterString)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Combined search and filter function
 * @param items Array of items to process
 * @param searchTerm General search term
 * @param searchFields Fields to search in
 * @param filters Specific field filters
 * @returns Filtered array of items
 */
export function searchAndFilterItems<T extends SearchableItem>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  filters: Record<string, unknown> = {}
): T[] {
  // First apply general search
  let filtered = searchItems(items, searchTerm, searchFields);
  
  // Then apply specific filters
  filtered = filterItems(filtered, filters);
  
  return filtered;
}

// Predefined search configurations for common entities
export const SEARCH_CONFIGS = {
  leads: {
    searchFields: ['name', 'contact', 'city', 'email', 'company_name', 'address', 'landmark', 'category', 'pan_vat', 'branch', 'source', 'lead_type', 'remarks'],
    filterFields: ['name', 'contact', 'city', 'address', 'email', 'gender', 'landmark', 'category', 'pan_vat', 'company_name', 'lead_type', 'branch', 'assign_to', 'division_id', 'subdivision_id']
  },
  users: {
    searchFields: ['name', 'email', 'phone', 'role'],
    filterFields: ['name', 'email', 'phone', 'role']
  },
  dealers: {
    searchFields: ['name', 'email', 'contact', 'dealer_id', 'city', 'address'],
    filterFields: ['name', 'email', 'contact', 'city', 'address', 'status']
  },
  divisions: {
    searchFields: ['name', 'division_name'],
    filterFields: ['name', 'division_name']
  },
  subdivisions: {
    searchFields: ['name', 'subdivision_name', 'division'],
    filterFields: ['name', 'subdivision_name', 'division']
  },
  roles: {
    searchFields: ['role_name', 'name'],
    filterFields: ['role_name', 'name']
  },
  followups: {
    searchFields: ['lead_name', 'name', 'followup_remarks', 'notes', 'followup_type'],
    filterFields: ['lead_name', 'followup_type', 'assign_to', 'status']
  }
}; 