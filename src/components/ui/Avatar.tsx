import React from 'react';

interface AvatarProps {
  photoURL: string | null | undefined;
  displayName: string | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  border?: string;
}

const Avatar: React.FC<AvatarProps> = ({ photoURL, displayName, size = 'md', className = '', border }) => {
  const initials = React.useMemo(() => {
    if (!displayName) return 'S';
    return displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [displayName]);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      rounded-full 
      flex items-center justify-center 
      overflow-hidden 
      relative 
      flex-shrink-0
      ${border ? `border-2 ${border}` : ''} 
      bg-[#f2f4f4]
      ${className}
    `}>
      {photoURL ? (
        <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-[#b32839] text-white font-bold flex items-center justify-center font-['Lora']">
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
