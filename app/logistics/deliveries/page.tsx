'use client';

import { useState, useEffect } from 'react';
import LogisticsLayout from '@/components/LogisticsLayout';

interface Delivery {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    deliveryAddress: string;
    customerId: {
      name: string;
      email: string;
    };
  };
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  status: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  trackingUpdates: {
    status: string;
    location: string;
    timestamp: string;
    notes?: string;
  }[];
}

export default function ActiveDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/delivery/my-deliveries');
      const data = await res.json();
      setDeliveries(data);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (deliveryId: string, status: string) => {
    const location = prompt('Enter current location:');
    if (!location) return;

    try {
      const res = await fetch('/api/delivery/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId, status, location }),
      });

      if (res.ok) {
        fetchDeliveries();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold mb-6">Active Deliveries</h1>

        {deliveries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No active deliveries</p>
          </div>
        ) : (
          <div className="space-y-6">
            {deliveries.map((delivery) => (
              <div key={delivery._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        Order #{delivery.orderId.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {delivery.orderId.customerId.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Delivery Address: {delivery.orderId.deliveryAddress}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Vehicle: {delivery.vehicleNumber}</p>
                      <p className="text-sm text-gray-600">Driver: {delivery.driverName}</p>
                      <p className="text-sm text-gray-600">Contact: {delivery.driverContact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Est. Delivery: {new Date(delivery.estimatedDeliveryDate).toLocaleDateString()}
                      </p>
                      {delivery.actualDeliveryDate && (
                        <p className="text-sm text-gray-600">
                          Actual: {new Date(delivery.actualDeliveryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {delivery.trackingUpdates.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Tracking Updates</h4>
                      <div className="space-y-3">
                        {delivery.trackingUpdates.map((update, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className={`w-2 h-2 mt-2 rounded-full ${
                                index === 0 ? 'bg-blue-500' : 'bg-gray-400'
                              }`}></div>
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium">
                                  {update.status.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(update.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600">Location: {update.location}</p>
                              {update.notes && (
                                <p className="text-xs text-gray-500 mt-1">{update.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update Buttons */}
                  {delivery.status !== 'delivered' && delivery.status !== 'failed' && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-3">Update Status</h4>
                      <div className="flex space-x-2">
                        {delivery.status === 'assigned' && (
                          <button
                            onClick={() => updateStatus(delivery._id, 'picked_up')}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                          >
                            Picked Up
                          </button>
                        )}
                        {delivery.status === 'picked_up' && (
                          <button
                            onClick={() => updateStatus(delivery._id, 'out_for_delivery')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Out for Delivery
                          </button>
                        )}
                        {(delivery.status === 'assigned' || delivery.status === 'picked_up' || delivery.status === 'out_for_delivery') && (
                          <>
                            <button
                              onClick={() => updateStatus(delivery._id, 'delivered')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Delivered
                            </button>
                            <button
                              onClick={() => updateStatus(delivery._id, 'failed')}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Failed
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LogisticsLayout>
  );
}