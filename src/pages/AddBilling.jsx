import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdReceipt, MdCheckCircle, MdRestaurant, MdFlashOn, MdPerson, MdAccessTime, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AddBilling = () => {
    const [stats, setStats] = useState({ totalOrders: 0, completed: 0, assigned: 0, topItem: 'N/A' });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [productFilter, setProductFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast.error('No authentication token found');
                setLoading(false);
                return;
            }

            console.log('Fetching from API_URL:', API_URL);

            // Fetch from both Billing and Orders collections
            const [billingRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/api/billing?page=1&limit=100`, {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${API_URL}/api/orders?page=1&limit=100`, {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            let allBills = [];

            if (billingRes.ok) {
                const billingData = await billingRes.json();
                console.log('Billing API Response:', billingData);
                if (billingData.success && billingData.bills) {
                    console.log('Billing bills count:', billingData.bills.length);
                    allBills = [...allBills, ...billingData.bills];
                }
            } else {
                console.error('Billing API error:', billingRes.status, billingRes.statusText);
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                console.log('Orders API Response:', ordersData);
                if (ordersData.success && ordersData.orders) {
                    console.log('Orders count:', ordersData.orders.length);
                    allBills = [...allBills, ...ordersData.orders];
                }
            } else {
                console.error('Orders API error:', ordersRes.status, ordersRes.statusText);
            }

            console.log('Total bills fetched:', allBills.length);

            // Filter orders that are either Assigned_to_Kitchen or Completed (but were assigned)
            const assignedOrders = allBills.filter(b => 
                b.status === 'Assigned_to_Kitchen' || 
                (b.status === 'Completed' && b.kitchen)
            );
            
            console.log('Assigned orders (including completed):', assignedOrders.length);

            // Extract unique products
            const uniqueProducts = new Set();
            assignedOrders.forEach(order => {
                order.items?.forEach(item => {
                    if (item.product?.name) {
                        uniqueProducts.add(item.product.name);
                    }
                });
            });
            setProducts(Array.from(uniqueProducts).sort());

            const totalOrders = assignedOrders.length;
            const completed = assignedOrders.filter(b => b.status === 'Completed').length;
            const assigned = assignedOrders.filter(b => b.status === 'Assigned_to_Kitchen').length;

            const itemCount = {};
            assignedOrders.forEach(bill => {
                bill.items?.forEach(item => {
                    const name = item.product?.name || 'Unknown';
                    itemCount[name] = (itemCount[name] || 0) + item.quantity;
                });
            });
            const topItem = Object.keys(itemCount).length > 0
                ? Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0][0]
                : 'N/A';

            setStats({ totalOrders, completed, assigned, topItem });
            setOrders(assignedOrders);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error.message || 'Failed to load data');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Apply all filters
    let filteredOrders = orders;

    // Status filter
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(o => 
            statusFilter === 'assigned' 
                ? o.status === 'Assigned_to_Kitchen'
                : o.status === 'Completed'
        );
    }

    // Product filter
    if (productFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order =>
            order.items?.some(item => item.product?.name === productFilter)
        );
    }

    // Date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

            if (dateFilter === 'today') {
                return orderDay.getTime() === today.getTime();
            } else if (dateFilter === 'yesterday') {
                return orderDay.getTime() === yesterday.getTime();
            } else if (dateFilter === 'week') {
                return orderDate >= weekAgo;
            } else if (dateFilter === 'month') {
                return orderDate >= monthAgo;
            }
            return true;
        });
    }

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                        <MdReceipt size={16} />
                    </div>
                    <span className="text-primary font-black tracking-widest text-[9px] uppercase bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Order Management</span>
                </div>
                <h1 className="text-3xl font-black text-secondary tracking-tight leading-none">Order Assignment</h1>
                <p className="text-zinc-500 text-[11px] font-medium">Orders assigned to kitchen (including completed)</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: stats.totalOrders.toString().padStart(2, '0'), color: 'blue', icon: <MdReceipt size={20} /> },
                    { label: 'Completed', value: stats.completed.toString().padStart(2, '0'), color: 'emerald', icon: <MdCheckCircle size={20} /> },
                    { label: 'Assigned', value: stats.assigned.toString().padStart(2, '0'), color: 'orange', icon: <MdRestaurant size={20} /> },
                    { label: 'Top Item', value: stats.topItem.length > 12 ? stats.topItem.substring(0, 12) + '...' : stats.topItem, color: 'purple', icon: <MdFlashOn size={20} /> }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3.5 group hover:border-primary/30 transition-all">
                        <div className={`w-12 h-12 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <h3 className="text-xl font-black text-secondary leading-none">{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        statusFilter === 'all'
                            ? 'bg-secondary text-primary shadow-lg'
                            : 'bg-white text-secondary border border-zinc-100 hover:border-secondary'
                    }`}
                >
                    All Orders ({orders.length})
                </button>
                <button
                    onClick={() => { setStatusFilter('assigned'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        statusFilter === 'assigned'
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-white text-secondary border border-zinc-100 hover:border-orange-500'
                    }`}
                >
                    Assigned ({orders.filter(o => o.status === 'Assigned_to_Kitchen').length})
                </button>
                <button
                    onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        statusFilter === 'completed'
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-white text-secondary border border-zinc-100 hover:border-emerald-500'
                    }`}
                >
                    Completed ({orders.filter(o => o.status === 'Completed').length})
                </button>
            </div>

            {/* Product and Date Filters */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product Filter */}
                    <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Filter by Product</label>
                        <select
                            value={productFilter}
                            onChange={(e) => { setProductFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-4 py-2.5 rounded-lg border border-zinc-100 text-[10px] font-bold text-secondary focus:outline-none focus:border-primary"
                        >
                            <option value="all">All Products</option>
                            {products.map(product => (
                                <option key={product} value={product}>{product}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Filter by Date</label>
                        <select
                            value={dateFilter}
                            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-4 py-2.5 rounded-lg border border-zinc-100 text-[10px] font-bold text-secondary focus:outline-none focus:border-primary"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <div className="p-5 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <MdReceipt size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-secondary tracking-tight uppercase">Kitchen Orders</h2>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
                        </div>
                    </div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-3 py-2 rounded-lg">{filteredOrders.length} Orders</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Bill/Order No</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Kitchen</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Items</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-zinc-400 font-bold">Loading...</td>
                                </tr>
                            ) : paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-zinc-400 font-bold">No orders found</td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <motion.tr
                                        key={order._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <span className="font-black text-secondary text-xs uppercase">{order.billNumber || order.orderNumber}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div>
                                                <p className="font-black text-secondary text-xs">{order.customer?.name || 'Guest'}</p>
                                                {order.customer?.phone && (
                                                    <p className="text-[8px] font-bold text-zinc-400">{order.customer.phone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[10px] font-bold text-zinc-600">{order.kitchen?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="text-[10px] font-bold text-zinc-600">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx}>{item.product?.name} x{item.quantity}</div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                order.status === 'Assigned_to_Kitchen' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {order.status === 'Completed' && <MdCheckCircle size={12} />}
                                                {order.status === 'Assigned_to_Kitchen' && <MdRestaurant size={12} />}
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className="font-black text-secondary text-sm">₹{order.totalAmount}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="text-[10px] font-bold text-zinc-400">
                                                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[8px]">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-5 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
                        <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-zinc-100 text-secondary hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <MdChevronLeft size={18} />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                                        currentPage === page
                                            ? 'bg-secondary text-primary shadow-lg'
                                            : 'bg-white text-secondary border border-zinc-100 hover:border-secondary'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-zinc-100 text-secondary hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <MdChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddBilling;
