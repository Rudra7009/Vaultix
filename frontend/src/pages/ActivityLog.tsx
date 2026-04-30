import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';

export const ActivityLog: React.FC = () => {
  const { auditLogs, users } = useApp();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  // Get unique entity types from real audit logs
  const entityTypes = Array.from(new Set(auditLogs.map(log => log.entity_type)));

  const filteredLog = auditLogs.filter(log => {
    const matchesSearch = log.event_type.toLowerCase().includes(search.toLowerCase()) ||
                         log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
                         (log.performer?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesEntity = !entityFilter || log.entity_type === entityFilter;
    const matchesUser = !userFilter || log.performer?.name === userFilter;
    return matchesSearch && matchesEntity && matchesUser;
  });

  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes('CREATED') || eventType.includes('ADDED')) return 'success';
    if (eventType.includes('DELETED') || eventType.includes('DISPOSED')) return 'error';
    if (eventType.includes('UPDATED') || eventType.includes('DONE')) return 'info';
    if (eventType.includes('SCHEDULED') || eventType.includes('ISSUED')) return 'warning';
    return 'default';
  };

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
            {entityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
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
              {filteredLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filteredLog.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getEventBadgeVariant(log.event_type)}>
                        {log.event_type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.entity_type}
                      {log.entity_id && (
                        <span className="text-gray-400 ml-1 text-xs">({log.entity_id.slice(0, 8)}…)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.performer?.name || 'System'}
                      {log.performer?.role && (
                        <span className="text-gray-400 ml-1 text-xs">({log.performer.role})</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};