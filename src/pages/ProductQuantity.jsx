import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ArrowUpDown,
    MoreVertical,
    Edit3,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    Package,
    Layers,
    ShoppingBag,
    TrendingDown,
    X,
    Save,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductQuantity = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Mock Inventory Data
    const [inventory, setInventory] = useState([
        { id: 1, name: 'Premium Basmati Rice', category: 'Ingredients', stock: 120, minStock: 50, unit: 'kg', lastUpdated: '2 hours ago' },
        { id: 2, name: 'Cooking Oil', category: 'Ingredients', stock: 15, minStock: 20, unit: 'ltr', lastUpdated: '1 hour ago' },
        { id: 3, name: 'Regular Gol Gapppa (Uncooked)', category: 'Snacks', stock: 5000, minStock: 1000, unit: 'pcs', lastUpdated: 'Today' },
        { id: 4, name: 'Masala Packets', category: 'Packaging', stock: 300, minStock: 100, unit: 'pkt', lastUpdated: 'Yesterday' },
        { id: 5, name: 'Green Chutney Powder', category: 'Ingredients', stock: 8, minStock: 10, unit: 'kg', lastUpdated: '3 hours ago' },
        { id: 6, name: 'Paper Plates', category: 'Packaging', stock: 0, minStock: 500, unit: 'pcs', lastUpdated: '2 days ago' },
        { id: 7, name: 'Sweet Tamarind Paste', category: 'Ingredients', stock: 45, minStock: 15, unit: 'kg', lastUpdated: 'Today' },
    ]);

    const categories = ['All', 'Ingredients', 'Snacks', 'Packaging', 'Others'];

    // Stats calculation
    const stats = useMemo(() => {
        const lowStock = inventory.filter(item => item.stock > 0 && item.stock <= item.minStock).length;
        const outOfStock = inventory.filter(item => item.stock === 0).length;
        return [
            { title: 'Total Products', value: inventory.length, icon: <Package />, color: 'bg-blue-200', trend: 'up', trendValue: 'Active' },
            { title: 'Low Stock Alert', value: lowStock, icon: <AlertTriangle />, color: 'bg-orange-200', trend: 'down', trendValue: `${lowStock} items` },
            { title: 'Out of Stock', value: outOfStock, icon: <TrendingDown />, color: 'bg-red-200', trend: 'down', trendValue: `${outOfStock} items` },
            { title: 'Categories', value: categories.length - 1, icon: <Layers />, color: 'bg-green-200', trend: 'up', trendValue: 'Ready' },
        ];
    }, [inventory]);

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (stock, minStock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' };
        if (stock <= minStock) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500' };
        return { label: 'In Stock', color: 'bg-accent/10 text-accent', dot: 'bg-accent' };
    };

    const handleEdit = (product) => {
        setEditingProduct({ ...product });
        setIsEditModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Remove this product from inventory?')) {
            setInventory(inventory.filter(p => p.id !== id));
            toast.error('Product removed');
        }
    };

    const saveEdit = (e) => {
        e.preventDefault();
        setInventory(inventory.map(p => p.id === editingProduct.id ? editingProduct : p));
        setIsEditModalOpen(false);
        toast.success('Stock updated successfully');
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-primary font-bold tracking-widest text-xs uppercase italic">Inventory Overview</span>
                    <h1 className="text-3xl font-black text-secondary mt-1 tracking-tight">Product Quantity</h1>
                    <p className="text-zinc-500 font-medium">Real-time monitoring of stock levels and alerts</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm w-fit">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-secondary text-white shadow-lg' : 'text-zinc-400 hover:text-secondary'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
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
                            <div className={`p-4 rounded-2xl ${stat.color} bg-opacity-10 text-${stat.color.split('-')[1] === 'accent' ? 'accent' : stat.color.split('-')[1] + '-600'}`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${stat.trend === 'up' ? 'bg-accent/10 text-accent' : 'bg-red-100 text-red-600'}`}>
                                {stat.trendValue}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none">{stat.title}</p>
                        <h3 className="text-2xl font-black text-secondary mt-2">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-premium overflow-hidden">
                {/* Table Controls */}
                <div className="p-6 border-b border-zinc-50 bg-[#fafafa] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by product name..."
                            className="w-full bg-white border-2 border-zinc-200 rounded-2xl py-4 pl-15 pr-6 text-secondary font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white text-zinc-600 border border-zinc-200 px-5 py-3.5 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-sm shadow-sm">
                            <ArrowUpDown size={18} /> Sort A-Z
                        </button>
                        <button className="flex items-center gap-2 bg-secondary text-white px-5 py-3.5 rounded-2xl hover:bg-black transition-all font-bold text-sm shadow-xl shadow-secondary/20">
                            <Filter size={18} /> Detailed Filter
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50">
                                <th className="px-8 py-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Product Info</th>
                                <th className="px-8 py-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Category</th>
                                <th className="px-8 py-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-center">Current Stock</th>
                                <th className="px-8 py-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Status</th>
                                <th className="px-8 py-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            <AnimatePresence mode='popLayout'>
                                {filteredInventory.map((item) => {
                                    const status = getStockStatus(item.stock, item.minStock);
                                    return (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={item.id}
                                            className="group hover:bg-zinc-50 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-100 group-hover:bg-white transition-all shadow-sm">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-secondary text-base uppercase tracking-tight">{item.name}</h4>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">Updated {item.lastUpdated}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div>
                                                    <p className="text-xl font-black text-secondary">
                                                        {item.stock} <span className="text-[11px] text-zinc-400 font-bold uppercase">{item.unit}</span>
                                                    </p>
                                                    {/* Progress bar visual */}
                                                    <div className="w-24 h-1.5 bg-zinc-100 rounded-full mt-2 mx-auto overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.stock === 0 ? 'w-0' : (item.stock <= item.minStock ? 'bg-orange-500 w-1/3' : 'bg-accent w-full')}`}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider ${status.color}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                                                    {status.label}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredInventory.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 border-4 border-dashed border-zinc-100 mx-auto mb-6">
                            <Package size={40} />
                        </div>
                        <h3 className="text-zinc-500 font-black text-xl uppercase tracking-widest">No matching products</h3>
                        <p className="text-zinc-300 text-sm font-bold mt-2">Adjust your search or filters to find what you're looking for.</p>
                    </div>
                )}

                {/* Pagination Placeholder */}
                <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Showing {filteredInventory.length} of {inventory.length} products</p>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-secondary hover:border-secondary transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20">
                            1
                        </button>
                        <button className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-secondary hover:border-secondary transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal / Slide-over */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-secondary/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-secondary flex items-center gap-3">
                                    <Edit3 className="text-primary" /> Edit Stock
                                </h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={saveEdit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1 block mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-zinc-400 font-bold outline-none cursor-not-allowed"
                                        value={editingProduct?.name}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1 block mb-2">Current Stock</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-secondary font-black text-xl outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                                value={editingProduct?.stock}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary font-black uppercase text-xs">
                                                {editingProduct?.unit}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1 block mb-2">Threshold / Min</label>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-secondary font-black text-xl outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                            value={editingProduct?.minStock}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-secondary text-white font-black py-5 rounded-2xl shadow-xl shadow-secondary/20 hover:shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    <Save size={24} strokeWidth={3} />
                                    SAVE CHANGES
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductQuantity;
