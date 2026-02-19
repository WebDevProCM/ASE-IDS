'use client';

import { useState, useEffect } from 'react';
import RdcLayout from '@/components/RdcLayout';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState(false);

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
    setUpdating(true);
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
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) return;
    
    setUpdating(true);
    try {
      const res = await fetch('/api/orders/cancel-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItemId: selectedOrder._id,
          reason: cancelReason,
        }),
      });

      if (res.ok) {
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancelReason('');
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setUpdating(false);
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  return (
    <RdcLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Orders to Process</h1>

        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
            <p className="text-gray-500">No pending orders to process</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold">Pending Orders</h2>
            {pendingOrders.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Order #{item.orderNumber}</p>
                    <p className="font-medium mt-1 text-lg">{item.productId.name}</p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p><span className="font-medium">Quantity:</span> {item.quantity} {item.productId.unit}</p>
                      <p><span className="font-medium">Customer:</span> {item.customerId.name}</p>
                      <p className="sm:col-span-2"><span className="font-medium">Delivery:</span> {item.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Update Status
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      onChange={(e) => updateOrderStatus(item._id, e.target.value)}
                      value={item.status}
                      disabled={updating}
                      className="flex-1 border border-gray-300 rounded-md text-sm p-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button
                      onClick={() => {
                        setSelectedOrder(item);
                        setShowCancelModal(true);
                      }}
                      disabled={updating}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Cancelling will return items to inventory
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {cancelledOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Cancelled Orders</h2>
            <div className="space-y-4">
              {cancelledOrders.map((item) => (
                <div key={item._id} className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-red-600">Order #{item.orderNumber}</p>
                      <p className="font-medium mt-1">{item.productId.name}</p>
                      <p className="text-sm mt-2"><span className="font-medium">Quantity:</span> {item.quantity} {item.productId.unit}</p>
                      <p className="text-sm"><span className="font-medium">Customer:</span> {item.customerId.name}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        CANCELLED
                      </span>
                      <p className="text-xs text-red-600 mt-2">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
            <div className="relative top-20 mx-auto max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                  <h3 className="text-lg font-medium">Cancel Order Item</h3>
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedOrder.productId.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {selectedOrder.quantity} {selectedOrder.productId.unit}</p>
                  <p className="text-sm text-gray-600">Order: #{selectedOrder.orderNumber}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter cancellation reason..."
                    required
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Note:</span> Cancelling will return the items to inventory and update stock levels.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedOrder(null);
                      setCancelReason('');
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={!cancelReason.trim() || updating}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {updating ? 'Processing...' : 'Yes, Cancel Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RdcLayout>
  );
}