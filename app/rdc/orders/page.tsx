'use client';

import { useState, useEffect } from 'react';
import RdcLayout from '@/components/RdcLayout';

interface OrderItem {
  _id: string;
  orderNumber: string;
  productId: {
    name: string;
    unit: string;
  };
  quantity: number;
  status: string;
  customerId: {
    name: string;
  };
  deliveryAddress: string;
  createdAt: string;
}

export default function RdcOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/rdc-pending');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderItemId: string, status: string) => {
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItemId, status }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold mb-6">Orders to Process</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No orders to process</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order #{item.orderNumber}</p>
                    <p className="font-medium mt-1">{item.productId.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} {item.productId.unit}
                    </p>
                    <p className="text-sm text-gray-600">Customer: {item.customerId.name}</p>
                    <p className="text-sm text-gray-600">Delivery: {item.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <select
                    onChange={(e) => updateOrderStatus(item._id, e.target.value)}
                    value={item.status}
                    className="border border-gray-300 rounded-md text-sm p-2 w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RdcLayout>
  );
}