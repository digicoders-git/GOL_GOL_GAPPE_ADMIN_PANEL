import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { otpLogin, sendOtp } from '../utils/api';

const UserLogin = () => {
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP/Name
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        otp: ''
    });
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (formData.mobile.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        try {
            const response = await sendOtp({ mobile: formData.mobile });
            if (response.data.success) {
                setIsRegistered(response.data.isRegistered);
                setStep(2);
                toast.success('OTP sent successfully!');
                if (response.data.otp) {
                    console.log('Test OTP:', response.data.otp);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyLogin = async (e) => {
        e.preventDefault();

        if (!isRegistered && !formData.name) {
            toast.error('Please enter your name for registration');
            return;
        }

        setLoading(true);
        try {
            const response = await otpLogin(formData);
            const data = response.data;

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success(`Welcome ${data.user.name || 'User'}!`);
                navigate('/user-dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FFFCF5] relative overflow-hidden p-4">
            {/* Soft decorative backgrounds */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(45,27,13,0.1)] border border-primary/5 relative overflow-hidden">
                    {/* Top glow */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-dark to-primary" />

                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary-dark text-[10px] font-bold uppercase tracking-wider mb-4"
                        >
                            <Sparkles size={12} />
                            User Access Portal
                        </motion.div>
                        <h1 className="text-3xl font-black text-secondary tracking-tight">Gol Gol Gappe</h1>
                        <p className="text-secondary/50 text-sm mt-2 font-medium">Ordering snacks has never been easier</p>
                    </div>

                    <form onSubmit={step === 1 ? handleSendOTP : handleVerifyLogin} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-secondary/60 ml-2 uppercase tracking-wide">Mobile Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/30 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="tel"
                                                required
                                                maxLength={10}
                                                placeholder="10-digit mobile number"
                                                className="w-full bg-[#F9F6F0] border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-secondary font-bold placeholder:text-secondary/30 focus:border-primary/30 focus:bg-white transition-all outline-none shadow-sm"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-2">
                                        <p className="text-xs font-bold text-primary-dark uppercase">Verify Identity</p>
                                        <p className="text-sm font-black text-secondary mt-1">+91 {formData.mobile}</p>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-[10px] font-bold text-primary-dark underline mt-1 hover:text-primary"
                                        >
                                            Change Number
                                        </button>
                                    </div>

                                    {!isRegistered && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-1.5"
                                        >
                                            <label className="text-xs font-bold text-secondary/60 ml-2 uppercase tracking-wide">Enter Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/30 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    required={!isRegistered}
                                                    placeholder="First time here? Enter name"
                                                    className="w-full bg-[#F9F6F0] border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-secondary font-bold placeholder:text-secondary/30 focus:border-primary/30 focus:bg-white transition-all outline-none shadow-sm"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-secondary/60 ml-2 uppercase tracking-wide">Enter OTP</label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/30 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                placeholder="6-digit OTP"
                                                className="w-full bg-[#F9F6F0] border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-secondary font-bold tracking-[0.5em] text-center placeholder:text-secondary/30 placeholder:tracking-normal focus:border-primary/30 focus:bg-white transition-all outline-none shadow-sm"
                                                value={formData.otp}
                                                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-secondary/20 hover:bg-black hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    {step === 1 ? 'Send OTP' : 'Verify & Enter'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-bold text-secondary/30 uppercase tracking-[0.2em]">
                            Secure Access Powered by Gol Gol Gappe
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UserLogin;
