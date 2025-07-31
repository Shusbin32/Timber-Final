import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'gradient' | 'icon' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  className?: string;
}

const base = `
  inline-flex items-center justify-center gap-2 font-semibold rounded-full 
  transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 
  focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed
  active:transform active:scale-95
`;

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const variants = {
  primary: `
    bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 
    text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
    focus:ring-yellow-500
  `,
  secondary: `
    bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 
    hover:border-gray-300 shadow-sm hover:shadow-md
    focus:ring-gray-500
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
    text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
    focus:ring-red-500
  `,
  gradient: `
    bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-500 
    hover:from-yellow-500 hover:via-orange-400 hover:to-yellow-600 
    text-yellow-900 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
    focus:ring-yellow-500 font-bold
  `,
  icon: `
    p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full 
    w-10 h-10 justify-center shadow-md hover:shadow-lg
    transform hover:-translate-y-0.5 focus:ring-yellow-500
  `,
  ghost: `
    bg-transparent hover:bg-yellow-50 text-yellow-700 hover:text-yellow-800
    border border-transparent hover:border-yellow-200
    focus:ring-yellow-500
  `,
  outline: `
    bg-transparent text-yellow-700 border-2 border-yellow-500 
    hover:bg-yellow-500 hover:text-white
    focus:ring-yellow-500
  `,
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  return (
    <button 
      className={`
        ${base} 
        ${sizes[size]} 
        ${variants[variant]} 
        ${className}
        ${loading ? 'cursor-wait' : ''}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button; 