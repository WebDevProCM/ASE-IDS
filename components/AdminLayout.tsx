'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  CubeIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'Product Management', href: '/admin/products', icon: CubeIcon },
  { name: 'RDC Management', href: '/admin/rdcs', icon: BuildingOfficeIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-20 px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-600">IslandLink Admin</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:w-64 ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b lg:block hidden">
          <h2 className="text-xl font-bold text-blue-600">IslandLink Admin</h2>
        </div>
        
        <nav className="p-4 mt-16 lg:mt-0">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={`flex items-center p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
            
            <li className="pt-4 mt-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <main className="pt-16 lg:pt-0">
          <div className="p-0 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}