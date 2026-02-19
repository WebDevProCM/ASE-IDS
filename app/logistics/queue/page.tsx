'use client';

import { useState, useEffect } from 'react';
import LogisticsLayout from '@/components/LogisticsLayout';

interface PendingOrder {
  _id: string;
  orderNumber: string;
  customerId: {
    name: string;
    email: string;
  };
  items: {
    productId: {
      name: string;
    };
    quantity: number;
    status: string;
  }[];
  totalAmount: number;
  deliveryAddress: string;
  createdAt: string;
}

export default function DeliveryQueue() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    estimatedDeliveryDate: '',
  });

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('/api/delivery/pending');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch('/api/delivery/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          ...formData,
        }),
      });

      if (res.ok) {
        setShowAssignModal(false);
        setSelectedOrder(null);
        setFormData({
          vehicleNumber: '',
          driverName: '',
          driverContact: '',
          estimatedDeliveryDate: '',
        });
        fetchPendingOrders();
      }
    } catch (error) {
      console.error('Failed to assign delivery:', error);
    }
  };

  if (loading) {
    return (
      <LogisticsLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LogisticsLayout>
    );
  }

  return (
    <LogisticsLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Delivery Assignment Queue</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No orders pending delivery assignment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {order.customerId.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Address: {order.deliveryAddress}
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Ready for Assignment
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Items:</h4>
                  <ul className="space-y-1">
                    {order.items.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {item.productId.name} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowAssignModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Assign Delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Delivery Modal */}
        {showAssignModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Assign Delivery for Order #{selectedOrder.orderNumber}
                </h3>
                
                <form onSubmit={handleAssign}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Vehicle Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="e.g., WP-XXXX"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Driver Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.driverName}
                        onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Driver Contact *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.driverContact}
                        onChange={(e) => setFormData({...formData, driverContact: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estimated Delivery Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.estimatedDeliveryDate}
                        onChange={(e) => setFormData({...formData, estimatedDeliveryDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignModal(false);
                        setSelectedOrder(null);
                        setFormData({
                          vehicleNumber: '',
                          driverName: '',
                          driverContact: '',
                          estimatedDeliveryDate: '',
                        });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Assign
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </LogisticsLayout>
  );
}