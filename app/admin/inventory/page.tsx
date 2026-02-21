'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { PencilIcon, BuildingOfficeIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { create } from 'domain';

interface RDC {
  _id: string;
  name: string;
  location: string;
}

interface Product {
  _id: string;
  name: string;
  unit: string;
  price: number;
}

interface InventoryItem {
  _id: string;
  productId: Product;
  rdcId: RDC;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
}

export default function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [rdcs, setRdcs] = useState<RDC[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRdc, setSelectedRdc] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  
  const [collapsedRdcs, setCollapsedRdcs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inventoryRes, rdcsRes, productsRes] = await Promise.all([
        fetch('/api/admin/inventory'),
        fetch('/api/admin/rdcs'),
        fetch('/api/admin/products'),
      ]);
      
      setInventory(await inventoryRes.json());
      setRdcs(await rdcsRes.json());
      setProducts(await productsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRdc = (rdcName: string) => {
    setCollapsedRdcs(prev => ({
      ...prev,
      [rdcName]: !prev[rdcName]
    }));
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rdcId: selectedRdc,
          productId: selectedProduct,
          quantity: parseInt(quantity),
          minStockLevel: parseInt(minStock),
          maxStockLevel: parseInt(maxStock),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedRdc('');
        setSelectedProduct('');
        setQuantity('');
        setMinStock('');
        setMaxStock('');
        fetchData();
      }

      const data = await res.json();

      if(data?.error){
        alert(data.error);
      }

    } catch (error) {
      console.error('Failed to create inventory:', error);
    }
  };

  const updateStock = async (inventoryId: string, newQuantity: number) => {
    try {
      await fetch(`/api/admin/inventory/${inventoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedInventory = inventory.reduce((acc: any, item) => {
    const rdcName = item.rdcId.name;
    if (!acc[rdcName]) {
      acc[rdcName] = [];
    }
    acc[rdcName].push(item);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">RDC Inventory Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            Add Stock to RDC
          </button>
        </div>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {Object.entries(groupedInventory).map(([rdcName, items]: [string, any]) => (
          <div key={rdcName} className="mb-8">
            <h2 
              onClick={() => toggleRdc(rdcName)}
              className="text-lg font-semibold mb-4 bg-gray-50 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span>{rdcName}</span>
              {collapsedRdcs[rdcName] ? (
                <ChevronRightIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </h2>
            
            {!collapsedRdcs[rdcName] && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item: InventoryItem) => {
                        const status = item.quantity <= item.minStockLevel ? 'Low Stock' : 
                                     item.quantity >= item.maxStockLevel ? 'Overstocked' : 'Normal';
                        const statusColor = item.quantity <= item.minStockLevel ? 'bg-red-100 text-red-800' :
                                           item.quantity >= item.maxStockLevel ? 'bg-yellow-100 text-yellow-800' :
                                           'bg-green-100 text-green-800';
                        
                        return (
                          <tr key={item._id}>
                            <td className="px-6 py-4">
                              <p className="font-medium">{item.productId.name}</p>
                              <p className="text-xs text-gray-500">Unit: {item.productId.unit}</p>
                            </td>
                            <td className="px-6 py-4 font-medium">{item.quantity}</td>
                            <td className="px-6 py-4">{item.minStockLevel}</td>
                            <td className="px-6 py-4">{item.maxStockLevel}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  const newQty = prompt('Enter new quantity:', item.quantity.toString());
                                  if (newQty && !isNaN(parseInt(newQty))) {
                                    updateStock(item._id, parseInt(newQty));
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Update
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
            <div className="relative top-20 mx-auto max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Stock to RDC</h3>
                
                <form onSubmit={handleCreateInventory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select RDC</label>
                    <select
                      required
                      value={selectedRdc}
                      onChange={(e) => setSelectedRdc(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="">Choose RDC</option>
                      {rdcs.map(rdc => (
                        <option key={rdc._id} value={rdc._id}>{rdc.name} - {rdc.location}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Product</label>
                    <select
                      required
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="">Choose Product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>{product.name} - {product.unit}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maximum Stock Level</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={maxStock}
                      onChange={(e) => setMaxStock(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>

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
                      Add Stock
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