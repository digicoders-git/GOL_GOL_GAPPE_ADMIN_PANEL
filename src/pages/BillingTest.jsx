import React, { useState } from 'react';
import { getBills } from '../utils/api';
import toast from 'react-hot-toast';

const BillingTest = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const testFetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Testing getBills API...');
      
      const response = await getBills(1, 20);
      console.log('Full Response:', response);
      console.log('Response Data:', response.data);
      
      setData(response.data);
      
      if (response.data.success) {
        toast.success(`Fetched ${response.data.bills?.length || 0} bills`);
      } else {
        toast.error('API returned success: false');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Billing API Test</h1>
      
      <button
        onClick={testFetchBills}
        disabled={loading}
        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Test Get Bills'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Response Summary:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>Success: {data.success ? '✅ Yes' : '❌ No'}</li>
              <li>Bills Count: {data.bills?.length || 0}</li>
              <li>Total (Pagination): {data.pagination?.total || 0}</li>
              <li>Page: {data.pagination?.page || 'N/A'}</li>
              <li>Pages: {data.pagination?.pages || 'N/A'}</li>
            </ul>
          </div>

          {data.bills && data.bills.length > 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-800 mb-3">Bills Data:</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.bills.map((bill, idx) => (
                  <div key={idx} className="p-3 bg-white border border-green-100 rounded">
                    <p className="font-semibold text-gray-800">{bill.billNumber}</p>
                    <p className="text-sm text-gray-600">Customer: {bill.customer?.name} ({bill.customer?.phone})</p>
                    <p className="text-sm text-gray-600">Amount: ₹{bill.totalAmount}</p>
                    <p className="text-sm text-gray-600">Status: {bill.status}</p>
                    <p className="text-sm text-gray-600">Items: {bill.items?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {bill._id}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-800">No Bills Found</h3>
              <p className="text-sm text-yellow-700 mt-1">Create a bill first to see data here</p>
            </div>
          )}

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Full Response (JSON):</h3>
            <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingTest;
