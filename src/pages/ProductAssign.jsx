import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftRight,
    MapPin,
    Package,
    ChefHat,
    Send,
    History,
    Trash2,
    CheckCircle2,
    Clock,
    Plus,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductAssign = () => {
    const [formData, setFormData] = useState({
        product: '',
        kitchen: '',
        quantity: '',
        staff: '',
        notes: ''
    });

    const [assignments, setAssignments] = useState([
        { id: 1, product: 'Regular Gol Gappe', kitchen: 'Main Kitchen', quantity: 500, unit: 'pcs', staff: 'Rahul', time: '10:30 AM', status: 'delivered' },
        { id: 2, product: 'Masala Water', kitchen: 'Counter A', quantity: 20, unit: 'ltr', staff: 'Anita', time: '11:15 AM', status: 'shipped' },
        { id: 3, product: 'Atta (Premium)', kitchen: 'Basement Store', quantity: 50, unit: 'kg', staff: 'Suresh', time: '09:00 AM', status: 'delivered' },
    ]);

    const [products] = useState([
        { id: 'p1', name: 'Regular Gol Gappe', unit: 'pcs', currentStock: 4500 },
        { id: 'p2', name: 'Masala Water', unit: 'ltr', currentStock: 80 },
        { id: 'p3', name: 'Atta (Premium)', unit: 'kg', currentStock: 220 },
        { id: 'p4', name: 'Cooking Oil', unit: 'ltr', currentStock: 15 },
    ]);

    const [kitchens] = useState([
        { id: 'k1', name: 'Main Kitchen', location: 'Section A' },
        { id: 'k2', name: 'Counter A', location: 'Gate 1' },
        { id: 'k3', name: 'Counter B', location: 'Main Entrance' },
        { id: 'k4', name: 'Kitchen 2', location: 'Floor 1' },
    ]);

    const stats = useMemo(() => [
        { title: 'Today Assigned', value: '850 Units', icon: <ArrowLeftRight />, color: 'bg-blue-200' },
        { title: 'Pending Pickup', value: '12 Items', icon: <Clock />, color: 'bg-orange-200' },
        { title: 'Active Kitchens', value: kitchens.length, icon: <ChefHat />, color: 'bg-green-200' },
        { title: 'Most Moved', value: 'Gol Gappe', icon: <Package />, color: 'bg-purple-200' },
    ], [kitchens.length]);

    const handleAssign = (e) => {
        e.preventDefault();
        if (!formData.product || !formData.kitchen || !formData.quantity) {
            toast.error('Galti ho gayi bhai! Saari fields bharo.');
            return;
        }

        const selectedProd = products.find(p => p.name === formData.product);

        const newAssignment = {
            id: Date.now(),
            product: formData.product,
            kitchen: formData.kitchen,
            quantity: Number(formData.quantity),
            unit: selectedProd?.unit || 'units',
            staff: formData.staff || 'Admin',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'shipped'
        };

        setAssignments([newAssignment, ...assignments]);
        setFormData({ product: '', kitchen: '', quantity: '', staff: '', notes: '' });
        toast.success('Product successfully assign ho gaya! 🚚', {
            style: { borderRadius: '15px', background: '#2D1B0D', color: '#fff' },
        });
    };

    const deleteAssignment = (id) => {
        if (window.confirm('Yeh record remove kar dein?')) {
            setAssignments(assignments.filter(a => a.id !== id));
            toast.error('Record removed');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div>
                <span className="text-primary font-bold tracking-widest text-xs uppercase italic">Inventory Distribution</span>
                <h1 className="text-4xl font-black text-secondary mt-1 tracking-tight">Product Assign</h1>
                <p className="text-zinc-500 font-medium">Distribute products to kitchens, counters, and storage areas</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5 }}
                        key={stat.title}
                        className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-premium group transition-all hover:shadow-2xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-2xl ${stat.color} flex items-center justify-center text-secondary/70`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black px-3 py-1 bg-zinc-50 rounded-full text-zinc-400 border border-zinc-100 uppercase tracking-widest">Live</span>
                        </div>
                        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-none">{stat.title}</p>
                        <h3 className="text-3xl font-black text-secondary mt-2">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Assignment Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-12 xl:col-span-5"
                >
                    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-2xl relative overflow-hidden">
                        <h2 className="text-2xl font-black text-secondary mb-8 flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary shadow-lg shadow-primary/30">
                                <Send size={24} />
                            </div>
                            New Distribution
                        </h2>

                        <form onSubmit={handleAssign} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600 uppercase ml-1 block tracking-wider">Select Product</label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <select
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-secondary font-bold outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
                                        value={formData.product}
                                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                    >
                                        <option value="">Select Item...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.name}>{p.name} ({p.currentStock} {p.unit} left)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600 uppercase ml-1 block tracking-wider">Assign To (Destination)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <select
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-secondary font-bold outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
                                        value={formData.kitchen}
                                        onChange={(e) => setFormData({ ...formData, kitchen: e.target.value })}
                                    >
                                        <option value="">Select Kitchen/Counter...</option>
                                        {kitchens.map(k => (
                                            <option key={k.id} value={k.name}>{k.name} ({k.location})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-600 uppercase ml-1 block tracking-wider">Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-secondary font-black text-xl outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-600 uppercase ml-1 block tracking-wider">Staff Handle</label>
                                    <input
                                        type="text"
                                        placeholder="Staff Name"
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-secondary font-bold outline-none focus:border-primary focus:bg-white transition-all"
                                        value={formData.staff}
                                        onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-secondary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-secondary/30 hover:shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg mt-2"
                            >
                                <ArrowRight size={24} strokeWidth={3} />
                                ASSIGN SHIPMENT
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Assignment History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-12 xl:col-span-7"
                >
                    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-premium overflow-hidden flex flex-col h-full max-h-[850px]">
                        <div className="p-8 border-b border-zinc-50 bg-[#fafafa]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-secondary tracking-tight">Recent Transfers</h2>
                                    <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest mt-1">Live Distribution log</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-zinc-200 text-primary shadow-sm">
                                    <History size={22} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <AnimatePresence mode='popLayout'>
                                {assignments.map((item, idx) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={item.id}
                                        className={`p-6 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 mb-4 group transition-all hover:bg-white hover:shadow-xl hover:border-primary/20`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary font-black text-xl shadow-sm border border-zinc-50">
                                                    {item.product.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-secondary text-base uppercase">{item.product}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1 text-[10px] font-black text-zinc-400 uppercase">
                                                            <ChefHat size={12} className="text-primary" /> {item.kitchen}
                                                        </span>
                                                        <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase">{item.time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-8">
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-secondary">
                                                        {item.quantity} <span className="text-[10px] text-zinc-400 uppercase">{item.unit}</span>
                                                    </p>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${item.status === 'delivered' ? 'bg-accent/10 text-accent' : 'bg-blue-50 text-blue-500'}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => deleteAssignment(item.id)}
                                                    className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="p-10 border-t border-zinc-100 bg-zinc-50/50">
                            <p className="text-center text-zinc-400 text-[11px] font-black uppercase tracking-[0.3em]">
                                Inventory Flow Log End
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductAssign;
