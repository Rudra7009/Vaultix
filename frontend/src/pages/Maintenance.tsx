import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import { Badge } from '../components/Badge';
import { MaintenanceStatus } from '../lib/database.types';

export const Maintenance: React.FC = () => {
  const { maintenanceRecords } = useApp();
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState<'all' | MaintenanceStatus | 'upcoming'>('all');

  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filteredRecords = maintenanceRecords.filter(m => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return m.status === 'SCHEDULED' && m.scheduledDate <= sevenDaysFromNow && m.scheduledDate >= today;
    }
    return m.status === activeTab;
  });

  const upcomingCount = maintenanceRecords.filter(
    m => m.status === 'SCHEDULED' && m.scheduledDate <= sevenDaysFromNow && m.scheduledDate >= today
  ).length;

  const getStatusVariant = (status: MaintenanceStatus) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'SCHEDULED': return 'info';
    }
  };

  const tabs = [
    { key: 'all' as const, label: 'All' },
    { key: 'SCHEDULED' as const, label: 'Scheduled' },
    { key: 'IN_PROGRESS' as const, label: 'In Progress' },
    { key: 'COMPLETED' as const, label: 'Completed' },
    { key: 'upcoming' as const, label: `Upcoming (${upcomingCount})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Schedule</h2>
          <p className="text-gray-600 mt-1">Manage asset maintenance and repairs</p>
        </div>
        {can('manage_maintenance') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Schedule Maintenance
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map(record => {
                const isPastDue = record.status !== 'COMPLETED' && record.scheduledDate < today;
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.assetName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.assetSerialNo}</td>
                    <td className="px-6 py-4">
                      <Badge variant={record.maintenanceType === 'PREVENTIVE' ? 'info' : 'warning'}>
                        {record.maintenanceType}
                      </Badge>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isPastDue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                      {record.scheduledDate.toLocaleDateString()}
                      {isPastDue && ' (overdue)'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(record.status)}>
                        {record.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.technician}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.cost ? `$${record.cost}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};