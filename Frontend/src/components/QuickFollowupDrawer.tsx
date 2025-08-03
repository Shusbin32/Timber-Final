import React, { useState } from "react";
import { 
  UserIcon, 
  CalendarIcon, 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import Drawer from '@/components/Drawer';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Avatar from '@/components/Avatar';
import { getUsers } from '@/api/users';
import { updateFollowup, rescheduleFollowup } from '@/api/followups';
import { Followup } from '@/api/followups';
import AddLeadPanel, { LeadForm } from './AddLeadPanel';
import RescheduleFollowupModal from './RescheduleFollowupModal';

interface QuickFollowupDrawerProps {
  open: boolean;
  onClose: () => void;
  followup?: Followup | null;
  onUpdate?: (updated: Followup) => void;
}

// Helper to map Followup to LeadForm for editing
function followupToLeadForm(f: Followup): Partial<LeadForm> {
  return {
    name: typeof f.name === 'string' ? f.name : '',
    contact: typeof f.contact === 'string' ? f.contact : '',
    address: typeof f.address === 'string' ? f.address : '',
    email: typeof f.email === 'string' ? f.email : '',
    gender: typeof f.gender === 'string' ? f.gender : '',
    city: typeof f.city === 'string' ? f.city : '',
    landmark: typeof f.landmark === 'string' ? f.landmark : '',
    lead_type: typeof f.lead_type === 'string' ? f.lead_type : '',
    source: typeof f.source === 'string' ? f.source : '',
    category: typeof f.category === 'string' ? f.category : '',
    pan_vat: typeof f.pan_vat === 'string' ? f.pan_vat : '',
    company_name: typeof f.company_name === 'string' ? f.company_name : '',
    branch: typeof f.branch === 'string' ? f.branch : '',
    tentetive_visit_date: typeof f.tentetive_visit_date === 'string' ? f.tentetive_visit_date : '',
    tentetive_purchase_date: typeof f.tentetive_purchase_date === 'string' ? f.tentetive_purchase_date : '',
    followup_date: typeof f.followup_date === 'string' ? f.followup_date : '',
    followup_remarks: typeof f.followup_remarks === 'string' ? f.followup_remarks : '',
    followup_type: typeof f.followup_type === 'string' ? f.followup_type : '',
    division_id: typeof f.division_id === 'number' ? f.division_id : undefined,
    subdivision_id: typeof f.subdivision_id === 'number' ? f.subdivision_id : undefined,
    assign_to: typeof f.assign_to === 'string' ? f.assign_to : '',
    created_at: typeof f.created_at === 'string' ? f.created_at : '',
    updated_at: typeof f.updated_at === 'string' ? f.updated_at : '',
    is_customer: typeof f.is_customer === 'boolean' ? f.is_customer : false,
    remarks: typeof f.remarks === 'string' ? f.remarks : '',
  };
}

// Business Logic Constants
const FOLLOWUP_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
} as const;

const FOLLOWUP_TYPES = {
  GENERAL: 'General',
  PAYMENT: 'Payment',
  AFTER_VISIT: 'AFTER VISIT followup',
  BEFORE_VISIT: 'BEFORE VISIT FOLLOW-UP',
  RAW_DATA: 'RAW DATA FOLLOW-UP',
  INITIAL_CONTACT: 'Initial Contact',
  FOLLOW_UP: 'Follow Up'
} as const;

