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
  };
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
}

interface OrderItem {
  _id: string;
  orderNumber: string;
  productId: {
    name: string;
  };
  quantity: number;
  status: string;
}

export default function RdcDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inventoryRes, ordersRes] = await Promise.all([
        fetch('/api/inventory/my-rdc'),
        fetch('/api/orders/rdc-pending'),
      ]);
      
      const inventoryData = await inventoryRes.json();
      const ordersData = await ordersRes.json();
      
      setInventory(inventoryData);
      setPendingOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (productId: string, newQuantity: number) => {
    try {
      await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update inventory:', error);
    }
  };

  const updateOrderStatus = async (orderItemId: string, status: string) => {
    try {
      await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItemId, status }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update order:', error);
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
        <h1 className="text-2xl font-bold mb-6">RDC Dashboard</h1>

        {/* Low Stock Alerts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory
              .filter(item => item.quantity <= item.minStockLevel)
              .map(item => (
                <div key={item._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800">{item.productId.name}</h3>
                  <p className="text-sm text-red-600">
                    Stock: {item.quantity} {item.productId.unit} (Min: {item.minStockLevel})
                  </p>
                  <button
                    onClick={() => {
                      const newQty = prompt('Enter new stock quantity:', item.maxStockLevel.toString());
                      if (newQty) updateInventory(item.productId._id, parseInt(newQty));
                    }}
                    className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
                  >
                    Restock
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Current Inventory */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Inventory</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{item.productId.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.productId.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.quantity <= item.minStockLevel
                          ? 'bg-red-100 text-red-800'
                          : item.quantity >= item.maxStockLevel
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.quantity <= item.minStockLevel
                          ? 'Low Stock'
                          : item.quantity >= item.maxStockLevel
                          ? 'Overstocked'
                          : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          const newQty = prompt('Update quantity:', item.quantity.toString());
                          if (newQty) updateInventory(item.productId._id, parseInt(newQty));
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Orders */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Pending Orders to Process</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingOrders.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.productId.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        onChange={(e) => updateOrderStatus(item._id, e.target.value)}
                        className="border border-gray-300 rounded-md text-sm p-1"
                        defaultValue=""
                      >
                        <option value="" disabled>Update Status</option>
                        <option value="processing">Processing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RdcLayout>
  );
}