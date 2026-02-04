import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Package,
    ChevronRight
} from 'lucide-react';

const StatCard = ({ title, value, icon, color, trend, trendValue, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        className="bg-white p-5 rounded-3xl shadow-premium border border-zinc-100 flex flex-col gap-3 transition-all hover:shadow-xl"
    >
        <div className="flex justify-between items-start">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1] === 'primary' ? 'primary-dark' : color.split('-')[1] + '-700'}`}>
                {icon}
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${trend === 'up' ? 'bg-accent/10 text-accent' : 'bg-red-100 text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trendValue}
            </div>
        </div>
        <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-black text-secondary mt-1">{value}</h3>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const recentOrders = [
        { id: '#BK-9921', customer: 'Rahul Sharma', items: '2x Gol Gappe, 1x Chaat', total: '₹140', time: '5 mins ago', status: 'Completed' },
        { id: '#BK-9920', customer: 'Anita Singh', items: '1x Aloo Tikki', total: '₹50', time: '12 mins ago', status: 'Pending' },
        { id: '#BK-9919', customer: 'Karan Mehra', items: '3x Dahi Bhalla', total: '₹180', time: '25 mins ago', status: 'Completed' },
        { id: '#BK-9918', customer: 'Suresh Kumar', items: '1x Mix Chaat', total: '₹80', time: '1 hour ago', status: 'Completed' },
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span className="text-primary font-bold tracking-widest text-xs uppercase italic">Business Insights</span>
                    <h1 className="text-4xl font-black text-secondary mt-1 tracking-tight">Overview Dashboard</h1>
                    <p className="text-zinc-500 font-medium">Welcome back, Super Admin! Here's what's happening today.</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm w-fit">
                    <button className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold text-sm shadow-lg">Last 24h</button>
                    <button className="px-6 py-2.5 rounded-xl text-zinc-500 font-bold text-sm hover:text-secondary transition-colors">7 Days</button>
                    <button className="px-6 py-2.5 rounded-xl text-zinc-500 font-bold text-sm hover:text-secondary transition-colors">30 Days</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard index={0} title="Total Revenue" value="₹45,230" icon={<DollarSign />} color="bg-blue-200" trend="up" trendValue="+12.5%" />
                <StatCard index={1} title="Daily Orders" value="124" icon={<ShoppingBag />} color="bg-orange-200" trend="up" trendValue="+8.2%" />
                <StatCard index={2} title="Active Customers" value="892" icon={<Users />} color="bg-purple-200" trend="up" trendValue="+5.1%" />
                <StatCard index={3} title="Inventory Alert" value="Low" icon={<Package />} color="bg-red-200" trend="down" trendValue="4 Critical" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sales Activity - Large Area */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-zinc-100 shadow-premium min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-secondary tracking-tight">Sales Performance</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time revenue tracking</p>
                        </div>
                        <div className="flex items-center gap-2 text-accent font-bold text-sm bg-accent/5 px-4 py-2 rounded-xl">
                            <TrendingUp size={16} />
                            Live tracking active
                        </div>
                    </div>

                    {/* Visual Placeholder for Chart */}
                    <div className="flex-1 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center p-12 text-center group transition-all">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-300 border border-zinc-100 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp size={32} />
                        </div>
                        <h3 className="text-secondary/40 font-black text-xl uppercase tracking-tighter">Growth Analytics Chart</h3>
                        <p className="text-zinc-400 text-sm max-w-[250px] mt-2 font-medium">Detailed sales breakdown by category and time will be displayed here.</p>
                    </div>
                </div>

                {/* Recent Transactions - Smaller Side Area */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-premium flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-secondary uppercase tracking-tighter">Recent Orders</h2>
                            <button className="text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {recentOrders.map((order, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    key={order.id}
                                    className="flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-primary border border-zinc-100 group-hover:bg-primary/5 transition-colors">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-secondary text-sm">{order.customer}</h4>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">{order.id} • {order.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-secondary">{order.total}</p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${order.status === 'Completed' ? 'bg-accent/10 text-accent' : 'bg-orange-100 text-orange-600'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Action / Notice */}
                    <div className="bg-secondary p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-white font-black text-xl leading-tight">System Ready for<br />New Orders!</h3>
                            <p className="text-white/40 text-xs font-bold mt-2 uppercase tracking-widest">Inventory synced 2m ago</p>
                            <button className="mt-6 bg-primary text-secondary font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                                Manage menu
                            </button>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
