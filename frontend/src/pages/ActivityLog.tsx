import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActivityLog: React.FC = () => {
  const { assets, inventoryItems, users, maintenanceRecords } = useApp();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  // Generate activity log from existing data
  const activityLog = [
    ...assets.slice(0, 10).map((a, i) => ({
      id: `log-asset-${i}`,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      event: `Asset ${a.status === 'ASSIGNED' ? 'assigned' : 'added'}`,
      entity: 'Asset',
      entityName: a.name,
      performedBy: users[i % users.length].name
    })),
    ...inventoryItems.slice(0, 10).map((item, i) => ({
      id: `log-inv-${i}`,
      timestamp: new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000),
      event: item.quantityOnHand < item.reorderLevel ? 'Low stock alert' : 'Item updated',
      entity: 'Inventory',
      entityName: item.name,
      performedBy: users[i % users.length].name
    })),
    ...maintenanceRecords.slice(0, 10).map((m, i) => ({
      id: `log-maint-${i}`,
      timestamp: new Date(Date.now() - (i + 20) * 24 * 60 * 60 * 1000),
      event: `Maintenance ${m.status.toLowerCase()}`,
      entity: 'Maintenance',
      entityName: m.assetName,
      performedBy: m.technician
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const filteredLog = activityLog.filter(log => {
    const matchesSearch = log.event.toLowerCase().includes(search.toLowerCase()) ||
                         log.entityName.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = !entityFilter || log.entity === entityFilter;
    const matchesUser = !userFilter || log.performedBy === userFilter;
    return matchesSearch && matchesEntity && matchesUser;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
        <p className="text-gray-600 mt-1">Track all system activities and changes</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Entity Types</option>
            <option value="Asset">Asset</option>
            <option value="Inventory">Inventory</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.name}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLog.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.timestamp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.event}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.entity}: {log.entityName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};