const QuickFollowupDrawer: React.FC<QuickFollowupDrawerProps> = ({ open, onClose, followup, onUpdate }) => {
  const f = followup;
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Followup>>(f ? { ...f } : {});
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [displayData, setDisplayData] = useState<Partial<Followup>>(f ? { ...f } : {});

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getUsers();
        const userList: Record<string, unknown>[] = Array.isArray(res) ? res : res.data || res.users || [];
        setUsers(userList.map((u) => ({ id: Number(u.id ?? u.user_id), name: String(u.name ?? u.username ?? u.full_name ?? u.email ?? '') })));
      } catch {
        setUsers([]);
      }
    }
    fetchUsers();
  }, []);

  React.useEffect(() => {
    if (f) {
      function getUserIdFromName(name: string): number | undefined {
        const user = users.find(u => u.name === name);
        return user ? user.id : undefined;
      }
      let assignTo = f.assign_to;
      if (typeof assignTo === 'string' && isNaN(Number(assignTo))) {
        assignTo = getUserIdFromName(assignTo) ?? assignTo;
      }
      const updatedData = { ...f, assign_to: assignTo };
      setEditData(updatedData);
      setDisplayData(updatedData);
    }
  }, [f, users]);

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    if (!editData.lead_id) {
      toast.error('Missing lead ID');
      return;
    }
    
    setSaving(true);
    try {
      // Use the new direct followup update API
      const updatedFollowup = await updateFollowup(editData as Followup);
      setDisplayData(updatedFollowup);
      setEditMode(false);
      if (onUpdate) onUpdate(updatedFollowup);
      toast.success('Followup updated successfully!');
    } catch (error) {
      console.error('Error updating followup:', error);
      toast.error('Failed to update followup. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkAsDone() {
    if (!editData.lead_id) {
      toast.error('Missing lead ID');
      return;
    }
    
    setSaving(true);
    try {
      // Business Logic: Mark as Done should:
      // 1. Change status to 'completed'
      // 2. Update followup_type to indicate completion
      // 3. Add completion remarks
      const completionData = {
        ...editData,
        status: FOLLOWUP_STATUSES.COMPLETED,
        followup_type: FOLLOWUP_STATUSES.COMPLETED,
        followup_remarks: editData.followup_remarks 
          ? `${editData.followup_remarks} [COMPLETED: ${new Date().toLocaleDateString()}]`
          : `Followup completed on ${new Date().toLocaleDateString()}`,
        updated_at: new Date().toISOString()
      };

      const updatedFollowup = await updateFollowup(completionData as Followup);
      setDisplayData(updatedFollowup);
      setEditData(updatedFollowup);
      
      if (onUpdate) onUpdate(updatedFollowup);
      // Removed toast here - parent page will handle the success message
    } catch (error) {
      console.error('Error marking followup as done:', error);
      toast.error('Failed to mark followup as done');
    } finally {
      setSaving(false);
    }
  }

  async function handleReschedule(data: { date: string; remarks: string; type: string }) {
    if (!editData.lead_id) {
      toast.error('Missing lead ID');
      return;
    }

    setSaving(true);
    try {
      // Business Logic: Rescheduling should:
      // 1. Update the followup date
      // 2. Reset status to 'pending' (unless it's a specific type)
      // 3. Update remarks with reschedule information
      const rescheduleData = {
        ...editData,
        followup_date: data.date,
        followup_type: data.type,
        followup_remarks: data.remarks,
        status: data.type === FOLLOWUP_STATUSES.COMPLETED ? FOLLOWUP_STATUSES.COMPLETED : FOLLOWUP_STATUSES.PENDING,
        updated_at: new Date().toISOString()
      };

      // Use the available reschedule API
      const updatedFollowup = await rescheduleFollowup(editData.lead_id, {
        followup_date: data.date,
        followup_remarks: data.remarks,
        followup_type: data.type
      });

      // Update local state
      const finalData = { ...rescheduleData, ...updatedFollowup };
      setDisplayData(finalData);
      setEditData(finalData);
      
      if (onUpdate) onUpdate(finalData as Followup);
      toast.success('Followup rescheduled successfully!');
    } catch (error) {
      console.error('Error rescheduling followup:', error);
      toast.error('Failed to reschedule followup. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getLeadTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'raw data':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'after visit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'before visit':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFollowupTypeOptions = () => [
    { value: '', label: 'Select Type' },
    { value: FOLLOWUP_TYPES.GENERAL, label: 'General Followup' },
    { value: FOLLOWUP_TYPES.PAYMENT, label: 'Payment Followup' },
    { value: FOLLOWUP_TYPES.AFTER_VISIT, label: 'After Visit Followup' },
    { value: FOLLOWUP_TYPES.BEFORE_VISIT, label: 'Before Visit Followup' },
    { value: FOLLOWUP_TYPES.RAW_DATA, label: 'Raw Data Followup' },
    { value: FOLLOWUP_TYPES.INITIAL_CONTACT, label: 'Initial Contact' },
    { value: FOLLOWUP_TYPES.FOLLOW_UP, label: 'Follow Up' }
  ];

  const leadTypeOptions = [
    { value: '', label: 'Select Lead Type' },
    { value: 'Raw Data', label: 'Raw Data' },
    { value: 'Complete', label: 'Complete' },
    { value: 'After Visit', label: 'After Visit' },
    { value: 'Before Visit', label: 'Before Visit' }
  ];

  const followupTypeOptions = getFollowupTypeOptions();

  // Business Logic Helper Functions
  const isOverdue = () => {
    if (!displayData?.followup_date) return false;
    const followupDate = new Date(displayData.followup_date);
    const now = new Date();
    return followupDate < now && displayData.status !== FOLLOWUP_STATUSES.COMPLETED;
  };

  const canMarkAsDone = () => {
    return displayData?.status !== FOLLOWUP_STATUSES.COMPLETED;
  };

  const canReschedule = () => {
    return displayData?.status !== FOLLOWUP_STATUSES.CANCELLED;
  };

  const getBusinessStatus = () => {
    if (displayData?.status === FOLLOWUP_STATUSES.COMPLETED) return 'Completed';
    if (isOverdue()) return 'Overdue';
    if (displayData?.status === FOLLOWUP_STATUSES.PENDING) return 'Pending';
    return 'Unknown';
  };

  return (
    <Drawer open={open} onClose={onClose} title="Followup Details">
      <div className="flex flex-col gap-6 max-h-full overflow-y-auto">


        {/* Header Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-start gap-4">
          <Avatar 
            name={typeof displayData?.name === 'string' ? displayData.name : ''}
            size="xl"
            showTooltip={true}
          />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-yellow-900 mb-2">
                {typeof displayData?.name === 'string' ? displayData.name : 'Unknown Lead'}
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLeadTypeBadge(typeof displayData?.lead_type === 'string' ? displayData.lead_type : '')}`}>
                  {typeof displayData?.lead_type === 'string' ? displayData.lead_type : 'Unknown Type'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(typeof displayData?.followup_type === 'string' ? displayData.followup_type : '')}`}>
                  {getBusinessStatus()}
                </span>
                {isOverdue() && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-3 h-3" />
                    Overdue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-yellow-700">
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-medium">
                    {(() => {
                      const id = typeof displayData?.assign_to === 'number' ? displayData.assign_to : (typeof displayData?.assign_to === 'string' && displayData?.assign_to !== '' ? Number(displayData.assign_to) : undefined);
                      const user = users.find(u => u.id === id);
                      return user && user.name ? String(user.name) : (displayData?.assign_to ? String(displayData.assign_to) : 'Unassigned');
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-medium">
                    {typeof displayData?.followup_date === 'string' ? displayData.followup_date.slice(0, 10) : (typeof displayData?.created_at === 'string' ? displayData.created_at.slice(0, 10) : 'No date')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-yellow-600" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editMode ? (
              <>
                <Input label="Name" name="name" value={typeof editData.name === 'string' ? editData.name : ''} onChange={handleEditChange} />
                <Input label="Email" name="email" value={typeof editData.email === 'string' ? editData.email : ''} onChange={handleEditChange} />
                <Input label="Mobile" name="contact" value={typeof editData.contact === 'string' ? editData.contact : ''} onChange={handleEditChange} />
                <Input label="Address" name="address" value={typeof editData.address === 'string' ? editData.address : ''} onChange={handleEditChange} />
                <Input label="City" name="city" value={typeof editData.city === 'string' ? editData.city : ''} onChange={handleEditChange} />
                <Input label="Landmark" name="landmark" value={typeof editData.landmark === 'string' ? editData.landmark : ''} onChange={handleEditChange} />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">{typeof displayData?.name === 'string' ? displayData.name : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">{typeof displayData?.email === 'string' ? displayData.email : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">{typeof displayData?.contact === 'string' ? displayData.contact : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">{typeof displayData?.address === 'string' ? displayData.address : '—'}</span>
                </div>
          <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">{typeof displayData?.city === 'string' ? displayData.city : '—'}</span>
          </div>
          <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">{typeof displayData?.landmark === 'string' ? displayData.landmark : '—'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Followup Details Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-yellow-600" />
            Followup Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editMode ? (
            <>
              <Select
                label="Assign To"
                name="assign_to"
                value={typeof editData.assign_to === 'number' ? String(editData.assign_to) : (typeof editData.assign_to === 'string' ? editData.assign_to : '')}
                onChange={e => setEditData(prev => ({ ...prev, assign_to: Number(e.target.value) }))}
                options={users.map(u => ({ value: String(u.id), label: u.name }))}
              />
                <Input label="Followup Date" name="followup_date" type="date" value={typeof editData.followup_date === 'string' ? editData.followup_date.slice(0,10) : ''} onChange={handleEditChange} />
              <Select label="Lead Type" name="lead_type" value={typeof editData.lead_type === 'string' ? editData.lead_type : ''} onChange={handleEditChange} options={leadTypeOptions} />
                <Select label="Followup Type" name="followup_type" value={typeof editData.followup_type === 'string' ? editData.followup_type : ''} onChange={handleEditChange} options={followupTypeOptions} />
                <Input label="Tentative Visit Date" name="tentetive_visit_date" type="date" value={typeof editData.tentetive_visit_date === 'string' ? editData.tentetive_visit_date.slice(0,10) : ''} onChange={handleEditChange} />
                <Input label="Tentative Purchase Date" name="tentetive_purchase_date" type="date" value={typeof editData.tentetive_purchase_date === 'string' ? editData.tentetive_purchase_date.slice(0,10) : ''} onChange={handleEditChange} />
                <div className="md:col-span-2">
              <Input label="Followup Remarks" name="followup_remarks" value={typeof editData.followup_remarks === 'string' ? editData.followup_remarks : ''} onChange={handleEditChange} />
                </div>
                <div className="md:col-span-2">
                  <Input label="General Remarks" name="remarks" value={typeof editData.remarks === 'string' ? editData.remarks : ''} onChange={handleEditChange} />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Assigned to: {
                    (() => {
                      const id = typeof displayData?.assign_to === 'number' ? displayData.assign_to : (typeof displayData?.assign_to === 'string' && displayData?.assign_to !== '' ? Number(displayData.assign_to) : undefined);
                      const user = users.find(u => u.id === id);
                      return user && user.name ? String(user.name) : (displayData?.assign_to ? String(displayData.assign_to) : 'Unassigned');
                    })()
                  }</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Followup Date: {typeof displayData?.followup_date === 'string' ? displayData.followup_date : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Lead Type: {typeof displayData?.lead_type === 'string' ? displayData.lead_type : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Followup Type: {typeof displayData?.followup_type === 'string' ? displayData.followup_type : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Visit Date: {typeof displayData?.tentetive_visit_date === 'string' ? displayData.tentetive_visit_date : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Purchase Date: {typeof displayData?.tentetive_purchase_date === 'string' ? displayData.tentetive_purchase_date : '—'}</span>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-start gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <span className="font-medium text-black">Followup Remarks:</span>
                      <p className="text-black mt-1">{typeof displayData?.followup_remarks === 'string' ? displayData.followup_remarks : '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-start gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <span className="font-medium text-black">General Remarks:</span>
                      <p className="text-black mt-1">{typeof displayData?.remarks === 'string' ? displayData.remarks : '—'}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BuildingOfficeIcon className="w-5 h-5 text-yellow-600" />
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editMode ? (
              <>
              <Input label="Category" name="category" value={typeof editData.category === 'string' ? editData.category : ''} onChange={handleEditChange} />
              <Input label="Source" name="source" value={typeof editData.source === 'string' ? editData.source : ''} onChange={handleEditChange} />
              <Input label="PAN/VAT" name="pan_vat" value={typeof editData.pan_vat === 'string' ? editData.pan_vat : ''} onChange={handleEditChange} />
              <Input label="Company Name" name="company_name" value={typeof editData.company_name === 'string' ? editData.company_name : ''} onChange={handleEditChange} />
              <Input label="Branch" name="branch" value={typeof editData.branch === 'string' ? editData.branch : ''} onChange={handleEditChange} />
              <Input label="Created At" name="created_at" type="date" value={typeof editData.created_at === 'string' ? editData.created_at.slice(0,10) : ''} onChange={handleEditChange} />
            </>
          ) : (
            <>
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Category: {typeof displayData?.category === 'string' ? displayData.category : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Source: {typeof displayData?.source === 'string' ? displayData.source : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">PAN/VAT: {typeof displayData?.pan_vat === 'string' ? displayData.pan_vat : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Company: {typeof displayData?.company_name === 'string' ? displayData.company_name : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Branch: {typeof displayData?.branch === 'string' ? displayData.branch : '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-black">Created: {typeof displayData?.created_at === 'string' ? displayData.created_at : '—'}</span>
                </div>
            </>
          )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200">
          {canReschedule() && (
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2" 
              onClick={() => setRescheduleOpen(true)}
            >
              <CalendarIcon className="w-4 h-4" /> 
              Reschedule
            </button>
          )}
          
          {canMarkAsDone() && (
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2" 
              onClick={handleMarkAsDone} 
              disabled={saving}
            >
              <CheckCircleIcon className="w-4 h-4" /> 
              {saving ? 'Saving...' : 'Mark as Done'}
            </button>
          )}
          
          {editMode ? (
            <>
              <button 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-xl shadow border border-yellow-700 transition flex items-center gap-2" 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2" 
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold px-4 py-2 rounded-xl shadow border border-yellow-300 transition flex items-center gap-2" 
              onClick={() => setEditMode(true)}
            >
              <PencilSquareIcon className="w-4 h-4" /> 
              Edit
            </button>
          )}
          
          <button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2" 
            onClick={() => window.location.reload()}
          >
            <ArrowPathIcon className="w-4 h-4" /> 
            Refresh
          </button>
          
          <button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2" 
            onClick={onClose}
          >
            <XMarkIcon className="w-4 h-4" /> 
            Close
          </button>
        </div>

        {/* Reschedule Modal */}
        <RescheduleFollowupModal 
          open={rescheduleOpen} 
          onClose={() => setRescheduleOpen(false)} 
          leadId={editData.lead_id}
          initialDate={editData.followup_date}
          initialRemarks={editData.followup_remarks}
          initialType={editData.followup_type}
          onOk={handleReschedule}
        />
      </div>
      
      {editOpen && f && (
        <AddLeadPanel
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onAddLead={() => setEditOpen(false)}
          users={[]}
          divisions={[]}
          subdivisions={[]}
          initialValues={followupToLeadForm(f)}
        />
      )}
    </Drawer>
  );
};

export default QuickFollowupDrawer; 