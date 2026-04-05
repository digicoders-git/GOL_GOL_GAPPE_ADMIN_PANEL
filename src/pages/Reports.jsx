import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdTrendingUp, MdBarChart, MdPieChart, MdFileDownload, MdFilterList, MdDateRange } from 'react-icons/md';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import toast from 'react-hot-toast';
import { getBills, getProducts, getUserInventory, getMyKitchen, getMyKitchenOrders, getKitchenOrders, getAllOrders } from '../utils/api';

const Reports = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'super_admin';
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ bills: [], inventory: [] });
    const [performanceData, setPerformanceData] = useState({ categories: [], series: [] });
    const [stockDistribution, setStockDistribution] = useState({ series: [] });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);

                let bills = [];
                let inventory = [];

                if (role === 'billing_admin') {
                    console.log('Fetching reports for billing_admin...');
                    
                    let kitchenRes, ordersRes;
                    try {
                        [kitchenRes, ordersRes] = await Promise.all([
                            getMyKitchen(),
                            getMyKitchenOrders()
                        ]);
                    } catch (err) {
                        console.error('API Error:', err);
                    }

                    console.log('Kitchen API response:', kitchenRes?.data);
                    console.log('Orders API response:', ordersRes?.data);

                    // Get inventory from kitchen
                    if (kitchenRes?.data?.success && kitchenRes.data.kitchen?.assignedProducts) {
                        inventory = kitchenRes.data.kitchen.assignedProducts
                            .filter(ap => ap.product)
                            .map(ap => ({
                                ...ap.product,
                                quantity: (ap.assigned || 0) - (ap.used || 0),
                                assigned: ap.assigned || 0,
                                used: ap.used || 0
                            }));
                    }

                    // Get orders - if kitchen-specific returns empty, try general billing API
                    if (ordersRes?.data?.success && (ordersRes.data.orders?.length > 0 || ordersRes.data.bills?.length > 0)) {
                        bills = ordersRes.data.orders || ordersRes.data.bills || [];
                    } else {
                        // Fallback to general billing API
                        console.log('Kitchen orders empty, fetching all bills...');
                        try {
                            const allBillsRes = await getBills();
                            console.log('All Bills response:', allBillsRes?.data);
                            bills = allBillsRes?.data?.bills || [];
                        } catch (err) {
                            console.error('Fallback bills error:', err);
                        }
                    }
                } else if (role === 'kitchen_admin') {
                    console.log('Fetching reports for kitchen_admin...');
                    
                    let invRes, ordersRes;
                    try {
                        [invRes, ordersRes] = await Promise.all([
                            getUserInventory(),
                            getKitchenOrders()
                        ]);
                    } catch (err) {
                        console.error('API Error:', err);
                    }

                    console.log('Inventory API response:', invRes?.data);
                    console.log('Orders API response:', ordersRes?.data);

                    if (invRes?.data?.success && invRes.data.inventory) {
                        inventory = invRes.data.inventory;
                    }

                    // Get orders - if kitchen-specific returns empty, try general billing API
                    if (ordersRes?.data?.success && (ordersRes.data.orders?.length > 0 || ordersRes.data.bills?.length > 0)) {
                        bills = ordersRes.data.orders || ordersRes.data.bills || [];
                    } else {
                        // Fallback to general billing API
                        console.log('Kitchen orders empty, fetching all bills...');
                        try {
                            const allBillsRes = await getBills();
                            console.log('All Bills response:', allBillsRes?.data);
                            bills = allBillsRes?.data?.bills || [];
                        } catch (err) {
                            console.error('Fallback bills error:', err);
                        }
                    }
                } else {
                    console.log('Fetching reports for super_admin/admin...');
                    
                    let billRes, invRes, ordersRes;
                    try {
                        [billRes, invRes, ordersRes] = await Promise.all([
                            getBills(),
                            getProducts(),
                            getAllOrders()
                        ]);
                    } catch (err) {
                        console.error('API Error:', err);
                    }

                    console.log('Bills API response:', billRes?.data);
                    console.log('Products API response:', invRes?.data);
                    console.log('Orders API response:', ordersRes?.data);

                    // Combine bills and orders
                    const billsData = billRes?.data?.bills || [];
                    const ordersData = ordersRes?.data?.orders || [];
                    
                    // Merge both arrays
                    bills = [...billsData, ...ordersData];
                    console.log('Combined bills + orders:', bills.length);
                    
                    inventory = invRes?.data?.products || [];
                }

                console.log('Reports - Bills:', bills);
                console.log('Reports - Bills Count:', bills.length);
                console.log('Reports - Inventory:', inventory);

                // Ensure bills is always an array
                if (!Array.isArray(bills)) {
                    console.error('Bills is not an array:', bills);
                    bills = [];
                }

                setData({ bills, inventory });

                // --- Performance Summary (Last 6 Months) ---
                const last6Months = Array.from({ length: 6 }, (_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - (5 - i));
                    return d;
                });

                const monthlyData = last6Months.map(monthDate => {
                    const targetMonth = monthDate.getMonth();
                    const targetYear = monthDate.getFullYear();

                    const monthRevenue = bills
                        .filter(b => {
                            if (!b || !b.createdAt) return false;
                            const d = new Date(b.createdAt);
                            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
                        })
                        .reduce((sum, b) => {
                            // Try multiple amount fields
                            const amount = parseFloat(b.totalAmount) || 
                                         parseFloat(b.total) || 
                                         parseFloat(b.paymentAmount) || 
                                         parseFloat(b.amount) || 
                                         parseFloat(b.finalAmount) || 0;
                            if (amount > 0) {
                                console.log('Bill/Order:', b.billNumber || b.orderNumber || b._id, 'Amount:', amount);
                            }
                            return sum + amount;
                        }, 0);
                    
                    console.log(`Revenue for ${monthDate.toLocaleString('default', { month: 'short' })}:`, monthRevenue);
                    return parseFloat(monthRevenue.toFixed(2));
                });

                const monthLabels = last6Months.map(d => d.toLocaleString('default', { month: 'short' }));

                const totalRevenue = monthlyData.reduce((sum, val) => sum + val, 0);
                console.log('Monthly Revenue Data:', monthlyData);
                console.log('Total Revenue:', totalRevenue);

                setPerformanceData({
                    categories: monthLabels,
                    series: [{
                        name: 'Revenue (₹)',
                        data: monthlyData,
                        color: '#F97316'
                    }]
                });

                // --- Stock Distribution (Top 10 items) ---
                const stockData = [...inventory]
                    .sort((a, b) => (b.quantity || b.product?.quantity || 0) - (a.quantity || a.product?.quantity || 0))
                    .slice(0, 10)
                    .map(item => ({
                        name: item.name || item.product?.name || 'Unknown Item',
                        y: item.quantity || item.product?.quantity || 0
                    }));

                setStockDistribution({
                    series: [{
                        name: 'Quantity',
                        colorByPoint: true,
                        data: stockData
                    }]
                });

            } catch (error) {
                console.error('Reports fetch error:', error);
                toast.error('Failed to load report data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [role]);

    // Chart Options Generation
    const getPerformanceOptions = () => ({
        chart: { type: 'column', backgroundColor: 'transparent' },
        title: { text: '' },
        xAxis: {
            categories: performanceData.categories,
            labels: { style: { fontWeight: 'bold', color: '#64748b' } }
        },
        yAxis: {
            title: { text: 'Revenue (₹)' },
            labels: { 
                style: { fontWeight: 'bold', color: '#64748b' },
                formatter: function() {
                    return '₹' + this.value.toLocaleString('en-IN');
                }
            }
        },
        tooltip: {
            formatter: function() {
                return '<b>' + this.x + '</b><br/>' + 
                       'Revenue: <b>₹' + this.y.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</b>';
            }
        },
        series: performanceData.series,
        credits: { enabled: false },
        plotOptions: {
            column: {
                borderRadius: 8,
                dataLabels: { 
                    enabled: true,
                    formatter: function() {
                        return '₹' + this.y.toLocaleString('en-IN');
                    },
                    style: { fontSize: '10px', fontWeight: 'bold' }
                }
            }
        }
    });

    const getStockOptions = () => ({
        chart: { type: 'pie', backgroundColor: 'transparent' },
        title: { text: '' },
        plotOptions: {
            pie: {
                innerSize: '50%',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y}',
                    style: { fontSize: '10px' }
                }
            }
        },
        series: stockDistribution.series,
        credits: { enabled: false }
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-zinc-500 font-bold">Loading reports...</p>
                    </div>
                </div>
            ) : (
                <>
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
                        <div>
                            <h3 className="font-black text-secondary uppercase tracking-tight">Performance Summary</h3>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Last 6 Months Revenue</p>
                        </div>
                    </div>
                    {performanceData.series.length > 0 && performanceData.series[0].data.length > 0 ? (
                        <HighchartsReact highcharts={Highcharts} options={getPerformanceOptions()} />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest">
                            No revenue data available
                        </div>
                    )}
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
                            {data.bills && data.bills.length > 0 ? (
                                data.bills.slice(0, 10).map((bill, i) => (
                                    <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors">
                                        <td className="p-5">
                                            <p className="font-black text-secondary text-sm">Order #{(bill.billNumber || bill.orderNumber || '000000').slice(-6)}</p>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{bill.customer?.name || 'Walk-in'}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-black text-secondary text-sm">₹{(bill.totalAmount || bill.total || 0).toFixed(2)}</p>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{bill.items?.length || 0} Items</p>
                                        </td>
                                        <td className="p-5">
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase">
                                                {(bill.status || 'pending').replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right font-bold text-zinc-400 text-xs">
                                            {new Date(bill.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-zinc-400 font-bold uppercase tracking-widest">
                                        No bills data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
                </>
            )}
        </div>
    );
};

export default Reports;
