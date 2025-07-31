import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  rounded = true,
  className = '' 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-200 ease-in-out
    ${rounded ? 'rounded-full' : 'rounded-lg'}
  `;

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-yellow-500 to-yellow-600 
      text-white shadow-sm
      hover:from-yellow-600 hover:to-yellow-700
    `,
    secondary: `
      bg-gray-100 text-gray-700 border border-gray-200
      hover:bg-gray-200
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600 
      text-white shadow-sm
      hover:from-green-600 hover:to-green-700
    `,
    warning: `
      bg-gradient-to-r from-orange-500 to-orange-600 
      text-white shadow-sm
      hover:from-orange-600 hover:to-orange-700
    `,
    error: `
      bg-gradient-to-r from-red-500 to-red-600 
      text-white shadow-sm
      hover:from-red-600 hover:to-red-700
    `,
    info: `
      bg-gradient-to-r from-blue-500 to-blue-600 
      text-white shadow-sm
      hover:from-blue-600 hover:to-blue-700
    `,
  };

  return (
    <span className={`
      ${baseClasses}
      ${sizes[size]}
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge; 