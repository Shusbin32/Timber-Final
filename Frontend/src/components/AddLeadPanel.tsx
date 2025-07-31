import React, { useState, useEffect } from "react";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { BranchService, Branch } from '@/api/branches';

export type LeadForm = {
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
  followup_date: string;
  followup_remarks: string;
  followup_type: string;
  division_id?: number;
  subdivision_id?: number;
  assign_to: string | "";
  created_at: string;
  updated_at: string;
  is_customer?: boolean;
  remarks: string;
  created_by?: string; // Add field to show who created the lead
};

type AddLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onAddLead: (lead: LeadForm) => void;
  users: { id: number; name: string }[];
  divisions: { division_id: number; division_name: string }[];
  subdivisions: { subdivision_id: number; subdivision_name: string; division_id: number }[];
  initialValues?: Partial<LeadForm>;
};

const AddLeadPanel: React.FC<AddLeadModalProps> = ({ open, onClose, onAddLead, users, divisions, subdivisions, initialValues }) => {
  const defaultForm: LeadForm & { before_visit_notes?: string; after_visit_notes?: string } = {
    name: "",
    contact: "",
    address: "",
    email: "",
    gender: "",
    city: "",
    landmark: "",
    lead_type: "",
    source: "",
    category: "",
    pan_vat: "",
    company_name: "",
    branch: "",
    tentetive_visit_date: "",
    tentetive_purchase_date: "",
    followup_date: "",
    followup_remarks: "",
    followup_type: "",
    division_id: undefined,
    subdivision_id: undefined,
    assign_to: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    before_visit_notes: "",
    after_visit_notes: "",
    is_customer: false,
    remarks: "",
    created_by: localStorage.getItem("userName") || "", // Initialize with current user's name
  };
  const [form, setForm] = useState<LeadForm & { before_visit_notes?: string; after_visit_notes?: string }>(initialValues ? { ...defaultForm, ...initialValues } : defaultForm);

  // Reset form when opening for edit or add
  React.useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...defaultForm, ...initialValues } : defaultForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);
  const [expanded, setExpanded] = useState(false);
  const typeOptions = ["Raw Data", "Complete", "Before Visit", "After Visit"];
  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([]);
  const followupTypeOptions = [
    { value: '', label: 'Select Followup Type' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'pending', label: 'Pending' },
  ];

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const name = e.target.name;
    const value = e.target.value;
    const type = e.target.type;
    if (type === "checkbox") {
      const input = e.target as HTMLInputElement;
      setForm(f => ({ ...f, [name]: input.checked }));
    } else if (name === 'division_id' || name === 'subdivision_id') {
      setForm(f => ({ ...f, [name]: value ? Number(value) : undefined }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleExpand(e: React.MouseEvent) {
    e.preventDefault();
    setExpanded((prev) => !prev);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || form.name.trim() === "") {
      toast.error("Name is required.");
      return;
    }
    if (!form.contact || !/^[0-9]{10}$/.test(form.contact)) {
      toast.error("Contact must be a 10-digit number.");
      return;
    }
    if (!form.followup_date || form.followup_date.trim() === "") {
      toast.error("Followup Date is required.");
      return;
    }
    if (!form.followup_type || form.followup_type.trim() === "") {
      toast.error("Followup Type is required.");
      return;
    }
    if (!form.followup_remarks || form.followup_remarks.trim() === "") {
      toast.error("Followup Remarks is required.");
      return;
    }
    // Always send a value for gender
    const payload = {
      ...form,
      gender: form.gender || "",
      division_id: form.division_id,
      subdivision_id: form.subdivision_id,
    };
    console.log('Submitting lead data:', payload); // Debug log
    onAddLead(payload);
    onClose();
    setForm({
      name: "",
      contact: "",
      address: "",
      email: "",
      gender: "",
      city: "",
      landmark: "",
      lead_type: "",
      source: "",
      category: "",
      pan_vat: "",
      company_name: "",
      branch: "",
      tentetive_visit_date: "",
      tentetive_purchase_date: "",
      followup_date: "",
      followup_remarks: "",
      followup_type: "",
      division_id: undefined,
      subdivision_id: undefined,
      assign_to: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      before_visit_notes: "",
      after_visit_notes: "",
      is_customer: false,
      remarks: "",
    });
    setExpanded(false);
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-end ${open ? '' : 'pointer-events-none'}`} style={{ transition: 'background 0.2s' }}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 transition-all duration-200 ${open ? 'bg-white/40' : 'bg-transparent'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white rounded-l-2xl shadow-2xl border-l-4 border-yellow-400 transition-transform duration-300 z-50 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ maxWidth: 520, borderLeft: '4px solid #facc15', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <div className="p-8 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">Add Lead</h2>
            <Button variant="icon" onClick={onClose}><XMarkIcon className="w-6 h-6" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
            {/* Is Customer Checkbox */}
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="is_customer"
                name="is_customer"
                checked={form.is_customer || false}
                onChange={handleChange}
                className="mr-2 w-4 h-4 accent-yellow-500"
              />
              <label htmlFor="is_customer" className="text-yellow-900 font-medium">Is Customer</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Enter name" />
              <Input label="Email" id="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Mobile" id="mobile" name="contact" value={form.contact} onChange={handleChange} placeholder="Enter mobile number" />
              <Input label="Address" id="address" name="address" value={form.address} onChange={handleChange} placeholder="Enter address" />
            </div>
            <Select
              label="Type"
              id="type"
              name="lead_type"
              value={form.lead_type}
              onChange={handleChange}
              options={[{ value: '', label: 'Select Type' }, ...typeOptions.map(type => ({ value: type, label: type }))]}
            />
            <Select
              label="Gender"
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select Gender' },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Others', label: 'Others' },
              ]}
            />
            {/* Remarks textarea replaces Branch dropdown here */}
            <div>
              <label htmlFor="remarks" className="block text-yellow-900 font-medium mb-1">Remarks *</label>
              <textarea
                id="remarks"
                name="remarks"
                value={form.remarks || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-black p-2 min-h-[60px] text-black placeholder-black"
                placeholder="Enter any remarks..."
                required
              />
            </div>
            <Input label="Followup Date" id="followup_date" name="followup_date" type="date" value={form.followup_date || ''} onChange={handleChange} />
            <Input label="Followup Remarks" id="followup_remarks" name="followup_remarks" value={form.followup_remarks || ''} onChange={handleChange} />
            <Select
              label="Followup Type"
              id="followup_type"
              name="followup_type"
              value={form.followup_type || ''}
              onChange={handleChange}
              options={followupTypeOptions}
            />
            <Button variant="gradient" type="button" onClick={handleExpand} className="self-start">
              {expanded ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
              {expanded ? "Less Fields" : "More Fields"}
            </Button>
            {/* Expanded fields as a sliding section */}
            <div style={{ position: 'relative', minHeight: expanded ? 420 : 0 }}>
              <div
                className={`absolute top-0 left-0 w-full transition-transform transition-opacity duration-400 ease-in-out bg-yellow-50 rounded-xl p-4 border border-yellow-200 grid grid-cols-2 gap-4 shadow-2xl z-20 ${expanded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
                style={{ boxShadow: expanded ? '0 8px 32px 0 rgba(31,38,135,0.12)' : undefined }}
              >
                {expanded && (
                  <>
                    <Select
                      label="Sub Division"
                      id="subdivision"
                      name="subdivision_id"
                      value={form.subdivision_id ?? ''}
                      onChange={e => {
                        const selectedSub = subdivisions.find(s => s.subdivision_id === Number(e.target.value));
                        setForm(prev => ({
                          ...prev,
                          subdivision_id: e.target.value ? Number(e.target.value) : undefined,
                          division_id: selectedSub ? selectedSub.division_id : prev.division_id
                        }));
                      }}
                      options={[
                        { value: '', label: 'Select Sub Division' },
                        ...subdivisions
                          .filter(s => !form.division_id || s.division_id === form.division_id)
                          .map(s => ({
                            value: String(s.subdivision_id),
                            label: s.subdivision_name
                          }))
                      ]}
                    />
                    <Select
                      label="Division"
                      id="division"
                      name="division_id"
                      value={form.division_id ? String(form.division_id) : ''}
                      onChange={e => {
                        const newDivisionId = Number(e.target.value);
                        setForm(prev => {
                          // If current subdivision does not belong to new division, clear it
                          const sub = subdivisions.find(s => s.subdivision_id === Number(prev.subdivision_id));
                          if (!sub || sub.division_id !== newDivisionId) {
                            return { ...prev, division_id: newDivisionId, subdivision_id: undefined };
                          }
                          return { ...prev, division_id: newDivisionId };
                        });
                      }}
                      options={[
                        { value: '', label: 'Select Division' },
                        ...divisions.map(d => ({ value: String(d.division_id), label: d.division_name }))
                      ]}
                    />
                    <Select
                      label="Assign To"
                      id="assign_to"
                      name="assign_to"
                      value={form.assign_to ?? ''}
                      onChange={handleChange}
                      options={[
                        { value: '', label: 'Assign To' },
                        ...users.map(user => ({ value: String(user.id), label: user.name }))
                      ]}
                    />
                    <Input label="Created At" id="created_at" name="created_at" type="date" value={form.created_at.slice(0, 10)} onChange={handleChange} />
                    <Input label="Updated At" id="updated_at" name="updated_at" type="date" value={form.updated_at.slice(0, 10)} onChange={handleChange} />
                    <Input label="Created By" id="created_by" name="created_by" value={form.created_by || ''} onChange={handleChange} />
                  </>
                )}
                <Input label="City" id="city" name="city" value={form.city} onChange={handleChange} placeholder="Enter city" />
                <Input label="Landmark" id="landmark" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Enter landmark" />
                <Input label="Category" id="category" name="category" value={form.category} onChange={handleChange} placeholder="Enter category" />
                <Input label="Source" id="source" name="source" value={form.source} onChange={handleChange} placeholder="Enter source" />
                <Input label="PAN/VAT" id="pan_vat" name="pan_vat" value={form.pan_vat} onChange={handleChange} placeholder="Enter PAN/VAT" />
                <Input label="Company Name" id="company_name" name="company_name" value={form.company_name} onChange={handleChange} placeholder="Enter company name" />
                <Input label="Tentative Visit Date" id="tentetive_visit_date" name="tentetive_visit_date" type="date" value={form.tentetive_visit_date} onChange={handleChange} />
                <Input label="Tentative Purchase Date" id="tentetive_purchase_date" name="tentetive_purchase_date" type="date" value={form.tentetive_purchase_date} onChange={handleChange} />
                <Select
                  label="Branch"
                  id="branch"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  options={[{ value: '', label: 'Select Branch' }, ...branchOptions]}
                />
                <div className="flex justify-end mt-2">
                  <Button variant="secondary" type="button" onClick={() => setExpanded(false)}>OK</Button>
                </div>
              </div>
            </div>
            <div className="col-span-2 flex justify-end mt-4">
              <Button variant="primary" type="submit">Save</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLeadPanel; 