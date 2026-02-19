'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { UsersIcon, CubeIcon, ShoppingCartIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerId: {
    name: string;
  };
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent users
      const usersRes = await fetch('/api/admin/users?limit=5');
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      const usersData = await usersRes.json();
      setRecentUsers(usersData);

      // Fetch recent orders
      const ordersRes = await fetch('/api/admin/orders?limit=5');
      if (!ordersRes.ok) throw new Error('Failed to fetch orders');
      const ordersData = await ordersRes.json();
      setRecentOrders(ordersData);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: UsersIcon, 
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: CubeIcon, 
      color: 'bg-blue-500',
      link: '/admin/products'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingCartIcon, 
      color: 'bg-blue-500',
      link: '/admin/orders'
    },
    { 
      title: 'Revenue (LKR)', 
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`, 
      icon: CurrencyDollarIcon, 
      color: 'bg-blue-500',
      link: '/admin/reports'
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Link href={stat.link} key={stat.title}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Users</h2>
              <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users found</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' : ''}
                        ${user.role === 'customer' ? 'bg-green-100 text-green-800' : ''}
                        ${user.role === 'rdc_staff' ? 'bg-blue-100 text-blue-800' : ''}
                        ${user.role === 'logistics' ? 'bg-purple-100 text-purple-800' : ''}
                        ${user.role === 'ho_manager' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders found</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link 
                    key={order._id} 
                    href={`/admin/orders/${order._id}`}
                    className="block border-b pb-2 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">Customer: {order.customerId?.name || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs. {order.totalAmount.toLocaleString()}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/users" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition">
            <h3 className="font-medium text-blue-800">Add New User</h3>
            <p className="text-sm text-blue-600 mt-1">Create a new user account</p>
          </Link>
          
          <Link href="/admin/products" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition">
            <h3 className="font-medium text-blue-800">Add New Product</h3>
            <p className="text-sm text-blue-600 mt-1">Add a product to inventory</p>
          </Link>
          
          <Link href="/admin/rdcs" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition">
            <h3 className="font-medium text-blue-800">Add New RDC</h3>
            <p className="text-sm text-blue-600 mt-1">Create a new distribution center</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}