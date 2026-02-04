import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Package,
    Save,
    Trash2,
    History,
    Layers,
    Scale,
    Info,
    ArrowUpRight,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Search,
    X,
    FileDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddQuantity = () => {
    // Persistence with localStorage
    const [recentEntries, setRecentEntries] = useState(() => {
        const saved = localStorage.getItem('golgol_inventory_logs');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Atta (Premium)', quantity: 50, unit: 'kg', date: '03 Feb', status: 'completed', category: 'ingredients' },
            { id: 2, name: 'Cooking Oil', quantity: 20, unit: 'ltr', date: '02 Feb', status: 'completed', category: 'ingredients' },
            { id: 3, name: 'Green Chutney', quantity: 15, unit: 'ltr', date: '01 Feb', status: 'completed', category: 'ingredients' },
        ];
    });

    const [formData, setFormData] = useState({
        productName: '',
        category: 'ingredients',
        quantity: '',
        unit: 'kg',
        notes: ''
    });

    const [searchQuery, setSearchQuery] = useState('');

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem('golgol_inventory_logs', JSON.stringify(recentEntries));
    }, [recentEntries]);

    // Dynamic Stats
    const stats = useMemo(() => {
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const todayEntries = recentEntries.filter(e => e.date === today);
        const totalUnits = recentEntries.reduce((acc, curr) => acc + Number(curr.quantity), 0);

        return [
            { title: "Today's Additions", value: `${todayEntries.length} Items`, icon: <Plus />, color: "bg-blue-200", trend: `+${todayEntries.length}` },
            { title: "Total Units Added", value: `${totalUnits}`, icon: <Layers />, color: "bg-orange-300", trend: "Lifetime" },
            { title: "Top Category", value: "Ingredients", icon: <TrendingUp />, color: "bg-orange-200", trend: "High Use" },
            { title: "Log Entries", value: `${recentEntries.length}`, icon: <CheckCircle2 />, color: "bg-green-200", trend: "Active" },
        ];
    }, [recentEntries]);

    const filteredEntries = recentEntries.filter(entry =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.productName || !formData.quantity) {
            toast.error('Please fill all required fields');
            return;
        }

        const newEntry = {
            id: Date.now(),
            name: formData.productName,
            category: formData.category,
            quantity: Number(formData.quantity),
            unit: formData.unit,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            status: 'completed'
        };

        setRecentEntries([newEntry, ...recentEntries]);
        setFormData({ productName: '', category: 'ingredients', quantity: '', unit: 'kg', notes: '' });
        toast.success('Stock updated successfully!');
    };

    const deleteEntry = (id) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            setRecentEntries(recentEntries.filter(e => e.id !== id));
            toast.error('Entry removed');
        }
    };

    const exportData = () => toast.success('Report Downloaded!');

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-primary font-bold tracking-widest text-xs uppercase italic">Inventory Management</span>
                    <h1 className="text-3xl font-black text-secondary mt-1 tracking-tight">Add Quantity</h1>
                    <p className="text-zinc-500 font-medium">Update stock levels with full audit trail</p>
                </div>
                <button onClick={exportData} className="flex items-center gap-2 bg-white text-secondary border border-zinc-200 px-6 py-3 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-sm shadow-sm">
                    <FileDown size={18} className="text-primary" /> Export Data
                </button>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5 }}
                        key={stat.title}
                        className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-premium group transition-all hover:shadow-2xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-2xl ${stat.color} bg-opacity-10 text-${stat.color.split('-')[1] === 'primary' ? 'primary-dark' : stat.color.split('-')[1] + '-700'}`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/5 uppercase tracking-wider">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none">{stat.title}</p>
                        <h3 className="text-2xl font-black text-secondary mt-2">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Modern Form Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-12 xl:col-span-5"
                >
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-2xl shadow-zinc-200/50 relative overflow-hidden">
                        <h2 className="text-2xl font-black text-secondary mb-8 flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-200 rounded-2xl flex items-center justify-center text-secondary shadow-lg shadow-primary/30">
                                <Plus size={26} strokeWidth={3} />
                            </div>
                            Stock Arrival Entry
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600 uppercase ml-1 flex items-center gap-1.5 tracking-wider">
                                    <Package size={14} className="text-primary" /> Product Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter full product name"
                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-secondary font-bold outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-600 uppercase ml-1 tracking-wider">Category</label>
                                    <select
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-secondary font-bold outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="ingredients">Ingredients</option>
                                        <option value="stationery">Stationery</option>
                                        <option value="packaging">Packaging</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-600 uppercase ml-1 tracking-wider">Unit Type</label>
                                    <select
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-secondary font-bold outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="kg">KG</option>
                                        <option value="ltr">LITERS</option>
                                        <option value="pcs">PIECES</option>
                                        <option value="pkt">PACKETS</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600 uppercase ml-1 tracking-wider">Exact Quantity</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        required
                                        step="any"
                                        placeholder="0.00"
                                        className="w-full bg-zinc-50 border-2 border-zinc-200/50 rounded-2xl py-5 px-6 text-secondary text-4xl font-black outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <span className="bg-primary/10 text-primary-dark font-black px-4 py-2 rounded-xl text-sm uppercase">
                                            {formData.unit}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600 uppercase ml-1 tracking-wider">Notes / Remarks</label>
                                <textarea
                                    placeholder="Enter details like Batch No. or Supplier name..."
                                    rows="2"
                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-secondary font-bold outline-none focus:border-primary focus:bg-white transition-all resize-none"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-secondary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-secondary/30 hover:shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg mt-2"
                            >
                                <Save size={24} strokeWidth={3} />
                                CONFIRM & UPDATE
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Enhanced List Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-12 xl:col-span-7"
                >
                    <div className="bg-white rounded-3xl border border-zinc-100 shadow-premium overflow-hidden flex flex-col h-full max-h-[850px]">
                        <div className="p-6 border-b border-zinc-50 bg-[#fafafa] space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-secondary tracking-tight">Activity Log</h2>
                                    <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest mt-1">Audit Trail for Inventory</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-zinc-200 text-primary shadow-sm">
                                    <History size={22} />
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by product name or category..."
                                    className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-4.5 pl-15 pr-12 text-secondary font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                            <AnimatePresence mode='popLayout'>
                                {filteredEntries.map((item, idx) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={item.id}
                                        className={`p-4 flex items-center justify-between group transition-all hover:bg-zinc-50 ${idx !== filteredEntries.length - 1 ? 'border-b border-zinc-100' : ''}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-primary font-black text-2xl border-2 border-transparent group-hover:border-primary/30 group-hover:bg-white transition-all shadow-sm">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-secondary text-xl leading-tight uppercase truncate max-w-[150px] sm:max-w-[300px]">{item.name}</h4>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200 tracking-wider ">{item.category}</span>
                                                    <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full" />
                                                    <span className="text-[11px] font-bold text-zinc-400 uppercase">{item.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-accent flex items-center justify-end gap-1">
                                                    <Plus size={18} strokeWidth={4} />
                                                    {item.quantity}
                                                    <span className="text-[11px] font-bold text-zinc-400 uppercase ml-1 tracking-widest">{item.unit}</span>
                                                </p>
                                                <span className="text-[10px] font-black uppercase text-accent/80 flex items-center justify-end gap-1.5 mt-1">
                                                    <CheckCircle2 size={12} strokeWidth={3} /> VERIFIED
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => deleteEntry(item.id)}
                                                className="w-11 h-11 flex items-center justify-center text-zinc-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 size={22} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredEntries.length === 0 && (
                                <div className="p-24 text-center">
                                    <p className="text-zinc-300 font-black text-xl uppercase tracking-widest">No matching logs found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AddQuantity;
