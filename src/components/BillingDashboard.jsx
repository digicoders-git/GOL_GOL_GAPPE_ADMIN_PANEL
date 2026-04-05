import React, { useState, useEffect } from 'react';
import { getBills, updateBillStatus as updateBillStatusApi } from '../utils/api';
import toast from 'react-hot-toast';
import { MdEdit, MdDelete, MdCheckCircle, MdPending, MdLocalShipping, MdRefresh } from 'react-icons/md';
import Swal from 'sweetalert2';

const BillingDashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const fetchBills = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching bills from API...');
      const response = await getBills(page, 20);
      console.log('API Response:', response);
      
      if (response.data.success) {
        console.log('Bills received:', response.data.bills);
        setBills(response.data.bills || []);
        setPagination(response.data.pagination || { page, limit: 20, total: 0, pages: 0 });
      } else {
        console.warn('API returned success: false');
        toast.error('Failed to fetch bills');
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills(pagination.page);
  }, []);

  const handleStatusUpdate = async (billId, newStatus) => {
    try {
      const response = await updateBillStatusApi(billId, newStatus);

      if (response.data.success) {
        toast.success('Bill status updated');
        fetchBills(pagination.page);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.billNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customer?.phone?.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Paid': return 'bg-green-50 text-green-700 border-green-200';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ready': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Completed': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Assigned_to_Kitchen': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <MdPending className="text-yellow-600" />;
      case 'Paid': return <MdCheckCircle className="text-green-600" />;
      case 'Processing': return <MdLocalShipping className="text-blue-600" />;
      case 'Ready': return <MdCheckCircle className="text-emerald-600" />;
      case 'Completed': return <MdCheckCircle className="text-gray-600" />;
      case 'Assigned_to_Kitchen': return <MdLocalShipping className="text-purple-600" />;
      default: return <MdPending className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Billing Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Manage all orders and billing</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchBills(pagination.page)}
            className="px-4 py-2 rounded-lg font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all flex items-center gap-2"
          >
            <MdRefresh size={18} /> Refresh
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'table' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'card' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Card View
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-semibold">Total Bills</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{bills.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-semibold">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-600 mt-1">
            {bills.filter(b => b.status === 'Pending').length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-semibold">Completed</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">
            {bills.filter(b => b.status === 'Completed').length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-semibold">Total Amount</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-1">
            ₹{bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by bill number, customer name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Processing">Processing</option>
          <option value="Ready">Ready</option>
          <option value="Completed">Completed</option>
          <option value="Assigned_to_Kitchen">Assigned to Kitchen</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bills...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && bills.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">No bills found</p>
          <p className="text-gray-500 text-sm">Create a new order to see bills here</p>
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === 'table' && bills.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No bills match your search
                    </td>
                  </tr>
                ) : (
                  filteredBills.map(bill => (
                    <tr key={bill._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-800">{bill.billNumber}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{bill.customer?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{bill.customer?.phone || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {bill.items?.length || 0} item{bill.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">₹{(bill.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bill.status)}`}>
                          {getStatusIcon(bill.status)}
                          {bill.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={bill.status}
                            onChange={(e) => handleStatusUpdate(bill._id, e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-primary"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Processing">Processing</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                            <option value="Assigned_to_Kitchen">Assigned to Kitchen</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {!loading && viewMode === 'card' && bills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No bills match your search
            </div>
          ) : (
            filteredBills.map(bill => (
              <div key={bill._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Bill Number</p>
                    <h3 className="text-lg font-bold text-gray-800">{bill.billNumber}</h3>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bill.status)}`}>
                    {getStatusIcon(bill.status)}
                    {bill.status}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Customer</p>
                    <p className="text-sm font-semibold text-gray-800">{bill.customer?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-600">{bill.customer?.phone || 'N/A'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Items</p>
                      <p className="text-lg font-bold text-gray-800">{bill.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Amount</p>
                      <p className="text-lg font-bold text-primary">₹{(bill.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Date</p>
                    <p className="text-sm text-gray-800">
                      {bill.createdAt ? new Date(bill.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 flex gap-2">
                  <select
                    value={bill.status}
                    onChange={(e) => handleStatusUpdate(bill._id, e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-primary"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready">Ready</option>
                    <option value="Completed">Completed</option>
                    <option value="Assigned_to_Kitchen">Assigned to Kitchen</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && bills.length > 0 && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchBills(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetchBills(Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BillingDashboard;
