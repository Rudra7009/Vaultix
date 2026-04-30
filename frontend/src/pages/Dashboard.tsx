import React from 'react';
import { Package, Archive, AlertTriangle, Wrench, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const Dashboard: React.FC = () => {
  const { assets, inventoryItems, transactions, maintenanceRecords } = useApp();
  const navigate = useNavigate();

  // Calculate stats
  const totalAssets = assets.filter(a => a.status !== 'DISPOSED').length;
  const totalInventory = inventoryItems.length;
  const lowStockCount = inventoryItems.filter(i => i.quantity_on_hand > 0 && i.quantity_on_hand < i.reorder_level).length;
  
  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const maintenanceDue = maintenanceRecords.filter(m => {
    const scheduledDate = new Date(m.scheduled_date);
    return m.status === 'SCHEDULED' && scheduledDate <= sevenDaysFromNow && scheduledDate >= today;
  }).length;

  // Asset status pie chart data
  const assetStatusData = [
    { name: 'Available', value: assets.filter(a => a.status === 'AVAILABLE').length, color: '#10b981' },
    { name: 'Assigned', value: assets.filter(a => a.status === 'ASSIGNED').length, color: '#3b82f6' },
    { name: 'Under Maintenance', value: assets.filter(a => a.status === 'UNDER_MAINTENANCE').length, color: '#f59e0b' },
  ];

  // Inventory movement bar chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const movementData = last7Days.map((day, idx) => {
    const date = new Date(today.getTime() - (6 - idx) * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const inward = transactions
      .filter(t => {
        const txDate = new Date(t.created_at);
        return t.type === 'INWARD' && txDate >= dayStart && txDate <= dayEnd;
      })
      .reduce((sum, t) => sum + t.quantity, 0);
    
    const outward = transactions
      .filter(t => {
        const txDate = new Date(t.created_at);
        return t.type === 'OUTWARD' && txDate >= dayStart && txDate <= dayEnd;
      })
      .reduce((sum, t) => sum + t.quantity, 0);
    
    return { day, Inward: inward, Outward: outward };
  });

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Alerts
  const lowStockItems = inventoryItems.filter(i => i.quantity_on_hand > 0 && i.quantity_on_hand < i.reorder_level);
  const outOfStockItems = inventoryItems.filter(i => i.quantity_on_hand === 0);
  const upcomingMaintenance = maintenanceRecords.filter(m => {
    const scheduledDate = new Date(m.scheduled_date);
    return m.status === 'SCHEDULED' && scheduledDate <= sevenDaysFromNow && scheduledDate >= today;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assets"
          value={totalAssets}
          icon={Package}
          iconColor="bg-blue-500"
          borderColor="border-blue-500"
        />
        <StatCard
          title="Inventory Items"
          value={totalInventory}
          icon={Archive}
          iconColor="bg-green-500"
          borderColor="border-green-500"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          icon={AlertTriangle}
          iconColor="bg-amber-500"
          borderColor="border-amber-500"
        />
        <StatCard
          title="Maintenance Due (7d)"
          value={maintenanceDue}
          icon={Wrench}
          iconColor="bg-red-500"
          borderColor="border-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assetStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Movement Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Movement (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Inward" fill="#10b981" />
              <Bar dataKey="Outward" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{tx.item?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={tx.type === 'INWARD' ? 'success' : tx.type === 'OUTWARD' ? 'error' : 'info'}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tx.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tx.performer?.name || 'System'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {outOfStockItems.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Out of Stock</p>
                  <p className="text-sm text-red-700">{item.name}</p>
                </div>
                <button
                  onClick={() => navigate('/inventory')}
                  className="text-red-600 hover:text-red-800"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {lowStockItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">Low Stock</p>
                  <p className="text-sm text-amber-700">{item.name} ({item.quantity_on_hand} {item.unit})</p>
                </div>
                <button
                  onClick={() => navigate('/inventory')}
                  className="text-amber-600 hover:text-amber-800"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {upcomingMaintenance.slice(0, 3).map(m => (
              <div key={m.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Wrench className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Maintenance Due</p>
                  <p className="text-sm text-blue-700">{m.asset?.name || 'Asset'} on {new Date(m.scheduled_date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => navigate('/maintenance')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {outOfStockItems.length === 0 && lowStockItems.length === 0 && upcomingMaintenance.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">No alerts at this time</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
