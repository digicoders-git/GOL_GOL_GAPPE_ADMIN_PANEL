import { useState, useEffect } from 'react';
import { getAdminDashboard } from '../utils/api';

const ApiTest = () => {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAdminData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminDashboard();
            setAdminData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Admin Panel - Complete MongoDB Data</h1>
                <p className="text-gray-600">All collections and statistics from database</p>
                <button 
                    onClick={fetchAdminData}
                    disabled={loading}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Refresh Data'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-red-800">Error</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Fetching all MongoDB data...</p>
                </div>
            )}

            {adminData && (
                <div className="space-y-6">
                    {/* Statistics Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                        <h2 className="text-2xl font-bold mb-4">📊 Database Statistics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">{adminData.stats?.totalUsers || 0}</div>
                                <div className="text-sm text-gray-600">Total Users</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">{adminData.stats?.totalProducts || 0}</div>
                                <div className="text-sm text-gray-600">Products</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-600">{adminData.stats?.totalKitchens || 0}</div>
                                <div className="text-sm text-gray-600">Kitchens</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-orange-600">{adminData.stats?.totalBills || 0}</div>
                                <div className="text-sm text-gray-600">Bills</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-red-600">{adminData.stats?.totalOrders || 0}</div>
                                <div className="text-sm text-gray-600">Orders</div>
                            </div>
                        </div>
                    </div>

                    {/* Users Collection */}
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-4">👥 Users Collection ({adminData.users?.length || 0} records)</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                        <th className="px-4 py-2 text-left">Mobile</th>
                                        <th className="px-4 py-2 text-left">Role</th>
                                        <th className="px-4 py-2 text-left">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminData.users?.slice(0, 10).map((user, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-4 py-2">{user.name || 'N/A'}</td>
                                            <td className="px-4 py-2">{user.email || 'N/A'}</td>
                                            <td className="px-4 py-2">{user.mobile || 'N/A'}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                                                    user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                    user.role === 'billing_admin' ? 'bg-green-100 text-green-800' :
                                                    user.role === 'kitchen_admin' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {adminData.users?.length > 10 && (
                                <p className="text-sm text-gray-500 mt-2">Showing first 10 of {adminData.users.length} users</p>
                            )}
                        </div>
                    </div>

                    {/* Products Collection */}
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-4">🛍️ Products Collection ({adminData.products?.length || 0} records)</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Price</th>
                                        <th className="px-4 py-2 text-left">Quantity</th>
                                        <th className="px-4 py-2 text-left">Category</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminData.products?.slice(0, 10).map((product, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-4 py-2">{product.name || 'N/A'}</td>
                                            <td className="px-4 py-2">₹{product.price || 0}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    (product.quantity || 0) === 0 ? 'bg-red-100 text-red-800' :
                                                    (product.quantity || 0) <= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {product.quantity || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">{product.category || 'N/A'}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {adminData.products?.length > 10 && (
                                <p className="text-sm text-gray-500 mt-2">Showing first 10 of {adminData.products.length} products</p>
                            )}
                        </div>
                    </div>

                    {/* Kitchens Collection */}
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-4">🏪 Kitchens Collection ({adminData.kitchens?.length || 0} records)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {adminData.kitchens?.map((kitchen, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold">{kitchen.name || 'Unnamed Kitchen'}</h3>
                                    <p className="text-sm text-gray-600">{kitchen.location || 'No location'}</p>
                                    <p className="text-sm text-gray-600">Manager: {kitchen.manager || 'N/A'}</p>
                                    <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                                        kitchen.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {kitchen.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bills Collection */}
                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-4">🧾 Bills Collection ({adminData.bills?.length || 0} records)</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Bill #</th>
                                        <th className="px-4 py-2 text-left">Customer</th>
                                        <th className="px-4 py-2 text-left">Amount</th>
                                        <th className="px-4 py-2 text-left">Items</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminData.bills?.slice(0, 10).map((bill, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-4 py-2">{bill.billNumber || bill._id?.slice(-6) || 'N/A'}</td>
                                            <td className="px-4 py-2">{bill.customer?.name || bill.user?.name || 'Walk-in'}</td>
                                            <td className="px-4 py-2 font-bold">₹{bill.totalAmount || 0}</td>
                                            <td className="px-4 py-2">{bill.items?.length || 0} items</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    bill.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    bill.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                    bill.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {bill.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {adminData.bills?.length > 10 && (
                                <p className="text-sm text-gray-500 mt-2">Showing first 10 of {adminData.bills.length} bills</p>
                            )}
                        </div>
                    </div>

                    {/* Orders Collection */}
                    {adminData.orders && adminData.orders.length > 0 && (
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-xl font-bold mb-4">📋 Orders Collection ({adminData.orders?.length || 0} records)</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Order ID</th>
                                            <th className="px-4 py-2 text-left">Customer</th>
                                            <th className="px-4 py-2 text-left">Items</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminData.orders?.slice(0, 10).map((order, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="px-4 py-2">{order._id?.slice(-6) || 'N/A'}</td>
                                                <td className="px-4 py-2">{order.user?.name || 'N/A'}</td>
                                                <td className="px-4 py-2">{order.items?.length || 0} items</td>
                                                <td className="px-4 py-2">
                                                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                                        {order.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Stock Logs Collection */}
                    {adminData.stockLogs && adminData.stockLogs.length > 0 && (
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-xl font-bold mb-4">📊 Stock Logs Collection ({adminData.stockLogs?.length || 0} records)</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Product</th>
                                            <th className="px-4 py-2 text-left">Action</th>
                                            <th className="px-4 py-2 text-left">Quantity</th>
                                            <th className="px-4 py-2 text-left">User</th>
                                            <th className="px-4 py-2 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminData.stockLogs?.slice(0, 10).map((log, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="px-4 py-2">{log.product?.name || 'N/A'}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        log.action === 'add' ? 'bg-green-100 text-green-800' :
                                                        log.action === 'remove' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {log.action || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">{log.quantity || 0}</td>
                                                <td className="px-4 py-2">{log.user?.name || 'System'}</td>
                                                <td className="px-4 py-2">{new Date(log.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Raw JSON Data */}
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-4">🔍 Raw JSON Response</h2>
                        <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96 border">
                            {JSON.stringify(adminData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiTest;