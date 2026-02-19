'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  items: {
    _id: string;
    productId: {
      name: string;
      price: number;
      unit: string;
    };
    rdcId: {
      name: string;
      location: string;
    };
    quantity: number;
    price: number;
    status: string;
  }[];
  totalAmount: number;
  deliveryAddress: string;
  orderStatus: string;
  paymentStatus: string;
  invoiceNumber?: string;
}

export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });

      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status }),
      });

      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error('Failed to update payment:', error);
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
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/admin/orders')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Orders
          </button>
          <span className="text-sm text-gray-500">
            {updating && 'Updating...'}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
            <p><span className="font-medium">Name:</span> {order.customerId.name}</p>
            <p><span className="font-medium">Email:</span> {order.customerId.email}</p>
            <p><span className="font-medium">Delivery Address:</span> {order.deliveryAddress}</p>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 py-2">Product</th>
                  <th className="text-left text-sm font-medium text-gray-500 py-2">RDC</th>
                  <th className="text-left text-sm font-medium text-gray-500 py-2">Quantity</th>
                  <th className="text-left text-sm font-medium text-gray-500 py-2">Unit Price</th>
                  <th className="text-left text-sm font-medium text-gray-500 py-2">Total</th>
                  <th className="text-left text-sm font-medium text-gray-500 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item._id}>
                    <td className="py-3">{item.productId.name}</td>
                    <td className="py-3">{item.rdcId?.name || 'N/A'}</td>
                    <td className="py-3">{item.quantity} {item.productId.unit}</td>
                    <td className="py-3">Rs. {item.price.toLocaleString()}</td>
                    <td className="py-3">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right font-bold py-4">Total:</td>
                  <td className="font-bold py-4">Rs. {order.totalAmount.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Order Status */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={order.orderStatus}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  disabled={updating}
                  className="border border-gray-300 rounded-md p-2 w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  disabled={updating}
                  className="border border-gray-300 rounded-md p-2 w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          {order.invoiceNumber && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Invoice Information</h2>
              <p><span className="font-medium">Invoice Number:</span> {order.invoiceNumber}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}