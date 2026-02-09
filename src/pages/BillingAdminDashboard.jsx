import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdShoppingCart, MdInventory, MdTrendingUp } from 'react-icons/md';
import toast from 'react-hot-toast';

const BillingAdminDashboard = () => {
    const [kitchen, setKitchen] = useState(null);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKitchenData();
    }, []);

    const fetchKitchenData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const kitchenRes = await fetch('http://localhost:5000/api/billing-admin/my-kitchen', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const kitchenData = await kitchenRes.json();
            
            if (kitchenData.success) {
                setKitchen(kitchenData.kitchen);
            }

            const ordersRes = await fetch('http://localhost:5000/api/billing-admin/my-kitchen/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const ordersData = await ordersRes.json();
            if (ordersData.success) {
                setOrders(ordersData.orders);
            }

            const inventoryRes = await fetch('http://localhost:5000/api/billing-admin/my-kitchen/inventory', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const inventoryData = await inventoryRes.json();
            if (inventoryData.success) {
                setInventory(inventoryData.inventory);
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
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6">
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
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <MdShoppingCart size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold">Total Orders</p>
                            <p className="text-2xl font-black text-secondary">{orders.length}</p>
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
                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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

export default BillingAdminDashboard;
