import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Activity,
    CloudSun,
    Info,
    ChevronDown,
    Download
} from 'lucide-react';

const DayWiseStock = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Mock stock movement data
    const stockMovements = [
        { id: 1, item: 'Regular Gol Gappe (6pcs)', opening: 1200, added: 500, sold: 450, balanced: 1250, waste: 20, status: 'Surplus' },
        { id: 2, item: 'Dahi Bhalla', opening: 400, added: 100, sold: 120, balanced: 380, waste: 5, status: 'Deficit' },
        { id: 3, item: 'Masala Water (1L)', opening: 80, added: 40, sold: 35, balanced: 85, waste: 2, status: 'Surplus' },
        { id: 4, item: 'Papdi Chaat', opening: 250, added: 50, sold: 80, balanced: 220, waste: 3, status: 'Deficit' },
        { id: 5, item: 'Aloo Tikki', opening: 300, added: 150, sold: 140, balanced: 310, waste: 10, status: 'Surplus' },
    ];

    const filteredMovements = stockMovements.filter(m =>
        m.item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-primary">
                            <CloudSun size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[10px] uppercase italic">Daily Consumption Log</span>
                    </div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">Day Wise Stock</h1>
                    <p className="text-zinc-500 font-medium mt-1">Detailed analysis of stock movement for {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group w-full md:w-auto">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                        <input
                            type="date"
                            className="bg-white border-2 border-zinc-100 rounded-[1.5rem] py-4 pl-16 pr-8 font-black text-secondary outline-none focus:border-primary transition-all shadow-sm"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <button className="w-full md:w-auto bg-secondary text-white px-8 py-4.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Daily Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Sales', value: '₹14,500', trend: '+12%', icon: <TrendingUp />, color: 'bg-green-50 text-green-700' },
                    { label: 'Total Waste', value: '45 Units', trend: '-2%', icon: <Package />, color: 'bg-red-50 text-red-600' },
                    { label: 'Efficiency', value: '96.4%', trend: '+0.5%', icon: <Activity />, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Inventory Value', value: '₹84,200', trend: 'Healthy', icon: <TrendingUp />, color: 'bg-orange-50 text-orange-600' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-5 rounded-3xl border-2 border-zinc-50 shadow-premium group hover:border-primary/20 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg shadow-zinc-50 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-secondary mt-1 tracking-tighter">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Analysis Table */}
            <div className="bg-white rounded-3xl border-2 border-zinc-50 shadow-premium overflow-hidden">
                <div className="p-6 bg-[#fafafa] border-b-2 border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find item entry..."
                            className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-secondary outline-none focus:border-primary shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-4 py-2.5 rounded-xl shadow-sm">Showing {filteredMovements.length} Records</span>
                        <div className="w-px h-8 bg-zinc-200 mx-2" />
                        <button className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-widest bg-primary px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            <Filter size={14} /> Filter Columns
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50">
                                <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Product Information</th>
                                <th className="px-8 py-7 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Opening</th>
                                <th className="px-8 py-7 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Added (+)</th>
                                <th className="px-8 py-7 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Sold (-)</th>
                                <th className="px-8 py-7 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Final Bal</th>
                                <th className="px-8 py-7 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Waste</th>
                                <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredMovements.map((m, i) => (
                                <tr key={m.id} className="group hover:bg-orange-50/20 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-primary font-black border border-zinc-100 group-hover:bg-white transition-all shadow-sm">
                                                {m.item.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-secondary text-sm uppercase">{m.item}</h4>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Entry #{1000 + m.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-center font-bold text-zinc-500">{m.opening}</td>
                                    <td className="px-8 py-7 text-center font-black text-green-600">+{m.added}</td>
                                    <td className="px-8 py-7 text-center font-black text-red-500">-{m.sold}</td>
                                    <td className="px-8 py-7 text-center">
                                        <div className="inline-block px-4 py-2 bg-secondary text-white rounded-xl font-black text-sm">
                                            {m.balanced}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-center font-bold text-orange-600">{m.waste}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${m.status === 'Surplus' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {m.status === 'Surplus' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            {m.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-zinc-50 border-t-2 border-zinc-100 flex items-center justify-center">
                    <div className="flex bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm gap-4 items-center px-8">
                        <Info size={20} className="text-primary" />
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            System auto-calibrates stock every midnight. Manual override available in settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayWiseStock;
