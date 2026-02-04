import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdTrendingUp, MdBarChart, MdPieChart, MdFileDownload, MdFilterList, MdDateRange } from 'react-icons/md';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getBills, getProducts, getUserInventory } from '../utils/api';
import toast from 'react-hot-toast';

const Reports = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'super_admin';
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ bills: [], inventory: [] });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [billRes, invRes] = await Promise.all([
                    getBills(),
                    role === 'super_admin' ? getProducts() : getUserInventory()
                ]);
                setData({
                    bills: billRes.data.bills,
                    inventory: role === 'super_admin' ? invRes.data.products : invRes.data.inventory
                });
            } catch (error) {
                toast.error('Failed to load report data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Chart Options Generation
    const getPerformanceOptions = () => ({
        chart: { type: 'column', backgroundColor: 'transparent' },
        title: { text: '' },
        xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
        yAxis: { title: { text: role === 'kitchen_admin' ? 'Orders Processed' : 'Revenue (₹)' } },
        series: [{
            name: role === 'kitchen_admin' ? 'Orders' : 'Revenue',
            data: [450, 520, 610, 580, 720, 850],
            color: '#F97316'
        }],
        credits: { enabled: false }
    });

    const getStockOptions = () => ({
        chart: { type: 'pie', backgroundColor: 'transparent' },
        title: { text: '' },
        plotOptions: {
            pie: {
                innerSize: '50%',
                dataLabels: { enabled: true, format: '{point.name}: {point.y}' }
            }
        },
        series: [{
            name: 'Stock',
            data: data.inventory.slice(0, 5).map(item => ({
                name: (item.product?.name || item.name),
                y: item.quantity
            }))
        }],
        credits: { enabled: false }
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary/10 rounded-lg text-secondary border border-secondary/20 shadow-sm">
                            <MdTrendingUp size={16} />
                        </div>
                        <span className="text-secondary font-black tracking-widest text-[9px] uppercase italic bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">Analytical Suite</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Operational Reports</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Detailed breakdown of performance, stock, and financials.</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-zinc-100 px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-all font-bold text-xs shadow-sm cursor-pointer">
                        <MdDateRange size={16} /> Date Range
                    </button>
                    <button className="flex items-center gap-2 bg-secondary text-primary px-4 py-2.5 rounded-xl hover:bg-black transition-all font-bold text-xs shadow-lg cursor-pointer">
                        <MdFileDownload size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-premium"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                            <MdBarChart size={20} />
                        </div>
                        <h3 className="font-black text-secondary uppercase tracking-tight">Performance Summary</h3>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={getPerformanceOptions()} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-premium"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                            <MdPieChart size={20} />
                        </div>
                        <h3 className="font-black text-secondary uppercase tracking-tight">Inventory Distribution</h3>
                    </div>
                    {data.inventory.length > 0 ? (
                        <HighchartsReact highcharts={Highcharts} options={getStockOptions()} />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest">
                            No inventory data available
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Activity Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-premium overflow-hidden"
            >
                <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="font-black text-secondary uppercase tracking-tight italic">Detailed Audit Trail</h3>
                    <MdFilterList size={20} className="text-zinc-400" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Event</th>
                                <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Metric</th>
                                <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.bills.slice(0, 10).map((bill, i) => (
                                <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors">
                                    <td className="p-5">
                                        <p className="font-black text-secondary text-sm">Order #{bill.billNumber.slice(-6)}</p>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{bill.customer?.name || 'Walk-in'}</p>
                                    </td>
                                    <td className="p-5">
                                        <p className="font-black text-secondary text-sm">₹{bill.totalAmount}</p>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{bill.items.length} Items</p>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase">
                                            {bill.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right font-bold text-zinc-400 text-xs">
                                        {new Date(bill.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Reports;
