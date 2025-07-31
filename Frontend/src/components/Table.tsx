import React from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  className?: string;
}

function Table<T extends Record<string, unknown>>({ columns, data, actions, className = '' }: TableProps<T>) {
  // Helper function to format cell values
  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '—';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? `${value.length} items` : 'Empty';
      }
      // For objects, show a summary or key properties
      const obj = value as Record<string, unknown>;
      if (obj.name || obj.title || obj.label) {
        return String(obj.name || obj.title || obj.label);
      }
      if (obj.id) {
        return `ID: ${obj.id}`;
      }
      return 'Object';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return '—';
    }
    
    return String(value);
  };

  return (
    <div className={`overflow-x-auto bg-white/80 rounded-3xl shadow-2xl border-2 border-yellow-100 mt-2 ${className}`}>
      <table className="min-w-full text-yellow-900">
        <thead className="sticky top-0 z-10 bg-yellow-50/90">
          <tr className="text-yellow-700 text-lg font-bold border-b border-yellow-200">
            {columns.map(col => (
              <th key={String(col.key)} className="p-4 whitespace-nowrap border-r border-yellow-100 last:border-r-0 tracking-wide">
                {col.label}
              </th>
            ))}
            {actions && <th className="p-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-gray-400 text-lg">No data found.</td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className={`border-b last:border-b-0 transition-transform duration-100 hover:scale-[1.01] hover:shadow-lg hover:bg-yellow-50/60 ${idx % 2 === 0 ? 'bg-white/70' : 'bg-yellow-50/60'}`}>
                {columns.map(col => (
                  <td key={String(col.key)} className="p-4 whitespace-nowrap border-r border-yellow-50 last:border-r-0 text-base">
                    {col.render ? col.render(row[col.key], row) : formatCellValue(row[col.key])}
                  </td>
                ))}
                {actions && <td className="p-4">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table; 