import React, { useState } from "react";
import { UserIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import Drawer from '@/components/Drawer';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Avatar from '@/components/Avatar';
import { getUsers } from '@/api/users';
import { updateFollowup } from '@/api/followups';
import { Followup } from '@/api/followups';
import AddLeadPanel, { LeadForm } from './AddLeadPanel';
import RescheduleFollowupModal from './RescheduleFollowupModal';
import { PencilSquareIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';


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

const QuickFollowupDrawer: React.FC<QuickFollowupDrawerProps> = ({ open, onClose, followup, onUpdate }) => {
  console.log('Drawer followup:', followup);
  console.log('Followup keys:', followup ? Object.keys(followup) : 'No followup');
  const f = followup;
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Followup>>(f ? { ...f } : {});
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  // State to track the current display data (combines prop and updated data)
  const [displayData, setDisplayData] = useState<Partial<Followup>>(f ? { ...f } : {});

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getUsers();
        // Try to support both {data: users[]} and users[]
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
      console.log('Original followup data:', f);
      console.log('Followup type:', f.followup_type);
      
      // Helper to map username to user ID
      function getUserIdFromName(name: string): number | undefined {
        const user = users.find(u => u.name === name);
        return user ? user.id : undefined;
      }
      let assignTo = f.assign_to;
      // If assign_to is a string and not a number, map to user ID
      if (typeof assignTo === 'string' && isNaN(Number(assignTo))) {
        assignTo = getUserIdFromName(assignTo) ?? assignTo;
      }
      const updatedData = { ...f, assign_to: assignTo };
      setEditData(updatedData);
      setDisplayData(updatedData);
    }
  }, [f, editOpen, users]);

  // Dropdown options
  const leadTypeOptions = [
    { value: '', label: 'Select Type' },
    { value: 'Raw Data', label: 'Raw Data' },
    { value: 'Complete', label: 'Complete' },
    { value: 'Before Visit', label: 'Before Visit' },
    { value: 'After Visit', label: 'After Visit' },
    { value: 'Hot', label: 'Hot' },
    { value: 'Cold', label: 'Cold' },
  ];
  const followupTypeOptions = [
    { value: '', label: 'Select Followup Type' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
  ];

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    console.log('editData:', editData);
    console.log('editData.lead_id:', editData.lead_id);
    console.log('editData.followup_type:', editData.followup_type);
    console.log('editData keys:', Object.keys(editData));
    
    // For followups, we use lead_id since there's no separate followup API
    const leadId = editData.lead_id;
    
    if (!leadId) {
      toast.error('Missing lead_id. Cannot update. Available fields: ' + Object.keys(editData).join(', '));
      return;
    }
    
    setSaving(true);
    try {
      // Update followup data directly
      const updated = await updateFollowup(editData as Followup);
      console.log('Updated followup returned:', updated);
      toast.success('Followup updated successfully!');
      setEditMode(false);
      
      // Update the local state to reflect the changes immediately
      setEditData(updated);
      setDisplayData(updated);
      
      if (onUpdate) onUpdate(updated);
    } catch {
      toast.error('Failed to update followup.');
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkAsDone() {
    console.log('Marking followup as done:', editData);
    
    const leadId = editData.lead_id;
    
    if (!leadId) {
      toast.error('Missing lead_id. Cannot mark as done.');
      return;
    }
    
    setSaving(true);
    try {
      // Update the followup type to completed
      const updatedData = { ...editData, followup_type: 'completed' };
      const updated = await updateFollowup(updatedData as Followup);
      console.log('Marked as done, updated followup:', updated);
      toast.success('Followup marked as completed!');
      
      // Update the local state to reflect the changes immediately
      setEditData(updated);
      setDisplayData(updated);
      
      if (onUpdate) onUpdate(updated);
    } catch (error) {
      console.error('Error marking followup as done:', error);
      toast.error('Failed to mark followup as completed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Quick Followup View">
      <div className="flex flex-col gap-6">
        {/* Header: Name, Status, Type */}
        <div className="flex items-center gap-4 mb-2">
          <Avatar 
            name={typeof displayData?.name === 'string' ? displayData.name : ''}
            size="xl"
            showTooltip={true}
          />
          <div>
            <div className="text-2xl font-extrabold text-yellow-900">{typeof displayData?.name === 'string' ? displayData.name : ''}</div>
            <div className="flex gap-2 mt-1">
              {/* You may want to map status/type from lead fields */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700`}>{typeof displayData?.lead_type === 'string' ? displayData.lead_type : ''}</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">{typeof displayData?.lead_type === 'string' ? displayData.lead_type : ''}</span>
            </div>
          </div>
        </div>
        {/* Assigned To, Next Date, Next Remarks */}
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-end">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-yellow-700" />
            <span className="font-semibold text-yellow-900">{
              (() => {
                const id = typeof displayData?.assign_to === 'number' ? displayData.assign_to : (typeof displayData?.assign_to === 'string' && displayData?.assign_to !== '' ? Number(displayData.assign_to) : undefined);
                const user = users.find(u => u.id === id);
                return user && user.name ? String(user.name) : (displayData?.assign_to ? String(displayData.assign_to) : '');
              })()
            }</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-yellow-700" />
            <span className="font-semibold text-yellow-900">{typeof displayData?.tentetive_visit_date === 'string' ? displayData.tentetive_visit_date.slice(0, 10) : (typeof displayData?.created_at === 'string' ? displayData.created_at.slice(0, 10) : '')}</span>
          </div>
        </div>
        {/* All fields from Add Lead panel */}
        <div className="grid grid-cols-2 gap-4 bg-white border border-gray-200 rounded-xl p-4 text-black">
          {editMode ? (
            <>
              <Select
                label="Assign To"
                name="assign_to"
                value={typeof editData.assign_to === 'number' ? String(editData.assign_to) : (typeof editData.assign_to === 'string' ? editData.assign_to : '')}
                onChange={e => setEditData(prev => ({ ...prev, assign_to: Number(e.target.value) }))}
                options={users.map(u => ({ value: String(u.id), label: u.name }))}
              />
              <Input label="Name" name="name" value={typeof editData.name === 'string' ? editData.name : ''} onChange={handleEditChange} />
              <Input label="Email" name="email" value={typeof editData.email === 'string' ? editData.email : ''} onChange={handleEditChange} />
              <Input label="Mobile" name="contact" value={typeof editData.contact === 'string' ? editData.contact : ''} onChange={handleEditChange} />
              <Input label="Address" name="address" value={typeof editData.address === 'string' ? editData.address : ''} onChange={handleEditChange} />
              <Select label="Lead Type" name="lead_type" value={typeof editData.lead_type === 'string' ? editData.lead_type : ''} onChange={handleEditChange} options={leadTypeOptions} />
              <Input label="Remarks" name="remarks" value={typeof editData.remarks === 'string' ? editData.remarks : ''} onChange={handleEditChange} />
              <Input label="Followup Date" name="followup_date" type="date" value={typeof editData.followup_date === 'string' ? editData.followup_date.slice(0,10) : ''} onChange={handleEditChange} />
              <Input label="Followup Remarks" name="followup_remarks" value={typeof editData.followup_remarks === 'string' ? editData.followup_remarks : ''} onChange={handleEditChange} />
              <Select label="Followup Type" name="followup_type" value={typeof editData.followup_type === 'string' ? editData.followup_type : ''} onChange={handleEditChange} options={followupTypeOptions} />
              <Input label="City" name="city" value={typeof editData.city === 'string' ? editData.city : ''} onChange={handleEditChange} />
              <Input label="Landmark" name="landmark" value={typeof editData.landmark === 'string' ? editData.landmark : ''} onChange={handleEditChange} />
              <Input label="Category" name="category" value={typeof editData.category === 'string' ? editData.category : ''} onChange={handleEditChange} />
              <Input label="Source" name="source" value={typeof editData.source === 'string' ? editData.source : ''} onChange={handleEditChange} />
              <Input label="PAN/VAT" name="pan_vat" value={typeof editData.pan_vat === 'string' ? editData.pan_vat : ''} onChange={handleEditChange} />
              <Input label="Company Name" name="company_name" value={typeof editData.company_name === 'string' ? editData.company_name : ''} onChange={handleEditChange} />
              <Input label="Branch" name="branch" value={typeof editData.branch === 'string' ? editData.branch : ''} onChange={handleEditChange} />
              <Input label="Tentative Visit Date" name="tentetive_visit_date" type="date" value={typeof editData.tentetive_visit_date === 'string' ? editData.tentetive_visit_date.slice(0,10) : ''} onChange={handleEditChange} />
              <Input label="Tentative Purchase Date" name="tentetive_purchase_date" type="date" value={typeof editData.tentetive_purchase_date === 'string' ? editData.tentetive_purchase_date.slice(0,10) : ''} onChange={handleEditChange} />
              <Input label="Created At" name="created_at" type="date" value={typeof editData.created_at === 'string' ? editData.created_at.slice(0,10) : ''} onChange={handleEditChange} />
              <Input label="Updated At" name="updated_at" type="date" value={typeof editData.updated_at === 'string' ? editData.updated_at.slice(0,10) : ''} onChange={handleEditChange} />
            </>
          ) : (
            <>
              <div><b>Owner:</b> {
                (() => {
                  const id = typeof displayData?.assign_to === 'number' ? displayData.assign_to : (typeof displayData?.assign_to === 'string' && displayData?.assign_to !== '' ? Number(displayData.assign_to) : undefined);
                  const user = users.find(u => u.id === id);
                  return user && user.name ? String(user.name) : (displayData?.assign_to ? String(displayData.assign_to) : '');
                })()
              }</div>
              <div><b>Name:</b> {typeof displayData?.name === 'string' ? displayData.name : ''}</div>
              <div><b>Email:</b> {typeof displayData?.email === 'string' ? displayData.email : ''}</div>
              <div><b>Mobile:</b> {typeof displayData?.contact === 'string' ? displayData.contact : ''}</div>
              <div><b>Address:</b> {typeof displayData?.address === 'string' ? displayData.address : ''}</div>
              <div><b>Lead Type:</b> {typeof displayData?.lead_type === 'string' ? displayData.lead_type : ''}</div>
              <div><b>Remarks:</b> {typeof displayData?.remarks === 'string' ? displayData.remarks : ''}</div>
              <div><b>Followup Date:</b> {typeof displayData?.followup_date === 'string' ? displayData.followup_date : ''}</div>
              <div><b>Followup Remarks:</b> {typeof displayData?.followup_remarks === 'string' ? displayData.followup_remarks : ''}</div>
              <div><b>Followup Type:</b> {typeof displayData?.followup_type === 'string' ? displayData.followup_type : ''}</div>
              <div><b>City:</b> {typeof displayData?.city === 'string' ? displayData.city : ''}</div>
              <div><b>Landmark:</b> {typeof displayData?.landmark === 'string' ? displayData.landmark : ''}</div>
              <div><b>Category:</b> {typeof displayData?.category === 'string' ? displayData.category : ''}</div>
              <div><b>Source:</b> {typeof displayData?.source === 'string' ? displayData.source : ''}</div>
              <div><b>PAN/VAT:</b> {typeof displayData?.pan_vat === 'string' ? displayData.pan_vat : ''}</div>
              <div><b>Company Name:</b> {typeof displayData?.company_name === 'string' ? displayData.company_name : ''}</div>
              <div><b>Branch:</b> {typeof displayData?.branch === 'string' ? displayData.branch : ''}</div>
              <div><b>Tentative Visit Date:</b> {typeof displayData?.tentetive_visit_date === 'string' ? displayData.tentetive_visit_date : ''}</div>
              <div><b>Tentative Purchase Date:</b> {typeof displayData?.tentetive_purchase_date === 'string' ? displayData.tentetive_purchase_date : ''}</div>
              <div><b>Created At:</b> {typeof displayData?.created_at === 'string' ? displayData.created_at : ''}</div>
              <div><b>Updated At:</b> {typeof displayData?.updated_at === 'string' ? displayData.updated_at : ''}</div>
            </>
          )}
        </div>
        {/* Timeline/Activities: Not available in Lead, so omitted. */}
        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow transition flex items-center gap-2" onClick={() => setRescheduleOpen(true)}><CalendarIcon className="w-5 h-5" /> Reschedule</button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-xl shadow transition flex items-center gap-2" onClick={handleMarkAsDone} disabled={saving}><CheckCircleIcon className="w-5 h-5" /> {saving ? 'Saving...' : 'Mark as Done'}</button>
          {editMode ? (
            <>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-5 py-2 rounded-xl shadow border border-yellow-700 transition flex items-center gap-2" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-5 py-2 rounded-xl shadow transition flex items-center gap-2" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold px-5 py-2 rounded-xl shadow border border-yellow-300 transition flex items-center gap-2" onClick={() => setEditMode(true)}><PencilSquareIcon className="w-5 h-5" /> Edit</button>
          )}
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-xl shadow transition flex items-center gap-2" onClick={() => window.location.reload()}>Refresh</button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-5 py-2 rounded-xl shadow transition flex items-center gap-2" onClick={onClose}><XMarkIcon className="w-5 h-5" /> Close</button>
        </div>
        <RescheduleFollowupModal 
          open={rescheduleOpen} 
          onClose={() => setRescheduleOpen(false)} 
          leadId={editData.lead_id}
          initialDate={editData.followup_date}
          initialRemarks={editData.followup_remarks}
          initialType={editData.followup_type}
          onOk={async (data) => {
            // Update the local state with the rescheduled data
            const updatedData = {
              ...editData,
              followup_date: data.date,
              followup_remarks: data.remarks,
              followup_type: data.type,
            };
            setEditData(updatedData);
            setDisplayData(updatedData);
            
            // Call the onUpdate callback if provided
            if (onUpdate) {
              onUpdate(updatedData as Followup);
            }
          }}
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