import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MdLock,
    MdVisibility,
    MdVisibilityOff,
    MdCheckCircle,
    MdSecurity,
    MdWarning,
    MdVpnKey,
    MdShield,
    MdHistory,
    MdArrowForward
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { changePassword } from '../utils/api';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match!');
            return;
        }

        const loadingToast = toast.loading('Updating security credentials...');
        try {
            const response = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            if (response.data.success) {
                toast.success('Password updated successfully!', { id: loadingToast });
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.response?.data?.message || 'Failed to update password', { id: loadingToast });
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">

            {/* --- Compact Header --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdVpnKey size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Security Settings</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Security Credentials</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Keep your account secure by updating your password regularly.</p>
                </div>


            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* --- Form Section --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-7"
                >
                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-premium relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                <MdLock size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-secondary tracking-tight uppercase">Update Password</h2>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Credential Management</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative">
                                    <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-12 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('current')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-primary transition-colors"
                                    >
                                        {showPasswords.current ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-zinc-100 to-transparent my-4" />

                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative">
                                    <MdSecurity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-12 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('new')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-primary transition-colors"
                                    >
                                        {showPasswords.new ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <div className="relative">
                                    <MdCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-12 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Re-enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('confirm')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-primary transition-colors"
                                    >
                                        {showPasswords.confirm ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-secondary text-primary font-black py-4 rounded-xl shadow-lg shadow-secondary/10 hover:shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-sm group mt-6 cursor-pointer"
                            >
                                <MdLock size={20} className="group-hover:rotate-12 transition-transform" />
                                UPDATE CREDENTIALS
                            </button>
                        </form>

                        {/* Decor */}
                        <MdShield size={200} className="absolute -bottom-12 -right-12 text-secondary/[0.02] -rotate-12 pointer-events-none" />
                    </div>
                </motion.div>

                {/* --- Requirements & Tips Section --- */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-5 flex flex-col gap-6"
                >
                    {/* Password Requirements */}
                    <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                                <MdWarning size={18} />
                            </div>
                            <h3 className="text-base font-black text-secondary uppercase tracking-tight">Requirements</h3>
                        </div>
                        <div className="space-y-3">
                            {passwordRequirements.map((req, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${req.met ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                                    }`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-400'
                                        }`}>
                                        <MdCheckCircle size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wide">{req.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Stats */}
                    <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                        <h3 className="text-base font-black text-secondary uppercase tracking-tight mb-5">Security Status</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Password Strength', value: 'Strong', percent: 85, color: 'bg-emerald-500' },
                                { label: 'Last Changed', value: '30 days ago', percent: 60, color: 'bg-orange-400' },
                                { label: 'Security Score', value: '92/100', percent: 92, color: 'bg-blue-500' }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                                        <span className="text-xs font-black text-secondary">{stat.value}</span>
                                    </div>
                                    <div className="h-2 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.percent}%` }}
                                            transition={{ duration: 1, delay: 0.3 + (i * 0.1) }}
                                            className={`h-full ${stat.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Tip */}

                </motion.div>
            </div>
        </div>
    );
};

export default ChangePassword;
