"use client";

import { PlusIcon, FunnelIcon, CheckIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Card from '@/components/Card';
import Avatar from '@/components/Avatar';
import ExpandableData from '@/components/ExpandableData';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { fetchLeads, updateLead, addLead, fetchLeadsByUser } from '@/api/leads';
import { searchAndFilterItems, SEARCH_CONFIGS } from '@/utils/searchUtils';
import AddLeadPanel from '@/components/AddLeadPanel';
import { useSearchParams } from 'next/navigation';
import { fetchDivisions } from '@/api/divisions';
import { fetchSubDivisions } from '@/api/subdivisions';
import {
  fetchRawLeadById, fetchCompletedLeadById, fetchAfterVisitLeadById, fetchBeforeVisitLeadById, fetchLeadById
} from '@/api/leads';
import { BranchService, Branch } from '@/api/branches';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { getApiUrl } from '@/config/api';
type LeadForm = {
  lead_id?: number;
  name: string;
  contact: string;
  address: string;
  email: string;
  gender: string;
  city: string;
  landmark: string;
  lead_type: string;
  source: string;
  category: string;
  pan_vat: string;
  company_name: string;
  branch: string;
  tentetive_visit_date: string;
  tentetive_purchase_date: string;
  division_id?: number;
  subdivision_id?: number;
  assign_to: string | null;
  created_at: string;
  updated_at: string;
  is_customer?: boolean;
  remarks: string;
  created_by?: string; // Add field to show who created the lead
};

// Interface for imported lead data
interface ImportedLead {
  name?: string;
  contact?: string;
  email?: string;
  gender?: string;
  address?: string;
  // Common variations of field names
  Name?: string;
  Contact?: string;
  Email?: string;
  Gender?: string;
  Address?: string;
  phone?: string;
  Phone?: string;
  mobile?: string;
  Mobile?: string;
  'Full Name'?: string;
  'Phone Number'?: string;
  'Mobile Number'?: string;
  'Email Address'?: string;
  'Full Address'?: string;
  [key: string]: unknown; // Allow for additional fields from CSV/Excel
}

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const selectedType = searchParams.get('type');

  // Removed unused selectedLeadType to fix lint error
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [leads, setLeads] = useState<LeadForm[]>([]);
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [divisions, setDivisions] = useState<{ division_id: number; division_name: string }[]>([]);
  const [subdivisions, setSubdivisions] = useState<{ subdivision_id: number; subdivision_name: string; division_id: number }[]>([]);
  const [search, setSearch] = useState(""); // <-- Add search state
  // Add a loading state for lead details
  const [leadDetailsLoading, setLeadDetailsLoading] = useState(false);
  // Add loading states for production
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Remove internal selectedLeadType state
  // const [selectedLeadType, setSelectedLeadType] = useState<string>('');

  // Filter state
  // Ensure filters type includes subdivision_id and division_id as string
  const [filters, setFilters] = useState<{
    name: string;
    contact: string;
    city: string;
    address: string;
    email: string;
    gender: string;
    landmark: string;
    category: string;
    pan_vat: string;
    company_name: string;
    lead_type: string;
    branch: string;
    tentetive_purchase_date: string;
    tentetive_visit_date: string;
    assign_to: string;
    created_at: string;
    is_customer: string;
    subdivision_id: string;
    division_id: string;
    source: string; // <-- Added
  }>({
    name: '',
    contact: '',
    city: '',
    address: '',
    email: '',
    gender: '',
    landmark: '',
    category: '',
    pan_vat: '',
    company_name: '',
    lead_type: '',
    branch: '',
    tentetive_purchase_date: '',
    tentetive_visit_date: '',
    assign_to: '',
    created_at: '',
    is_customer: '',
    subdivision_id: '',
    division_id: '',
    source: '', // <-- Added
  });

  // Filtered leads using utility function
  const filteredLeads = searchAndFilterItems(
    leads,
    search,
    SEARCH_CONFIGS.leads.searchFields as (keyof LeadForm)[],
    filters
  );

  // Add pagination state and logic if missing
  const [page, setPage] = useState(1);
  const leadsPerPage = 10;
  const paginatedLeads = filteredLeads.slice((page-1)*leadsPerPage, page*leadsPerPage);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  // Add showAllColumns state for toggling columns
  const [showAllColumns, setShowAllColumns] = useState(false);

  // Fetch users for assign_to dropdown
  useEffect(() => {
    setIsLoadingUsers(true);
    setError(null);
    
    fetch('http://127.0.0.1:8000/api/user/getusers', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched users:', data);
        // If your backend returns { data: [...] }
        const usersArr = Array.isArray(data.data) ? data.data : data;
        setUsers(usersArr.map((u: { user_id?: number; id?: number; full_name?: string; name?: string }) => ({
          id: u.user_id || u.id || 0,
          name: u.full_name || u.name || 'Unknown User'
        })));
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
        setUsers([]);
      })
      .finally(() => {
        setIsLoadingUsers(false);
      });
  }, []);

  // Fetch divisions and subdivisions
  useEffect(() => {
    setIsLoadingDivisions(true);
    setError(null);
    
    Promise.all([
      fetchDivisions().then((data) => {
        const arr = Array.isArray(data) ? data : [];
        const mapped = arr.map((item) => ({
          division_id: Number(item.division_id ?? item.id),
          division_name: String(item.division_name ?? item.name),
          // ...other fields as needed
        }));
        setDivisions(mapped);
      }).catch((err) => {
        console.error('Error fetching divisions:', err);
        setError('Failed to load divisions. Please try again.');
      }),
      fetchSubDivisions().then((data: unknown) => {
        // data may be { subdivisions: [...] } or just an array
        const rawArr: Record<string, unknown>[] = Array.isArray(data)
          ? data as Record<string, unknown>[]
          : ((data as { subdivisions?: Record<string, unknown>[] })?.subdivisions
            || (data as { data?: Record<string, unknown>[] })?.data
            || []);
        const arr = rawArr.map((item) => ({
          subdivision_id: Number(item.subdivision_id ?? item.id),
          subdivision_name: String(item.subdivision_name ?? item.name),
          division_id: Number(item.division_id ?? item.division),
          // ...add other fields as needed
        }));
        console.log('Loaded subdivisions:', arr);
        setSubdivisions(arr);
      }).catch((err) => {
        console.error('Error fetching subdivisions:', err);
        setError('Failed to load subdivisions. Please try again.');
      })
    ]).finally(() => {
      setIsLoadingDivisions(false);
    });
  }, []);

  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const branches: Branch[] = await BranchService.getAllBranches();
        setBranchOptions(branches.map(branch => ({ value: branch.branch_id?.toString() || branch.name, label: branch.name })));
      } catch {
        setBranchOptions([]);
      }
    }
    fetchBranches();
  }, []);

    // Load leads from backend on mount
  React.useEffect(() => {
    async function fetchLeadsByType() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Decode the selectedType to handle URL encoding
        const decodedType = selectedType ? decodeURIComponent(selectedType) : null;
        
        // Check if user is admin to determine which leads to fetch
        const userRole = localStorage.getItem('role');
        const isAdmin = userRole?.toLowerCase() === 'admin';
        
        console.log('🔍 Debug - User role:', userRole);
        console.log('🔍 Debug - Is admin:', isAdmin);
        
        let allLeads = [];
        if (isAdmin) {
          // Admin sees all leads
          console.log('🔍 Debug - Fetching all leads for admin');
          allLeads = await fetchLeads();
        } else {
          // Regular users see only their own leads
          console.log('🔍 Debug - Fetching user-specific leads');
          allLeads = await fetchLeadsByUser();
        }
        
        console.log('🔍 Debug - Total leads fetched:', allLeads.length);
        console.log('🔍 Debug - Sample lead data:', allLeads[0]);
        
        let filteredLeads = allLeads;
        if (decodedType === 'Raw Data') {
          filteredLeads = allLeads.filter(lead => lead.lead_type === 'Raw Data');
        } else if (decodedType === 'Complete') {
          filteredLeads = allLeads.filter(lead => lead.lead_type === 'Complete');
        } else if (decodedType === 'After Visit') {
          filteredLeads = allLeads.filter(lead => lead.lead_type === 'After Visit');
        } else if (decodedType === 'Before Visit') {
          filteredLeads = allLeads.filter(lead => lead.lead_type === 'Before Visit');
        }
        
        // Ensure filteredLeads is mapped to LeadForm[] (add missing fields if necessary)
        const leadsArr = Array.isArray(filteredLeads) ? filteredLeads : [];
        
        const leadsFormData: LeadForm[] = leadsArr.map((lead) => {
            if (typeof lead === 'object' && lead !== null) {
              const l = lead as Record<string, unknown>;
              return {
                name: typeof l.name === 'string' ? l.name : '',
                contact: l.contact ? String(l.contact) : '',
                address: typeof l.address === 'string' ? l.address : '',
                email: typeof l.email === 'string' ? l.email : '',
                gender: typeof l.gender === 'string' ? l.gender : '',
                city: typeof l.city === 'string' ? l.city : '',
                landmark: typeof l.landmark === 'string' ? l.landmark : '',
                lead_type: typeof l.lead_type === 'string' ? l.lead_type : '',
                source: typeof l.source === 'string' ? l.source : '',
                category: typeof l.category === 'string' ? l.category : '',
                pan_vat: typeof l.pan_vat === 'string' ? l.pan_vat : '',
                company_name: typeof l.company_name === 'string' ? l.company_name : '',
                branch: typeof l.branch === 'string' ? l.branch : '',
                tentetive_visit_date: typeof l.tentetive_visit_date === 'string' ? l.tentetive_visit_date : '',
                tentetive_purchase_date: typeof l.tentetive_purchase_date === 'string' ? l.tentetive_purchase_date : '',
                division_id: l.division_id && typeof l.division_id === 'object' && 'id' in l.division_id
                  ? (l.division_id as { id: number }).id
                  : typeof l.division_id === 'number'
                    ? l.division_id
                    : typeof l.division_id === 'string' && l.division_id !== ''
                      ? Number(l.division_id)
                      : undefined,
                subdivision_id: l.subdivision_id && typeof l.subdivision_id === 'object' && 'id' in l.subdivision_id
                  ? (l.subdivision_id as { id: number }).id
                  : typeof l.subdivision_id === 'number'
                    ? l.subdivision_id
                    : typeof l.subdivision_id === 'string' && l.subdivision_id !== ''
                      ? Number(l.subdivision_id)
                      : undefined,
                assign_to: typeof l.assign_to === 'string' ? l.assign_to : null,
                created_at: typeof l.created_at === 'string' ? l.created_at : '',
                updated_at: typeof l.updated_at === 'string' ? l.updated_at : '',
                lead_id: typeof l.lead_id === 'number' ? l.lead_id : undefined,
                is_customer: typeof l.is_customer === 'boolean' ? l.is_customer : false,
                remarks: typeof l.remarks === 'string' ? l.remarks : '',
                created_by: typeof l.created_by === 'string' ? l.created_by : '',
              };
            }
            // fallback for non-object
            return {
            name: '', contact: '', address: '', email: '', gender: '', city: '', landmark: '', lead_type: '', source: '', category: '', pan_vat: '', company_name: '', branch: '', tentetive_visit_date: '', tentetive_purchase_date: '', division_id: undefined, subdivision_id: undefined, assign_to: null, created_at: '', updated_at: '', is_customer: false, remarks: '', created_by: ''
            };
          });
          
          setLeads(leadsFormData);
        } catch (err) {
          console.error('Error fetching leads:', err);
          setError('Failed to load leads. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
      fetchLeadsByType();
    }, [selectedType]);
    
    // Debug: Log when useEffect runs
    console.log('useEffect triggered with selectedType:', selectedType);
    
    // Debug: Check what leads exist in database
    if (selectedType === 'Raw Data') {
              console.log('Raw Data selected, checking database...');
        fetchLeads().then(() => {
          // Debug: Check what lead types exist in database
        }).catch(err => {
        console.error('Error checking all leads:', err);
      });
    }

  function handleAddLead(newLead: LeadForm) {
    const payload = {
      ...newLead,
      assign_to: newLead.assign_to && newLead.assign_to.trim() !== '' ? newLead.assign_to : null,
      division_id: newLead.division_id ? Number(newLead.division_id) : undefined,
      subdivision_id: newLead.subdivision_id ? Number(newLead.subdivision_id) : undefined,
    };
    addLead(payload)
      .then(async () => {
        const leadsData = await fetchLeads();
        const leadsFormData: LeadForm[] = (leadsData as unknown[]).map((lead) => {
          if (typeof lead === 'object' && lead !== null) {
            const l = lead as Record<string, unknown>;
            return {
              name: typeof l.name === 'string' ? l.name : '',
              contact: l.contact ? String(l.contact) : '',
              address: typeof l.address === 'string' ? l.address : '',
              email: typeof l.email === 'string' ? l.email : '',
              gender: typeof l.gender === 'string' ? l.gender : '',
              city: typeof l.city === 'string' ? l.city : '',
              landmark: typeof l.landmark === 'string' ? l.landmark : '',
              lead_type: typeof l.lead_type === 'string' ? l.lead_type : '',
              source: typeof l.source === 'string' ? l.source : '',
              category: typeof l.category === 'string' ? l.category : '',
              pan_vat: typeof l.pan_vat === 'string' ? l.pan_vat : '',
              company_name: typeof l.company_name === 'string' ? l.company_name : '',
              branch: typeof l.branch === 'string' ? l.branch : '',
              tentetive_visit_date: typeof l.tentetive_visit_date === 'string' ? l.tentetive_visit_date : '',
              tentetive_purchase_date: typeof l.tentetive_purchase_date === 'string' ? l.tentetive_purchase_date : '',
              division_id: typeof l.division_id === 'string' ? Number(l.division_id) : undefined,
              subdivision_id: typeof l.subdivision_id === 'string' ? Number(l.subdivision_id) : undefined,
              assign_to: typeof l.assign_to === 'string' ? l.assign_to : null,
              created_at: typeof l.created_at === 'string' ? l.created_at : '',
              updated_at: typeof l.updated_at === 'string' ? l.updated_at : '',
              lead_id: typeof l.lead_id === 'number' ? l.lead_id : undefined,
              is_customer: typeof l.is_customer === 'boolean' ? l.is_customer : false,
              remarks: typeof l.remarks === 'string' ? l.remarks : '',
              created_by: typeof l.created_by === 'string' ? l.created_by : '',
            };
          }
          // fallback for non-object
          return {
            name: '', contact: '', address: '', email: '', gender: '', city: '', landmark: '', lead_type: '', source: '', category: '', pan_vat: '', company_name: '', branch: '', tentetive_visit_date: '', tentetive_purchase_date: '', division_id: undefined, subdivision_id: undefined, assign_to: null, created_at: '', updated_at: '', is_customer: false, remarks: '', created_by: ''
          };
        });
        setLeads(leadsFormData);
        setPage(1);
        toast.success("Lead added successfully!");
      })
      .catch((err: unknown) => {
        let errorMsg = "Unknown error";
        if (typeof err === "object" && err !== null && "message" in err) {
          errorMsg = (err as { message?: string }).message || errorMsg;
        }
        toast.error("Failed to add lead: " + errorMsg);
      });
  }

  // Helper function to fetch a single lead by id based on type
  async function fetchLeadDetailsByType(id: number | string, type: string) {
    if (type === 'Raw Data') {
      return await fetchRawLeadById(id);
    } else if (type === 'Complete') {
      return await fetchCompletedLeadById(id);
    } else if (type === 'After Visit') {
      return await fetchAfterVisitLeadById(id);
    } else if (type === 'Before Visit') {
      return await fetchBeforeVisitLeadById(id);
    } else {
      return await fetchLeadById(Number(id)); // fallback
    }
  }

  // Dynamically get all fields from LeadForm for table headers
  const leadFields = React.useMemo<{ key: keyof LeadForm; label: string }[]>(() => [
    { key: "name", label: "Name" },
    { key: "contact", label: "Contact" },
    { key: "email", label: "Email" },
    { key: "lead_type", label: "Lead Type" },
    { key: "source", label: "Source" },
    { key: "is_customer", label: "Is Customer" },
    { key: "address", label: "Address" },
    { key: "gender", label: "Gender" },
    { key: "city", label: "City" },
    { key: "landmark", label: "Landmark" },
    { key: "category", label: "Category" },
    { key: "pan_vat", label: "PAN/VAT" },
    { key: "company_name", label: "Company Name" },
    { key: "branch", label: "Branch" },
    { key: "tentetive_visit_date", label: "Tentative Visit Date" },
    { key: "tentetive_purchase_date", label: "Tentative Purchase Date" },
    { key: "division_id", label: "Division" },
    { key: "subdivision_id", label: "Sub Division" },
    { key: "assign_to", label: "Assign To" },
    { key: "created_at", label: "Created At" },
    { key: "updated_at", label: "Updated At" },
    { key: "lead_id", label: "Lead ID" },
    { key: "remarks", label: "Remarks" },
    { key: "created_by", label: "Created By" },
  ], []);

  // Key columns to show by default
  const keyColumnKeys = React.useMemo<(keyof LeadForm)[]>(() => [
    "name", "contact", "email", "lead_type", "source", "is_customer"
  ], []);
  const [selectedLead, setSelectedLead] = useState<LeadForm | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editLead, setEditLead] = useState<LeadForm | null>(null);

  // Only show columns for fields that have non-empty values in at least one lead
  const visibleFields = React.useMemo(() => {
    if (showAllColumns) return leadFields;
    return leadFields.filter(field => keyColumnKeys.includes(field.key));
  }, [leadFields, showAllColumns, keyColumnKeys]);

  // Debug logging


  // Add state for modal position
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Drag handlers
  function onModalMouseDown(e: React.MouseEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - modalPos.x, y: e.clientY - modalPos.y });
  }
  useEffect(() => {
    if (dragging) {
      function onModalMouseMove(e: MouseEvent) {
        if (dragging && dragStart) {
          setModalPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
      }
      function onModalMouseUp() {
        setDragging(false);
        setDragStart(null);
      }
      window.addEventListener('mousemove', onModalMouseMove);
      window.addEventListener('mouseup', onModalMouseUp);
      return () => {
        window.removeEventListener('mousemove', onModalMouseMove);
        window.removeEventListener('mouseup', onModalMouseUp);
      };
    }
  }, [dragging, dragStart]);

  const typeOptions = ["Raw Data", "Complete", "Before Visit", "After Visit"];

  // Show loading state while initial data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading leads..." />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 flex items-center justify-center p-8">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Import handler
  const handleImport = async (file: File) => {
    try {
      let leads: ImportedLead[] = [];
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true });
        leads = result.data as ImportedLead[];
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        leads = XLSX.utils.sheet_to_json(worksheet) as ImportedLead[];
      } else {
        toast.error('Unsupported file type. Please upload a CSV or XLSX file.');
        return;
      }
      // Filter and map to required fields with flexible column mapping
      const filteredLeads = leads.map((l: ImportedLead) => {
        // Helper function to safely extract string values
        const getStringValue = (obj: ImportedLead, keys: string[]): string => {
          for (const key of keys) {
            if (obj[key] && typeof obj[key] === 'string') {
              return obj[key] as string;
            }
          }
          return '';
        };
        
        // Debug: Log the raw object to see what keys are available
        console.log('Raw lead object keys:', Object.keys(l));
        console.log('Raw lead object values:', l);
        
        const name = getStringValue(l, ['name', 'Name', 'NAME', 'Full Name', 'Full name', 'full name', 'Customer Name', 'Customer name', 'customer name']);
        const contact = getStringValue(l, ['contact', 'Contact', 'CONTACT', 'phone', 'Phone', 'PHONE', 'mobile', 'Mobile', 'MOBILE', 'Phone Number', 'Phone number', 'phone number', 'Mobile Number', 'Mobile number', 'mobile number']);
        const email = getStringValue(l, ['email', 'Email', 'EMAIL', 'Email Address', 'Email address', 'email address']);
        const gender = getStringValue(l, ['gender', 'Gender', 'GENDER', 'sex', 'Sex', 'SEX']);
        const address = getStringValue(l, ['address', 'Address', 'ADDRESS', 'location', 'Location', 'LOCATION', 'Full Address', 'Full address', 'full address']);
        
        console.log('Extracted values - name:', name, 'contact:', contact, 'email:', email);
        
        return {
          name,
          contact,
          email,
          gender,
          address,
        };
      });
      
      console.log('Imported leads data:', filteredLeads);
      console.log('Total leads to process:', filteredLeads.length);
      console.log('Sample lead data:', filteredLeads[0]);
      console.log('Raw imported data sample:', leads[0]);
      // Try bulk import first, fallback to individual creation
      try {
        const res = await fetch(getApiUrl('/api/services/importleads'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ leads: filteredLeads }),
        });
        
        if (res.ok) {
          toast.success('Leads imported successfully!');
        } else {
          throw new Error('Bulk import failed, trying individual creation...');
        }
      } catch (bulkError) {
        console.log('Bulk import failed, trying individual creation...', bulkError);
        
        // Fallback: Create leads individually
        let successCount = 0;
        let errorCount = 0;
        
        for (const lead of filteredLeads) {
          try {
            // Validate and clean the data
            if (!lead.name || lead.name.trim() === '') {
              console.warn('Skipping lead with empty name');
              errorCount++;
              continue;
            }

            // Clean and validate contact number
            let contact = lead.contact || '';
            contact = contact.toString().replace(/\D/g, ''); // Remove non-digits
            if (contact.length !== 10) {
              console.warn(`Skipping lead "${lead.name}" - contact must be 10 digits, got: ${contact}`);
              errorCount++;
              continue;
            }

            const leadData = {
              name: lead.name.trim(),
              contact: contact,
              email: lead.email || '',
              gender: lead.gender || '',
              address: lead.address || '',
              city: '',
              landmark: '',
              lead_type: 'Raw Data',
              source: 'Import',
              category: '',
              pan_vat: '',
              company_name: '',
              branch: '',
              tentetive_visit_date: '',
              tentetive_purchase_date: '',
              division_id: undefined,
              subdivision_id: undefined,
              assign_to: '',
              is_customer: false,
              remarks: 'Imported from file',
              created_by: localStorage.getItem('userName') || ''
            };
            
            console.log('Creating lead:', leadData.name, 'with contact:', leadData.contact);
            await addLead(leadData);
            successCount++;
          } catch (error) {
            console.error('Failed to create lead:', lead.name, error);
            errorCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`Imported ${successCount} leads successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        } else {
          console.error('Import failed - all leads failed validation or creation');
          throw new Error(`All leads failed to import. Check console for details. Success: ${successCount}, Errors: ${errorCount}`);
        }
      }
      
      // Refresh leads list
      const leadsData = await fetchLeadsByUser();
      setLeads(
        leadsData.map(l => ({
          name: l.name || '',
          contact: l.contact || '',
          email: l.email || '',
          gender: l.gender || '',
          address: l.address || '',
          city: l.city || '',
          landmark: l.landmark || '',
          lead_type: l.lead_type || '',
          source: l.source || '',
          category: l.category || '',
          pan_vat: l.pan_vat || '',
          company_name: l.company_name || '',
          branch: l.branch || '',
          tentetive_visit_date: l.tentetive_visit_date || '',
          tentetive_purchase_date: l.tentetive_purchase_date || '',
          division_id: l.division_id || undefined,
          subdivision_id: l.subdivision_id || undefined,
          assign_to: l.assign_to || '',
          created_at: l.created_at || '',
          updated_at: l.updated_at || '',
          is_customer: l.is_customer || false,
          remarks: l.remarks || '',
          lead_id: l.lead_id || undefined,
          created_by: l.created_by || '',
        }))
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error('Import failed: ' + errorMessage);
    }
  };

  // Updated Export handler for API-based export with filters
  const handleExport = async () => {
    // Map UI filter state to API query params
    const filterParams: Record<string, string> = {};
    if (filters.name) filterParams.name = filters.name;
    if (filters.contact) filterParams.contact = filters.contact;
    if (filters.email) filterParams.email = filters.email;
    if (filters.gender) filterParams.gender = filters.gender;
    if (filters.lead_type) filterParams.lead_type = filters.lead_type;
    if (filters.source) filterParams.source = filters.source;
    if (filters.category) filterParams.category = filters.category;
    if (filters.is_customer) filterParams.is_customer = filters.is_customer;
    if (filters.division_id) filterParams.division_id = filters.division_id;
    if (filters.created_at) filterParams.created_from = filters.created_at; // assuming created_at is used as created_from
    if (filters.tentetive_purchase_date) filterParams.created_to = filters.tentetive_purchase_date; // or use a separate field if available
    if (filters.subdivision_id) filterParams.subdivision_id = filters.subdivision_id;
    if (filters.assign_to) filterParams.assign_to = filters.assign_to;
    if (filters.branch) filterParams.branch_id = filters.branch;

    // Build query string
    const query = new URLSearchParams(filterParams).toString();
    const url = getApiUrl(`/api/services/exportleads/${query ? `?${query}` : ''}`);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Export failed:', errorText);
        throw new Error('Export failed: ' + errorText);
      }
      // Handle file download (CSV or XLSX)
      const blob = await res.blob();
      const filename = 'leads_export.xlsx';
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      toast.success('Leads exported successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error('Export failed: ' + errorMessage);
    }
  };

  // Function to get user name from ID or created_by field
  function getUserName(userId: string | number | null | undefined): string {
    if (!userId) return 'Unknown';
    
    // First try to find by user_id (numeric)
    const numericId = typeof userId === 'string' ? parseInt(userId) : userId;
    const userById = users.find(u => u.id === numericId);
    if (userById) return userById.name;
    
    // If not found by ID, check if created_by is already a name
    if (typeof userId === 'string' && userId !== '') {
      // If it looks like a name (not just numbers), return it as is
      if (isNaN(parseInt(userId))) {
        return userId;
      }
    }
    
    return 'Unknown';
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 p-0 flex">
        {/* Sidebar Filters removed */}
        {/* Main Content */}
        <div className="flex-1 p-8">
        {/* 1. Add a page header */}
        <div className="max-w-6xl mx-auto w-full px-2 md:px-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 w-full">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M4 11h16" /></svg>
            <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-900 mb-4 sm:mb-8 tracking-tight">Leads Dashboard</h1>
          </div>
        </div>
        {/* 2. Group quick actions in a Card */}
        <Card className="mb-6 p-4 md:p-6 flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 items-stretch md:items-center justify-between shadow-xl border border-yellow-100 bg-white/90 rounded-2xl w-full">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 items-stretch md:items-center w-full md:w-auto">
            <Button variant="gradient" onClick={() => setAddLeadOpen(true)} className="rounded-full shadow font-bold px-6 py-2 flex items-center gap-2 text-base transition hover:scale-105 focus:ring-2 focus:ring-yellow-400">
              <PlusIcon className="w-5 h-5 text-white" /> Add Lead
            </Button>
            <Button variant="gradient" title="Export leads" onClick={handleExport} className="rounded-full shadow font-bold px-6 py-2 flex items-center gap-2 text-base transition hover:scale-105 focus:ring-2 focus:ring-yellow-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> Export
            </Button>
            <label className="rounded-full shadow font-bold px-6 py-2 flex items-center gap-2 text-base transition hover:scale-105 focus:ring-2 focus:ring-yellow-400 bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-500 text-yellow-900 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4m8 8H4" /></svg> Import
              <input
                type="file"
                accept=".xlsx,.csv,.xls"
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    // Prefer .xlsx if multiple files are selected
                    const files = Array.from(e.target.files);
                    const xlsxFile = files.find(f => f.name.endsWith('.xlsx'));
                    handleImport(xlsxFile || files[0]);
                  }
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          <Button variant="gradient" title="Get help using the leads page" className="rounded-full shadow font-bold px-6 py-2 flex items-center gap-2 text-base transition hover:scale-105 focus:ring-2 focus:ring-yellow-400 w-full md:w-auto mt-2 md:mt-0"><span className="text-lg">❓</span> Help</Button>
        </Card>
        {/* 3. Enhance search/filter area */}
        <Card className="mb-6 p-4 md:p-6 shadow-xl rounded-2xl bg-white/90 border border-yellow-100 w-full">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="flex w-full max-w-full md:max-w-2xl gap-2 items-center relative">
              <Input
                type="text"
                placeholder="Search leads..."
                className="flex-1 pr-10 rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="absolute right-24 text-gray-400 hover:text-red-500 text-xl focus:outline-none"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  style={{ zIndex: 2 }}
                >×</button>
              )}
              <Button
                variant="gradient"
                onClick={() => setFilterPopupOpen(v => !v)}
                title="Show advanced filters"
                className="z-10 rounded-full shadow font-bold px-6 py-2 flex items-center gap-2 text-base transition hover:scale-105 focus:ring-2 focus:ring-yellow-400"
                disabled={isLoadingUsers || isLoadingDivisions}
              >
                <FunnelIcon className="w-5 h-5" /> Filter By
              </Button>
            </div>
          </div>
        </Card>
        {/* 4. Filter popover improvements */}
        {filterPopupOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/10"
              onClick={() => setFilterPopupOpen(false)}
              aria-label="Close filter popover"
            />
            <div className="absolute z-50 left-1/2 top-16 -translate-x-1/2 w-full max-w-md animate-fade-in">
              <Card className="relative shadow-2xl border border-yellow-200 rounded-2xl bg-white/90 p-6">
                <div className="sticky top-0 bg-white/90 z-10 flex items-center justify-between pb-2 mb-4 border-b border-yellow-100">
                  <h2 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                    <FunnelIcon className="w-6 h-6 text-yellow-500" /> Filter Leads
                  </h2>
                  <button
                    className="text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
                    onClick={() => setFilterPopupOpen(false)}
                    aria-label="Close filter popover"
                  >×</button>
                </div>
                <div className="flex flex-wrap gap-4 mb-4 max-h-72 overflow-y-auto pr-2">
                  <Input label="Name" id="filter-name" type="text" value={filters.name} onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} placeholder="Search name" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Mobile" id="filter-mobile" type="text" value={filters.contact} onChange={e => setFilters(f => ({ ...f, contact: e.target.value }))} placeholder="Search mobile" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="City" id="filter-city" type="text" value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} placeholder="Search city" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Address" id="filter-address" type="text" value={filters.address} onChange={e => setFilters(f => ({ ...f, address: e.target.value }))} placeholder="Search address" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Email" id="filter-email" type="text" value={filters.email} onChange={e => setFilters(f => ({ ...f, email: e.target.value }))} placeholder="Search email" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Gender" id="filter-gender" type="text" value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))} placeholder="Search gender" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Landmark" id="filter-landmark" type="text" value={filters.landmark} onChange={e => setFilters(f => ({ ...f, landmark: e.target.value }))} placeholder="Search landmark" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Category" id="filter-category" type="text" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} placeholder="Search category" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="PAN/VAT" id="filter-panvat" type="text" value={filters.pan_vat} onChange={e => setFilters(f => ({ ...f, pan_vat: e.target.value }))} placeholder="Search PAN/VAT" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Company Name" id="filter-companyname" type="text" value={filters.company_name} onChange={e => setFilters(f => ({ ...f, company_name: e.target.value }))} placeholder="Search company name" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Sub Division" id="filter-subdivision" type="text" value={filters.subdivision_id} onChange={e => setFilters(f => ({ ...f, subdivision_id: e.target.value }))} placeholder="Search sub division" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Select
                    label="Type"
                    id="filter-type"
                    value={filters.lead_type}
                    onChange={e => setFilters(f => ({ ...f, lead_type: e.target.value }))}
                    options={[{ value: '', label: 'All' }, ...typeOptions.map(type => ({ value: type, label: type }))]}
                    className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2"
                  />
                  <Input label="Division" id="filter-division" type="text" value={filters.division_id} onChange={e => setFilters(f => ({ ...f, division_id: e.target.value }))} placeholder="Search division" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Select
                    label="Branch"
                    id="filter-branch"
                    value={filters.branch}
                    onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}
                    options={[{ value: '', label: 'All' }, ...branchOptions.map(branch => ({ value: branch.value, label: branch.label }))]}
                    className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2"
                  />
                  <Input label="Tentative Purchase Date" id="filter-tentativePurchase" type="date" value={filters.tentetive_purchase_date} onChange={e => setFilters(f => ({ ...f, tentetive_purchase_date: e.target.value }))} placeholder="YYYY-MM-DD" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Tentative Visit Date" id="filter-visitDate" type="date" value={filters.tentetive_visit_date} onChange={e => setFilters(f => ({ ...f, tentetive_visit_date: e.target.value }))} placeholder="YYYY-MM-DD" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="User Wise" id="filter-assignTo" type="text" value={filters.assign_to || ''} onChange={e => setFilters(f => ({ ...f, assign_to: e.target.value }))} placeholder="Assign To" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Input label="Create Date" id="filter-leadCreateDate" type="date" value={filters.created_at} onChange={e => setFilters(f => ({ ...f, created_at: e.target.value }))} placeholder="YYYY-MM-DD" className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2" />
                  <Select
                    label="Is Customer"
                    id="filter-isCustomer"
                    value={filters.is_customer}
                    onChange={e => setFilters(f => ({ ...f, is_customer: e.target.value }))}
                    options={[
                      { value: '', label: 'All' },
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' }
                    ]}
                    className="rounded-xl border border-yellow-200 shadow focus:ring-2 focus:ring-yellow-400 text-base px-4 py-2"
                  />
                </div>
                <div className="flex justify-between mt-8 gap-4">
                  <Button variant="secondary" onClick={() => setFilters({
                     name: '',
                     contact: '',
                     city: '',
                     address: '',
                     email: '',
                     gender: '',
                     landmark: '',
                     category: '',
                     pan_vat: '',
                     company_name: '',
                     subdivision_id: '',
                     lead_type: '',
                     division_id: '',
                     branch: '',
                     tentetive_purchase_date: '',
                     tentetive_visit_date: '',
                     assign_to: '',
                     created_at: '',
                     is_customer: '',
                     source: '', // <-- Added
                   })} className="rounded-full shadow font-bold px-6 py-2 text-base transition hover:scale-105 focus:ring-2 focus:ring-yellow-400">Reset Filters</Button>
                  <Button variant="gradient" onClick={() => setFilterPopupOpen(false)} className="rounded-full shadow font-bold px-6 py-2 flex items-center gap-2 text-base transition hover:scale-105 focus:ring-2 focus:ring-yellow-400"><CheckIcon className="w-5 h-5" /> Apply Filters</Button>
                </div>
              </Card>
            </div>
            <style>{`
              @keyframes fade-in { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: none; } }
              .animate-fade-in { animation: fade-in 0.25s cubic-bezier(0.4,0,0.2,1); }
            `}</style>
          </>
        )}
        {/* Add Lead Panel */}
        <AddLeadPanel open={addLeadOpen} onClose={() => setAddLeadOpen(false)} onAddLead={lead => { handleAddLead(lead); setAddLeadOpen(false); }} users={users} divisions={divisions} subdivisions={subdivisions} />
        {/* 5. Leads table polish */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="text-gray-700 text-sm md:text-base font-medium">
            Showing {filteredLeads.length === 0 ? 0 : (page - 1) * leadsPerPage + 1}
            –{Math.min(page * leadsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="pageSize" className="text-gray-600 text-xs mr-1">Rows per page:</label>
            <select
              id="pageSize"
              className="rounded border border-yellow-200 px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-400"
              value={leadsPerPage}
              onChange={e => {
                setPage(1);
                // @ts-expect-error: leadsPerPage is not typed on window, used for hot reload
                window.leadsPerPage = Number(e.target.value); // for hot reload
              }}
              style={{ minWidth: 60 }}
              disabled
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <Button
              variant="gradient"
              onClick={() => setShowAllColumns(v => !v)}
              className="mb-0"
              disabled={isLoading}
            >
              {showAllColumns ? 'Show Fewer Columns' : 'View All'}
            </Button>
          </div>
        </div>
        {/* --- Advanced Table Styling Starts Here --- */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow-2xl border border-yellow-100 mt-4 w-full max-w-full">
          <table className="min-w-full divide-y divide-yellow-200">
            <thead className="bg-yellow-50 sticky top-0 z-10 shadow-md">
              <tr>
                {visibleFields.map(field => (
                  <th key={String(field.key)} className="px-4 py-3 text-left text-base font-semibold text-black whitespace-nowrap border-r border-yellow-100 last:border-r-0 tracking-wide group relative">
                    <span>{field.label}</span>
                    {/* Tooltip for header */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 group-hover:block hidden bg-black text-white text-xs rounded px-2 py-1 z-20 whitespace-nowrap mt-1">{field.label}</span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-base font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={visibleFields.length + 1} className="text-center py-12 text-gray-400 text-lg">No data found.</td>
                </tr>
          ) : (
                paginatedLeads.map((lead, idx) => (
                  <tr
                    key={lead.lead_id || idx}
                    className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-yellow-50' : 'bg-white'} hover:bg-yellow-100 text-sm md:text-base`}
                  >
                    {visibleFields.map(field => {
                      const value = lead[field.key];
                      if (field.key === 'is_customer') {
                        return (
                          <td key={String(field.key)} className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap border-r border-yellow-50 last:border-r-0 text-black">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{value ? 'Yes' : 'No'}</span>
                          </td>
                        );
                      }
                      if (["lead_type", "source", "status", "category"].includes(field.key)) {
                        return (
                          <td key={String(field.key)} className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap border-r border-yellow-50 last:border-r-0 text-black">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${field.key === 'lead_type' ? 'bg-yellow-200 text-yellow-900' : field.key === 'source' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{String(value)}</span>
                          </td>
                        );
                      }
                      if (field.key === 'name') {
                        return (
                          <td key={String(field.key)} className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap border-r border-yellow-50 last:border-r-0 text-black">
                            <div className="flex items-center gap-3">
                              <Avatar 
                                name={String(value)} 
                                size="sm" 
                                showTooltip={true}
                              />
                              <span className="font-medium text-black truncate" title={String(value)}>
                                {value === null || value === undefined || String(value).trim() === '' ? <span className="text-gray-400">—</span> : String(value)}
                              </span>
                            </div>
                          </td>
                        );
                      }
                      if (field.key === 'created_by') {
                        return (
                          <td key={String(field.key)} className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap border-r border-yellow-50 last:border-r-0 text-black">
                            <span className="font-medium text-black truncate" title={getUserName(value as string | number | null | undefined)}>
                              {value === null || value === undefined || String(value).trim() === '' ? 
                                <span className="text-gray-400">—</span> : 
                                getUserName(value as string | number | null | undefined)
                              }
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={String(field.key)} className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap border-r border-yellow-50 last:border-r-0 font-medium text-black max-w-[180px] truncate" title={String(value)}>
                          {value === null || value === undefined || String(value).trim() === '' ? <span className="text-gray-400">—</span> : String(value)}
                        </td>
                      );
                    })}
                    <td className="px-2 md:px-4 py-2 md:py-3">
                      <button
                  onClick={async () => {
                    setLeadDetailsLoading(true);
                    try {
                      const fullLead = await fetchLeadDetailsByType(lead.lead_id!, selectedType!);
                      let leadObj;
                      if (fullLead && typeof fullLead === 'object') {
                        if ('data' in fullLead && fullLead.data && typeof fullLead.data === 'object') {
                          leadObj = fullLead.data;
                        } else if ('lead' in fullLead) {
                          leadObj = fullLead.lead;
                        } else {
                          leadObj = fullLead;
                        }
                      } else {
                        leadObj = fullLead;
                      }
                      setSelectedLead(leadObj as LeadForm);
                      const editLeadData = {
                        ...leadObj,
                        division_id: leadObj.division_id && typeof leadObj.division_id === 'object' && 'id' in leadObj.division_id
                          ? (leadObj.division_id as { id: number }).id
                          : typeof leadObj.division_id === 'number'
                            ? leadObj.division_id
                            : typeof leadObj.division_id === 'string' && leadObj.division_id !== ''
                              ? Number(leadObj.division_id)
                              : undefined,
                        subdivision_id: leadObj.subdivision_id && typeof leadObj.subdivision_id === 'object' && 'id' in leadObj.subdivision_id
                          ? (leadObj.subdivision_id as { id: number }).id
                          : typeof leadObj.subdivision_id === 'number'
                            ? leadObj.subdivision_id
                            : typeof leadObj.subdivision_id === 'string' && leadObj.subdivision_id !== ''
                              ? Number(leadObj.subdivision_id)
                              : undefined,
                        remarks: leadObj.remarks || '',
                        created_by: leadObj.created_by || '',
                      };
                      setEditLead(editLeadData);
                    } catch {
                      toast.error('Failed to fetch lead details.');
                    } finally {
                      setLeadDetailsLoading(false);
                    }
                  }}
                  disabled={leadDetailsLoading}
                        className="flex items-center gap-1 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold py-1 px-4 rounded-full shadow transition"
                        title="View Lead"
                >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                  {leadDetailsLoading ? 'Loading...' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* --- Advanced Table Styling Ends Here --- */}
        {/* 6. Pagination polish */}
        <div className="flex flex-wrap justify-end items-center gap-2 mt-4 w-full">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page-1)}>&lt;</Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button key={i} variant={page === i+1 ? 'primary' : 'secondary'} onClick={() => setPage(i+1)} className="rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
              {i+1}
            </Button>
          ))}
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage(page+1)}>&gt;</Button>
        </div>
        {/* 7. Table zebra striping and sticky headers (add to Table component CSS or className) */}
        {/* Add this to your global CSS or Table component: */}
        {/*
        .leads-table table tbody tr:nth-child(even) { background-color: #fef9c3; }
        .leads-table table thead th { position: sticky; top: 0; background: #fef3c7; z-index: 1; }
        .leads-table table tbody tr:hover { background-color: #fef08a; transition: background 0.2s; }
        */}
        {/* Lead Details Modal */}
        {selectedLead && (
          <>
            {/* Overlay without blur */}
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => {
              setSelectedLead(null);
              setEditMode(false);
              setEditLead(null);
            }} aria-label="Close lead details" />
            <div
              className={`fixed z-50 flex items-center justify-center pointer-events-none`}
              style={{ left: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
            >
              <div
                className={`relative w-[350px] h-[350px] max-w-2xl min-w-[250px] min-h-[200px] max-w-[90vw] max-h-[90vh] p-8 rounded-2xl shadow-2xl border border-black bg-white resize-both overflow-auto pointer-events-auto`}
                style={{
                  resize: 'both',
                  overflow: 'auto',
                  transform: `translate(${modalPos.x}px, ${modalPos.y}px)`
                }}
                id="lead-details-modal-box"
              >
                <div
                  className="modal-drag-handle cursor-move flex items-center gap-2 mb-8 select-none"
                  onMouseDown={onModalMouseDown}
                  style={{ userSelect: 'none' }}
                >
                  <h2 className="text-3xl font-extrabold text-black flex items-center gap-2">
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M4 11h16" /></svg>
                    Lead Details
                  </h2>
                  <span className="ml-auto" />
                  <button
                    className="text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
                    onClick={() => {
                      setSelectedLead(null);
                      setEditMode(false);
                      setEditLead(null);
                    }}
                    aria-label="Close lead details"
                  >×</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                  {leadFields.map(({ key, label }) => {
                    const value = selectedLead ? selectedLead[key] : undefined;
                    // Badge for categorical fields
                    const isBadge = key === 'lead_type' || key === 'gender';
                    // Division dropdown in edit mode
                    if (editMode && key === 'division_id') {
                      return (
                        <div key={String(key)} className="flex flex-col border-b pb-1 gap-1">
                          <span className="text-sm font-semibold text-black">{label}:</span>
                          <select
                            value={editLead && typeof editLead.division_id === 'number' ? editLead.division_id : ''}
                            onChange={e => {
                              const newDivisionId = Number(e.target.value);
                              setEditLead(prev => prev ? {
                                ...prev,
                                division_id: newDivisionId,
                                // Reset subdivision if division changes
                                subdivision_id: undefined
                              } : prev);
                            }}
                            className="border rounded px-2 py-1 text-black border-black"
                          >
                            <option value="">Select Division</option>
                            {divisions.map(div => (
                              <option key={div.division_id} value={div.division_id}>{div.division_name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    // Subdivision dropdown in edit mode
                    if (editMode && key === 'subdivision_id') {
                      // Only show subdivisions for selected division
                      const filteredSubdivisions = subdivisions.filter(sub =>
                        editLead && typeof editLead.division_id === 'number' ? sub.division_id === editLead.division_id : true
                      );
                      return (
                        <div key={String(key)} className="flex flex-col border-b pb-1 gap-1">
                          <span className="text-sm font-semibold text-black">{label}:</span>
                          <select
                            value={editLead && typeof editLead.subdivision_id === 'number' ? editLead.subdivision_id : ''}
                            onChange={e => {
                              const selectedSubId = Number(e.target.value);
                              const selectedSub = subdivisions.find(sub => sub.subdivision_id === selectedSubId);
                              setEditLead(prev => prev ? {
                                ...prev,
                                subdivision_id: selectedSubId,
                                division_id: selectedSub ? selectedSub.division_id : prev.division_id
                              } : prev);
                            }}
                            className="border rounded px-2 py-1 text-black border-black"
                          >
                            <option value="">Select Sub Division</option>
                            {filteredSubdivisions.map(sub => (
                              <option key={sub.subdivision_id} value={sub.subdivision_id}>{sub.subdivision_name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    // Branch dropdown in edit mode
                    if (editMode && key === 'branch') {
                      return (
                        <div key={String(key)} className="flex flex-col border-b pb-1 gap-1">
                          <span className="text-sm font-semibold text-black">Branch:</span>
                          <select
                            value={editLead && editLead.branch ? String(editLead.branch) : ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditLead(prev => prev ? { ...prev, branch: e.target.value } : prev)}
                            className="border rounded px-2 py-1 text-black border-black"
                          >
                            <option value="">Select Branch</option>
                            {branchOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    return (
                      <div key={String(key)} className="flex flex-col border-b pb-1 gap-1">
                        <span className="text-sm font-semibold text-black">{label}:</span>
                        {editMode ? (
                          key === 'lead_id' ? (
                            <span className="text-base font-medium text-black truncate" title={String(value)}>{
                              value === null ||
                              value === undefined ||
                              String(value).trim() === '' ||
                              String(value).toLowerCase() === 'null' ||
                              String(value).toLowerCase() === 'undefined'
                                ? 'None'
                                : String(value)
                            }</span>
                          ) : key === 'is_customer' ? (
                            <input
                              type="checkbox"
                              checked={editLead ? Boolean(editLead[key]) : false}
                              onChange={e => setEditLead(prev => prev ? { ...prev, [key]: e.target.checked } : prev)}
                              className="w-4 h-4 accent-yellow-500"
                            />
                          ) : key === 'lead_type' ? (
                            <select
                              value={editLead && editLead[key] != null && String(editLead[key]).trim() !== '' && String(editLead[key]).toLowerCase() !== 'null' ? String(editLead[key]) : ''}
                              onChange={e =>
                                setEditLead(prev =>
                                  prev ? { ...prev, [key]: e.target.value } : prev
                                )
                              }
                              className="border rounded px-2 py-1 text-black border-black"
                            >
                              <option value="">Select Type</option>
                              {typeOptions.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          ) : key === 'gender' ? (
                            <select
                              value={editLead && editLead[key] != null && String(editLead[key]).trim() !== '' && String(editLead[key]).toLowerCase() !== 'null' ? String(editLead[key]) : ''}
                              onChange={e =>
                                setEditLead(prev =>
                                  prev ? { ...prev, [key]: e.target.value } : prev
                                )
                              }
                              className="border rounded px-2 py-1 text-black border-black"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Others">Others</option>
                            </select>
                          ) : key === 'assign_to' ? (
                            <select
                              value={editLead && editLead[key] != null && String(editLead[key]).trim() !== '' && String(editLead[key]).toLowerCase() !== 'null' ? String(editLead[key]) : ''}
                              onChange={e =>
                                setEditLead(prev =>
                                  prev ? { ...prev, [key]: e.target.value } : prev
                                )
                              }
                              className="border rounded px-2 py-1 text-black border-black"
                            >
                              <option value="">Assign To</option>
                              {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={String(key).toLowerCase().includes('date') ? 'date' : 'text'}
                              value={
                                editLead &&
                                editLead[key] != null &&
                                String(editLead[key]).trim() !== '' &&
                                String(editLead[key]).toLowerCase() !== 'null'
                                  ? (String(key).toLowerCase().includes('date')
                                      ? (String(editLead[key]).length > 10 && !isNaN(Date.parse(String(editLead[key])))
                                          ? new Date(String(editLead[key])).toISOString().slice(0, 10)
                                          : String(editLead[key]).slice(0, 10))
                                      : String(editLead[key]))
                                  : ''
                              }
                              onChange={e =>
                                setEditLead(prev =>
                                  prev ? { ...prev, [key]: e.target.value } : prev
                                )
                              }
                              className="border rounded px-2 py-1 text-black border-black"
                            />
                          )
                        ) : (
                          key === 'is_customer' ? (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {value ? 'Yes' : 'No'}
                            </span>
                          ) : isBadge && value ? (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${key === 'lead_type' ? 'bg-yellow-100 text-black' : 'bg-blue-100 text-black'}`} title={String(value)}>
                              {String(value)}
                            </span>
                          ) : (
                            <div className="text-base font-medium text-black">
                              {value === null || value === undefined || String(value).trim() === '' || String(value).toLowerCase() === 'null' || String(value).toLowerCase() === 'undefined' ? (
                                'None'
                              ) : typeof value === 'object' ? (
                                <ExpandableData data={value} label={key.replace(/_/g, ' ')} />
                              ) : key === 'created_by' ? (
                                getUserName(value as string | number | null | undefined)
                              ) : (
                                String(value)
                              )}
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-3 border-t pt-6">
                  {!editMode && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditMode(true);
                        setEditLead(selectedLead);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {editMode && (
                    <>
                      <Button
                        variant="primary"
                        onClick={async () => {
                          if (!editLead) return;
                          if (!editLead.division_id) {
                            toast.error('Division is required.');
                            return;
                          }
                          console.log('division_id being sent:', editLead.division_id, typeof editLead.division_id);
                          console.log('editLead data being sent:', editLead);
                          const updatePayload = {
                            ...editLead,
                            division_id: editLead.division_id ? Number(editLead.division_id) : undefined,
                            subdivision_id: editLead.subdivision_id ? Number(editLead.subdivision_id) : undefined,
                          };
                          console.log('updatePayload being sent:', updatePayload);
                          // updateLead expects division_id and subdivision_id as string in type, but backend expects string or null. mapLeadToBackend will handle null conversion.
                          try {
                            await updateLead(updatePayload);
                            const leadsData = await fetchLeads();
                            const leadsFormData: LeadForm[] = (leadsData as unknown[]).map((lead) => {
                              if (typeof lead === 'object' && lead !== null) {
                                const l = lead as Record<string, unknown>;
                                return {
                                  name: typeof l.name === 'string' ? l.name : '',
                                  contact: l.contact ? String(l.contact) : '',
                                  address: typeof l.address === 'string' ? l.address : '',
                                  email: typeof l.email === 'string' ? l.email : '',
                                  gender: typeof l.gender === 'string' ? l.gender : '',
                                  city: typeof l.city === 'string' ? l.city : '',
                                  landmark: typeof l.landmark === 'string' ? l.landmark : '',
                                  lead_type: typeof l.lead_type === 'string' ? l.lead_type : '',
                                  source: typeof l.source === 'string' ? l.source : '',
                                  category: typeof l.category === 'string' ? l.category : '',
                                  pan_vat: typeof l.pan_vat === 'string' ? l.pan_vat : '',
                                  company_name: typeof l.company_name === 'string' ? l.company_name : '',
                                  branch: typeof l.branch === 'string' ? l.branch : '',
                                  tentetive_visit_date: typeof l.tentetive_visit_date === 'string' ? l.tentetive_visit_date : '',
                                  tentetive_purchase_date: typeof l.tentetive_purchase_date === 'string' ? l.tentetive_purchase_date : '',
                                  division_id: typeof l.division_id === 'string' ? Number(l.division_id) : undefined,
                                  subdivision_id: typeof l.subdivision_id === 'string' ? Number(l.subdivision_id) : undefined,
                                  assign_to: typeof l.assign_to === 'string' ? l.assign_to : null,
                                  created_at: typeof l.created_at === 'string' ? l.created_at : '',
                                  updated_at: typeof l.updated_at === 'string' ? l.updated_at : '',
                                  lead_id: typeof l.lead_id === 'number' ? l.lead_id : undefined,
                                  is_customer: typeof l.is_customer === 'boolean' ? l.is_customer : false,
                                  remarks: typeof l.remarks === 'string' ? l.remarks : '',
                                  created_by: typeof l.created_by === 'string' ? l.created_by : '',
                                };
                              }
                              // fallback for non-object
                              return {
                                name: '', contact: '', address: '', email: '', gender: '', city: '', landmark: '', lead_type: '', source: '', category: '', pan_vat: '', company_name: '', branch: '', tentetive_visit_date: '', tentetive_purchase_date: '', division_id: undefined, subdivision_id: undefined, assign_to: null, created_at: '', updated_at: '', is_customer: false, remarks: '', created_by: ''
                              };
                            });
                            setLeads(leadsFormData);
                            setEditMode(false);
                            setSelectedLead(null);
                            setEditLead(null);
                            toast.success('Lead updated successfully!');
                          } catch (error) {
                            toast.error('Failed to update lead.');
                            console.error(error);
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditMode(false);
                          setEditLead(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
                {/* Shrink/Expand Arrow */}
                <button
                  className="absolute bottom-2 right-2 bg-yellow-200 hover:bg-yellow-300 text-black rounded-full p-1 shadow border border-black"
                  style={{ zIndex: 10 }}
                  title="Shrink/Expand"
                  onClick={() => {
                    const box = document.getElementById('lead-details-modal-box');
                    if (box) {
                      const isMax = box.classList.toggle('maximized');
                      if (isMax) {
                        box.style.width = '90vw';
                        box.style.height = '90vh';
                      } else {
                        box.style.width = '';
                        box.style.height = '';
                      }
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v4h4M16 8V4h-4" /><path d="M16 4l-6 6M4 16l6-6" /></svg>
                </button>
              </div>
            </div>
          </>
        )}
        {/* Action/Summary Sections (to be filled in next steps) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full">
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 text-center font-bold text-black shadow-md">Today New Leads</div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 text-center font-bold text-black shadow-md">Today Orders</div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-6 text-center font-bold text-black shadow-md">Convert to Leads</div>
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 text-center font-bold text-black shadow-md">Convert to Order</div>
        </div>
              </div>
      </div>
    </ErrorBoundary>
  );
}
