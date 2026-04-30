import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  borderColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor, borderColor }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-t-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${iconColor} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};