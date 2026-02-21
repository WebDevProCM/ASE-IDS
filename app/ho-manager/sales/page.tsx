'use client';

import { useState, useEffect } from 'react';
import HoLayout from '@/components/HoLayout';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

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
  dailySales: {
    _id: string;
    sales: number;
    orders: number;
  }[];
}

export default function SalesReports() {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
    
    doc.setFontSize(14);
    doc.text('Summary', 14, 48);
    
    doc.setFontSize(11);
    doc.text(`Total Sales: Rs. ${report.totalSales.toLocaleString()}`, 14, 58);
    doc.text(`Total Orders: ${report.totalOrders}`, 14, 64);
    doc.text(`Average Order Value: Rs. ${report.averageOrderValue.toLocaleString()}`, 14, 70);
    
    doc.setFontSize(14);
    doc.text('Sales by RDC', 14, 84);
    
    const rdcData = report.salesByRDC.map(rdc => [
      rdc.rdcName,
      `Rs. ${rdc.totalSales.toLocaleString()}`,
      rdc.orderCount.toString()
    ]);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoTable(doc,{
      startY: 88,
      head: [['RDC', 'Total Sales', 'Orders']],
      body: rdcData,
    });
    
    doc.setFontSize(14);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.text('Top Products', 14, (doc as any).lastAutoTable.finalY + 10);
    
    const productData = report.topProducts.map(product => [
      product.productName,
      product.quantity.toString(),
      `Rs. ${product.revenue.toLocaleString()}`
    ]);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoTable(doc,{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [['Product', 'Quantity', 'Revenue']],
      body: productData,
    });
    
    doc.save(`sales-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`);
  };

  if (loading) {
    return (
      <HoLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </HoLayout>
    );
  }

  return (
    <HoLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sales Reports</h1>
          {report && (
            <button
              onClick={exportPDF}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export PDF
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
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

        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-green-500 p-3 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {report.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <ShoppingCartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {report.averageOrderValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Sales by RDC</h2>
              <div className="space-y-4">
                {report.salesByRDC.map((rdc) => (
                  <div key={rdc.rdcName}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{rdc.rdcName}</span>
                      <span>Rs. {rdc.totalSales.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(rdc.totalSales / report.totalSales) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{rdc.orderCount} orders</p>
                  </div>
                ))}
              </div>
            </div>

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
                    {report.topProducts.map((product, index) => (
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
          </>
        )}
      </div>
    </HoLayout>
  );
}