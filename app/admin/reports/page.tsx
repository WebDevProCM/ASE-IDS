'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  TruckIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByRDC: {
    rdcName: string;
    totalSales: number;
    orderCount: number;
  }[];
  topProducts: {
    productName: string;
    quantity: number;
    revenue: number;
  }[];
}

interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: {
    productName: string;
    rdcName: string;
    quantity: number;
    minStockLevel: number;
  }[];
  stockByRDC: {
    rdcName: string;
    itemCount: number;
    totalValue: number;
  }[];
}

export default function AdminReports() {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange, activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales') {
        const res = await fetch(`/api/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
        const data = await res.json();
        setSalesReport(data);
      } else {
        const res = await fetch('/api/reports/inventory');
        const data = await res.json();
        setInventoryReport(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // In a real app, this would generate a CSV or PDF
    alert('Export functionality would generate a report file');
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">System Reports</h1>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sales')}
              className={`${
                activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Sales Reports
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`${
                activeTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Inventory Reports
            </button>
          </nav>
        </div>

        {/* Date Range Filter (for sales tab) */}
        {activeTab === 'sales' && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center flex-wrap justify-center gap-3 space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="mt-1 border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="mt-1 border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sales Reports */}
        {activeTab === 'sales' && salesReport && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap justify-center items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {salesReport.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap justify-center items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {salesReport.totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap justify-center items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {salesReport.averageOrderValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales by RDC */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Sales by RDC</h2>
              <div className="space-y-4">
                {salesReport.salesByRDC.map((rdc) => (
                  <div key={rdc.rdcName}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{rdc.rdcName}</span>
                      <span>Rs. {rdc.totalSales.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(rdc.totalSales / salesReport.totalSales) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{rdc.orderCount} orders</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity Sold</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salesReport.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{product.productName}</td>
                        <td className="px-4 py-2">{product.quantity}</td>
                        <td className="px-4 py-2">Rs. {product.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Reports */}
        {activeTab === 'inventory' && inventoryReport && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap justify-center items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {inventoryReport.totalProducts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap justify-center items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {inventoryReport.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-red-600">
               Low Stock Alerts
              </h2>
              
              {inventoryReport.lowStockItems.length === 0 ? (
                <p className="text-gray-500">No low stock items</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">RDC</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Current Stock</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Min Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inventoryReport.lowStockItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 font-medium">{item.productName}</td>
                          <td className="px-4 py-2">{item.rdcName}</td>
                          <td className="px-4 py-2 text-red-600 font-medium">{item.quantity}</td>
                          <td className="px-4 py-2">{item.minStockLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Stock by RDC */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Stock Distribution by RDC</h2>
              <div className="space-y-4">
                {inventoryReport.stockByRDC.map((rdc) => (
                  <div key={rdc.rdcName}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{rdc.rdcName}</span>
                      <span>{rdc.itemCount} items</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(rdc.itemCount / inventoryReport.totalProducts) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Value: Rs. {rdc.totalValue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}