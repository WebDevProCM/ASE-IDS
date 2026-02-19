'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CustomerLayout from '@/components/CustomerLayout';

interface Invoice {
  _id: string;
  orderNumber: string;
  createdAt: string;
  customerId: {
    name: string;
    email: string;
  };
  items: {
    productId: {
      name: string;
    };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  deliveryAddress: string;
  orderStatus: string;
  paymentStatus: string;
}

export default function InvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      setInvoice(data);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (!invoice) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Invoice not found</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Invoice Header */}
          <div className="p-8 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-600 mt-1">Order #{invoice.orderNumber}</p>
              </div>
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Print Invoice
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Date: {new Date(invoice.createdAt).toLocaleDateString()}
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
              <p className="mt-2 font-medium">{invoice.customerId.name}</p>
              <p className="text-gray-600">{invoice.deliveryAddress}</p>
              <p className="text-gray-600">{invoice.customerId.email}</p>
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
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3">{item.productId.name}</td>
                    <td className="py-3">{item.quantity}</td>
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
                  <span>Rs. {invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Delivery:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg">
                  <span>Total:</span>
                  <span>Rs. {invoice.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Status & Payment */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Order Status: </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                  invoice.orderStatus === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                  invoice.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.orderStatus.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium">Payment Status: </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Footer */}
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