import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdKitchen, MdInventory, MdWarning, MdCheckCircle, MdError, MdRefresh, MdSearch, MdFilterList, MdTrendingDown, MdViewList, MdViewModule, MdLocationOn, MdPerson, MdWhatshot } from 'react-icons/md';
import { getKitchens, getTransferHistory } from '../utils/api';
import toast from 'react-hot-toast';

const KitchenStockMonitor = () => {
    const [kitchens, setKitchens] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [viewMode, setViewMode] = useState('table');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [kitchenRes, transferRes] = await Promise.all([
                getKitchens(),
                getTransferHistory()
            ]);
            
            if (kitchenRes.data.success) {
                const kitchensData = kitchenRes.data.kitchens || [];
                console.log('Raw kitchens data:', kitchensData);
                setKitchens(kitchensData);
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
        
        // Handle both old format (quantity) and new format (assigned/used)
        const totalAssigned = products.reduce((acc, curr) => {
            // If new format exists, use it; otherwise use quantity as assigned
            return acc + (curr.assigned !== undefined ? curr.assigned : (curr.quantity || 0));
        }, 0);
        
        const totalUsed = products.reduce((acc, curr) => acc + (curr.used || 0), 0);
        const totalRemaining = totalAssigned - totalUsed;
        const totalItemsCount = products.length;
        
        const outOfStock = products.filter(p => {
            const assigned = p.assigned !== undefined ? p.assigned : (p.quantity || 0);
            const used = p.used || 0;
            return (assigned - used) <= 0;
        }).length;
        
        const lowStock = products.filter(p => {
            const assigned = p.assigned !== undefined ? p.assigned : (p.quantity || 0);
            const used = p.used || 0;
            const remaining = assigned - used;
            return remaining > 0 && remaining <= 5;
        }).length;
        
        const inStock = totalItemsCount - outOfStock - lowStock;
        
        console.log(`Kitchen ${kitchen.name} stats:`, { 
            totalAssigned, 
            totalUsed, 
            totalRemaining,
            products: products.map(p => ({
                name: p.product?.name,
                assigned: p.assigned,
                used: p.used,
                quantity: p.quantity
            }))
        });
        
        return { 
            total: totalItemsCount, 
            totalAssigned, 
            totalUsed, 
            totalRemaining,
            outOfStock, 
            lowStock, 
            inStock 
        };
    };

    const getKitchenTransfers = (kitchenAdmin) => {
        if (!kitchenAdmin) return [];
        const adminId = kitchenAdmin._id || kitchenAdmin;
        return transfers.filter(t => {
            const toUserId = t.toUser?._id || t.toUser;
            return toUserId?.toString() === adminId?.toString();
        }).slice(0, 5);
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
        <div className="max-w-[1600px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">
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
                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-zinc-100 shadow-sm mr-2">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-secondary text-primary shadow-md' : 'text-zinc-400 hover:text-secondary'}`}
                        >
                            <MdViewList size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'card' ? 'bg-secondary text-primary shadow-md' : 'text-zinc-400 hover:text-secondary'}`}
                        >
                            <MdViewModule size={20} />
                        </button>
                    </div>

                    <div className="relative group">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search kitchens..."
                            className="bg-white border border-zinc-100 rounded-2xl py-2.5 pl-12 pr-4 font-bold text-xs outline-none focus:border-primary shadow-sm w-[300px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-secondary text-primary rounded-xl shadow-lg hover:scale-105 transition-all"
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

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        key="loading" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center py-20"
                    >
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </motion.div>
                ) : filteredKitchens.length === 0 ? (
                    <motion.div 
                        key="empty" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-20"
                    >
                        <MdKitchen size={48} className="mx-auto text-zinc-200 mb-4" />
                        <p className="text-sm font-black text-zinc-400 uppercase">No kitchens found</p>
                    </motion.div>
                ) : viewMode === 'table' ? (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-premium overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Kitchen Node</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Manager</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Assigned</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Used</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Remaining</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Usage %</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {filteredKitchens.map((k) => {
                                        const stats = getKitchenStats(k);
                                        const isCritical = stats.outOfStock > 0;
                                        const isLow = stats.lowStock > 0 && !isCritical;
                                        const usagePercent = stats.totalAssigned > 0 ? Math.round((stats.totalUsed / stats.totalAssigned) * 100) : 0;
                                        
                                        return (
                                            <tr key={k._id} className="hover:bg-zinc-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                                            isCritical ? 'bg-red-50 text-red-600 border-red-100' : 
                                                            isLow ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        }`}>
                                                            <MdKitchen size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-secondary leading-none mb-1">{k.name}</h4>
                                                            <div className="flex items-center gap-1 text-zinc-400">
                                                                <MdLocationOn size={10} />
                                                                <span className="text-[9px] font-bold uppercase tracking-widest">{k.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                                                            <MdPerson size={16} />
                                                        </div>
                                                        <span className="text-sm font-bold text-secondary uppercase tracking-tight">{k.manager || k.admin?.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black">
                                                        {stats.totalAssigned}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-black">
                                                        {stats.totalUsed}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1.5 bg-secondary text-primary rounded-lg text-xs font-black shadow-sm">
                                                        {stats.totalRemaining}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs font-black text-secondary">{usagePercent}%</span>
                                                        <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${usagePercent}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                                                        isCritical ? 'bg-red-50 text-red-600 border-red-100' :
                                                        isLow ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
                                                        {isCritical ? 'CRITICAL' : isLow ? 'LOW' : 'STABLE'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => { setViewMode('card'); setSearch(k.name); }}
                                                        className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                                                    >
                                                        View Inventory
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredKitchens.map((kitchen, idx) => {
                            const stats = getKitchenStats(kitchen);
                            const recentTransfers = getKitchenTransfers(kitchen.admin);
                            const isCritical = stats.outOfStock > 0;
                            const isLow = stats.lowStock > 0 && !isCritical;
                            const usagePercent = stats.totalAssigned > 0 ? Math.round((stats.totalUsed / stats.totalAssigned) * 100) : 0;

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

                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            <div className="bg-white rounded-xl p-3 text-center border border-zinc-100">
                                                <p className="text-xl font-black text-emerald-600">{stats.totalAssigned}</p>
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">Assigned</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-3 text-center border border-zinc-100">
                                                <p className="text-xl font-black text-orange-600">{stats.totalUsed}</p>
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">Used</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-3 text-center border border-zinc-100">
                                                <p className="text-xl font-black text-secondary">{stats.totalRemaining}</p>
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">Remaining</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-3 text-center border border-zinc-100">
                                                <p className="text-xl font-black text-primary">{usagePercent}%</p>
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">Usage</p>
                                            </div>
                                        </div>

                                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full" style={{ width: `${usagePercent}%` }} />
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Current Inventory</p>
                                        {(kitchen.assignedProducts || []).length === 0 ? (
                                            <p className="text-xs text-zinc-400 text-center py-4">No products assigned</p>
                                        ) : (
                                            (kitchen.assignedProducts || []).map((item, i) => {
                                                const assigned = item.assigned !== undefined ? item.assigned : (item.quantity || 0);
                                                const used = item.used || 0;
                                                const remaining = assigned - used;
                                                const isOut = remaining <= 0;
                                                const isLowItem = remaining > 0 && remaining <= 5;

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
                                                        <div className="text-right ml-2">
                                                            <div className="flex gap-2 text-[10px] font-black">
                                                                <span className="text-emerald-600">{assigned}</span>
                                                                <span className="text-zinc-300">/</span>
                                                                <span className={isOut ? 'text-red-600' : isLowItem ? 'text-orange-600' : 'text-secondary'}>{remaining}</span>
                                                            </div>
                                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">{item.product?.unit}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KitchenStockMonitor;
