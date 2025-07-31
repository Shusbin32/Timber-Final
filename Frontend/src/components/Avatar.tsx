import React from 'react';

interface AvatarProps {
  name?: string;
  email?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'square' | 'rounded';
  showInitials?: boolean;
  showTooltip?: boolean;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name = '', 
  email = '',
  size = 'md',
  variant = 'circle',
  showInitials = true,
  showTooltip = false,
  className = '',
  onClick
}) => {
  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Generate color based on name or email
  const getColorFromString = (str: string): string => {
    if (!str) return 'gray';
    
    const colors = [
      'yellow', 'green', 'blue', 'purple', 'pink', 'red', 'orange', 'indigo', 'teal', 'cyan'
    ];
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name || email);
  const color = getColorFromString(name || email);
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const variantClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const colorClasses = {
    yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900',
    green: 'bg-gradient-to-br from-green-400 to-green-600 text-green-900',
    blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-blue-900',
    purple: 'bg-gradient-to-br from-purple-400 to-purple-600 text-purple-900',
    pink: 'bg-gradient-to-br from-pink-400 to-pink-600 text-pink-900',
    red: 'bg-gradient-to-br from-red-400 to-red-600 text-red-900',
    orange: 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900',
    indigo: 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-indigo-900',
    teal: 'bg-gradient-to-br from-teal-400 to-teal-600 text-teal-900',
    cyan: 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-cyan-900',
    gray: 'bg-gradient-to-br from-gray-400 to-gray-600 text-gray-900',
  };

  const baseClasses = `
    flex items-center justify-center font-bold font-sans
    transition-all duration-200 ease-in-out
    shadow-sm hover:shadow-md
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
  `;

  const avatarContent = (
    <div
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${colorClasses[color as keyof typeof colorClasses]}
        ${className}
      `}
      onClick={onClick}
      title={showTooltip ? (name || email || 'User') : undefined}
    >
      {showInitials ? initials : '?'}
    </div>
  );

  return avatarContent;
};

export default Avatar; 