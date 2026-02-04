import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Download,
    Eye,
    ChevronDown,
    Layers,
    PieChart,
    Target,
    Zap
} from 'lucide-react';

const MonthWiseStock = () => {
    const [selectedMonth, setSelectedMonth] = useState('2024-02');
    const [searchQuery, setSearchQuery] = useState('');

    const monthlyStats = [
        { label: 'Total Procured', value: '₹2.4L', trend: '+15%', icon: <BarChart3 />, color: 'bg-blue-50 text-blue-600' },
        { label: 'Consumption', value: '₹1.8L', trend: '+8%', icon: <Zap />, color: 'bg-orange-50 text-orange-600' },
        { label: 'Waste Ratio', value: '3.2%', trend: '-0.5%', icon: <Target />, color: 'bg-red-50 text-red-600' },
        { label: 'Net Efficiency', value: '94.8%', trend: '+2%', icon: <PieChart />, color: 'bg-green-50 text-green-700' }
    ];

    const inventoryAudit = [
        { id: 1, item: 'Regular Gol Gapppa (Uncooked)', qtyIn: '50k pcs', qtyOut: '42k pcs', loss: '0.8%', valuation: '₹85,000', status: 'Stable' },
        { id: 2, item: 'Maida / Flour', qtyIn: '1200 kg', qtyOut: '1150 kg', loss: '1.2%', valuation: '₹42,000', status: 'High Use' },
        { id: 3, item: 'Cooking Oil', qtyIn: '400 Ltr', qtyOut: '380 Ltr', loss: '2.5%', valuation: '₹64,000', status: 'Optimized' },
        { id: 4, item: 'Packaging Boxes (Small)', qtyIn: '10k units', qtyOut: '9.5k units', loss: '0.5%', valuation: '₹12,000', status: 'In Demand' },
        { id: 5, item: 'Special Chaat Masala', qtyIn: '150 kg', qtyOut: '140 kg', loss: '1.0%', valuation: '₹35,000', status: 'Stable' },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-primary">
                            <Layers size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[10px] uppercase italic">Strategic Inventory Audit</span>
                    </div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">Month Wise Stock</h1>
                    <p className="text-zinc-500 font-medium mt-1">Consolidated monthly analysis for better procurement planning.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group w-full md:w-auto">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                        <input
                            type="month"
                            className="bg-white border-2 border-zinc-100 rounded-[1.5rem] py-4 pl-16 pr-8 font-black text-secondary outline-none focus:border-primary transition-all shadow-sm"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    <button className="w-full md:w-auto bg-secondary text-white px-8 py-4.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        <Download size={18} />
                        Monthly Report
                    </button>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {monthlyStats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-3xl border-2 border-zinc-50 shadow-premium group hover:border-primary/20 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg shadow-zinc-50 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{stat.label}</p>
                        <h3 className="text-3xl font-black text-secondary mt-1 tracking-tighter">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Inventory Table */}
                <div className="lg:col-span-12 xl:col-span-8 bg-white rounded-3xl border-2 border-zinc-50 shadow-premium overflow-hidden">
                    <div className="p-6 bg-[#fafafa] border-b-2 border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-secondary tracking-tight">Stock Analysis</h2>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Itemized Flow Review</p>
                        </div>
                        <div className="relative group w-full md:w-72">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold text-secondary outline-none focus:border-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-50">
                                    <th className="px-8 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Item</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">In-Flow</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Out-Flow</th>
                                    <th className="px-6 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Loss %</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-right">Valuation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {inventoryAudit.map((item) => (
                                    <tr key={item.id} className="group hover:bg-orange-50/20 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-100 group-hover:bg-white transition-all">
                                                    {item.item.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-secondary text-sm uppercase leading-tight">{item.item}</h4>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border mt-1 inline-block ${item.status === 'High Use' ? 'bg-orange-100 border-orange-200 text-orange-600' : 'bg-zinc-100 border-zinc-200 text-zinc-500'}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center font-bold text-zinc-600">{item.qtyIn}</td>
                                        <td className="px-6 py-6 text-center font-bold text-zinc-600">{item.qtyOut}</td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`font-black text-sm ${parseFloat(item.loss) > 2 ? 'text-red-500' : 'text-zinc-600'}`}>
                                                {item.loss}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-secondary">{item.valuation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <div className="bg-secondary p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black tracking-tight leading-tight mb-4">Procurement<br />Efficiency Tip</h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed mb-8">
                                Weekly Maida procurement during festivals has shown 15% better price stability than daily buying.
                            </p>
                            <button className="bg-primary text-secondary font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                                View Prediction
                            </button>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="bg-white p-6 rounded-3xl border-2 border-zinc-50 shadow-premium">
                        <h3 className="text-xl font-black text-secondary uppercase tracking-tight mb-8">Asset Growth</h3>
                        <div className="space-y-8">
                            {[
                                { label: 'Fixed Assets', value: '₹12.4L', percent: 75, color: 'bg-primary' },
                                { label: 'Liquid Inventory', value: '₹4.2L', percent: 45, color: 'bg-orange-400' },
                                { label: 'Operational Funds', value: '₹2.8L', percent: 25, color: 'bg-blue-400' }
                            ].map((asset, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{asset.label}</p>
                                        <span className="text-sm font-black text-secondary">{asset.value}</span>
                                    </div>
                                    <div className="h-3 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${asset.percent}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                            className={`h-full ${asset.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthWiseStock;
