'use client';

import { useState, useEffect } from 'react';
import RdcLayout from '@/components/RdcLayout';
import { ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Warehouse {
  _id: string;
  name: string;
  location: string;
  region: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
}

interface InventoryItem {
  productId: Product;
  quantity: number;
}

interface Transfer {
  _id: string;
  transferNumber: string;
  fromRDC: Warehouse;
  toRDC: Warehouse;
  items: {
    productId: Product;
    quantity: number;
  }[];
  status: string;
  requestDate: string;
  notes?: string;
  rejectionReason?: string;
}

export default function RdcTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [currentRdcId, setCurrentRdcId] = useState<string>('');
  const [formData, setFormData] = useState({
    toRDC: '',
    items: [{ productId: '', quantity: '' }],
    notes: '',
  });
  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => {
    fetchCurrentRdc();
  }, []);

  const fetchCurrentRdc = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user?.rdcId?._id) {
        setCurrentRdcId(data.user.rdcId._id);
        fetchData(data.user.rdcId._id);
      }
    } catch (error) {
      console.error('Failed to fetch current RDC:', error);
      setLoading(false);
    }
  };

  const fetchData = async (rdcId: string) => {
    try {
      const [transfersRes, warehousesRes, inventoryRes, productsRes] = await Promise.all([
        fetch('/api/transfers/my-rdc'),
        fetch('/api/warehouses'),
        fetch('/api/inventory/my-rdc'),
        fetch('/api/products'),
      ]);
      
      const transfersData = await transfersRes.json();
      const warehousesData = await warehousesRes.json();
      const inventoryData = await inventoryRes.json();
      const productsData = await productsRes.json();
      
      setTransfers(transfersData);
      setWarehouses(warehousesData);
      setInventory(inventoryData);
      setProducts(productsData);
      
      console.log('Current RDC ID:', rdcId);
      console.log('Transfers:', transfersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '' }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transferItems = formData.items
        .filter(item => item.productId && item.quantity)
        .map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
        }));

      const res = await fetch('/api/transfers/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toRDC: formData.toRDC,
          items: transferItems,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        setShowRequestModal(false);
        setFormData({
          toRDC: '',
          items: [{ productId: '', quantity: '' }],
          notes: '',
        });
        fetchData(currentRdcId);
      }
    } catch (error) {
      console.error('Failed to request transfer:', error);
    }
  };

  const handleReceiveTransfer = async () => {
    if (!selectedTransfer) return;
    
    try {
      const res = await fetch(`/api/transfers/${selectedTransfer._id}/receive`, {
        method: 'POST',
      });

      if (res.ok) {
        setShowReceiveModal(false);
        setSelectedTransfer(null);
        fetchData(currentRdcId);
      }
    } catch (error) {
      console.error('Failed to receive transfer:', error);
    }
  };

  const updateTransferStatus = async (transferId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/transfers/${transferId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });

      if (res.ok) {
        fetchData(currentRdcId);
      }
    } catch (error) {
      console.error('Failed to update transfer:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const incomingTransfers = transfers.filter(t => t.toRDC?._id === currentRdcId);
  const outgoingTransfers = transfers.filter(t => t.fromRDC?._id === currentRdcId);

  if (loading) {
    return (
      <RdcLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </RdcLayout>
    );
  }

  return (
    <RdcLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Stock Transfers</h1>
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Request Transfer
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`${
                activeTab === 'incoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Incoming Transfers ({incomingTransfers.length})
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`${
                activeTab === 'outgoing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Outgoing Requests ({outgoingTransfers.length})
            </button>
          </nav>
        </div>

        {/* Incoming Transfers */}
        {activeTab === 'incoming' && (
          <div className="space-y-4">
            {incomingTransfers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No incoming transfers</p>
              </div>
            ) : (
              incomingTransfers.map((transfer) => (
                <div key={transfer._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Transfer #{transfer.transferNumber}</p>
                      <p className="font-medium mt-1">From: {transfer.fromRDC?.name}</p>
                      <p className="text-sm text-gray-600">Requested: {new Date(transfer.requestDate).toLocaleDateString()}</p>
                      {transfer.notes && (
                        <p className="text-sm text-gray-600 mt-2">Notes: {transfer.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
                        {transfer.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Items:</h3>
                    <ul className="space-y-2">
                      {transfer.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{item.productId.name}</span>
                          <span className="font-medium">{item.quantity} {item.productId.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {transfer.status === 'pending' && (
                    <div className="border-t pt-4 mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => updateTransferStatus(transfer._id, 'approved')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) updateTransferStatus(transfer._id, 'rejected', reason);
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center"
                      >
                        <XMarkIcon className="h-5 w-5 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}

                  {transfer.status === 'approved' && (
                    <div className="border-t pt-4 mt-4">
                      <button
                        onClick={() => {
                          setSelectedTransfer(transfer);
                          setShowReceiveModal(true);
                        }}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Receive Stock
                      </button>
                    </div>
                  )}

                  {transfer.status === 'rejected' && transfer.rejectionReason && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Rejection Reason:</span> {transfer.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Outgoing Transfers */}
        {activeTab === 'outgoing' && (
          <div className="space-y-4">
            {outgoingTransfers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No outgoing transfer requests</p>
              </div>
            ) : (
              outgoingTransfers.map((transfer) => (
                <div key={transfer._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Transfer #{transfer.transferNumber}</p>
                      <p className="font-medium mt-1">To: {transfer.toRDC?.name}</p>
                      <p className="text-sm text-gray-600">Requested: {new Date(transfer.requestDate).toLocaleDateString()}</p>
                      {transfer.notes && (
                        <p className="text-sm text-gray-600 mt-2">Notes: {transfer.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
                        {transfer.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Items:</h3>
                    <ul className="space-y-2">
                      {transfer.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{item.productId.name}</span>
                          <span className="font-medium">{item.quantity} {item.productId.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {transfer.status === 'pending' && (
                    <div className="border-t pt-4 mt-4">
                      <button
                        onClick={() => updateTransferStatus(transfer._id, 'cancelled')}
                        className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}

                  {transfer.status === 'approved' && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-green-600 font-medium">Waiting for destination to receive</p>
                    </div>
                  )}

                  {transfer.status === 'rejected' && transfer.rejectionReason && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Rejection Reason:</span> {transfer.rejectionReason}
                      </p>
                    </div>
                  )}

                  {transfer.status === 'completed' && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-green-600 font-medium">Transfer completed</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Request Transfer Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
            <div className="relative top-20 mx-auto max-w-2xl bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Request Stock Transfer
                </h3>
                
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination RDC
                    </label>
                    <select
                      required
                      value={formData.toRDC}
                      onChange={(e) => setFormData({...formData, toRDC: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">Select destination warehouse</option>
                      {warehouses
                        .filter(w => w._id !== currentRdcId)
                        .map((warehouse) => (
                          <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name} - {warehouse.location}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items to Transfer
                    </label>
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md p-2"
                          required
                        >
                          <option value="">Select product</option>
                          {inventory.map((inv) => (
                            <option key={inv.productId._id} value={inv.productId._id}>
                              {inv.productId.name} ({inv.quantity} {inv.productId.unit} available)
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          max={inventory.find(i => i.productId._id === item.productId)?.quantity || 0}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-24 border border-gray-300 rounded-md p-2"
                          placeholder="Qty"
                          required
                        />
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add another item
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md p-2"
                      placeholder="Add any notes about this transfer request"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestModal(false);
                        setFormData({
                          toRDC: '',
                          items: [{ productId: '', quantity: '' }],
                          notes: '',
                        });
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Receive Transfer Modal */}
        {showReceiveModal && selectedTransfer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
            <div className="relative top-20 mx-auto max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Receive Stock Transfer
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Transfer #{selectedTransfer.transferNumber}</p>
                  <p className="font-medium mt-2">From: {selectedTransfer.fromRDC?.name}</p>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Items to Receive:</h4>
                  <ul className="space-y-2">
                    {selectedTransfer.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{item.productId.name}</span>
                        <span className="font-medium">{item.quantity} {item.productId.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Confirm that you have received these items. This will update your inventory.
                </p>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReceiveModal(false);
                      setSelectedTransfer(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReceiveTransfer}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Confirm Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RdcLayout>
  );
}