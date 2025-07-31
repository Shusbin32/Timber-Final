import React, { useState } from 'react';
import Modal from './Modal';
import { CalendarIcon, BoltIcon } from '@heroicons/react/24/outline';
import { rescheduleFollowup } from '@/api/followups';
import { toast } from 'react-toastify';

interface RescheduleFollowupModalProps {
  open: boolean;
  onClose: () => void;
  leadId?: number;
  onOk?: (data: { date: string; remarks: string; type: string }) => void;
  initialDate?: string;
  initialRemarks?: string;
  initialType?: string;
}

const followupTypes = [
  { value: '', label: 'Select Followup Type' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'General', label: 'General' },
  { value: 'Payment', label: 'Payment' },
  { value: 'AFTER VISIT followup', label: 'After Visit Followup' },
  { value: 'BEFORE VISIT FOLLOW-UP', label: 'Before Visit Follow-up' },
  { value: 'RAW DATA FOLLOW-UP', label: 'Raw Data Follow-up' },
];

const RescheduleFollowupModal: React.FC<RescheduleFollowupModalProps> = ({ 
  open, 
  onClose, 
  leadId, 
  onOk,
  initialDate,
  initialRemarks,
  initialType
}) => {
  const [date, setDate] = useState('2025-07-26T10:00');
  const [remarks, setRemarks] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickSelector, setShowQuickSelector] = useState(false);

  // Reset form when modal opens with initial values
  React.useEffect(() => {
    if (open) {
      // Format date for datetime-local input
      let formattedDate = '2025-07-26T10:00';
      if (initialDate) {
        try {
          const dateObj = new Date(initialDate);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().slice(0, 16);
          }
        } catch (error) {
          console.warn('Error formatting date:', error);
        }
      }
      
      setDate(formattedDate);
      setRemarks(initialRemarks || '');
      setType(initialType || '');
    }
  }, [open, initialDate, initialRemarks, initialType]);

  // Quick selector options
  const getQuickSelectorOptions = () => {
    const now = new Date();
    const options = [
      {
        label: 'Tomorrow 10:00 AM',
        value: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0)
      },
      {
        label: 'Tomorrow 2:00 PM',
        value: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0)
      },
      {
        label: 'Day After Tomorrow 10:00 AM',
        value: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0)
      },
      {
        label: 'Next Week Same Time',
        value: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 10, 0)
      },
      {
        label: 'In 3 Days 10:00 AM',
        value: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0)
      },
      {
        label: 'In 5 Days 10:00 AM',
        value: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 10, 0)
      }
    ];
    return options;
  };

  const handleQuickSelect = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().slice(0, 16);
    setDate(formattedDate);
    setShowQuickSelector(false);
  };

  async function handleOk() {
    console.log('🔍 Debug - Reschedule handleOk called');
    console.log('🔍 Debug - leadId:', leadId);
    console.log('🔍 Debug - date:', date);
    console.log('🔍 Debug - remarks:', remarks);
    console.log('🔍 Debug - type:', type);
    
    if (!leadId) {
      console.error('🔍 Debug - Lead ID is missing');
      toast.error('Lead ID is required for rescheduling');
      return;
    }

    if (!type || !remarks.trim()) {
      console.error('🔍 Debug - Missing required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Debug - Calling rescheduleFollowup API');
      await rescheduleFollowup(leadId, {
        followup_date: date,
        followup_remarks: remarks,
        followup_type: type,
      });
      
      console.log('🔍 Debug - Reschedule successful');
      toast.success('Followup rescheduled successfully!');
      if (onOk) onOk({ date, remarks, type });
      onClose();
    } catch (error) {
      console.error('🔍 Debug - Error rescheduling followup:', error);
      toast.error('Failed to reschedule followup. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reschedule Followup">
      <form className="flex flex-col gap-5 mt-2">
        <div>
          <label className="font-bold text-lg text-black flex items-center gap-2 mb-2">
            <span className="text-red-500">*</span> Followup Date
            <span 
              className="text-yellow-600 flex items-center gap-1 cursor-pointer text-base font-semibold ml-2 hover:text-yellow-700 transition-colors"
              onClick={() => setShowQuickSelector(!showQuickSelector)}
            >
              <BoltIcon className="w-5 h-5" /> Quick Selector
            </span>
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-yellow-200 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-yellow-50 text-lg"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
            <CalendarIcon className="w-6 h-6 text-yellow-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            
            {/* Quick Selector Dropdown */}
            {showQuickSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-yellow-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="text-sm font-semibold text-gray-700 px-3 py-2 border-b border-gray-200">Quick Date Options</div>
                  {getQuickSelectorOptions().map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-yellow-50 rounded transition-colors text-sm text-gray-700 hover:text-yellow-800"
                      onClick={() => handleQuickSelect(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="font-bold text-lg text-black mb-2 flex items-center gap-2">
            <span className="text-red-500">*</span> Remarks
          </label>
          <textarea
            className="w-full rounded-lg border border-yellow-200 px-4 py-2 min-h-[60px] text-black focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-yellow-50 text-lg"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Enter Remarks"
            required
          />
        </div>
        <div>
          <label className="font-bold text-lg text-black mb-2 flex items-center gap-2">
            <span className="text-red-500">*</span> Followup Type
          </label>
          <select
            className="w-full rounded-lg border border-yellow-200 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-yellow-50 text-lg"
            value={type}
            onChange={e => setType(e.target.value)}
            required
          >
            {followupTypes.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold px-5 py-2 rounded-xl border border-gray-300 shadow transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={e => { e.preventDefault(); handleOk(); }}
            disabled={loading}
          >
            {loading ? 'Rescheduling...' : 'OK'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RescheduleFollowupModal; 