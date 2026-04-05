import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant, MdShoppingCart, MdInventory, MdTrendingUp, MdCheckCircle, MdAccessTime } from 'react-icons/md';
import toast from 'react-hot-toast';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const BillingAdminDashboard = () => {
    const [kitchen, setKitchen] = useState(null);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState({ categories: [], series: [] });

    const fetchKitchenData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const timestamp = new Date().getTime();

            const kitchenRes = await fetch(`${API_URL}/api/billing-admin/my-kitchen?t=${timestamp}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });
            const kitchenData = await kitchenRes.json();

            if (kitchenData.success) {
                console.log('Kitchen data:', kitchenData.kitchen);
                setKitchen(kitchenData.kitchen);
            }

            const ordersRes = await fetch(`${API_URL}/api/billing-admin/my-kitchen/orders?t=${timestamp}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });
            const ordersData = await ordersRes.json();
            if (ordersData.success) {
                console.log('Orders data:', ordersData.orders);
                const fetchedOrders = ordersData.orders || [];
                setOrders(fetchedOrders);

                // Calculate last 7 days revenue
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                });

                const dailyRevenue = last7Days.map(day => {
                    const dayStr = day.toDateString();
                    return fetchedOrders
                        .filter(o => new Date(o.createdAt).toDateString() === dayStr)
                        .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || parseFloat(o.total) || 0), 0);
                });

                const dayLabels = last7Days.map(d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));

                setRevenueData({
                    categories: dayLabels,
                    series: [{ name: 'Revenue (₹)', data: dailyRevenue, color: '#F97316' }]
                });
            }

            const inventoryRes = await fetch(`${API_URL}/api/billing-admin/my-kitchen/inventory?t=${timestamp}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });
            const inventoryData = await inventoryRes.json();
            if (inventoryData.success) {
                setInventory(inventoryData.inventory);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load kitchen data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKitchenData();
        const interval = setInterval(fetchKitchenData, 5000);
        return () => clearInterval(interval);
    }, []);

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
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Assigned_to_Kitchen').length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    const totalAssigned = kitchen?.assignedProducts?.reduce((sum, ap) => sum + (ap.assigned || 0), 0) || 0;

    console.log('Stats:', { totalRevenue, totalOrders, pendingOrders, completedOrders, totalAssigned });

    const revenueChartOptions = {
        chart: { type: 'area', backgroundColor: 'transparent', height: 280 },
        title: { text: '' },
        xAxis: {
            categories: revenueData.categories,
            labels: { style: { fontWeight: 'bold', color: '#64748b', fontSize: '10px' } }
        },
        yAxis: {
            title: { text: 'Revenue (₹)', style: { fontWeight: 'bold' } },
            labels: {
                style: { fontWeight: 'bold', color: '#64748b' },
                formatter: function() { return '₹' + this.value.toLocaleString('en-IN'); }
            }
        },
        tooltip: {
            formatter: function() {
                return '<b>' + this.x + '</b><br/>Revenue: <b>₹' + this.y.toLocaleString('en-IN', {minimumFractionDigits: 2}) + '</b>';
            }
        },
        series: revenueData.series,
        credits: { enabled: false },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [[0, 'rgba(249, 115, 22, 0.3)'], [1, 'rgba(249, 115, 22, 0)']]
                },
                marker: { radius: 4, fillColor: '#F97316' },
                lineWidth: 3,
                lineColor: '#F97316'
            }
        }
    };

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                            <p className="text-2xl font-black text-secondary">{totalOrders}</p>
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
                            <MdAccessTime size={24} />
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
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <MdCheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold">Completed Orders</p>
                            <p className="text-2xl font-black text-secondary">{completedOrders}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <MdInventory size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-bold">Total Assigned</p>
                            <p className="text-2xl font-black text-secondary">
                                {totalAssigned}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Revenue Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border border-zinc-100 shadow-lg p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <MdTrendingUp size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-secondary">Revenue Trend</h2>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Last 7 Days</p>
                    </div>
                </div>
                <HighchartsReact highcharts={Highcharts} options={revenueChartOptions} />
            </motion.div>

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
                                    <p className="font-bold text-secondary">#{order.orderNumber || order.billNumber}</p>
                                    <p className="text-xs text-zinc-500">{order.customer?.name || 'Walk-in'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-secondary">₹{order.totalAmount}</p>
                                <span className={`text-xs px-2 py-1 rounded-lg ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kitchen?.assignedProducts?.map((ap) => {
                        const product = ap.product || {};
                        const assigned = ap.assigned || 0;
                        const used = ap.used || 0;
                        const remaining = assigned - used;

                        return (
                            <div key={ap._id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <MdInventory />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-secondary text-sm uppercase tracking-tight">{product.name}</p>
                                            <span className="text-[8px] font-black bg-white px-2 py-0.5 rounded-full border border-zinc-100 text-zinc-400">{product.unit}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{product.category}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white p-2 rounded-lg border border-zinc-100 text-center shadow-sm">
                                        <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-1 leading-none">Assigned</p>
                                        <p className="text-xs font-black text-emerald-600 leading-none">{assigned}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-zinc-100 text-center shadow-sm">
                                        <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-1 leading-none">Used</p>
                                        <p className="text-xs font-black text-red-600 leading-none">{used}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-zinc-100 text-center shadow-sm">
                                        <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-1 leading-none">Remain</p>
                                        <p className="text-xs font-black text-blue-600 leading-none">{remaining}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BillingAdminDashboard;
