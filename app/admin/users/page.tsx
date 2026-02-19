'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { PencilIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  rdcId?: { name: string };
  isActive: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rdcs, setRdcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    rdcId: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRDCs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRDCs = async () => {
    try {
      const res = await fetch('/api/admin/rdcs');
      const data = await res.json();
      setRdcs(data);
    } catch (error) {
      console.error('Failed to fetch RDCs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchUsers();
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'customer',
          rdcId: '',
        });
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'rdc_staff': return 'bg-blue-100 text-blue-800';
      case 'logistics': return 'bg-purple-100 text-purple-800';
      case 'ho_manager': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add New User
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RDC</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-medium text-sm sm:text-base">{user.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">{user.email}</p>
                          <span className={`sm:hidden inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm">
                        {user.rdcId?.name || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className={`text-sm font-medium ${
                            user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
            <div className="relative top-20 mx-auto max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add New User
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="customer">Customer</option>
                      <option value="rdc_staff">RDC Staff</option>
                      <option value="logistics">Logistics Officer</option>
                      <option value="ho_manager">HO Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  {(formData.role === 'rdc_staff' || formData.role === 'logistics') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assign RDC</label>
                      <select
                        value={formData.rdcId}
                        onChange={(e) => setFormData({...formData, rdcId: e.target.value})}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="">Select RDC</option>
                        {rdcs.map((rdc) => (
                          <option key={rdc._id} value={rdc._id}>
                            {rdc.name} - {rdc.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}