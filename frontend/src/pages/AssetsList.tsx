import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { AssetStatus } from '../lib/database.types';

export const AssetsList: React.FC = () => {
  const { assets, deleteAsset } = useApp();
  const { can } = usePermissions();
  const { show } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const assetTypes = Array.from(new Set(assets.map(a => a.asset_type)));
  const departments = Array.from(new Set(assets.map(a => a.department?.name).filter(Boolean)));

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
                         asset.serial_no.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    const matchesType = !typeFilter || asset.asset_type === typeFilter;
    const matchesDept = !deptFilter || asset.department?.name === deptFilter;
    return matchesSearch && matchesStatus && matchesType && matchesDept;
  });

  const getStatusVariant = (status: AssetStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ASSIGNED': return 'info';
      case 'UNDER_MAINTENANCE': return 'warning';
      case 'DISPOSED': return 'default';
    }
  };

  const getWarrantyStatus = (expiry: string | null) => {
    if (!expiry) return { text: 'N/A', className: 'text-gray-600' };
    const expiryDate = new Date(expiry);
    const today = new Date();
    const daysUntil = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { text: `${expiryDate.toLocaleDateString()} (expired)`, className: 'text-red-600 font-semibold' };
    if (daysUntil <= 30) return { text: `${expiryDate.toLocaleDateString()} (expiring soon)`, className: 'text-amber-600 font-semibold' };
    return { text: expiryDate.toLocaleDateString(), className: 'text-gray-600' };
  };

  const handleDelete = (id: string) => {
    deleteAsset(id);
    show('Asset deleted successfully', 'success');
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
          <p className="text-gray-600 mt-1">Track and manage all your assets</p>
        </div>
        {can('edit_asset') && (
          <button
            onClick={() => show('Add asset feature - coming soon', 'info')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="DISPOSED">Disposed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {assetTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No assets found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warranty Expiry</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map(asset => {
                  const warranty = getWarrantyStatus(asset.warranty_expiry);
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.serial_no}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{asset.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.asset_type}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(asset.status)}>
                          {asset.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.location?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.department?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.assignedUser?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}</td>
                      <td className={`px-6 py-4 text-sm ${warranty.className}`}>{warranty.text}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === asset.id ? null : asset.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          {activeDropdown === asset.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <button
                                  onClick={() => {
                                    navigate(`/assets/${asset.id}`);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                {can('edit_asset') && (
                                  <button
                                    onClick={() => {
                                      show('Edit feature - coming soon', 'info');
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                )}
                                {can('change_asset_status') && (
                                  <button
                                    onClick={() => {
                                      show('Change status feature - coming soon', 'info');
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    Change Status
                                  </button>
                                )}
                                {can('delete_asset') && (
                                  <button
                                    onClick={() => {
                                      setDeleteConfirm(asset.id);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};