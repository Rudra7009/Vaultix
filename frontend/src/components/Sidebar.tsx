import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, LayoutDashboard, Archive, Cpu, Wrench, BarChart2, Users, ScrollText, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useApp();
  const { can } = usePermissions();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { to: '/inventory', icon: Archive, label: 'Inventory', show: true },
    { to: '/assets', icon: Cpu, label: 'Assets', show: true },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance', show: true },
    { to: '/reports', icon: BarChart2, label: 'Reports', show: true },
    { to: '/users', icon: Users, label: 'Users', show: can('manage_users') },
    { to: '/activity', icon: ScrollText, label: 'Activity Log', show: can('view_activity_log') },
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'MANAGER': return 'purple';
      case 'TECHNICIAN': return 'emerald';
      case 'AUDITOR': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold">Vaultix</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.filter(item => item.show).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      {currentUser && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <Avatar initials={currentUser.avatar} role={currentUser.role} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <Badge variant={getRoleBadgeVariant(currentUser.role)} className="mt-1">
                {currentUser.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};