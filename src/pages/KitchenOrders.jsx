import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdRestaurant, MdTimer, MdCheckCircle, MdSearch, MdChevronRight, MdLocalFireDepartment, MdUpdate, MdPrint } from 'react-icons/md';
import { getKitchenOrders, updateBillStatus } from '../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const KitchenOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Assigned_to_Kitchen');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getKitchenOrders();
            if (response.data.success) {
                setOrders(response.data.bills);
            }
        } catch (error) {
            toast.error('Failed to load kitchen orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await updateBillStatus(id, newStatus);
            if (response.data.success) {
                toast.success(`Order set to ${newStatus.replace(/_/g, ' ')}`);
                fetchOrders();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const activeOrders = orders.filter(o => o.status === filter);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600 border border-orange-200 shadow-sm">
                            <MdLocalFireDepartment size={16} />
                        </div>
                        <span className="text-orange-600 font-black tracking-widest text-[9px] uppercase italic bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">Live Kitchen Feed</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Command Center</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Manage and process active orders from the billing system.</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-zinc-100 shadow-sm">
                    {['Assigned_to_Kitchen', 'Processing', 'Ready'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${filter === status
                                    ? 'bg-secondary text-primary shadow-lg shadow-secondary/20'
                                    : 'text-zinc-400 hover:text-secondary'
                                }`}
                        >
                            {status.replace(/_/g, ' ')}
                            <span className="ml-2 bg-zinc-100 px-2 py-0.5 rounded-md text-[8px]">
                                {orders.filter(o => o.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {activeOrders.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-zinc-400 font-bold uppercase tracking-widest">
                            No active orders in this queue.
                        </div>
                    ) : activeOrders.map((order, i) => (
                        <motion.div
                            key={order._id}
                            layout
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-premium overflow-hidden group hover:border-orange-200 transition-all flex flex-col"
                        >
                            <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-black text-secondary text-lg leading-none">#{order.billNumber.slice(-6)}</h3>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors">
                                        <MdPrint size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 flex-1 space-y-4">
                                {/* Items List */}
                                <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center font-black text-secondary text-xs">
                                                    {item.quantity}
                                                </div>
                                                <p className="text-sm font-black text-secondary">{item.product?.name || 'Deleted Product'}</p>
                                            </div>
                                            <MdChevronRight className="text-zinc-300" />
                                        </div>
                                    ))}
                                </div>

                                {/* Customer Info */}
                                <div className="pt-4 border-t border-zinc-50 flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    <span>{order.customer?.name || 'Walk-in'}</span>
                                    <span className="text-secondary">{order.paymentMethod}</span>
                                </div>
                            </div>

                            <div className="p-6 pt-0">
                                {filter === 'Assigned_to_Kitchen' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order._id, 'Processing')}
                                        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                                    >
                                        <MdTimer size={18} className="group-hover:rotate-45 transition-transform" />
                                        Start Preparation
                                    </button>
                                )}
                                {filter === 'Processing' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order._id, 'Ready')}
                                        className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                                    >
                                        <MdUpdate size={18} className="animate-pulse" />
                                        Mark as Ready
                                    </button>
                                )}
                                {filter === 'Ready' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order._id, 'Completed')}
                                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <MdCheckCircle size={18} />
                                        Serve Order
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default KitchenOrders;
