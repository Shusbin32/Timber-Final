import React, { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: { name: string; label: string; type: string; required?: boolean }[];
  onSubmit: (data: Record<string, string>) => void;
}

export default function CreationModal({ isOpen, onClose, title, fields, onSubmit }: CreationModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({});
    onClose();
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <Input
              key={field.name}
              label={field.label}
              id={field.name}
              name={field.name}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          ))}
          
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              Create {title}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 