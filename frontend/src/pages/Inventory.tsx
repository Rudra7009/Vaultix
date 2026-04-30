import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { InventoryItem } from '../lib/database.types';

export const Inventory: React.FC = () => {
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, recordTransaction, currentUser, transactions, locations } = useApp();
  const { can } = usePermissions();
  const { show } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    quantity_on_hand: 0,
    reorder_level: 0,
    location_id: '',
    description: ''
  });

  const [txFormData, setTxFormData] = useState({
    type: 'INWARD' as 'INWARD' | 'OUTWARD' | 'TRANSFER',
    quantity: 0,
    toLocation: '',
    notes: ''
  });

  const categories = Array.from(new Set(inventoryItems.map(i => i.category)));

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesLowStock = !lowStockOnly || (item.quantity_on_hand < item.reorder_level);
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity_on_hand === 0) return { label: 'Out of Stock', variant: 'error' as const };
    if (item.quantity_on_hand < item.reorder_level) return { label: 'Low Stock', variant: 'warning' as const };
    return { label: 'OK', variant: 'success' as const };
  };

  const handleAddEdit = async () => {
    if (!formData.name || !formData.category || !formData.unit || !formData.location_id) {
      show('Please fill all required fields', 'error');
      return;
    }

    try {
      if (selectedItem) {
        await updateInventoryItem(selectedItem.id, formData);
        show('Item updated successfully', 'success');
      } else {
        await addInventoryItem(formData);
        show('Item added successfully', 'success');
      }
      setShowAddEdit(false);
      resetForm();
    } catch (error: any) {
      show(error.message || 'Operation failed', 'error');
    }
  };

  const handleTransaction = async () => {
    if (!selectedItem || !currentUser) return;

    if (txFormData.quantity <= 0) {
      show('Quantity must be greater than 0', 'error');
      return;
    }

    if (txFormData.type === 'OUTWARD' && txFormData.quantity > selectedItem.quantity_on_hand) {
      show(`Cannot withdraw more than current stock (${selectedItem.quantity_on_hand} ${selectedItem.unit})`, 'error');
      return;
    }

    if (txFormData.type === 'TRANSFER' && !txFormData.toLocation) {
      show('Please specify destination location', 'error');
      return;
    }

    try {
      await recordTransaction({
        itemId: selectedItem.id,
        quantity: txFormData.quantity,
        type: txFormData.type,
        fromLocationId: txFormData.type === 'TRANSFER' ? selectedItem.location_id || undefined : undefined,
        toLocationId: txFormData.type === 'TRANSFER' ? txFormData.toLocation : undefined,
        notes: txFormData.notes
      });
      show('Transaction recorded successfully', 'success');
      setShowTransaction(false);
      setTxFormData({ type: 'INWARD', quantity: 0, toLocation: '', notes: '' });
    } catch (error: any) {
      show(error.message || 'Transaction failed', 'error');
    }
  };

  const openAddEdit = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity_on_hand: item.quantity_on_hand,
        reorder_level: item.reorder_level,
        location_id: item.location_id || '',
        description: item.description || ''
      });
    } else {
      setSelectedItem(null);
      resetForm();
    }
    setShowAddEdit(true);
    setActiveDropdown(null);
  };

  const openTransaction = (item: InventoryItem) => {
    setSelectedItem(item);
    setTxFormData({ type: 'INWARD', quantity: 0, toLocation: '', notes: '' });
    setShowTransaction(true);
    setActiveDropdown(null);
  };

  const openView = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowView(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      show('Item deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error: any) {
      show(error.message || 'Delete failed', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit: '',
      quantity_on_hand: 0,
      reorder_level: 0,
      location_id: '',
      description: ''
    });
  };

  const itemTransactions = selectedItem
    ? transactions.filter(t => t.item_id === selectedItem.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Manage your inventory items and stock levels</p>
        </div>
        {can('edit_inventory') && (
          <button
            onClick={() => openAddEdit()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No items found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map(item => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${
                        item.quantity_on_hand === 0 ? 'text-red-600' :
                        item.quantity_on_hand < item.reorder_level ? 'text-amber-600' :
                        'text-green-600'
                      }`}>
                        {item.quantity_on_hand}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.reorder_level}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.location?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          {activeDropdown === item.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <button
                                  onClick={() => openView(item)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                {can('edit_inventory') && (
                                  <button
                                    onClick={() => openAddEdit(item)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                )}
                                {can('record_transaction') && (
                                  <button
                                    onClick={() => openTransaction(item)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <ArrowRightLeft className="w-4 h-4" />
                                    Record Transaction
                                  </button>
                                )}
                                {can('delete_inventory') && (
                                  <button
                                    onClick={() => {
                                      setDeleteConfirm(item.id);
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddEdit}
        onClose={() => {
          setShowAddEdit(false);
          resetForm();
        }}
        title={selectedItem ? 'Edit Item' : 'Add New Item'}
        footer={
          <>
            <button
              onClick={() => {
                setShowAddEdit(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {selectedItem ? 'Update' : 'Add'} Item
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              list="categories"
            />
            <datalist id="categories">
              {categories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <select
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity on Hand</label>
              <input
                type="number"
                value={formData.quantity_on_hand}
                onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
              <input
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal
        isOpen={showTransaction}
        onClose={() => setShowTransaction(false)}
        title="Record Transaction"
        footer={
          <>
            <button
              onClick={() => setShowTransaction(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleTransaction}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Record Transaction
            </button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Item: <span className="font-medium text-gray-900">{selectedItem.name}</span></p>
              <p className="text-sm text-gray-600 mt-1">Current Stock: <span className="font-medium text-gray-900">{selectedItem.quantity_on_hand} {selectedItem.unit}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <div className="grid grid-cols-3 gap-3">
                {(['INWARD', 'OUTWARD', 'TRANSFER'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setTxFormData({ ...txFormData, type })}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                      txFormData.type === type
                        ? type === 'INWARD' ? 'border-green-500 bg-green-50 text-green-700' :
                          type === 'OUTWARD' ? 'border-red-500 bg-red-50 text-red-700' :
                          'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={txFormData.quantity || ''}
                onChange={(e) => setTxFormData({ ...txFormData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
              {txFormData.type === 'OUTWARD' && txFormData.quantity > selectedItem.quantity_on_hand && (
                <p className="text-sm text-red-600 mt-1">Cannot exceed current stock</p>
              )}
            </div>

            {txFormData.type === 'TRANSFER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Location *</label>
                <input
                  type="text"
                  value={txFormData.toLocation}
                  onChange={(e) => setTxFormData({ ...txFormData, toLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={txFormData.notes}
                onChange={(e) => setTxFormData({ ...txFormData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showView}
        onClose={() => setShowView(false)}
        title="Item Details"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Category</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Unit</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Location</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.location?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Quantity on Hand</label>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedItem.quantity_on_hand} {selectedItem.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Reorder Level</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.reorder_level} {selectedItem.unit}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.description || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Transaction History</h4>
              {itemTransactions.length === 0 ? (
                <p className="text-sm text-gray-500">No transactions yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {itemTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={tx.type === 'INWARD' ? 'success' : tx.type === 'OUTWARD' ? 'error' : 'info'}>
                            {tx.type}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">{tx.quantity} {selectedItem.unit}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{tx.notes || 'No notes'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">{tx.performer?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Item"
        message="Are you sure you want to delete this inventory item? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};