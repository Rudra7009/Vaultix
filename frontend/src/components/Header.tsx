import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Avatar } from './Avatar';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { currentUser, inventoryItems, maintenanceRecords, assets } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Calculate notifications
  const lowStockItems = inventoryItems.filter(i => i.quantityOnHand > 0 && i.quantityOnHand < i.reorderLevel);
  const outOfStockItems = inventoryItems.filter(i => i.quantityOnHand === 0);
  
  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingMaintenance = maintenanceRecords.filter(
    m => m.status === 'SCHEDULED' && m.scheduledDate <= sevenDaysFromNow && m.scheduledDate >= today
  );

  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringWarranties = assets.filter(
    a => a.warrantyExpiry && a.warrantyExpiry <= thirtyDaysFromNow && a.warrantyExpiry >= today
  );

  const totalNotifications = lowStockItems.length + outOfStockItems.length + upcomingMaintenance.length + expiringWarranties.length;

  const notifications = [
    ...outOfStockItems.map(item => ({
      type: 'error' as const,
      message: `Out of stock: ${item.name}`,
      link: '/inventory'
    })),
    ...lowStockItems.map(item => ({
      type: 'warning' as const,
      message: `Low stock: ${item.name} (${item.quantityOnHand} ${item.unit} remaining)`,
      link: '/inventory'
    })),
    ...upcomingMaintenance.map(m => ({
      type: 'info' as const,
      message: `Maintenance due: ${m.assetName} on ${m.scheduledDate.toLocaleDateString()}`,
      link: '/maintenance'
    })),
    ...expiringWarranties.map(a => ({
      type: 'warning' as const,
      message: `Warranty expiring: ${a.name} on ${a.warrantyExpiry?.toLocaleDateString()}`,
      link: `/assets/${a.id}`
    }))
  ];

  return (
    <div className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalNotifications > 9 ? '9+' : totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(notif.link);
                          setShowNotifications(false);
                        }}
                        className="w-full p-3 hover:bg-gray-50 text-left flex items-start gap-2"
                      >
                        {notif.type === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        ) : notif.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Bell className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700">{notif.message}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <Avatar initials={currentUser.avatar} role={currentUser.role} size="sm" />
            <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};