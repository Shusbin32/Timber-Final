import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'white' | 'yellow' | 'success' | 'warning' | 'error';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  color = 'primary', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-yellow-600',
    white: 'text-white',
    yellow: 'text-yellow-500',
    success: 'text-green-600',
    warning: 'text-orange-600',
    error: 'text-red-600'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`bg-current rounded-full animate-pulse ${sizeClasses[size]}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`bg-current rounded-full animate-pulse ${sizeClasses[size]}`} />
        );
      
      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`bg-current rounded-sm animate-pulse ${sizeClasses[size]}`}
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  height: size === 'xs' ? '12px' : size === 'sm' ? '16px' : size === 'md' ? '32px' : size === 'lg' ? '48px' : '64px'
                }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`} />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {renderSpinner()}
        {variant === 'spinner' && (
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current opacity-20 animate-pulse" />
        )}
      </div>
      {text && (
        <p className="text-sm font-medium text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 