import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1 mb-2">
    {label && <label className="font-medium text-gray-700 mb-1">{label}</label>}
    <select
      className={`border rounded-xl px-4 py-3 text-black shadow-sm focus:ring-2 focus:ring-yellow-300 ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="text-red-600 text-xs mt-1">{error}</span>}
  </div>
);

export default Select; 