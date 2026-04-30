import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, UserPlus, RefreshCw, Calendar, DollarSign, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { assets, maintenanceRecords } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'maintenance' | 'activity'>('maintenance');

  const asset = assets.find(a => a.id === id);

  if (!asset) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Asset not found</h3>
        <button
          onClick={() => navigate('/assets')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Assets
        </button>
      </div>
    );
  }

  const assetMaintenance = maintenanceRecords.filter(m => m.asset_id === asset.id);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ASSIGNED': return 'info';
      case 'UNDER_MAINTENANCE': return 'warning';
      case 'DISPOSED': return 'default';
      default: return 'default';
    }
  };

  const getMaintenanceStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'SCHEDULED': return 'info';
      default: return 'default';
    }
  };

  const warrantyDaysLeft = asset.warranty_expiry
    ? Math.floor((new Date(asset.warranty_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Fake activity log
  const activityLog = [
    { date: new Date(), action: 'Asset created', user: 'System' },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), action: 'Status changed to ' + asset.status, user: 'Admin' },
    ...(asset.assignedUser ? [{ date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), action: `Assigned to ${asset.assignedUser.name}`, user: 'Manager' }] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/assets')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
          <p className="text-gray-600">{asset.serial_no}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <UserPlus className="w-4 h-4" />
            Assign
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Change Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Asset Information</h3>
              <Badge variant={getStatusVariant(asset.status)} className="text-base px-3 py-1">
                {asset.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Serial Number</label>
                <p className="mt-1 text-sm text-gray-900">{asset.serial_no}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Asset Type</label>
                <p className="mt-1 text-sm text-gray-900">{asset.asset_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Location</label>
                <p className="mt-1 text-sm text-gray-900">{asset.location?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Department</label>
                <p className="mt-1 text-sm text-gray-900">{asset.department?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Purchase Date</label>
                <p className="mt-1 text-sm text-gray-900">{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Cost</label>
                <p className="mt-1 text-sm text-gray-900">${asset.cost ? asset.cost.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">{asset.description || 'No description available'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'maintenance'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Maintenance History
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activity Log
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'maintenance' ? (
                assetMaintenance.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No maintenance records</p>
                ) : (
                  <div className="space-y-4">
                    {assetMaintenance.map(m => {
                      const scheduledDate = new Date(m.scheduled_date);
                      const completedDate = m.completed_date ? new Date(m.completed_date) : null;
                      return (
                      <div key={m.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getMaintenanceStatusVariant(m.status)}>
                                {m.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">{m.maintenance_type}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{m.remarks || 'No remarks'}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Scheduled: {scheduledDate.toLocaleDateString()}</span>
                              {completedDate && <span>Completed: {completedDate.toLocaleDateString()}</span>}
                              <span>Technician: {m.technician?.name || 'N/A'}</span>
                              {m.cost && <span>Cost: ${m.cost}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {activityLog.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {log.user} • {log.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-full h-full p-4" viewBox="0 0 100 100">
                <rect x="0" y="0" width="20" height="20" fill="#000" />
                <rect x="25" y="0" width="15" height="20" fill="#000" />
                <rect x="45" y="0" width="10" height="20" fill="#000" />
                <rect x="60" y="0" width="20" height="20" fill="#000" />
                <rect x="85" y="0" width="15" height="20" fill="#000" />
                <rect x="0" y="25" width="15" height="15" fill="#000" />
                <rect x="20" y="25" width="20" height="15" fill="#000" />
                <rect x="45" y="25" width="10" height="15" fill="#000" />
                <rect x="60" y="25" width="15" height="15" fill="#000" />
                <rect x="80" y="25" width="20" height="15" fill="#000" />
                <rect x="0" y="45" width="10" height="10" fill="#000" />
                <rect x="15" y="45" width="25" height="10" fill="#000" />
                <rect x="45" y="45" width="10" height="10" fill="#000" />
                <rect x="60" y="45" width="20" height="10" fill="#000" />
                <rect x="85" y="45" width="15" height="10" fill="#000" />
                <rect x="0" y="60" width="20" height="20" fill="#000" />
                <rect x="25" y="60" width="15" height="20" fill="#000" />
                <rect x="45" y="60" width="10" height="20" fill="#000" />
                <rect x="60" y="60" width="20" height="20" fill="#000" />
                <rect x="85" y="60" width="15" height="20" fill="#000" />
                <rect x="0" y="85" width="15" height="15" fill="#000" />
                <rect x="20" y="85" width="20" height="15" fill="#000" />
                <rect x="45" y="85" width="10" height="15" fill="#000" />
                <rect x="60" y="85" width="15" height="15" fill="#000" />
                <rect x="80" y="85" width="20" height="15" fill="#000" />
              </svg>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">{asset.serial_no}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
            {asset.assignedUser ? (
              <div>
                <p className="text-sm text-gray-600">Assigned to</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{asset.assignedUser.name}</p>
                <p className="text-sm text-gray-600 mt-2">Department</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{asset.department?.name || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Not assigned</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Dates</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Purchase Date</p>
                  <p className="text-sm font-medium text-gray-900">{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Warranty Expiry</p>
                  {asset.warranty_expiry ? (
                    <>
                      <p className={`text-sm font-medium ${
                        warrantyDaysLeft && warrantyDaysLeft < 0 ? 'text-red-600' :
                        warrantyDaysLeft && warrantyDaysLeft <= 30 ? 'text-amber-600' :
                        'text-gray-900'
                      }`}>
                        {new Date(asset.warranty_expiry).toLocaleDateString()}
                      </p>
                      {warrantyDaysLeft !== null && (
                        <p className="text-xs text-gray-500 mt-1">
                          {warrantyDaysLeft < 0
                            ? `Expired ${Math.abs(warrantyDaysLeft)} days ago`
                            : `${warrantyDaysLeft} days remaining`}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-900">N/A</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Purchase Cost</p>
                  <p className="text-sm font-medium text-gray-900">${asset.cost ? asset.cost.toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Current Location</p>
                  <p className="text-sm font-medium text-gray-900">{asset.location?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};