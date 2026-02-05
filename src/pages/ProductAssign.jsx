import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
    MdSwapHoriz,
    MdInventory,
    MdRestaurant,
    MdSend,
    MdHistory,
    MdAccessTime,
    MdLocalShipping,
    MdPerson,
    MdNotes,
    MdArrowForward,
    MdCheckCircle
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { getProducts, getUsers, transferStock, getTransferHistory, getUserInventory } from '../utils/api';

const ProductAssign = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'super_admin';

    const [formData, setFormData] = useState({
        productId: '',
        toUserId: '',
        quantity: '',
        notes: ''
    });

    const [products, setProducts] = useState([]);
    const [recipientUsers, setRecipientUsers] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const isAdmin = role === 'super_admin' || role === 'admin';

            const [prodRes, userRes, transRes] = await Promise.all([
                isAdmin ? getProducts() : getUserInventory(),
                getUsers(),
                getTransferHistory()
            ]);

            console.log('Product Data:', prodRes.data);
            console.log('User Data:', userRes.data);
            console.log('Transfer Data:', transRes.data);

            if (prodRes.data.success) {
                const fetchedProducts = isAdmin ? (prodRes.data.products || []) : (prodRes.data.inventory || []);
                setProducts(fetchedProducts);
                console.log('Set Products:', fetchedProducts.length);
            }
            if (userRes.data.success) {
                // Filter recipients: Admins can transfer to anyone except themselves/other super admins. 
                const filtered = userRes.data.users.filter(u => {
                    if (isAdmin) return u._id !== user.id; // Can't transfer to self
                    if (role === 'billing_admin') return u.role === 'kitchen_admin';
                    return false;
                });
                setRecipientUsers(filtered);
                console.log('Set Recipients:', filtered.length);
            }
            if (transRes.data.success) {
                const fetchedTransfers = transRes.data.transfers || [];
                setTransfers(fetchedTransfers);
                console.log('Set Transfers:', fetchedTransfers.length);
            }
        } catch (error) {
            console.error('FetchData Error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            const response = await transferStock(formData);
            if (response.data.success) {
                toast.success('Stock transferred successfully!');
                setFormData({ productId: '', toUserId: '', quantity: '', notes: '' });
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transfer failed');
        }
    };

    const stats = useMemo(() => [
        { title: 'Total Transfers', value: transfers.length, icon: <MdSwapHoriz />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Recent Item', value: transfers[0]?.product?.name || 'N/A', icon: <MdAccessTime />, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Connected Nodes', value: recipientUsers.length, icon: <MdRestaurant />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Stock Types', value: products.length, icon: <MdInventory />, color: 'text-purple-600', bg: 'bg-purple-50' },
    ], [transfers, recipientUsers.length, products.length]);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">

            {/* --- Compact Header --- */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                        <MdSwapHoriz size={16} />
                    </div>
                    <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Inventory Distribution</span>
                </div>
                <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Product Assign</h1>
                <p className="text-zinc-500 text-[11px] font-medium">Distribute products to kitchens, counters, and storage areas</p>
            </div>

            {/* --- Stats --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3.5 group hover:border-primary/30 transition-all">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.title}</p>
                            <h3 className="text-lg font-black text-secondary leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Chart Section --- */}
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-100">
                        <MdInventory size={16} />
                    </div>
                    <div>
                        <h3 className="font-black text-secondary uppercase tracking-tight">Distribution Analytics</h3>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Kitchen-wise Allocation</p>
                    </div>
                </div>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                        chart: {
                            type: 'column',
                            backgroundColor: 'transparent',
                            height: 300,
                            style: { fontFamily: 'inherit' },
                        },
                        title: { text: null },
                        xAxis: {
                            categories: recipientUsers.map(u => u.email.split('@')[0]),
                            labels: {
                                style: { color: '#94a3b8', fontWeight: '900', fontSize: '9px' }
                            },
                        },
                        yAxis: {
                            title: { text: null },
                            labels: { style: { color: '#94a3b8', fontWeight: '900', fontSize: '10px' } },
                        },
                        credits: { enabled: false },
                        legend: { enabled: false },
                        series: [{
                            name: 'Stock Received',
                            data: recipientUsers.map((u, index) => ({
                                y: transfers
                                    .filter(t => t.toUser?._id?.toString() === u._id?.toString())
                                    .reduce((acc, curr) => acc + curr.quantity, 0),
                                color: ['#F59E0B', '#10B981', '#3B82F6', '#6366F1'][index % 4]
                            })),
                        }]
                    }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* --- Assignment Form --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-5"
                >
                    <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                <MdLocalShipping size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-secondary tracking-tight uppercase">New Assignment</h2>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Transfer Request</p>
                            </div>
                        </div>

                        <form onSubmit={handleAssign} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Product</label>
                                <div className="relative">
                                    <MdInventory className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                    <select
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm appearance-none"
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(p => {
                                            const item = p.product || p;
                                            return (
                                                <option key={p._id} value={item._id}>
                                                    {item.name} ({p.quantity} {item.unit})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Recipient Admin</label>
                                <div className="relative">
                                    <MdRestaurant className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                    <select
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm appearance-none"
                                        value={formData.toUserId}
                                        onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
                                    >
                                        <option value="">Select Recipient</option>
                                        {recipientUsers.map(u => (
                                            <option key={u._id} value={u._id}>{u.email} ({u.role.replace('_', ' ')})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                                <div className="relative">
                                    <MdNotes className="absolute left-4 top-4 text-zinc-300 text-lg" />
                                    <textarea
                                        rows="3"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm resize-none"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any special instructions..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-secondary text-primary font-black py-3.5 rounded-xl shadow-lg shadow-secondary/10 hover:shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm group mt-2 cursor-pointer"
                            >
                                <MdSend size={18} className="group-hover:translate-x-1 transition-transform" />
                                TRANSFER STOCK
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* --- Assignment History --- */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-7"
                >
                    <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-premium overflow-hidden">
                        <div className="p-5 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                                    <MdHistory size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-secondary tracking-tight uppercase">Assignment History</h2>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Recent Transfers</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-3 py-2 rounded-lg shadow-sm">{transfers.length} Records</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-100">
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Product</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Destination</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Quantity</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    <AnimatePresence>
                                        {transfers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-10 text-center text-zinc-400 font-bold">No transfers found</td>
                                            </tr>
                                        ) : (
                                            transfers.map((assign) => (
                                                <motion.tr
                                                    key={assign._id}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100 }}
                                                    className="group hover:bg-zinc-50/50 transition-colors"
                                                >
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-zinc-100 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-200 group-hover:bg-primary/10 transition-all shadow-inner text-xs">
                                                                {assign.product?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-secondary text-xs uppercase tracking-tight leading-none mb-1">{assign.product?.name || 'Deleted Product'}</h4>
                                                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <MdAccessTime size={10} /> {new Date(assign.createdAt).toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold">
                                                            {assign.fromUser?.email?.split('@')[0] || 'Unknown'} <MdArrowForward className="text-primary" /> {assign.toUser?.email?.split('@')[0] || 'Unknown'}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <span className="inline-block px-3 py-1.5 bg-secondary text-white rounded-lg font-black text-xs shadow-sm">
                                                            {assign.quantity} {assign.product?.unit || ''}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            <MdCheckCircle size={12} />
                                                            Success
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-bold text-zinc-400 text-[10px]">
                                                        {new Date(assign.createdAt).toLocaleDateString()}
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductAssign;
