import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  variant = 'default',
  hover = false,
  padding = 'lg'
}) => {
  const baseClasses = `
    bg-white rounded-2xl transition-all duration-300 ease-in-out
    focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2
  `;

  const variants = {
    default: 'shadow-lg border border-gray-100',
    elevated: 'shadow-2xl border-0',
    outlined: 'shadow-none border-2 border-yellow-200',
    gradient: 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl border border-yellow-100',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const hoverClasses = hover ? `
    hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]
    cursor-pointer transform transition-all duration-300
  ` : '';

  return (
    <div className={`
      ${baseClasses}
      ${variants[variant]}
      ${paddingClasses[padding]}
      ${hoverClasses}
      ${className}
    `}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card; 