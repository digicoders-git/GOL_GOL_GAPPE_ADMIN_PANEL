import { useState, useEffect, useMemo, useRef } from 'react';
import { MdInventory, MdSearch, MdRefresh, MdWarning, MdCheckCircle, MdTrendingUp } from 'react-icons/md';
import { getUserInventory } from '../utils/api';
import toast from 'react-hot-toast';
import Tooltip from '../components/common/Tooltip';
import io from 'socket.io-client';

const MyInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const socketRef = useRef(null);
    const refreshTimeoutRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const invRes = await getUserInventory();
            
            if (invRes.data.success) {
                console.log('Inventory data:', invRes.data.inventory);
                setInventory(invRes.data.inventory || []);
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
        
        // Initialize Socket.IO connection
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const socket = io(API_URL, {
            auth: {
                token: localStorage.getItem('token')
            }
        });
        socketRef.current = socket;

        // Listen for stock updates
        socket.on('stock-updated', () => {
            // console.log('Stock update received from server');
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = setTimeout(() => {
                fetchData();
            }, 500);
        });

        socket.on('kitchen-stock-updated', () => {
            // console.log('Kitchen stock update received');
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = setTimeout(() => {
                fetchData();
            }, 500);
        });

        return () => {
            if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
            socket.disconnect();
        };
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
        toast.success('Inventory Updated');
    };

    // Polling fallback - refetch every 30 seconds
    useEffect(() => {
        const pollInterval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(pollInterval);
    }, []);

    const stats = useMemo(() => {
        const totalAssigned = inventory.reduce((sum, item) => sum + (item.assigned || 0), 0);
        const totalUsed = inventory.reduce((sum, item) => sum + (item.used || 0), 0);
        const totalRemaining = inventory.reduce((sum, item) => sum + (item.remaining || item.quantity || 0), 0);
        const outOfStock = inventory.filter(item => (item.remaining || item.quantity || 0) <= 0).length;

        return { totalAssigned, totalUsed, totalRemaining, outOfStock };
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const productName = item.product?.name || '';
            const category = item.product?.category || '';
            const matchesSearch = productName.toLowerCase().includes(search.toLowerCase()) ||
                category.toLowerCase().includes(search.toLowerCase());
            return matchesSearch;
        });
    }, [inventory, search]);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-6">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <MdInventory size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.totalAssigned}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Assigned</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <MdTrendingUp size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.totalUsed}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Used</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm border-l-4 border-l-emerald-400">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <MdCheckCircle size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.totalRemaining}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Remaining</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm border-l-4 border-l-orange-400">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <MdWarning size={24} />
                        </div>
                        <span className="text-3xl font-black text-secondary">{stats.outOfStock}</span>
                    </div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Out of Stock</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                <th className="px-6 py-4 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Assigned</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Used</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Remaining</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-zinc-400">Loading...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <p className="text-sm font-bold text-zinc-400">No products found</p>
                                    </td>
                                </tr>
                            ) : filteredInventory.map((item) => {
                                // Handle both old and new data structures
                                const assigned = item.assigned !== undefined ? item.assigned : 0;
                                const used = item.used !== undefined ? item.used : 0;
                                const remaining = item.remaining !== undefined ? item.remaining : (item.quantity || 0);
                                const productName = item.product?.name || 'Unknown';
                                const category = item.product?.category || 'General';
                                const unit = item.product?.unit || 'Units';
                                const thumbnail = item.product?.thumbnail;
                                const minStock = item.product?.minStock || 10;
                                
                                // Use status from backend first, then calculate if not present
                                let status = item.status || item.product?.status;
                                if (!status) {
                                    if (remaining > minStock) {
                                        status = 'In Stock';
                                    } else if (remaining > 0) {
                                        status = 'Low Stock';
                                    } else {
                                        status = 'Out of Stock';
                                    }
                                }
                                
                                // Calculate status color
                                let statusColor = 'bg-zinc-100 text-zinc-600';
                                let statusIcon = null;
                                if (status === 'In Stock') {
                                    statusColor = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                                    statusIcon = <MdCheckCircle size={14} />;
                                } else if (status === 'Low Stock') {
                                    statusColor = 'bg-orange-100 text-orange-700 border-orange-200';
                                    statusIcon = <MdWarning size={14} />;
                                } else if (status === 'Out of Stock') {
                                    statusColor = 'bg-red-100 text-red-700 border-red-200';
                                    statusIcon = <MdWarning size={14} />;
                                }

                                return (
                                    <tr key={item._id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center border border-zinc-200 overflow-hidden">
                                                    {thumbnail ? (
                                                        <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <MdInventory size={20} className="text-zinc-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-secondary text-xs uppercase tracking-tight">{productName}</p>
                                                    <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">{category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-lg font-black text-blue-600">{assigned}</span>
                                                <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-lg font-black text-red-600">{used}</span>
                                                <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex flex-col items-center bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                                <span className="text-lg font-black text-emerald-600">{remaining}</span>
                                                <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-wider ${statusColor}`}>
                                                {statusIcon}
                                                {status}
                                            </div>
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
