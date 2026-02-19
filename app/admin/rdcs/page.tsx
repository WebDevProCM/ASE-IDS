'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { PencilIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface RDC {
  _id: string;
  name: string;
  location: string;
  region: string;
  address: string;
  contactNumber: string;
  isActive: boolean;
  managerName?: string;
  managerContact?: string;
}

export default function RDCManagement() {
  const [rdcs, setRdcs] = useState<RDC[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRdc, setEditingRdc] = useState<RDC | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    region: '',
    address: '',
    contactNumber: '',
    managerName: '',
    managerContact: '',
  });

  useEffect(() => {
    fetchRDCs();
  }, []);

  const fetchRDCs = async () => {
    try {
      const res = await fetch('/api/admin/rdcs');
      const data = await res.json();
      setRdcs(data);
    } catch (error) {
      console.error('Failed to fetch RDCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRdc 
        ? `/api/admin/rdcs/${editingRdc._id}`
        : '/api/admin/rdcs';
      
      const method = editingRdc ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingRdc(null);
        setFormData({
          name: '',
          location: '',
          region: '',
          address: '',
          contactNumber: '',
          managerName: '',
          managerContact: '',
        });
        fetchRDCs();
      }
    } catch (error) {
      console.error('Failed to save RDC:', error);
    }
  };

  const toggleRDCStatus = async (rdcId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/rdcs/${rdcId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchRDCs();
    } catch (error) {
      console.error('Failed to update RDC:', error);
    }
  };

  const editRDC = (rdc: RDC) => {
    setEditingRdc(rdc);
    setFormData({
      name: rdc.name,
      location: rdc.location,
      region: rdc.region,
      address: rdc.address,
      contactNumber: rdc.contactNumber,
      managerName: rdc.managerName || '',
      managerContact: rdc.managerContact || '',
    });
    setShowModal(true);
  };

  const regions = [
    'Western Province', 'Central Province', 'Southern Province',
    'Northern Province', 'Eastern Province', 'North Western Province',
    'North Central Province', 'Uva Province', 'Sabaragamuwa Province'
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">RDC Management</h1>
          <button
            onClick={() => {
              setEditingRdc(null);
              setFormData({
                name: '', location: '', region: '', address: '',
                contactNumber: '', managerName: '', managerContact: ''
              });
              setShowModal(true);
            }}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            Add RDC
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
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RDC</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rdcs.map((rdc) => (
                    <tr key={rdc._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-medium text-sm sm:text-base">{rdc.name}</p>
                          <p className="text-xs text-gray-500">{rdc.region}</p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm">{rdc.location}</td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm">{rdc.contactNumber}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          rdc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rdc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editRDC(rdc)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => toggleRDCStatus(rdc._id, rdc.isActive)}
                            className={`text-sm font-medium ${
                              rdc.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {rdc.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
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
                  {editingRdc ? 'Edit RDC' : 'Add New RDC'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RDC Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Region</label>
                    <select
                      required
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="">Select Region</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows={2}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager Name</label>
                    <input
                      type="text"
                      value={formData.managerName}
                      onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager Contact</label>
                    <input
                      type="text"
                      value={formData.managerContact}
                      onChange={(e) => setFormData({...formData, managerContact: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingRdc(null);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {editingRdc ? 'Update' : 'Create'}
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