import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
    MdSearch,
    MdFilterList,
    MdFileDownload,
    MdVisibility,
    MdReceipt,
    MdCalendarToday,
    MdPerson,
    MdKeyboardArrowDown,
    MdMoreVert,
    MdLocalPrintshop,
    MdNorthEast,
    MdSouthEast,
    MdSearchOff,
    MdAdd,
    MdClose,
    MdInsights,
    MdPayment,
    MdPieChart,
    MdShowChart,
    MdChevronLeft,
    MdChevronRight
} from 'react-icons/md';

const BillingManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Mock Billing Data (Expanded for pagination)
    const transactions = [
        { id: 'INV-8821', customer: 'Rahul Sharma', amount: 140, date: '2024-02-04', time: '10:45 AM', status: 'Completed', method: 'UPI' },
        { id: 'INV-8820', customer: 'Anita Singh', amount: 50, date: '2024-02-04', time: '10:30 AM', status: 'Pending', method: 'Cash' },
        { id: 'INV-8819', customer: 'Karan Mehra', amount: 180, date: '2024-02-04', time: '10:15 AM', status: 'Completed', method: 'UPI' },
        { id: 'INV-8818', customer: 'Suresh Kumar', amount: 80, date: '2024-02-04', time: '09:45 AM', status: 'Completed', method: 'Cash' },
        { id: 'INV-8817', customer: 'Priya Verma', amount: 220, date: '2024-02-03', time: '08:30 PM', status: 'Cancelled', method: 'Card' },
        { id: 'INV-8816', customer: 'Amit Patel', amount: 35, date: '2024-02-03', time: '07:15 PM', status: 'Completed', method: 'UPI' },
        { id: 'INV-8815', customer: 'Walk-in Customer', amount: 60, date: '2024-02-03', time: '06:00 PM', status: 'Completed', method: 'Cash' },
        { id: 'INV-8814', customer: 'Vikram Seth', amount: 110, date: '2024-02-03', time: '05:30 PM', status: 'Completed', method: 'UPI' },
        { id: 'INV-8813', customer: 'Sanjay Gupta', amount: 45, date: '2024-02-03', time: '04:45 PM', status: 'Pending', method: 'Cash' },
        { id: 'INV-8812', customer: 'Neha Kapoor', amount: 75, date: '2024-02-02', time: '03:15 PM', status: 'Completed', method: 'UPI' },
        { id: 'INV-8811', customer: 'Rohan Das', amount: 130, date: '2024-02-02', time: '02:00 PM', status: 'Completed', method: 'Card' },
        { id: 'INV-8810', customer: 'Aarav Jha', amount: 90, date: '2024-02-02', time: '01:15 PM', status: 'Completed', method: 'UPI' },
        { id: 'INV-8809', customer: 'Ishani Roy', amount: 55, date: '2024-02-02', time: '12:30 PM', status: 'Completed', method: 'Cash' },
        { id: 'INV-8808', customer: 'Kabir Singh', amount: 200, date: '2024-02-01', time: '11:45 AM', status: 'Cancelled', method: 'UPI' },
        { id: 'INV-8807', customer: 'Ananya Bajaj', amount: 120, date: '2024-02-01', time: '10:30 AM', status: 'Completed', method: 'Cash' },
    ];

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.customer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- Chart Configurations ---
    const revenueChartOptions = {
        chart: {
            type: 'areaspline',
            backgroundColor: 'transparent',
            height: 350,
            style: { fontFamily: 'inherit' }
        },
        title: { text: null },
        xAxis: {
            categories: ['Feb 01', 'Feb 02', 'Feb 03', 'Feb 04'],
            labels: { style: { color: '#94a3b8', fontWeight: 'bold' } },
            gridLineWidth: 0
        },
        yAxis: {
            title: { text: null },
            labels: { style: { color: '#94a3b8', fontWeight: 'bold' } },
            gridLineColor: '#f1f5f9'
        },
        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat: '<span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase">{point.key}</span><br/>',
            pointFormat: '<span style="color:{point.color}">\u25CF</span> <span style="font-weight: 800; color: #1e293b">{series.name}:</span> <b>₹{point.y}</b><br/>',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 0,
            shadow: true
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.1,
                marker: {
                    enabled: false,
                    states: { hover: { enabled: true } }
                }
            }
        },
        series: [{
            name: 'Revenue',
            data: [320, 350, 480, 520],
            color: '#F97316',
        }],
        credits: { enabled: false }
    };

    const methodChartOptions = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            height: 350,
            style: { fontFamily: 'inherit' }
        },
        title: { text: null },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 0,
            shadow: true
        },
        plotOptions: {
            pie: {
                innerSize: '65%',
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    style: { fontWeight: '800', color: '#64748b', textTransform: 'uppercase', fontSize: '10px' }
                },
                showInLegend: true
            }
        },
        legend: {
            itemStyle: { fontWeight: '800', fontSize: '10px', textTransform: 'uppercase', color: '#64748b' }
        },
        series: [{
            name: 'Share',
            data: [
                { name: 'UPI', y: 55, color: '#F97316' },
                { name: 'Cash', y: 35, color: '#2D1B0D' },
                { name: 'Card', y: 10, color: '#94a3b8' }
            ]
        }],
        credits: { enabled: false }
    };

    return (
        <div className="space-y-8 pb-10 max-w-[1600px] mx-auto p-4 lg:p-6 bg-[#FDFCFB]">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <MdInsights size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full">Business Intelligent POS</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight">Billing Management</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-0.5">Real-time transaction auditing and performance analytics.</p>
                </motion.div>

                <div className="flex items-center gap-3">
                    <button className="bg-white border-2 border-zinc-100 p-3 rounded-xl text-secondary hover:border-primary transition-all shadow-sm group">
                        <MdFileDownload size={20} className="group-hover:scale-110 transition-transform text-zinc-400 group-hover:text-primary" />
                    </button>
                    <button className="bg-secondary text-primary px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-secondary/10 hover:scale-[1.02] active:scale-95 transition-all">
                        Export Master Data
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Net Revenue', value: '₹14,230', trend: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <MdShowChart size={24} /> },
                    { label: 'Avg Ticket', value: '₹75', trend: '+5%', color: 'text-blue-600', bg: 'bg-blue-50', icon: <MdPayment size={24} /> },
                    { label: 'Active Orders', value: '42', trend: '+8%', color: 'text-orange-600', bg: 'bg-orange-50', icon: <MdReceipt size={24} /> },
                    { label: 'Cancellation', value: '2.4%', trend: '-3%', color: 'text-red-600', bg: 'bg-red-50', icon: <MdMoreVert size={24} /> }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm group hover:shadow-lg hover:border-primary/20 transition-all cursor-default"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-primary group-hover:text-secondary shadow-inner`}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${stat.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {stat.trend.startsWith('+') ? <MdNorthEast size={12} /> : <MdSouthEast size={12} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5">{stat.label}</p>
                        <h2 className="text-2xl font-black text-secondary tracking-tighter">{stat.value}</h2>
                    </motion.div>
                ))}
            </div>

            {/* Table & Analytics Container */}
            <div className="grid grid-cols-1 gap-8">

                {/* Filter & Table Area */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full group">
                            <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Audit by Transaction ID, Customer, or Phone..."
                                className="w-full bg-zinc-50 border-2 border-transparent rounded-2xl py-3 pl-16 pr-6 font-bold text-secondary outline-none focus:border-primary focus:bg-white transition-all shadow-inner text-sm"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar py-1">
                            {['All', 'Completed', 'Pending', 'Cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${statusFilter === status ? 'bg-secondary text-primary border-secondary shadow-xl shadow-secondary/10' : 'bg-white border-zinc-50 text-zinc-400 hover:border-zinc-200'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Audit Flow</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Entity</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Stage</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Volume</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Gateway</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-center">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    <AnimatePresence mode='popLayout'>
                                        {paginatedTransactions.length > 0 ? (
                                            paginatedTransactions.map((tx) => (
                                                <motion.tr
                                                    key={tx.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="group hover:bg-zinc-50/50 transition-colors text-sm"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/20 group-hover:text-primary transition-all shadow-inner">
                                                                <MdReceipt size={18} />
                                                            </div>
                                                            <span className="font-black text-secondary tracking-tight italic">{tx.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-secondary text-primary rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">
                                                                {tx.customer.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-secondary text-[11px] uppercase tracking-tight">{tx.customer}</span>
                                                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Verified User</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] font-black text-secondary">{tx.date}</span>
                                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{tx.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                            tx.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            <motion.div
                                                                animate={{ scale: [1, 1.2, 1] }}
                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                                className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Completed' ? 'bg-emerald-500' :
                                                                    tx.status === 'Pending' ? 'bg-orange-500' : 'bg-red-500'
                                                                    }`}
                                                            />
                                                            {tx.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xl font-black text-secondary tracking-tighter">₹{tx.amount}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <MdPayment className="text-zinc-300" size={16} />
                                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{tx.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button className="w-9 h-9 bg-zinc-50 hover:bg-white rounded-lg text-zinc-400 hover:text-primary hover:shadow-md transition-all border border-transparent hover:border-zinc-100 flex items-center justify-center">
                                                                <MdVisibility size={18} />
                                                            </button>
                                                            <button className="w-9 h-9 bg-zinc-50 hover:bg-white rounded-lg text-zinc-400 hover:text-secondary hover:shadow-md transition-all border border-transparent hover:border-zinc-100 flex items-center justify-center">
                                                                <MdLocalPrintshop size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-32 text-center">
                                                    <div className="flex flex-col items-center gap-6 opacity-40">
                                                        <MdSearchOff size={64} className="text-zinc-200" />
                                                        <div>
                                                            <h3 className="text-3xl font-black text-secondary uppercase italic">Empty Audit Log</h3>
                                                            <p className="text-sm font-bold text-zinc-500 uppercase mt-2 tracking-widest">No matching transactions found in system</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        {totalPages > 1 && (
                            <div className="p-5 bg-zinc-50/50 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                    Showing <span className="text-secondary">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="text-secondary">{filteredTransactions.length}</span> Master Entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${currentPage === 1 ? 'border-zinc-100 text-zinc-200 cursor-not-allowed' : 'border-zinc-200 text-secondary hover:border-primary hover:text-primary'}`}
                                    >
                                        <MdChevronLeft size={20} />
                                    </button>

                                    <div className="flex gap-1.5">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl font-black text-xs transition-all shadow-sm ${currentPage === i + 1 ? 'bg-secondary text-primary shadow-lg shadow-secondary/20 scale-105 z-10' : 'bg-white border text-zinc-400 hover:border-primary hover:text-primary'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${currentPage === totalPages ? 'border-zinc-100 text-zinc-200 cursor-not-allowed' : 'border-zinc-200 text-secondary hover:border-primary hover:text-primary'}`}
                                    >
                                        <MdChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Analytics Charts Section --- */}
                <div className="space-y-6 mt-8">
                    <div className="flex items-center gap-3 mb-1 px-2">
                        <div className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                        <div>
                            <h3 className="text-2xl font-black text-secondary tracking-tight">Business Intelligence</h3>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Revenue performance auditing</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm group hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                        <MdShowChart size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-secondary uppercase text-[12px] tracking-tight">Revenue Trajectory</h4>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">4-Day Velocity Audit</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">Live</div>
                            </div>
                            <HighchartsReact highcharts={Highcharts} options={revenueChartOptions} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm group hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shadow-inner">
                                        <MdPieChart size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-secondary uppercase text-[12px] tracking-tight">Gateway Distribution</h4>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Payment Channel Mix</p>
                                    </div>
                                </div>
                                <MdMoreVert className="text-zinc-300 pointer-events-none" />
                            </div>
                            <HighchartsReact highcharts={Highcharts} options={methodChartOptions} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingManagement;
