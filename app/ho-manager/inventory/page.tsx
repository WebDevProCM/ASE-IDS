'use client';

import { useState, useEffect } from 'react';
import HoLayout from '@/components/HoLayout';
import { CubeIcon, ExclamationTriangleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

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

export default function InventoryReports() {
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/reports/inventory');
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
    doc.text('Inventory Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    
    doc.setFontSize(14);
    doc.text('Summary', 14, 42);
    
    doc.setFontSize(11);
    doc.text(`Total Products: ${report.totalProducts}`, 14, 52);
    doc.text(`Total Inventory Value: Rs. ${report.totalValue.toLocaleString()}`, 14, 58);
    
    if (report.lowStockItems.length > 0) {
      doc.setFontSize(14);
      doc.text('Low Stock Items', 14, 72);
      
      const lowStockData = report.lowStockItems.map(item => [
        item.productName,
        item.rdcName,
        item.quantity.toString(),
        item.minStockLevel.toString()
      ]);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      autoTable(doc,{
        startY: 76,
        head: [['Product', 'RDC', 'Current Stock', 'Min Level']],
        body: lowStockData,
      });
      
      doc.setFontSize(14);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.text('Stock by RDC', 14, (doc as any).lastAutoTable.finalY + 10);
    } else {
      doc.setFontSize(14);
      doc.text('Stock by RDC', 14, 72);
    }
    
    const rdcData = report.stockByRDC.map(rdc => [
      rdc.rdcName,
      rdc.itemCount.toString(),
      `Rs. ${rdc.totalValue.toLocaleString()}`
    ]);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoTable(doc,{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startY: report.lowStockItems.length > 0 ? (doc as any).lastAutoTable.finalY + 14 : 76,
      head: [['RDC', 'Items', 'Total Value']],
      body: rdcData,
    });
    
    doc.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
          <h1 className="text-2xl font-bold">Inventory Reports</h1>
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

        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.totalProducts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-green-500 p-3 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {report.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                Low Stock Alerts
              </h2>
              
              {report.lowStockItems.length === 0 ? (
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.lowStockItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 font-medium">{item.productName}</td>
                          <td className="px-4 py-2">{item.rdcName}</td>
                          <td className="px-4 py-2 text-red-600 font-medium">{item.quantity}</td>
                          <td className="px-4 py-2">{item.minStockLevel}</td>
                          <td className="px-4 py-2">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              Low Stock
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Stock Distribution by RDC</h2>
              <div className="space-y-4">
                {report.stockByRDC.map((rdc) => (
                  <div key={rdc.rdcName}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{rdc.rdcName}</span>
                      <span>{rdc.itemCount} items</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(rdc.itemCount / report.totalProducts) * 100}%`,
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
          </>
        )}
      </div>
    </HoLayout>
  );
}