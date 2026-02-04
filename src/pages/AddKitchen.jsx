import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChefHat,
    MapPin,
    Phone,
    Plus,
    Save,
    User,
    Clock,
    Shield,
    Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddKitchen = () => {
    const [formData, setFormData] = useState({
        kitchenName: '',
        location: '',
        managerName: '',
        contact: '',
        startTime: '08:00',
        endTime: '22:00',
        capacity: 'High'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success(`Kitchen "${formData.kitchenName}" registered successfully! 🍳`);
        setFormData({
            kitchenName: '',
            location: '',
            managerName: '',
            contact: '',
            startTime: '08:00',
            endTime: '22:00',
            capacity: 'High'
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg text-primary">
                            <ChefHat size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[10px] uppercase italic">Operational Setup</span>
                    </div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">Register Kitchen</h1>
                    <p className="text-zinc-500 font-medium mt-1">Add a new kitchen unit to the Gol Gol Gappe network.</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border-2 border-zinc-50 shadow-premium relative overflow-hidden"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kitchen Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Kitchen Name</label>
                                <div className="relative">
                                    <ChefHat className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Main Central Kitchen"
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-16 pr-8 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                        value={formData.kitchenName}
                                        onChange={(e) => setFormData({ ...formData, kitchenName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Manager Name</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Rahul Khanna"
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-16 pr-8 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                        value={formData.managerName}
                                        onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location & Contact */}
                        <div className="space-y-6">
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Location Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Sector 12, Malviya Nagar"
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-16 pr-8 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+91 91234 56789"
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-16 pr-8 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Opening Time</label>
                            <div className="relative">
                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="time"
                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] py-5 pl-16 pr-8 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Closing Time</label>
                            <div className="relative">
                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="time"
                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-[1.5rem] py-5 pl-16 pr-8 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Kitchen Capacity</label>
                            <div className="flex bg-zinc-50 p-2 rounded-2xl border-2 border-zinc-100 shadow-inner">
                                {['Low', 'Medium', 'High'].map(cap => (
                                    <button
                                        type="button"
                                        key={cap}
                                        onClick={() => setFormData({ ...formData, capacity: cap })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.capacity === cap ? 'bg-secondary text-white shadow-lg' : 'text-zinc-400 hover:text-secondary'}`}
                                    >
                                        {cap}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t-2 border-dashed border-zinc-100 flex flex-col md:flex-row gap-6">
                        <button
                            type="submit"
                            className="flex-1 bg-secondary text-white font-black py-5 rounded-2xl shadow-xl shadow-secondary/20 hover:shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-xl group"
                        >
                            <Save size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                            SAVE KITCHEN DETAILS
                        </button>
                        <button
                            type="button"
                            className="md:w-64 bg-zinc-100 text-zinc-500 font-black py-5 rounded-2xl hover:bg-zinc-200 transition-all text-sm uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                    <ChefHat size={300} />
                </div>
            </motion.div>

            {/* Safety Notice */}
            <div className="bg-orange-50 border-2 border-orange-100 p-6 rounded-3xl flex items-start gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                    <Shield size={28} />
                </div>
                <div>
                    <h4 className="text-secondary font-black uppercase tracking-tight text-lg">Safety & Compliance</h4>
                    <p className="text-zinc-600 font-medium leading-relaxed">By registering this kitchen, you confirm that it meets all health and safety regulations. All kitchen activities will be logged and monitored by the central system.</p>
                </div>
            </div>
        </div>
    );
};

export default AddKitchen;
