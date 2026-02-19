'use client';

import { useState, useEffect } from 'react';
import LogisticsLayout from '@/components/LogisticsLayout';
import { TruckIcon, ClipboardDocumentListIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DeliverySummary {
  activeDeliveries: number;
  pendingAssignments: number;
  completedToday: number;
}

interface ActiveDelivery {
  _id: string;
  orderId: {
    orderNumber: string;
    deliveryAddress: string;
    customerId: {
      name: string;
    };
  };
  vehicleNumber: string;
  driverName: string;
  status: string;
  estimatedDeliveryDate: string;
}

export default function LogisticsDashboard() {
  const [summary, setSummary] = useState<DeliverySummary>({
    activeDeliveries: 0,
    pendingAssignments: 0,
    completedToday: 0
  });
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch active deliveries
      const activeRes = await fetch('/api/delivery/my-deliveries');
      const activeData = await activeRes.json();
      setActiveDeliveries(activeData);

      // Fetch pending assignments count
      const pendingRes = await fetch('/api/delivery/pending');
      const pendingData = await pendingRes.json();

      // Calculate completed today
      const today = new Date().toDateString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const completedToday = activeData.filter((d: any) => 
        d.status === 'delivered' && 
        new Date(d.updatedAt).toDateString() === today
      ).length;

      setSummary({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activeDeliveries: activeData.filter((d: any) => d.status !== 'delivered').length,
        pendingAssignments: pendingData.length,
        completedToday
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold mb-6">Logistics Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Deliveries</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.activeDeliveries}</p>
              </div>
            </div>
          </div>

          <Link href="/logistics/queue" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.pendingAssignments}</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.completedToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Active Deliveries</h2>
            <Link href="/logistics/deliveries" className="text-sm text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>

          {activeDeliveries.filter(d => d.status !== 'delivered').length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active deliveries</p>
          ) : (
            <div className="space-y-4">
              {activeDeliveries
                .filter(d => d.status !== 'delivered')
                .slice(0, 5)
                .map((delivery) => (
                  <div key={delivery._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{delivery.orderId.orderNumber}</p>
                        <p className="text-sm text-gray-600">Customer: {delivery.orderId.customerId.name}</p>
                        <p className="text-sm text-gray-600">Vehicle: {delivery.vehicleNumber}</p>
                        <p className="text-sm text-gray-600">Driver: {delivery.driverName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">
                          Est: {new Date(delivery.estimatedDeliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {summary.pendingAssignments > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-yellow-800">Pending Assignments</h3>
                <p className="text-sm text-yellow-600">
                  You have {summary.pendingAssignments} orders waiting for delivery assignment
                </p>
              </div>
              <Link
                href="/logistics/queue"
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Assign Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </LogisticsLayout>
  );
}