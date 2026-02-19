'use client';

import { useState, useEffect } from 'react';
import RdcLayout from '@/components/RdcLayout';

interface InventoryItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    unit: string;
    category: string;
  };
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastUpdated: string;
}

export default function RdcInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory/my-rdc');
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (productId: string, newQuantity: number) => {
    setUpdating(productId);
    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (res.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to update inventory:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minStockLevel) {
      return {
        label: 'Low Stock',
        color: 'bg-red-100 text-red-800',
      };
    } else if (item.quantity >= item.maxStockLevel) {
      return {
        label: 'Overstocked',
        color: 'bg-yellow-100 text-yellow-800',
      };
    } else {
      return {
        label: 'Normal',
        color: 'bg-green-100 text-green-800',
      };
    }
  };

  if (loading) {
    return (
      <RdcLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </RdcLayout>
    );
  }

  return (
    <RdcLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

        {/* Low Stock Alerts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory
              .filter(item => item.quantity <= item.minStockLevel)
              .map(item => (
                <div key={item._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800">{item.productId.name}</h3>
                  <p className="text-sm text-red-600 mt-1">
                    Current Stock: {item.quantity} {item.productId.unit}
                  </p>
                  <p className="text-sm text-red-600">
                    Minimum Level: {item.minStockLevel} {item.productId.unit}
                  </p>
                  <button
                    onClick={() => {
                      const newQty = prompt('Enter new stock quantity:', item.maxStockLevel.toString());
                      if (newQty && !isNaN(parseInt(newQty))) {
                        updateInventory(item.productId._id, parseInt(newQty));
                      }
                    }}
                    disabled={updating === item.productId._id}
                    className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    {updating === item.productId._id ? 'Updating...' : 'Restock'}
                  </button>
                </div>
              ))}
            
            {inventory.filter(item => item.quantity <= item.minStockLevel).length === 0 && (
              <p className="text-gray-500 col-span-full">No low stock items</p>
            )}
          </div>
        </div>

        {/* All Inventory */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Inventory</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium">{item.productId.name}</p>
                          <p className="text-xs text-gray-500">Unit: {item.productId.unit}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.productId.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.minStockLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.maxStockLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const newQty = prompt('Update quantity:', item.quantity.toString());
                            if (newQty && !isNaN(parseInt(newQty))) {
                              updateInventory(item.productId._id, parseInt(newQty));
                            }
                          }}
                          disabled={updating === item.productId._id}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50"
                        >
                          {updating === item.productId._id ? '...' : 'Update'}
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
    </RdcLayout>
  );
}