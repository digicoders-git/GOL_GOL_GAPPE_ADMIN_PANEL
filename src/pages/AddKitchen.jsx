import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdOutlineKitchen,
    MdLocationOn,
    MdPerson,
    MdPhone,
    MdAccessTime,
    MdSpeed,
    MdSave,
    MdRocketLaunch,
    MdVerifiedUser,
    MdArrowBack,
    MdRefresh,
    MdTimer,
    MdMonitorWeight,
    MdAdminPanelSettings
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { createKitchen, getUsers } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AddKitchen = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [billingAdmins, setBillingAdmins] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        manager: '',
        admin: '',
        billingAdmin: '',
        phone: '',
        startTime: '08:00',
        endTime: '22:00',
        capacity: 'High'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await fetch(`${API_URL}/admins`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    const kitchenAdmins = data.users.filter(u => u.role === 'kitchen_admin');
                    const billingAdminsList = data.users.filter(u => u.role === 'billing_admin');
                    setAdmins(kitchenAdmins);
                    setBillingAdmins(billingAdminsList);
                }
            } catch (error) {
                console.error('Error fetching admins:', error);
                toast.error('Failed to load administrators');
            }
        };
        fetchAdmins();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading('Initializing kitchen unit...');

        try {
            const response = await createKitchen(formData);
            if (response.data.success) {
                toast.success(`Unit "${formData.name}" Initialized!`, { id: loadingToast });
                setFormData({
                    name: '',
                    location: '',
                    manager: '',
                    admin: '',
                    billingAdmin: '',
                    phone: '',
                    startTime: '08:00',
                    endTime: '22:00',
                    capacity: 'High'
                });
                setTimeout(() => navigate('/kitchen-management'), 2000);
            }
        } catch (error) {
            console.error('Create kitchen error:', error);
            toast.error(error.response?.data?.message || 'Failed to initialize kitchen', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in">

            {/* --- Compact Header --- */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                            <MdRocketLaunch size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Deployment Protocol</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic">Initialize Kitchen</h1>
                    <p className="text-zinc-500 text-xs font-medium">Add a high-performance production node to the global network.</p>
                </div>

                <button className="flex items-center gap-2 text-zinc-400 hover:text-secondary font-black text-[9px] uppercase tracking-widest transition-all bg-white px-4 py-2 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md cursor-pointer">
                    <MdArrowBack size={16} />
                    Return to Fleet
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* --- Form Section (Compact) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 bg-white rounded-3xl border border-zinc-100 shadow-premium overflow-hidden"
                >
                    <div className="p-6 lg:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Unit Identity */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-widest border-b border-zinc-50 pb-2">
                                        <MdOutlineKitchen className="text-primary" /> Identity Cluster
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kitchen Call-Sign</label>
                                        <div className="relative">
                                            <MdOutlineKitchen className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g., Downtown Central 01"
                                                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Assigned Manager</label>
                                        <div className="relative">
                                            <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Lead personnel name"
                                                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                                value={formData.manager}
                                                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 space-y-5">
                                        <div className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-widest border-b border-zinc-50 pb-2">
                                            <MdAdminPanelSettings className="text-primary" /> Authority Protocol
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kitchen Administrator</label>
                                            <div className="relative">
                                                <MdAdminPanelSettings className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                                                <select
                                                    required
                                                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                                                    value={formData.admin}
                                                    onChange={(e) => setFormData({ ...formData, admin: e.target.value })}
                                                >
                                                    <option value="">Select Kitchen Admin</option>
                                                    {admins.map(admin => (
                                                        <option key={admin._id} value={admin._id}>
                                                            {admin.email || admin.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Billing Administrator</label>
                                            <div className="relative">
                                                <MdAdminPanelSettings className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                                                <select
                                                    required
                                                    className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                                                    value={formData.billingAdmin}
                                                    onChange={(e) => setFormData({ ...formData, billingAdmin: e.target.value })}
                                                >
                                                    <option value="">Select Billing Admin</option>
                                                    {billingAdmins.map(admin => (
                                                        <option key={admin._id} value={admin._id}>
                                                            {admin.email || admin.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-widest border-b border-zinc-50 pb-2">
                                        <MdLocationOn className="text-primary" /> Geo-Coordinates
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Location Address</label>
                                        <div className="relative">
                                            <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Sector, Street, City"
                                                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Unit Comms</label>
                                        <div className="relative">
                                            <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors text-lg" />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="+91 Mobile Number"
                                                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parameters */}
                            <div className="pt-4 space-y-5">
                                <div className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-widest border-b border-zinc-50 pb-2">
                                    <MdTimer className="text-primary" /> Operational Config
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Open</label>
                                        <div className="relative">
                                            <MdAccessTime className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                            <input
                                                type="time"
                                                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Close</label>
                                        <div className="relative">
                                            <MdAccessTime className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                            <input
                                                type="time"
                                                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Payload Tier</label>
                                        <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100 shadow-inner h-[46px]">
                                            {['Low', 'Mid', 'Max'].map(cap => (
                                                <button
                                                    type="button"
                                                    key={cap}
                                                    onClick={() => setFormData({ ...formData, capacity: cap })}
                                                    className={`flex-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${formData.capacity === cap
                                                        ? 'bg-secondary text-primary shadow-lg'
                                                        : 'text-zinc-400 hover:text-secondary'
                                                        }`}
                                                >
                                                    {cap}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] bg-secondary text-primary font-black py-4 rounded-2xl shadow-lg shadow-secondary/10 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest group cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <MdSave size={20} />
                                            Initialize Unit
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        name: '', location: '', manager: '', admin: '', billingAdmin: '', phone: '',
                                        startTime: '08:00', endTime: '22:00', capacity: 'High'
                                    })}
                                    className="flex-1 bg-zinc-100 text-zinc-500 font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all text-[10px] uppercase tracking-widest border border-zinc-200"
                                >
                                    Purge
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* --- Sidebar Telemetry (Compact) --- */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Live Preview Card */}
                    <div className="bg-secondary rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-primary text-secondary rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                                    <MdOutlineKitchen size={24} />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                        Protocol Ready
                                    </span>
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Node-ID: TBD</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] italic">Deployment Call-Sign</p>
                                <h2 className="text-xl font-black tracking-tight uppercase italic truncate">
                                    {formData.name || 'Node Locked'}
                                </h2>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary border border-white/5">
                                        <MdPerson size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Unit Lead</span>
                                        <span className="text-[10px] font-black text-white truncate max-w-[120px]">{formData.manager || 'Awaiting Assignment'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary border border-white/5">
                                        <MdLocationOn size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Coordinates</span>
                                        <span className="text-[10px] font-black text-white truncate max-w-[120px]">{formData.location || 'Pending Vector'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                    <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Window</p>
                                    <p className="text-[9px] font-black text-primary uppercase flex items-center justify-center gap-1">
                                        <MdAccessTime size={10} /> {formData.startTime}-{formData.endTime}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                    <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1">Payload</p>
                                    <p className="text-[9px] font-black text-emerald-400 uppercase flex items-center justify-center gap-1">
                                        <MdSpeed size={10} /> {formData.capacity}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Decor */}
                        <MdRefresh size={180} className="absolute -bottom-10 -right-10 text-white/[0.02] -rotate-12 pointer-events-none" />
                    </div>

                    {/* Compliance Box */}
                    <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 bg-zinc-50 text-secondary rounded-xl flex items-center justify-center shrink-0 border border-zinc-100">
                            <MdVerifiedUser size={20} />
                        </div>
                        <div>
                            <h4 className="text-secondary font-black uppercase tracking-tight text-xs mb-1">Security Sync</h4>
                            <p className="text-[9px] font-medium text-zinc-500 leading-relaxed uppercase tracking-widest">
                                Unit must undergo Tier-1 security validation post-initialization.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddKitchen;
