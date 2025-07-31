import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  className?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  success,
  helper,
  leftIcon,
  rightIcon,
  inputSize = 'md',
  variant = 'default',
  className = '', 
  ...props 
}) => {
  const baseClasses = `
    w-full transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variants = {
    default: `
      border-2 border-gray-200 rounded-xl shadow-sm
      focus:border-yellow-500 focus:ring-yellow-500
      hover:border-gray-300
    `,
    outlined: `
      border-2 border-yellow-300 rounded-xl shadow-sm
      focus:border-yellow-500 focus:ring-yellow-500
      hover:border-yellow-400
    `,
    filled: `
      border-2 border-transparent bg-gray-50 rounded-xl
      focus:border-yellow-500 focus:ring-yellow-500 focus:bg-white
      hover:bg-gray-100
    `,
  };

  const stateClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : success 
    ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
    : '';

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-semibold text-gray-700 text-sm">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
    <input
          className={`
            ${baseClasses}
            ${sizes[inputSize]}
            ${variants[variant]}
            ${stateClasses}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
      {...props}
    />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || success || helper) && (
        <div className="flex items-center gap-1 text-xs">
          {error && (
            <span className="text-red-600 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </span>
          )}
          {success && (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </span>
          )}
          {helper && !error && !success && (
            <span className="text-gray-500">
              {helper}
            </span>
          )}
        </div>
      )}
  </div>
);
};

export default Input; 