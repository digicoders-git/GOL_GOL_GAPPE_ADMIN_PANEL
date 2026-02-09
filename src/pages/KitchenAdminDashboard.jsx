import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdInventory, MdShoppingCart, MdTrendingUp, MdPeople, MdHistory, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import toast from 'react-hot-toast';

const KitchenAdminDashboard = () => {
    const [kitchen, setKitchen] = useState(null);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKitchenData();
    }, []);

    const fetchKitchenData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            
            // Fetch kitchen info
            const kitchenRes = await fetch('http://localhost:5000/api/kitchens', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const kitchenData = await kitchenRes.json();
            const myKitchen = kitchenData.kitchens?.find(k => k.admin?.toString() === user.id);
            setKitchen(myKitchen);

            // Fetch orders
            const ordersRes = await fetch('http://localhost:5000/api/billing/kitchen-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const ordersData = await ordersRes.json();
            if (ordersData.success) {
                setOrders(ordersData.bills);
            }

            // Fetch inventory
            const inventoryRes = await fetch('http://localhost:5000/api/products/user-inventory', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const inventoryData = await inventoryRes.json();
            if (inventoryData.success) {
                setInventory(inventoryData.inventory);
            }

            // Fetch stock transfers
            const transferRes = await fetch('http://localhost:5000/api/products/transfer-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const transferData = await transferRes.json();
            if (transferData.success) {
                const myTransfers = transferData.transfers.filter(
                    t => t.toUser?._id === user._id || t.toUser === user._id
                );
                setTransfers(myTransfers);
            }
        } catch (error) {
            toast.error('Failed to load kitchen data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!kitchen) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <MdRestaurant className="mx-auto text-zinc-300 mb-4" size={64} />
                    <p className="text-zinc-500 font-bold">No kitchen assigned to you</p>
                </div>
            </div>
        );
    }

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Assigned_to_Kitchen').length;
    const processingOrders = orders.filter(o => o.status === 'Processing').length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                        <MdRestaurant size={16} />
                    </div>
                    <span className="text-primary font-black tracking-widest text-[9px] uppercase">My Kitchen</span>
                </div>
                <h1 className="text-3xl font-black text-secondary">{kitchen.name}</h1>
                <p className="text-zinc-500 text-[11px] font-medium">{kitchen.location}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <MdTrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold">Total Revenue</p>
                            <p className="text-2xl font-black text-secondary">₹{totalRevenue}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <MdShoppingCart size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold">Pending Orders</p>
                            <p className="text-2xl font-black text-secondary">{pendingOrders}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <MdHistory size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold">Processing</p>
                            <p className="text-2xl font-black text-secondary">{processingOrders}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <MdInventory size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold">Stock Items</p>
                            <p className="text-2xl font-black text-secondary">{inventory.length}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Stock Assignments */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-lg overflow-hidden">
                <div className="p-5 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <MdArrowForward size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-secondary tracking-tight uppercase">Stock Assignments</h2>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Received from Admin</p>
                        </div>
                    </div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-3 py-2 rounded-lg">{transfers.length} Transfers</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Product</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">From</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Quantity</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Notes</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {transfers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-zinc-400 font-bold">No stock assignments yet</td>
                                </tr>
                            ) : (
                                transfers.slice(0, 10).map((transfer) => (
                                    <motion.tr
                                        key={transfer._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-zinc-100 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-200 group-hover:bg-primary/10 transition-all shadow-inner text-xs">
                                                    {transfer.product?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-secondary text-xs uppercase tracking-tight leading-none mb-1">{transfer.product?.name || 'Unknown'}</h4>
                                                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{transfer.product?.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                    <MdPeople size={16} />
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-600">
                                                    {transfer.fromUser?.name || transfer.fromUser?.email?.split('@')[0] || 'Admin'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-block px-3 py-1.5 bg-secondary text-white rounded-lg font-black text-xs shadow-sm">
                                                {transfer.quantity} {transfer.product?.unit || ''}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-[10px] text-zinc-500 font-medium max-w-xs truncate">
                                                {transfer.notes || '-'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="text-[10px] font-bold text-zinc-400">
                                                <p>{new Date(transfer.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[8px]">{new Date(transfer.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-lg p-6">
                <h2 className="text-xl font-black text-secondary mb-4">Recent Orders</h2>
                <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <MdShoppingCart />
                                </div>
                                <div>
                                    <p className="font-bold text-secondary">#{order.billNumber}</p>
                                    <p className="text-xs text-zinc-500">{order.customer?.name || 'Walk-in'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-secondary">₹{order.totalAmount}</p>
                                <span className={`text-xs px-2 py-1 rounded-lg ${
                                    order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Inventory */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-lg p-6">
                <h2 className="text-xl font-black text-secondary mb-4">Current Inventory</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {inventory.map((item) => (
                        <div key={item._id} className="p-4 bg-zinc-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <MdInventory />
                                </div>
                                <div>
                                    <p className="font-bold text-secondary">{item.product?.name}</p>
                                    <p className="text-xs text-zinc-500">Qty: {item.quantity} {item.product?.unit}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KitchenAdminDashboard;
