import React from 'react';
import { UserRole as Role } from '../lib/database.types';

interface AvatarProps {
  initials: string;
  role?: Role;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ initials, role, size = 'md', className = '' }) => {
  const roleColors = {
    ADMIN: 'bg-red-500',
    MANAGER: 'bg-purple-500',
    INVENTORY_CLERK: 'bg-blue-500',
    TECHNICIAN: 'bg-emerald-500',
    AUDITOR: 'bg-amber-500'
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl'
  };

  const bgColor = role ? roleColors[role] : 'bg-gray-500';

  return (
    <div className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {initials}
    </div>
  );
};