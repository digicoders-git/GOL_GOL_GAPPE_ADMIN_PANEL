import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdKitchen, MdInventory, MdWarning, MdCheckCircle, MdError, MdRefresh, MdSearch, MdFilterList, MdTrendingDown } from 'react-icons/md';
import { getKitchens, getTransferHistory } from '../utils/api';
import toast from 'react-hot-toast';

const KitchenStockMonitor = () => {
    const [kitchens, setKitchens] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [kitchenRes, transferRes] = await Promise.all([
                getKitchens(),
                getTransferHistory()
            ]);
            
            if (kitchenRes.data.success) {
                setKitchens(kitchenRes.data.kitchens || []);
            }
            if (transferRes.data.success) {
                setTransfers(transferRes.data.transfers || []);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getKitchenStats = (kitchen) => {
        const products = kitchen.assignedProducts || [];
        const total = products.length;
        const outOfStock = products.filter(p => p.quantity <= 0).length;
        const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;
        const inStock = total - outOfStock - lowStock;
        
        return { total, outOfStock, lowStock, inStock };
    };

    const getKitchenTransfers = (kitchenId) => {
        return transfers.filter(t => 
            t.toUser?.kitchen?.toString() === kitchenId?.toString()
        ).slice(0, 5);
    };

    const filteredKitchens = kitchens.filter(k => {
        const matchesSearch = k.name?.toLowerCase().includes(search.toLowerCase());
        const stats = getKitchenStats(k);
        
        if (statusFilter === 'Critical') return matchesSearch && stats.outOfStock > 0;
        if (statusFilter === 'Low Stock') return matchesSearch && stats.lowStock > 0;
        if (statusFilter === 'Healthy') return matchesSearch && stats.outOfStock === 0 && stats.lowStock === 0;
        
        return matchesSearch;
    });

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                            <MdKitchen size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                            Stock Intelligence
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic">Kitchen Stock Monitor</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Real-time inventory tracking across all kitchens</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search kitchens..."
                            className="bg-white border border-zinc-100 rounded-2xl py-3 pl-12 pr-4 font-bold text-sm outline-none focus:border-primary shadow-sm w-[300px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-3 bg-secondary text-primary rounded-2xl shadow-lg hover:scale-105 transition-all"
                    >
                        <MdRefresh size={20} />
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm w-fit">
                {['All', 'Critical', 'Low Stock', 'Healthy'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            statusFilter === status
                                ? 'bg-secondary text-primary shadow-md'
                                : 'text-zinc-400 hover:text-secondary'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Kitchen Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : filteredKitchens.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <MdKitchen size={48} className="mx-auto text-zinc-200 mb-4" />
                            <p className="text-sm font-black text-zinc-400 uppercase">No kitchens found</p>
                        </div>
                    ) : filteredKitchens.map((kitchen, idx) => {
                        const stats = getKitchenStats(kitchen);
                        const recentTransfers = getKitchenTransfers(kitchen._id);
                        const isCritical = stats.outOfStock > 0;
                        const isLow = stats.lowStock > 0 && !isCritical;

                        return (
                            <motion.div
                                key={kitchen._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-white rounded-3xl border-2 shadow-lg overflow-hidden ${
                                    isCritical ? 'border-red-200' : isLow ? 'border-orange-200' : 'border-zinc-100'
                                }`}
                            >
                                {/* Kitchen Header */}
                                <div className={`p-6 border-b ${
                                    isCritical ? 'bg-red-50 border-red-100' : 
                                    isLow ? 'bg-orange-50 border-orange-100' : 
                                    'bg-zinc-50 border-zinc-100'
                                }`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                                                isCritical ? 'bg-red-100 text-red-600' :
                                                isLow ? 'bg-orange-100 text-orange-600' :
                                                'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                <MdKitchen size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-secondary">{kitchen.name}</h3>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{kitchen.location}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                                            isCritical ? 'bg-red-100 text-red-600' :
                                            isLow ? 'bg-orange-100 text-orange-600' :
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {isCritical ? '🚨 Critical' : isLow ? '⚠️ Low' : '✓ Healthy'}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="bg-white rounded-xl p-3 text-center border border-zinc-100">
                                            <p className="text-xl font-black text-secondary">{stats.total}</p>
                                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">Total</p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                            <p className="text-xl font-black text-emerald-600">{stats.inStock}</p>
                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-wide">In Stock</p>
                                        </div>
                                        <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                                            <p className="text-xl font-black text-orange-600">{stats.lowStock}</p>
                                            <p className="text-[8px] font-black text-orange-600 uppercase tracking-wide">Low</p>
                                        </div>
                                        <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                                            <p className="text-xl font-black text-red-600">{stats.outOfStock}</p>
                                            <p className="text-[8px] font-black text-red-600 uppercase tracking-wide">Out</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Products List */}
                                <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Current Inventory</p>
                                    {(kitchen.assignedProducts || []).length === 0 ? (
                                        <p className="text-xs text-zinc-400 text-center py-4">No products assigned</p>
                                    ) : (
                                        (kitchen.assignedProducts || []).map((item, i) => {
                                            const isOut = item.quantity <= 0;
                                            const isLowItem = item.quantity > 0 && item.quantity <= 5;

                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex items-center justify-between p-3 rounded-xl border ${
                                                        isOut ? 'bg-red-50 border-red-100' :
                                                        isLowItem ? 'bg-orange-50 border-orange-100' :
                                                        'bg-zinc-50 border-zinc-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                                                            isOut ? 'bg-red-500' :
                                                            isLowItem ? 'bg-orange-500' :
                                                            'bg-emerald-500'
                                                        }`}>
                                                            {isOut ? <MdError size={16} /> : isLowItem ? <MdWarning size={16} /> : <MdCheckCircle size={16} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-black text-secondary truncate">{item.product?.name || 'Unknown'}</p>
                                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">{item.product?.category}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-black ${
                                                            isOut ? 'text-red-600' :
                                                            isLowItem ? 'text-orange-600' :
                                                            'text-emerald-600'
                                                        }`}>
                                                            {item.quantity}
                                                        </p>
                                                        <p className="text-[8px] font-bold text-zinc-400 uppercase">{item.product?.unit}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Recent Transfers */}
                                {recentTransfers.length > 0 && (
                                    <div className="p-4 bg-zinc-50 border-t border-zinc-100">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Recent Transfers</p>
                                        <div className="space-y-2">
                                            {recentTransfers.map((transfer, i) => (
                                                <div key={i} className="flex items-center justify-between text-[10px]">
                                                    <span className="font-bold text-secondary truncate flex-1">{transfer.product?.name}</span>
                                                    <span className="font-black text-emerald-600 ml-2">+{transfer.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default KitchenStockMonitor;
