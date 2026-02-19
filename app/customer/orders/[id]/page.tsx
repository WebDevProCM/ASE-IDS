'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CustomerLayout from '@/components/CustomerLayout';

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
      _id: string;
      name: string;
      price: number;
      unit: string;
    };
    rdcId: {
      _id: string;
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
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

  const handlePrint = () => {
    window.print();
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
      <CustomerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
          <button
            onClick={() => router.push('/customer/orders')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/customer/orders')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Orders
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Print Invoice
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Invoice Header */}
          <div className="p-8 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
                {order.invoiceNumber && (
                  <p className="text-gray-600">Invoice #: {order.invoiceNumber}</p>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Company & Customer Details */}
          <div className="p-8 border-b grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">From</h2>
              <p className="mt-2 font-medium">IslandLink Distribution</p>
              <p className="text-gray-600">123 Main Street</p>
              <p className="text-gray-600">Colombo, Sri Lanka</p>
              <p className="text-gray-600">info@islandlink.com</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">To</h2>
              <p className="mt-2 font-medium">{order.customerId.name}</p>
              <p className="text-gray-600">{order.deliveryAddress}</p>
              <p className="text-gray-600">{order.customerId.email}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8 border-b">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider py-2">
                    Item
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider py-2">
                    Quantity
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider py-2">
                    Unit Price
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider py-2">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{item.productId.name}</p>
                        <p className="text-xs text-gray-500">
                          Fulfilled by: {item.rdcId?.name || 'Unknown'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3">
                      {item.quantity} {item.productId.unit}
                    </td>
                    <td className="py-3">Rs. {item.price.toLocaleString()}</td>
                    <td className="py-3">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="p-8">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>Rs. {order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Delivery:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg">
                  <span>Total:</span>
                  <span>Rs. {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Status & Payment */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Order Status: </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium">Payment Status: </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t text-center text-gray-600 text-sm">
              <p>Thank you for your business!</p>
              <p className="mt-1">For any queries, please contact support@islandlink.com</p>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}