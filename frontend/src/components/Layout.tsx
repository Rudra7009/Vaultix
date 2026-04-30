import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory Management',
  '/assets': 'Asset Management',
  '/maintenance': 'Maintenance Schedule',
  '/reports': 'Reports & Analytics',
  '/users': 'User Management',
  '/activity': 'Activity Log'
};

export const Layout: React.FC = () => {
  const location = useLocation();
  
  // Get title from path
  let title = pageTitles[location.pathname] || 'Vaultix';
  
  // Handle dynamic routes
  if (location.pathname.startsWith('/assets/') && location.pathname !== '/assets') {
    title = 'Asset Details';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-60">
        <Header title={title} />
        <main className="pt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};