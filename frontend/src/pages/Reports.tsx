import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/StatCard';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

export const Reports: React.FC = () => {
  const { inventoryItems, transactions, assets, maintenanceRecords } = useApp();
  const { show } = useToast();
  const [activeReport, setActiveReport] = useState<'stock' | 'movement' | 'assets' | 'maintenance'>('stock');

  const exportCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    show('Report exported successfully', 'success');
  };

  // Stock Report Data
  const lowStockItems = inventoryItems.filter(i => i.quantity_on_hand > 0 && i.quantity_on_hand < i.reorder_level);
  const outOfStockItems = inventoryItems.filter(i => i.quantity_on_hand === 0);

  // Asset Summary Data
  const assetsByStatus = [
    { name: 'Available', value: assets.filter(a => a.status === 'AVAILABLE').length, color: '#10b981' },
    { name: 'Assigned', value: assets.filter(a => a.status === 'ASSIGNED').length, color: '#3b82f6' },
    { name: 'Under Maintenance', value: assets.filter(a => a.status === 'UNDER_MAINTENANCE').length, color: '#f59e0b' },
    { name: 'Disposed', value: assets.filter(a => a.status === 'DISPOSED').length, color: '#6b7280' },
  ];

  const assetsByType = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.asset_type] = (acc[a.asset_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).slice(0, 6);

  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sixtyDays = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const expiring30 = assets.filter(a => {
    if (!a.warranty_expiry) return false;
    const warrantyDate = new Date(a.warranty_expiry);
    return warrantyDate >= today && warrantyDate <= thirtyDays;
  }).length;
  const expiring60 = assets.filter(a => {
    if (!a.warranty_expiry) return false;
    const warrantyDate = new Date(a.warranty_expiry);
    return warrantyDate > thirtyDays && warrantyDate <= sixtyDays;
  }).length;
  const expiring90 = assets.filter(a => {
    if (!a.warranty_expiry) return false;
    const warrantyDate = new Date(a.warranty_expiry);
    return warrantyDate > sixtyDays && warrantyDate <= ninetyDays;
  }).length;

  // Maintenance Cost Data
  const completedMaintenance = maintenanceRecords.filter(m => m.status === 'COMPLETED' && m.cost);
  const totalMaintenanceCost = completedMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);

  // Monthly cost (last 6 months)
  const monthlyCost = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const cost = completedMaintenance
      .filter(m => {
        if (!m.completed_date) return false;
        const completedDate = new Date(m.completed_date);
        return completedDate >= monthStart && completedDate <= monthEnd;
      })
      .reduce((sum, m) => sum + (m.cost || 0), 0);
    
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      cost
    };
  });

  // Movement Report Data (last 30 days)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentTransactions = transactions.filter(t => {
    const txDate = new Date(t.created_at);
    return txDate >= thirtyDaysAgo;
  });

  const dailyMovement = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const inward = recentTransactions
      .filter(t => {
        const txDate = new Date(t.created_at);
        return t.type === 'INWARD' && txDate >= dayStart && txDate <= dayEnd;
      })
      .reduce((sum, t) => sum + t.quantity, 0);
    
    const outward = recentTransactions
      .filter(t => {
        const txDate = new Date(t.created_at);
        return t.type === 'OUTWARD' && txDate >= dayStart && txDate <= dayEnd;
      })
      .reduce((sum, t) => sum + t.quantity, 0);
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Inward: inward,
      Outward: outward
    };
  }).filter((_, i) => i % 3 === 0); // Show every 3rd day for readability

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600 mt-1">View insights and export reports</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveReport('stock')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeReport === 'stock'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Stock Report
            </button>
            <button
              onClick={() => setActiveReport('movement')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeReport === 'movement'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Movement Report
            </button>
            <button
              onClick={() => setActiveReport('assets')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeReport === 'assets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Asset Summary
            </button>
            <button
              onClick={() => setActiveReport('maintenance')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeReport === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Maintenance Cost
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeReport === 'stock' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Items"
                  value={inventoryItems.length}
                  icon={Package}
                  iconColor="bg-blue-500"
                  borderColor="border-blue-500"
                />
                <StatCard
                  title="Low Stock"
                  value={lowStockItems.length}
                  icon={AlertTriangle}
                  iconColor="bg-amber-500"
                  borderColor="border-amber-500"
                />
                <StatCard
                  title="Out of Stock"
                  value={outOfStockItems.length}
                  icon={AlertTriangle}
                  iconColor="bg-red-500"
                  borderColor="border-red-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => exportCSV(inventoryItems.map(i => ({
                    Name: i.name,
                    Category: i.category,
                    Quantity: i.quantity_on_hand,
                    Unit: i.unit,
                    ReorderLevel: i.reorder_level,
                    Location: i.location?.name || 'N/A'
                  })), 'stock-report.csv')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.quantity_on_hand} {item.unit}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.reorder_level} {item.unit}</td>
                        <td className="px-6 py-4 text-sm">
                          {item.quantity_on_hand === 0 ? (
                            <span className="text-red-600 font-semibold">Out of Stock</span>
                          ) : item.quantity_on_hand < item.reorder_level ? (
                            <span className="text-amber-600 font-semibold">Low Stock</span>
                          ) : (
                            <span className="text-green-600">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'movement' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Movement (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyMovement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Inward" fill="#10b981" />
                    <Bar dataKey="Outward" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => exportCSV(recentTransactions.map(t => ({
                    Date: new Date(t.created_at).toLocaleDateString(),
                    Item: t.item?.name || 'N/A',
                    Type: t.type,
                    Quantity: t.quantity,
                    PerformedBy: t.performer?.name || 'N/A'
                  })), 'movement-report.csv')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.slice(0, 20).map(tx => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{tx.item?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{tx.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{tx.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{tx.performer?.name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'assets' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets by Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {assetsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets by Type (Top 6)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={assetsByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty Expiry</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800 font-medium">Expiring in 30 days</p>
                    <p className="text-3xl font-bold text-amber-900 mt-2">{expiring30}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium">Expiring in 31-60 days</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{expiring60}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium">Expiring in 61-90 days</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{expiring90}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'maintenance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  title="Total Maintenance Cost"
                  value={`$${totalMaintenanceCost.toLocaleString()}`}
                  icon={TrendingUp}
                  iconColor="bg-purple-500"
                  borderColor="border-purple-500"
                />
                <StatCard
                  title="Completed Records"
                  value={completedMaintenance.length}
                  icon={Package}
                  iconColor="bg-green-500"
                  borderColor="border-green-500"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cost (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyCost}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cost" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedMaintenance.map(m => (
                      <tr key={m.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{m.asset?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{m.maintenance_type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{m.completed_date ? new Date(m.completed_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{m.technician?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">${m.cost || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};