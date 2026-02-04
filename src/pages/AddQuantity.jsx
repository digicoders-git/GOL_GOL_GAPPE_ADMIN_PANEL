import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdAdd,
    MdInventory,
    MdSave,
    MdDelete,
    MdHistory,
    MdLayers,
    MdScale,
    MdInfo,
    MdTrendingUp,
    MdWarning,
    MdCheckCircle,
    MdSearch,
    MdClose,
    MdFileDownload,
    MdCategory
} from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getStockLogs, addQuantity } from '../utils/api';

const AddQuantity = () => {
    const [recentEntries, setRecentEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        productName: '',
        category: 'ingredients',
        quantity: '',
        unit: 'kg',
        notes: ''
    });

    const [searchQuery, setSearchQuery] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await getStockLogs();
            if (response.data.success) {
                const logs = response.data.logs.map(log => ({
                    id: log._id,
                    name: log.product.name,
                    category: log.product.category,
                    quantity: log.quantity,
                    unit: log.product.unit,
                    date: new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                    status: 'completed'
                }));
                setRecentEntries(logs);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to fetch stock logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Dynamic Stats
    const stats = useMemo(() => {
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const todayEntries = recentEntries.filter(e => e.date === today);
        const totalUnits = recentEntries.reduce((acc, curr) => acc + Number(curr.quantity), 0);

        return [
            { title: "Today's Additions", value: `${todayEntries.length} Items`, icon: <MdAdd />, color: "text-blue-600", bg: "bg-blue-50", trend: `+${todayEntries.length}` },
            { title: "Total Units Added", value: `${totalUnits}`, icon: <MdLayers />, color: "text-orange-600", bg: "bg-orange-50", trend: "Lifetime" },
            { title: "Top Category", value: "Ingredients", icon: <MdTrendingUp />, color: "text-primary", bg: "bg-primary/10", trend: "High Use" },
            { title: "Log Entries", value: `${recentEntries.length}`, icon: <MdCheckCircle />, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Active" },
        ];
    }, [recentEntries]);

    const filteredEntries = recentEntries.filter(entry =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.productName || !formData.quantity) {
            toast.error('Please fill all required fields');
            return;
        }

        const loadingToast = toast.loading('Updating inventory...');
        try {
            const response = await addQuantity(formData);
            if (response.data.success) {
                toast.success('Stock updated successfully!', { id: loadingToast });
                setFormData({ productName: '', category: 'ingredients', quantity: '', unit: 'kg', notes: '' });
                fetchLogs(); // Refresh the list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update stock', { id: loadingToast });
        }
    };

    const deleteEntry = (id) => {
        Swal.fire({
            title: 'Delete Log?',
            text: "This record will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Yes, delete it!',
            background: '#ffffff',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm',
                cancelButton: 'px-6 py-2.5 rounded-xl font-bold text-sm'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setRecentEntries(recentEntries.filter(e => e.id !== id));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Entry has been removed.',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    customClass: {
                        popup: 'rounded-[2rem]',
                        confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm'
                    }
                });
            }
        });
    };

    const exportData = () => toast.success('Report Downloaded!');

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">

            {/* --- Compact Header --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdInventory size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Inventory Management</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Add Quantity</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Update stock levels with full audit trail</p>
                </div>

                <button onClick={exportData} className="flex items-center gap-2 bg-white text-secondary border border-zinc-100 px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-all font-bold text-xs shadow-sm cursor-pointer">
                    <MdFileDownload size={18} className="text-primary" /> Export Data
                </button>
            </div>

            {/* --- Stats Quick View --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3.5 group hover:border-primary/30 transition-all">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.title}</p>
                            <h3 className="text-lg font-black text-secondary leading-none">{stat.value}</h3>
                            <p className="text-[7px] font-bold text-zinc-300 uppercase italic mt-1">{stat.trend}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* --- Form Section --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-5"
                >
                    <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                <MdAdd size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-secondary tracking-tight uppercase">Stock Arrival Entry</h2>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Add New Inventory</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Product Name</label>
                                <div className="relative">
                                    <MdInventory className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                        value={formData.productName}
                                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                        placeholder="e.g., Premium Basmati Rice"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category</label>
                                <div className="relative">
                                    <MdCategory className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                    <select
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="ingredients">Ingredients</option>
                                        <option value="snacks">Snacks</option>
                                        <option value="packaging">Packaging</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Unit</label>
                                    <div className="relative">
                                        <MdScale className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                        <select
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm appearance-none"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="ltr">ltr</option>
                                            <option value="pcs">pcs</option>
                                            <option value="pkt">pkt</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                                <div className="relative">
                                    <MdInfo className="absolute left-4 top-4 text-zinc-300 text-lg" />
                                    <textarea
                                        rows="3"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm resize-none"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any additional information..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-secondary text-primary font-black py-3.5 rounded-xl shadow-lg shadow-secondary/10 hover:shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm group mt-2 cursor-pointer"
                            >
                                <MdSave size={18} className="group-hover:rotate-12 transition-transform" />
                                ADD TO INVENTORY
                            </button>
                        </form>

                        {/* Decor */}
                        <MdInventory size={200} className="absolute -bottom-12 -right-12 text-secondary/[0.02] -rotate-12 pointer-events-none" />
                    </div>
                </motion.div>

                {/* --- Recent Entries Log --- */}
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
                                    <h2 className="text-base font-black text-secondary tracking-tight uppercase">Recent Entries</h2>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Activity Log</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-3 py-2 rounded-lg shadow-sm">{recentEntries.length} Records</span>
                        </div>

                        {/* Search Bar */}
                        <div className="p-5 border-b border-zinc-100">
                            <div className="relative">
                                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                <input
                                    type="text"
                                    placeholder="Search entries..."
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 text-secondary font-bold outline-none focus:border-primary transition-all text-sm shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Entries List */}
                        <div className="max-h-[500px] overflow-y-auto">
                            <AnimatePresence>
                                {filteredEntries.map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="p-5 border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-200 group-hover:bg-primary/10 transition-all shadow-inner text-sm">
                                                    {entry.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-secondary text-xs uppercase tracking-tight leading-none mb-1">{entry.name}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{entry.category}</span>
                                                        <span className="text-[8px] font-bold text-zinc-300">•</span>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase">{entry.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right mr-3">
                                                    <p className="font-black text-secondary text-base leading-none">{entry.quantity}</p>
                                                    <p className="text-[8px] font-bold text-zinc-400 uppercase">{entry.unit}</p>
                                                </div>
                                                <button
                                                    onClick={() => deleteEntry(entry.id)}
                                                    className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition-all border border-red-100 flex items-center justify-center shadow-sm cursor-pointer"
                                                >
                                                    <MdDelete size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AddQuantity;
