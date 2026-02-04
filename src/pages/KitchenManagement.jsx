import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChefHat,
    Search,
    MapPin,
    Phone,
    Clock,
    User,
    MoreVertical,
    Activity,
    Settings2,
    CheckCircle2,
    XCircle,
    UtensilsCrossed,
    TrendingUp,
    Timer,
    Flame
} from 'lucide-react';

const KitchenManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const kitchens = [
        { id: 1, name: 'Main Central Kitchen', location: 'Malviya Nagar, Jaipur', manager: 'Rahul Khanna', contact: '+91 91234 56789', status: 'Active', orders: 12, performance: '98%', temperature: '24°C' },
        { id: 2, name: 'Raja Park Hub', location: 'Raja Park, Jaipur', manager: 'Sonia Sharma', contact: '+91 91234 56780', status: 'Busy', orders: 24, performance: '92%', temperature: '26°C' },
        { id: 3, name: 'Vaishali Express Unit', location: 'Vaishali Nagar, Jaipur', manager: 'Amit Patel', contact: '+91 91234 56781', status: 'Active', orders: 8, performance: '96%', temperature: '23°C' },
        { id: 4, name: 'C-Scheme Satellite', location: 'C-Scheme, Jaipur', manager: 'Priya Verma', contact: '+91 91234 56782', status: 'Offline', orders: 0, performance: 'N/A', temperature: '22°C' },
    ];

    const filteredKitchens = kitchens.filter(k =>
        k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-primary">
                            <UtensilsCrossed size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[10px] uppercase italic">Network Monitoring</span>
                    </div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">Kitchen Fleet</h1>
                    <p className="text-zinc-500 font-medium mt-1">Real-time status and performance tracking of all units.</p>
                </div>

                <div className="relative group w-full lg:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search kitchens by name or area..."
                        className="w-full bg-white border-2 border-zinc-100 rounded-[1.5rem] py-4.5 pl-16 pr-6 font-bold text-secondary outline-none focus:border-primary focus:shadow-xl focus:shadow-primary/10 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Global Kitchen Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Units', value: '12', icon: <ChefHat />, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Active Orders', value: '44', icon: <Timer />, color: 'bg-orange-50 text-orange-600' },
                    { label: 'Avg Efficiency', value: '94%', icon: <TrendingUp />, color: 'bg-green-50 text-green-700' },
                    { label: 'System Load', value: 'High', icon: <Flame />, color: 'bg-red-50 text-red-600' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border-2 border-zinc-50 shadow-premium flex items-center gap-5 group hover:border-primary transition-all">
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg shadow-zinc-100 group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-secondary tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Kitchen Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <AnimatePresence mode='popLayout'>
                    {filteredKitchens.map((kitchen) => (
                        <motion.div
                            key={kitchen.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl border-2 border-zinc-50 shadow-premium p-6 group hover:border-primary/20 transition-all relative overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col gap-6">
                                {/* Top Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-5">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-primary border-2 border-zinc-100 group-hover:bg-primary/5 transition-colors">
                                            <ChefHat size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-secondary tracking-tight uppercase italic">{kitchen.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin size={12} className="text-zinc-300" />
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{kitchen.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${kitchen.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        kitchen.status === 'Busy' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${kitchen.status === 'Active' ? 'bg-green-500' :
                                            kitchen.status === 'Busy' ? 'bg-orange-500' : 'bg-red-500'
                                            } animate-pulse`} />
                                        {kitchen.status}
                                    </div>
                                </div>

                                {/* Information Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Manager</p>
                                        <div className="flex items-center gap-2 text-secondary font-black text-sm uppercase">
                                            <User size={14} className="text-primary" />
                                            {kitchen.manager.split(' ')[0]}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Live Orders</p>
                                        <div className="flex items-center gap-2 text-secondary font-black text-sm">
                                            <Activity size={14} className="text-orange-500" />
                                            {kitchen.orders} Active
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Daily Perf.</p>
                                        <div className="flex items-center gap-2 text-secondary font-black text-sm">
                                            <TrendingUp size={14} className="text-green-500" />
                                            {kitchen.performance}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Ambient Temp</p>
                                        <div className="flex items-center gap-2 text-secondary font-black text-sm">
                                            <Flame size={14} className="text-red-500" />
                                            {kitchen.temperature}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-6 border-t border-dashed border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-lg bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-zinc-400">
                                                    S
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-lg bg-primary/20 border-2 border-white flex items-center justify-center text-[8px] font-black text-primary uppercase">
                                                +4
                                            </div>
                                        </div>
                                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Active Staff</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="p-3 bg-zinc-50 hover:bg-secondary hover:text-white rounded-xl transition-all shadow-sm">
                                            <Settings2 size={18} />
                                        </button>
                                        <button className="p-3 bg-zinc-50 hover:bg-primary hover:text-secondary rounded-xl transition-all shadow-sm">
                                            <Phone size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform">
                                <UtensilsCrossed size={200} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default KitchenManagement;
