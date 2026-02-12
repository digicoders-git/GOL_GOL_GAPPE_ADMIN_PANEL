import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdInventory,
    MdWarning,
    MdSearch,
    MdTrendingUp,
    MdTableChart,
    MdRefresh,
    MdReportProblem,
    MdCheckCircle,
    MdError
} from 'react-icons/md';
import { getUserInventory, getTransferHistory } from '../utils/api';
import toast from 'react-hot-toast';
import Tooltip from '../components/common/Tooltip';

const MyInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchData = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const [invRes, transferRes] = await Promise.all([
                getUserInventory(),
                getTransferHistory()
            ]);

            if (invRes.data.success) {
                setInventory(invRes.data.inventory || []);
            }

            if (transferRes.data.success) {
                setTransfers(transferRes.data.transfers || []);
            }
        } catch (error) {
            console.error('Inventory Fetch Error:', error);
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
        toast.success('Inventory Updated');
    };

    const stats = useMemo(() => {
        const remainingStock = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id || user.id;

        const assignedStock = transfers.reduce((sum, t) => {
            // Check if current user is the recipient
            const isRecipient = t.toUser?._id === userId || t.toUser === userId;
            return isRecipient ? sum + (t.quantity || 0) : sum;
        }, 0);

        // Used stock shouldn't be negative (in case of manual adds)
        const usedStock = Math.max(0, assignedStock - remainingStock);

        const lowStock = inventory.filter(item => {
            const min = item.product?.minStock || 10;
            return item.quantity > 0 && item.quantity <= min;
        }).length;
        const outOfStock = inventory.filter(item => item.quantity <= 0).length;

        return { remainingStock, assignedStock, usedStock, lowStock, outOfStock };
    }, [inventory, transfers]);

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
                item.product?.category?.toLowerCase().includes(search.toLowerCase());

            const min = item.product?.minStock || 10;
            const status = item.quantity <= 0 ? 'Out of Stock' :
                item.quantity <= min ? 'Low Stock' : 'In Stock';

            const matchesFilter = filterStatus === 'All' || status === filterStatus;

            return matchesSearch && matchesFilter;
        });
    }, [inventory, search, filterStatus]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-secondary">My Stock</h1>
                    <p className="text-sm text-zinc-500 mt-1">Kitchen Inventory Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="bg-white border border-zinc-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary w-80"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Tooltip text="Refresh" position="top">
                        <button
                            onClick={handleRefresh}
                            className={`p-3 bg-secondary text-primary rounded-xl hover:scale-105 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <MdRefresh size={20} />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <MdInventory size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.assignedStock}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Assigned</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <MdCheckCircle size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.remainingStock}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Remaining Stock</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                            <MdTrendingUp size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.usedStock}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Used Stock</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <MdWarning size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.lowStock}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Low Stock</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <MdReportProblem size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.outOfStock}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Out of Stock</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h2 className="text-lg font-black text-secondary">Stock Details</h2>
                    <div className="flex bg-zinc-100 p-1 rounded-xl">
                        {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(st => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === st ? 'bg-secondary text-primary' : 'text-zinc-500'}`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50">
                                <th className="px-6 py-4 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Assigned</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Current</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Used</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Min Stock</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[9px] font-black text-zinc-400 uppercase tracking-widest">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-zinc-400">Loading...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <p className="text-sm font-bold text-zinc-400">No products found</p>
                                    </td>
                                </tr>
                            ) : filteredInventory.map((item) => {
                                const min = item.product?.minStock || 10;
                                const isOut = item.quantity <= 0;
                                const isLow = item.quantity <= min && !isOut;

                                // Find transfer history for this product
                                const productTransfers = transfers.filter(
                                    t => t.product?._id === item.product?._id || t.product === item.product?._id
                                );
                                const initialQty = productTransfers.reduce((sum, t) => sum + (t.quantity || 0), 0);
                                const usedQty = initialQty - item.quantity;

                                return (
                                    <tr key={item._id} className="border-b border-zinc-50 hover:bg-zinc-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center">
                                                    {item.product?.thumbnail ? (
                                                        <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <MdInventory size={20} className="text-zinc-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-secondary text-sm">{item.product?.name}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{item.product?.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-black text-blue-600">
                                                {initialQty}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 ml-1 font-bold">{item.product?.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-2xl font-black ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-emerald-600'}`}>
                                                {item.quantity}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 ml-1 font-bold">{item.product?.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-black text-purple-600">
                                                {usedQty}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 ml-1 font-bold">{item.product?.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold">
                                                {min} {item.product?.unit}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${isOut ? 'bg-red-50 text-red-600' : isLow ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                <div className={`w-2 h-2 rounded-full ${isOut ? 'bg-red-600' : isLow ? 'bg-orange-600' : 'bg-emerald-600'}`} />
                                                {isOut ? 'Out' : isLow ? 'Low' : 'Good'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-lg font-black text-secondary">₹{(item.quantity * (item.product?.price || 0)).toLocaleString('en-IN')}</p>
                                            <p className="text-[9px] text-zinc-400 font-bold">@₹{item.product?.price || 0}/{item.product?.unit}</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyInventory;
