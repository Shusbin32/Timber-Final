"use client";
import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ExpandableDataProps {
  data: unknown;
  label?: string;
  maxDepth?: number;
}

export default function ExpandableData({ data, label = 'Data', maxDepth = 2 }: ExpandableDataProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatValue = (value: unknown, depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500 italic">null</span>;
    }

    if (typeof value === 'string') {
      return value.trim() === '' ? <span className="text-gray-500 italic">empty</span> : value;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'boolean') {
      return <span className={value ? 'text-green-600' : 'text-red-600'}>{value ? 'Yes' : 'No'}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500 italic">Empty array</span>;
      }
      
      if (depth >= maxDepth) {
        return <span className="text-blue-600">{value.length} items</span>;
      }

      return (
        <div className="ml-4">
          {value.map((item, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-50 rounded border">
              <span className="text-gray-600 text-sm">[{index}]: </span>
              {formatValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      
      if (keys.length === 0) {
        return <span className="text-gray-500 italic">Empty object</span>;
      }

      if (depth >= maxDepth) {
        return <span className="text-blue-600">{keys.length} properties</span>;
      }

      return (
        <div className="ml-4">
          {keys.map(key => (
            <div key={key} className="mb-1">
              <span className="text-gray-600 text-sm font-medium">{key}: </span>
              {formatValue(obj[key], depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  const getSummary = (data: unknown): string => {
    if (data === null || data === undefined) return 'null';
    if (typeof data === 'string') return data || 'empty';
    if (typeof data === 'number') return String(data);
    if (typeof data === 'boolean') return data ? 'Yes' : 'No';
    if (Array.isArray(data)) return `${data.length} items`;
    if (typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      const keys = Object.keys(obj);
      return `${keys.length} properties`;
    }
    return String(data);
  };

  return (
    <div className="border rounded-lg p-2 bg-gray-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left hover:bg-gray-100 p-1 rounded"
      >
        {isExpanded ? (
          <ChevronDownIcon className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
        )}
        <span className="font-medium text-gray-700">{label}:</span>
        <span className="text-gray-600">{getSummary(data)}</span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-2 bg-white rounded border">
          {formatValue(data)}
        </div>
      )}
    </div>
  );
} 