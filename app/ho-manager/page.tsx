'use client';

import { useState, useEffect } from 'react';
import HoLayout from '@/components/HoLayout';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DashboardData {
  sales: {
    today: number;
    week: number;
    month: number;
    growth: number;
  };
  inventory: {
    totalProducts: number;
    totalValue: number;
    lowStock: number;
  };
  delivery: {
    total: number;
    completed: number;
    onTime: number;
  };
  topProducts: {
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  rdcPerformance: {
    rdcName: string;
    totalSales: number;
    orderCount: number;
  }[];
}

export default function HoManagerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      // Fetch sales report
      const salesRes = await fetch(`/api/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      const salesData = await salesRes.json();

      // Fetch inventory report
      const inventoryRes = await fetch('/api/reports/inventory');
      const inventoryData = await inventoryRes.json();

      // Fetch delivery report
      const deliveryRes = await fetch(`/api/reports/delivery?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      const deliveryData = await deliveryRes.json();

      // Calculate today's sales (simplified - in real app would have separate API)
      const today = new Date().toISOString().split('T')[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const todaySales = salesData.dailySales?.find((d: any) => d._id === today)?.sales || 0;

      // Calculate week sales
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekSales = salesData.dailySales
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.filter((d: any) => new Date(d._id) >= weekAgo)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .reduce((sum: number, d: any) => sum + d.sales, 0) || 0;

      setData({
        sales: {
          today: todaySales,
          week: weekSales,
          month: salesData.totalSales,
          growth: 15.5, // Mock growth percentage
        },
        inventory: {
          totalProducts: inventoryData.totalProducts,
          totalValue: inventoryData.totalValue,
          lowStock: inventoryData.lowStockItems?.length || 0,
        },
        delivery: {
          total: deliveryData.totalDeliveries,
          completed: deliveryData.completedDeliveries,
          onTime: deliveryData.onTimeRate,
        },
        topProducts: salesData.topProducts || [],
        rdcPerformance: salesData.salesByRDC || [],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold mb-6">Executive Dashboard</h1>

        {/* Date Range Filter */}
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

        {data && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Todays Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {data.sales.today.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{data.sales.growth}%</span>
                  <span className="text-gray-500 ml-2">vs last month</span>
                </div>
              </div>

              <Link href="/ho-manager/inventory" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {data.inventory.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {data.inventory.totalProducts} products • {data.inventory.lowStock} low stock
                </p>
              </Link>

              <Link href="/ho-manager/analytics" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Deliveries</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.delivery.completed}/{data.delivery.total}
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <TruckIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  On-time: {data.delivery.onTime}%
                </p>
              </Link>

              <Link href="/ho-manager/sales" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rs. {data.sales.month.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Week: Rs. {data.sales.week.toLocaleString()}
                </p>
              </Link>
            </div>

            {/* RDC Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">RDC Performance</h2>
                <div className="space-y-4">
                  {data.rdcPerformance.map((rdc) => (
                    <div key={rdc.rdcName}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{rdc.rdcName}</span>
                        <span>Rs. {rdc.totalSales.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(rdc.totalSales / Math.max(...data.rdcPerformance.map(r => r.totalSales))) * 100}%`,
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
                {data.topProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {data.topProducts.map((product, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="w-6 text-gray-500">{index + 1}.</span>
                          <span className="font-medium">{product.productName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Qty: {product.quantity}</p>
                          <p className="text-xs text-gray-500">Rs. {product.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alerts Section */}
            {data.inventory.lowStock > 0 && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-800">Low Stock Alert</h3>
                    <p className="text-sm text-red-600">
                      {data.inventory.lowStock} products are running low on stock
                    </p>
                  </div>
                  <Link
                    href="/ho-manager/inventory"
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Review Now
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </HoLayout>
  );
}