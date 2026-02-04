import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdInventory, MdWarning, MdAssessment, MdSearch, MdHistory, MdArrowForward } from 'react-icons/md';
import { getUserInventory, getTransferHistory } from '../utils/api';
import toast from 'react-hot-toast';

const MyInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invRes, transRes] = await Promise.all([getUserInventory(), getTransferHistory()]);
            if (invRes.data.success) setInventory(invRes.data.inventory);
            if (transRes.data.success) setTransfers(transRes.data.transfers);
        } catch (error) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredInventory = inventory.filter(item =>
        item.product.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdInventory size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Department Stock</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">My Assigned Inventory</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Stock levels assigned to your department by management.</p>
                </div>

                <div className="relative w-full max-w-md group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search assigned products..."
                        className="w-full bg-white border border-zinc-100 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-sm outline-none focus:border-primary shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inventory Table */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-premium overflow-hidden"
                >
                    <div className="p-6 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
                        <h2 className="text-sm font-black text-secondary uppercase tracking-tight">Current Stock Levels</h2>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-zinc-100">
                            {filteredInventory.length} Items Found
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-50/50 text-left border-b border-zinc-100">
                                    <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Product Details</th>
                                    <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                    <th className="p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Available Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="p-10 text-center text-zinc-400 font-bold">Checking vault...</td></tr>
                                ) : filteredInventory.length === 0 ? (
                                    <tr><td colSpan="3" className="p-10 text-center text-zinc-400 font-bold">No stock assigned yet.</td></tr>
                                ) : filteredInventory.map((item) => (
                                    <tr key={item._id} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                                                    <MdInventory size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-secondary text-sm">{item.product.name}</p>
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.product.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase ${item.quantity > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {item.quantity > 5 ? 'Sufficient' : 'Low Stock'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <p className="text-lg font-black text-secondary">{item.quantity}</p>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase">{item.product.unit}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Transfer History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 space-y-6"
                >
                    <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-premium overflow-hidden">
                        <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                    <MdHistory size={18} />
                                </div>
                                <h3 className="text-sm font-black text-secondary uppercase tracking-tight italic">Transfer Logs</h3>
                            </div>
                        </div>

                        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                            {transfers.slice(0, 10).map((log, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group relative overflow-hidden">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-zinc-400 text-[8px] font-black uppercase tracking-widest">
                                                {log.fromUser?.role === 'super_admin' ? 'Management' : 'Self'} <MdArrowForward /> {log.toUser?.role.replace('_', ' ')}
                                            </div>
                                            <p className="font-black text-secondary text-xs">{log.product.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-primary">+{log.quantity}</p>
                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">{log.product.unit}</p>
                                        </div>
                                    </div>
                                    <p className="text-[8px] text-zinc-500 font-medium italic">"{log.notes || 'Routine stock allocation'}"</p>
                                    <p className="mt-2 text-[7px] font-black text-zinc-400 uppercase tracking-tighter">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MyInventory;
