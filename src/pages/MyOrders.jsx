import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaHistory, FaBox, FaClock, FaCheckCircle,
    FaMotorcycle, FaArrowLeft, FaShoppingBag, FaBoxOpen, FaUtensils
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '../utils/api';
import toast from 'react-hot-toast';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await getUserOrders();
            if (response.data.success) {
                setOrders(response.data.bills);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load your orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-amber-100 text-amber-600 border-amber-200',
            'Paid': 'bg-blue-100 text-blue-600 border-blue-200',
            'Assigned_to_Kitchen': 'bg-indigo-100 text-indigo-600 border-indigo-200',
            'Processing': 'bg-purple-100 text-purple-600 border-purple-200',
            'Ready': 'bg-emerald-100 text-emerald-600 border-emerald-200',
            'Completed': 'bg-green-100 text-green-600 border-green-200',
            'Cancelled': 'bg-red-100 text-red-600 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <FaCheckCircle />;
            case 'Processing': return <FaClock className="animate-spin" />;
            case 'Ready': return <FaBox />;
            case 'Assigned_to_Kitchen': return <FaMotorcycle />;
            default: return <FaHistory />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/user-dashboard')}
                        className="flex items-center gap-2 text-secondary/40 hover:text-secondary font-black uppercase tracking-widest text-[10px] transition-colors mb-2"
                    >
                        <FaArrowLeft /> Back to Menu
                    </button>
                    <h1 className="text-3xl font-black italic text-secondary">My Order History</h1>
                    <p className="text-secondary/50 text-xs font-medium">Track and reorder your favorite Gol Gappes</p>
                </div>

                <div className="bg-white px-4 py-2 rounded-2xl border border-primary/10 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <FaShoppingBag />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Total Orders</p>
                        <p className="text-lg font-black text-secondary">{orders.length}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
            ) : orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map((order, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={order._id}
                            className="bg-white rounded-[2.5rem] border border-primary/10 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                        >
                            <div className="p-6 md:p-8 space-y-6">
                                {/* Order Top Info */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/5 pb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Order ID: #{order.billNumber}</p>
                                        <p className="text-sm font-bold text-secondary">Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status.replace(/_/g, ' ')}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-[#F9F6F0] rounded-2xl overflow-hidden flex-shrink-0 border border-primary/5">
                                                {item.product?.thumbnail ? (
                                                    <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                                        <FaUtensils size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-base font-black italic text-secondary">{item.product?.name || 'Item'}</h4>
                                                <p className="text-xs text-secondary/50 font-bold uppercase tracking-widest">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="text-lg font-black text-secondary">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-primary/5 bg-gray-50/50 -mx-8 -mb-8 px-8 py-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <FaMotorcycle size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Served From</p>
                                            <p className="text-xs font-bold text-secondary">{order.kitchen?.name} ({order.kitchen?.location})</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Total Paid</p>
                                            <p className="text-2xl font-black text-secondary">₹{order.totalAmount}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/product/${order.items[0].product._id}`)}
                                            className="bg-primary text-secondary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-primary-dark hover:text-white transition-all active:scale-95"
                                        >
                                            Reorder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-primary/20 space-y-4">
                    <div className="text-6xl text-primary/30 flex justify-center">
                        <FaBoxOpen />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black italic text-secondary">No orders yet!</h3>
                        <p className="text-secondary/50 text-sm font-medium">Your cravings are waiting to be satisfied.</p>
                    </div>
                    <button
                        onClick={() => navigate('/user-dashboard')}
                        className="bg-primary text-secondary px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark hover:text-white transition-all inline-block mt-4"
                    >
                        Browse Menu
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
