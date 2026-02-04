import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    KeyRound,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const toggleShow = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const passwordRequirements = [
        { label: 'At least 8 characters long', met: formData.newPassword.length >= 8 },
        { label: 'Contains a number or symbol', met: /[0-9!@#$%^&*]/.test(formData.newPassword) },
        { label: 'Passwords must match', met: formData.newPassword && formData.newPassword === formData.confirmPassword }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match!');
            return;
        }

        toast.success('Password updated successfully! 🔐', {
            style: { borderRadius: '20px', background: '#2D1B0D', color: '#fff', fontWeight: 'bold' },
        });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg text-primary">
                        <KeyRound size={16} />
                    </div>
                    <span className="text-primary font-black tracking-widest text-[10px] uppercase italic">Security Settings</span>
                </div>
                <h1 className="text-4xl font-black text-secondary tracking-tight">Security Credentials</h1>
                <p className="text-zinc-500 font-medium mt-1">Keep your account secure by updating your password regularly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-7"
                >
                    <div className="bg-white p-6 rounded-3xl border-2 border-zinc-50 shadow-premium relative overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        required
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-16 pr-14 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('current')}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-primary transition-colors"
                                    >
                                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-dashed bg-gradient-to-r from-transparent via-zinc-100 to-transparent my-4" />

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">New Password</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        required
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-16 pr-14 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('new')}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-primary transition-colors"
                                    >
                                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Confirm New Password</label>
                                <div className="relative">
                                    <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        required
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-16 pr-14 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-inner"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('confirm')}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-primary transition-colors"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-secondary text-white font-black py-5 rounded-2xl shadow-xl shadow-secondary/20 hover:shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg group"
                            >
                                <Lock size={22} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                                UPDATE CREDENTIALS
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Requirements Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-5 flex flex-col gap-6"
                >
                    <div className="bg-white p-6 rounded-3xl border-2 border-zinc-50 shadow-premium">
                        <h3 className="text-xl font-black text-secondary uppercase tracking-tight mb-6 flex items-center gap-3">
                            <AlertCircle size={20} className="text-primary" />
                            Requirements
                        </h3>
                        <div className="space-y-4">
                            {passwordRequirements.map((req, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${req.met ? 'bg-green-50 border-green-100 text-green-700' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500 text-white' : 'bg-zinc-200 text-zinc-400'}`}>
                                        <CheckCircle2 size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wide">{req.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-secondary p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-white font-black text-lg mb-2 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-primary" />
                                Pro-Tip
                            </h4>
                            <p className="text-white/60 text-[10px] font-bold uppercase leading-relaxed tracking-wider">
                                We recommend using a unique password that you don't use on any other service.
                                Password changes are logged for security audits.
                            </p>
                            <button className="mt-6 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
                                Security Log <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ChangePassword;
