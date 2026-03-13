import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MdTrendingUp,
    MdPeople,
    MdShoppingCart,
    MdAttachMoney,
    MdWarning,
    MdInventory,
    MdRestaurant,
    MdAssessment,
    MdChevronRight,
    MdAccessTime,
    MdCheckCircle,
    MdLocalShipping,
    MdAdd,
    MdReceipt,
    MdSwapHoriz,
    MdRefresh,
    MdNotifications,
    MdArrowUpward,
    MdArrowDownward
} from 'react-icons/md';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';
import toast from 'react-hot-toast';
import { getProducts, getBills, getKitchens, getUserInventory } from '../utils/api';
import DashboardSkeleton from '../components/DashboardSkeleton';

// Initialize 3D module
if (typeof Highcharts3D === 'function') {
    Highcharts3D(Highcharts);
}

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'super_admin';

    const [timeRange, setTimeRange] = useState('24h');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Role-based Quick Actions
    const roleQuickActions = {
        super_admin: [
            { title: 'Add Bulk Stock', icon: <MdAdd />, color: 'text-orange-600', bg: 'bg-orange-50', path: '/add-quantity', description: 'Restock master inventory' },
            { title: 'Inventory Assign', icon: <MdSwapHoriz />, color: 'text-purple-600', bg: 'bg-purple-50', path: '/product-assign', description: 'Allocate to admins' },
            { title: 'New Admin', icon: <MdPeople />, color: 'text-blue-600', bg: 'bg-blue-50', path: '/manage-admins', description: 'Add billing/kitchen admin' },
            { title: 'Add Kitchen', icon: <MdRestaurant />, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/add-kitchen', description: 'Register new node' },
        ],
        billing_admin: [
            { title: 'Add Billing', icon: <MdReceipt />, color: 'text-blue-600', bg: 'bg-blue-50', path: '/add-billing', description: 'Generate customer bill' },
            { title: 'Assign to Kitchen', icon: <MdRestaurant />, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/billing-management', description: 'Manage order flow' },
            { title: 'My Inventory', icon: <MdInventory />, color: 'text-purple-600', bg: 'bg-purple-50', path: '/my-inventory', description: 'Check your stock' },
            { title: 'Security', icon: <MdAssessment />, color: 'text-orange-600', bg: 'bg-orange-50', path: '/change-password', description: 'Update profile' },
        ],
        kitchen_admin: [
            { title: 'View Orders', icon: <MdRestaurant />, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/kitchen-orders', description: 'Active preparations' },
            { title: 'Stock Status', icon: <MdInventory />, color: 'text-orange-600', bg: 'bg-orange-50', path: '/my-inventory', description: 'Check ingredients' },
            { title: 'Stock Logs', icon: <MdAssessment />, color: 'text-blue-600', bg: 'bg-blue-50', path: '/day-stock', description: 'Usage history' },
            { title: 'Profile', icon: <MdPeople />, color: 'text-purple-600', bg: 'bg-purple-50', path: '/change-password', description: 'Security settings' },
        ]
    };

    const quickActions = roleQuickActions[role] || roleQuickActions.super_admin;

    // Stats with real-time simulation
    const [stats, setStats] = useState([
        { title: role === 'kitchen_admin' ? 'Active Orders' : 'Total Revenue', value: '₹0', icon: <MdAttachMoney />, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Live', isUp: true, rawValue: 0 },
        { title: role === 'kitchen_admin' ? 'Orders Ready' : 'Daily Orders', value: '0', icon: <MdShoppingCart />, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Live', isUp: true, rawValue: 0 },
        { title: (role === 'super_admin' || role === 'admin') ? 'Active Kitchens' : 'Stock Items', value: '0', icon: <MdRestaurant />, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Live', isUp: true, rawValue: 0 },
        { title: 'Alerts', value: '0', icon: <MdWarning />, color: 'text-red-600', bg: 'bg-red-50', trend: 'Items', isUp: false, rawValue: 0 },
    ]);

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartsData, setChartsData] = useState({
        revenue: { categories: [], series: [] },
        kitchen: { categories: [], series: [] },
        stock: { series: [] }
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    const fetchData = async () => {
        try {
            setLoading(true);

            // Single dashboard API call instead of multiple calls
            const dashboardRes = await fetch(`${API_URL}/api/auth/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).catch(() => ({ success: false }));

            if (dashboardRes.success) {
                const { stats, recentBills, products, kitchens } = dashboardRes;

                // Update stats quickly
                setStats(prev => {
                    const newStats = [...prev];
                    if (role === 'kitchen_admin') {
                        newStats[0].value = recentBills.filter(b => b.status === 'Processing').length.toString();
                        newStats[1].value = recentBills.filter(b => b.status === 'Ready').length.toString();
                    } else {
                        newStats[0].value = `₹${stats.todayRevenue?.toLocaleString() || 0}`;
                        newStats[1].value = stats.totalBills?.toString() || '0';
                    }
                    newStats[2].value = (role === 'super_admin' ? stats.totalKitchens : products.length).toString();
                    newStats[3].value = stats.lowStockCount?.toString() || '0';
                    return newStats;
                });

                // Map recent orders
                const mappedOrders = recentBills.map(b => ({
                    id: b.id || b.billNumber || b.orderNumber || 'N/A',
                    customer: b.customer?.name || 'Walk-in',
                    items: (b.items?.length || 0) + ' Items',
                    total: `₹${b.totalAmount || 0}`,
                    time: new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    status: (b.status || 'Pending').replace(/_/g, ' ')
                }));
                setRecentOrders(mappedOrders);

                // Simple chart data
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toLocaleDateString('en-IN', { weekday: 'short' });
                });

                setChartsData({
                    revenue: {
                        categories: last7Days,
                        series: [{
                            name: 'Revenue',
                            data: [12000, 15000, 18000, 14000, 20000, 16000, 22000],
                            color: '#F97316'
                        }]
                    },
                    kitchen: {
                        categories: kitchens.slice(0, 4).map(k => k.name || 'Kitchen'),
                        series: [{
                            name: 'Efficiency %',
                            data: [85, 92, 78, 88],
                            color: '#F97316'
                        }]
                    },
                    stock: {
                        series: [{
                            name: 'Stock',
                            colorByPoint: true,
                            data: [
                                { name: 'In Stock', y: Math.max(0, products.length - (stats.lowStockCount || 0)), color: '#10b981' },
                                { name: 'Low Stock', y: stats.lowStockCount || 0, color: '#f59e0b' },
                                { name: 'Out of Stock', y: 2, color: '#ef4444' }
                            ]
                        }]
                    }
                });
            } else {
                // Fallback to individual API calls if dashboard API fails
                const [prodRes, billRes] = await Promise.all([
                    (role === 'super_admin' || role === 'admin')
                        ? getProducts().catch(() => ({ data: { success: false, products: [] } }))
                        : getUserInventory().catch(() => ({ data: { success: false, inventory: [] } })),
                    getBills().catch(() => ({ data: { success: false, bills: [] } }))
                ]);

                // Process fallback data (simplified)
                if (billRes.data?.success) {
                    const bills = billRes.data.bills || [];
                    const mappedOrders = bills.slice(0, 6).map(b => ({
                        id: b.billNumber || 'N/A',
                        customer: b.customer?.name || 'Walk-in',
                        items: (b.items?.length || 0) + ' Items',
                        total: `₹${b.totalAmount || 0}`,
                        time: new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        status: (b.status || 'Pending').replace(/_/g, ' ')
                    }));
                    setRecentOrders(mappedOrders);
                }
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            // Set default values on error
            setStats(prev => prev.map(stat => ({ ...stat, value: '0' })));
            setRecentOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Refresh Dashboard
    const handleRefresh = async () => {
        setIsRefreshing(true);
        const loadingToast = toast.loading('Refreshing dashboard...');
        await fetchData();
        setIsRefreshing(false);
        toast.success('Dashboard refreshed!', { id: loadingToast });
    };

    // Navigate to page
    const handleQuickAction = (path) => {
        toast.success('Navigating...', { duration: 1000 });
        navigate(path);
    };

    // View all orders
    const viewAllOrders = () => {
        navigate(role === 'kitchen_admin' ? '/kitchen-orders' : '/billing-management');
    };

    // Revenue Trend Chart (Area Spline)
    const revenueChartOptions = {
        chart: {
            type: 'areaspline',
            backgroundColor: 'transparent',
            height: 300,
            animation: { duration: 2000, easing: 'easeOutBounce' }
        },
        title: { text: '' },
        credits: { enabled: false },
        legend: { enabled: false },
        xAxis: {
            categories: chartsData.revenue.categories,
            lineWidth: 0,
            tickWidth: 0,
            labels: { style: { color: '#94a3b8', fontSize: '10px', fontWeight: '800' } }
        },
        yAxis: {
            title: { text: '' },
            gridLineColor: '#f1f5f9',
            labels: {
                style: { color: '#94a3b8', fontSize: '10px', fontWeight: '800' },
                formatter: function () { return '₹' + this.value; }
            }
        },
        tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormat: '<div style="text-align: center; padding: 8px;"><div style="font-weight: 900; color: #2D1B0D; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Revenue</div><div style="font-size: 20px; font-weight: 900; color: #F97316;">₹{point.y}</div></div>',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#F97316',
            shadow: { color: 'rgba(249, 115, 22, 0.3)', offsetX: 0, offsetY: 4, opacity: 0.5, width: 10 }
        },
        plotOptions: {
            areaspline: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(249, 115, 22, 0.3)'],
                        [1, 'rgba(249, 115, 22, 0.01)']
                    ]
                },
                lineWidth: 3,
                marker: {
                    enabled: true,
                    radius: 5,
                    fillColor: '#F97316',
                    lineWidth: 3,
                    lineColor: '#ffffff',
                    states: { hover: { radius: 7, lineWidth: 4 } }
                },
                animation: { duration: 2000 }
            }
        },
        series: chartsData.revenue.series
    };

    // Kitchen Performance Chart (3D Column)
    const kitchenChartOptions = {
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            height: 300,
            animation: { duration: 2000 },
            options3d: { enabled: true, alpha: 15, beta: 15, depth: 50, viewDistance: 25 }
        },
        title: { text: '' },
        credits: { enabled: false },
        xAxis: {
            categories: chartsData.kitchen.categories,
            labels: { style: { color: '#94a3b8', fontSize: '9px', fontWeight: '800' } }
        },
        yAxis: {
            title: { text: '' },
            gridLineColor: '#f1f5f9',
            labels: {
                style: { color: '#94a3b8', fontSize: '10px', fontWeight: '800' },
                formatter: function () { return this.value + '%'; }
            }
        },
        tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormat: '<div style="text-align: center; padding: 8px;"><div style="font-weight: 900; color: #2D1B0D; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">{point.category}</div><div style="font-size: 18px; font-weight: 900; color: #F97316;">{point.y}% Efficiency</div></div>',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#F97316'
        },
        plotOptions: {
            column: {
                depth: 40,
                colorByPoint: true,
                colors: [
                    { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#F97316'], [1, '#ea580c']] },
                    { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#3b82f6'], [1, '#2563eb']] },
                    { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#10b981'], [1, '#059669']] },
                    { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#8b5cf6'], [1, '#7c3aed']] }
                ],
                dataLabels: {
                    enabled: true,
                    format: '{point.y}%',
                    style: { fontSize: '10px', fontWeight: '900', color: '#ffffff', textOutline: 'none' }
                },
                animation: { duration: 2000, easing: 'easeOutBounce' }
            }
        },
        series: chartsData.kitchen.series
    };

    // Stock Distribution Chart (3D Donut Pie)
    const stockChartOptions = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            height: 300,
            animation: { duration: 2000 },
            options3d: { enabled: true, alpha: 45, beta: 0 }
        },
        title: { text: '' },
        credits: { enabled: false },
        tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormat: '<div style="text-align: center; padding: 8px;"><div style="font-weight: 900; color: #2D1B0D; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">{point.name}</div><div style="font-size: 18px; font-weight: 900; color: #F97316;">{point.y} Items</div></div>',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#F97316'
        },
        plotOptions: {
            pie: {
                innerSize: '60%',
                depth: 45,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y}',
                    distance: -30,
                    style: { fontSize: '10px', fontWeight: '900', color: '#ffffff', textOutline: 'none' }
                },
                showInLegend: false,
                animation: { duration: 2000, easing: 'easeOutBounce' },
                states: { hover: { halo: { size: 10 } } }
            }
        },
        series: chartsData.stock.series
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>

                    {/* --- Compact Header --- */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                                    <MdAssessment size={16} />
                                </div>
                                <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Business Insights</span>
                            </div>
                            <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Overview Dashboard</h1>
                            <p className="text-zinc-500 text-[11px] font-medium">Welcome back, {role.replace('_', ' ')}! ({user.email}) - {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 bg-white text-secondary border border-zinc-100 px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-all font-bold text-xs shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                <MdRefresh size={16} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
                            </button>
                            <div className="flex bg-white p-1 rounded-xl border border-zinc-100 shadow-sm">
                                {['24h', '7d', '30d'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${timeRange === range ? 'bg-secondary text-primary shadow-lg' : 'text-zinc-400 hover:text-secondary'}`}
                                    >
                                        {range === '24h' ? 'Last 24h' : range === '7d' ? '7 Days' : '30 Days'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- Stats Grid --- */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm group hover:border-primary/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                                        {stat.icon}
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase flex items-center gap-1 ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {stat.isUp ? <MdArrowUpward size={10} /> : <MdArrowDownward size={10} />}
                                        {stat.trend}
                                    </div>
                                </div>
                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.title}</p>
                                <h3 className="text-xl font-black text-secondary leading-none">{stat.value}</h3>
                            </motion.div>
                        ))}
                    </div>

                    {/* --- Quick Actions --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                    <MdNotifications size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-secondary tracking-tight uppercase">Quick Actions</h2>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Frequently Used Features</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {quickActions.map((action, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleQuickAction(action.path)}
                                        className="bg-zinc-50 hover:bg-white border border-zinc-100 hover:border-primary/30 p-4 rounded-xl transition-all group"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${action.bg} ${action.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform mx-auto mb-3`}>
                                            {action.icon}
                                        </div>
                                        <h3 className="text-xs font-black text-secondary uppercase tracking-tight mb-1">{action.title}</h3>
                                        <p className="text-[8px] text-zinc-400 font-bold uppercase">{action.description}</p>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* --- Revenue Trend Chart --- */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-8"
                        >
                            <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                                            <MdTrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-secondary tracking-tight uppercase">Revenue Trend</h2>
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Weekly Performance</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[9px] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                        <MdTrendingUp size={14} />
                                        Live Tracking
                                    </div>
                                </div>
                                <HighchartsReact highcharts={Highcharts} options={revenueChartOptions} />
                            </div>
                        </motion.div>

                        {/* --- Recent Orders --- */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-4"
                        >
                            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-premium overflow-hidden">
                                <div className="p-5 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                                            <MdShoppingCart size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-secondary tracking-tight uppercase">Recent Orders</h2>
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Latest Activity</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={viewAllOrders}
                                        className="text-primary font-bold text-[9px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
                                    >
                                        View All <MdChevronRight size={14} />
                                    </button>
                                </div>

                                <div className="max-h-[350px] overflow-y-auto">
                                    {recentOrders.map((order, i) => (
                                        <div key={i} className="p-4 border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors cursor-pointer">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-black text-secondary">{order.id}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] font-bold text-zinc-600">{order.customer}</p>
                                                    <p className="text-[8px] text-zinc-400 mt-1">{order.items}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-secondary">{order.total}</p>
                                                    <p className="text-[7px] text-zinc-400 flex items-center gap-1 mt-1">
                                                        <MdAccessTime size={10} /> {order.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* --- Kitchen & Stock Charts --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Kitchen Performance */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shadow-inner">
                                        <MdRestaurant size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-secondary tracking-tight uppercase">Kitchen Efficiency</h2>
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Performance Metrics</p>
                                    </div>
                                </div>
                                <HighchartsReact highcharts={Highcharts} options={kitchenChartOptions} />
                            </div>
                        </motion.div>

                        {/* Stock Distribution */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                                        <MdInventory size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-secondary tracking-tight uppercase">Stock Status</h2>
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Inventory Overview</p>
                                    </div>
                                </div>
                                <HighchartsReact highcharts={Highcharts} options={stockChartOptions} />
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
