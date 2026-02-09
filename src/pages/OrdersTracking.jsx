import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdShoppingCart, MdPerson, MdPayment, MdLocalShipping, MdRestaurant, MdSearch } from 'react-icons/md';
import toast from 'react-hot-toast';

const OrdersTracking = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/billing', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.bills || []);
            }
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-700',
            'Paid': 'bg-green-100 text-green-700',
            'Assigned_to_Kitchen': 'bg-blue-100 text-blue-700',
            'Processing': 'bg-purple-100 text-purple-700',
            'Ready': 'bg-teal-100 text-teal-700',
            'Completed': 'bg-emerald-100 text-emerald-700',
            'Cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredOrders = (orders || []).filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = order.billNumber?.toLowerCase().includes(search.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                        <MdShoppingCart size={16} />
                    </div>
                    <span className="text-primary font-black tracking-widest text-[9px] uppercase">Tracking</span>
                </div>
                <h1 className="text-3xl font-black text-secondary">Orders Tracking</h1>
                <p className="text-zinc-500 text-[11px] font-medium">Monitor all orders, payments & delivery status</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by bill number or customer..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-primary"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-primary font-bold"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Assigned_to_Kitchen">Assigned to Kitchen</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready">Ready</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders Grid */}
            <div className="grid gap-4">
                {filteredOrders.map((order, i) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Order Info */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <MdShoppingCart size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-secondary text-lg">#{order.billNumber}</h3>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Customer */}
                                    <div className="flex items-center gap-2">
                                        <MdPerson className="text-zinc-400" />
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase font-bold">Customer</p>
                                            <p className="text-sm font-bold text-secondary">
                                                {order.customer?.name || 'Walk-in'}
                                            </p>
                                            {order.customer?.phone && (
                                                <p className="text-xs text-zinc-500">{order.customer.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div className="flex items-center gap-2">
                                        <MdPayment className="text-zinc-400" />
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase font-bold">Payment</p>
                                            <p className="text-sm font-bold text-secondary">
                                                ₹{order.totalAmount}
                                            </p>
                                            <p className="text-xs text-zinc-500">{order.paymentMethod || 'Cash'}</p>
                                        </div>
                                    </div>

                                    {/* Kitchen */}
                                    <div className="flex items-center gap-2">
                                        <MdRestaurant className="text-zinc-400" />
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase font-bold">Kitchen</p>
                                            <p className="text-sm font-bold text-secondary">
                                                {order.kitchen?.name || 'Not Assigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex flex-wrap gap-2">
                                    {order.items?.map((item, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-zinc-50 rounded-lg text-xs font-bold text-secondary">
                                            {item.product?.name || 'Item'} x{item.quantity}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${getStatusColor(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <MdLocalShipping />
                                    <span>Order ID: {order._id.slice(-6)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                    <MdShoppingCart className="mx-auto text-zinc-300 mb-4" size={64} />
                    <p className="text-zinc-400 font-bold">No orders found</p>
                </div>
            )}
        </div>
    );
};

export default OrdersTracking;
