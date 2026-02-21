'use client';

import { useState, useEffect } from 'react';
import HoLayout from '@/components/HoLayout';
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

interface DeliveryReport {
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  byStatus: {
    _id: string;
    count: number;
  }[];
  averageDeliveryTime: number;
}

export default function AnalyticsPage() {
  const [report, setReport] = useState<DeliveryReport | null>(null);
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
      const res = await fetch(`/api/reports/delivery?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
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
    doc.text('Performance Analytics Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
    
    doc.setFontSize(14);
    doc.text('Delivery Performance Summary', 14, 48);
    
    doc.setFontSize(11);
    doc.text(`Total Deliveries: ${report.totalDeliveries}`, 14, 58);
    doc.text(`Completed Deliveries: ${report.completedDeliveries}`, 14, 64);
    doc.text(`Failed Deliveries: ${report.failedDeliveries}`, 14, 70);
    doc.text(`On-Time Deliveries: ${report.onTimeDeliveries}`, 14, 76);
    doc.text(`On-Time Rate: ${report.onTimeRate}%`, 14, 82);
    doc.text(`Average Delivery Time: ${report.averageDeliveryTime} hours`, 14, 88);
    
    doc.setFontSize(14);
    doc.text('Delivery Status Breakdown', 14, 102);
    
    const statusData = report.byStatus.map(status => [
      status._id.replace(/_/g, ' ').toUpperCase(),
      status.count.toString(),
      `${((status.count / report.totalDeliveries) * 100).toFixed(1)}%`
    ]);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoTable(doc,{
      startY: 106,
      head: [['Status', 'Count', 'Percentage']],
      body: statusData,
    });
    
    doc.setFontSize(14);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.text('Key Insights', 14, (doc as any).lastAutoTable.finalY + 10);
    
    doc.setFontSize(11);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.text(`• On-time delivery rate is ${report.onTimeRate}%`, 14, (doc as any).lastAutoTable.finalY + 20);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.text(`• ${report.failedDeliveries} deliveries failed (${((report.failedDeliveries / report.totalDeliveries) * 100).toFixed(1)}%)`, 14, (doc as any).lastAutoTable.finalY + 26);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.text(`• Average delivery takes ${report.averageDeliveryTime} hours`, 14, (doc as any).lastAutoTable.finalY + 32);
    
    doc.save(`performance-analytics-${dateRange.startDate}-to-${dateRange.endDate}.pdf`);
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
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <TruckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.totalDeliveries}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-green-500 p-3 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.completedDeliveries}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-red-500 p-3 rounded-lg">
                    <XCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.failedDeliveries}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {report.onTimeRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery Status Breakdown</h2>
                <div className="space-y-4">
                  {report.byStatus.map((status) => (
                    <div key={status._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{status._id.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{status.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status._id === 'delivered' ? 'bg-green-600' :
                            status._id === 'failed' ? 'bg-red-600' :
                            status._id === 'out_for_delivery' ? 'bg-blue-600' :
                            'bg-yellow-600'
                          }`}
                          style={{
                            width: `${(status.count / report.totalDeliveries) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>On-Time Deliveries</span>
                      <span className="font-medium">
                        {report.onTimeDeliveries} / {report.completedDeliveries}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(report.onTimeDeliveries / report.completedDeliveries) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Delivery Time</span>
                      <span className="font-medium">{report.averageDeliveryTime} hours</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Key Insights</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          report.onTimeRate >= 90 ? 'bg-green-500' : 
                          report.onTimeRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                        On-time delivery rate is {report.onTimeRate}%
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2 bg-blue-500"></span>
                        {report.failedDeliveries} deliveries failed ({((report.failedDeliveries / report.totalDeliveries) * 100).toFixed(1)}%)
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2 bg-purple-500"></span>
                        Average delivery takes {report.averageDeliveryTime} hours
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </HoLayout>
  );
}