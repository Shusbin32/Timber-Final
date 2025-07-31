"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface FollowupTypeDropdownProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  onRefresh?: () => void;
  showNavigation?: boolean;
}

const followupTypes = [
  { value: 'all', label: 'All', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300' },
];

export default function FollowupTypeDropdown({ 
  selectedType, 
  onTypeChange, 
  onRefresh,
  showNavigation = false 
}: FollowupTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTypeSelect = (type: string) => {
    onTypeChange(type);
    setIsOpen(false);
  };

  const handleNavigateToPage = (type: string) => {
    if (type === 'all') {
      window.location.href = '/homescreen/followup/all';
    } else {
      window.location.href = `/homescreen/followup/${type}`;
    }
  };



  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Bar */}
      <div className="bg-yellow-500 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-yellow-600 transition-colors">
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              className="text-white hover:text-yellow-200 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          )}
          <span className="text-white font-bold text-lg">Followup</span>
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
          {followupTypes.map((type) => (
            <div key={type.value} className="px-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleTypeSelect(type.value)}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors hover:bg-gray-50 ${type.color} border ${type.value === selectedType ? 'ring-2 ring-yellow-500' : ''}`}
                >
                  {type.label}
                </button>
                {showNavigation && (
                  <button
                    onClick={() => handleNavigateToPage(type.value)}
                    className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    title={`Go to ${type.label} page`}
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
        aria-label="Open followup type dropdown"
      >
        {/* Invisible overlay to make the entire header clickable */}
        <div className="absolute inset-0" />
      </button>
    </div>
  );
} 