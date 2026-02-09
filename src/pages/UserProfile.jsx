import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaEdit, FaSave, FaCamera, FaKey } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/user-login');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
            name: userData.name || '',
            email: userData.email || '',
            mobile: userData.mobile || ''
        });
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Ideally call an API here
            // const response = await updateProfile(formData);

            // For now, updating local storage (mock update)
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto pb-10 px-4">
            <div className="relative mb-20">
                <div className="h-48 bg-gradient-to-r from-secondary to-black rounded-[3rem] shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </div>

                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl overflow-hidden border-4 border-white">
                            <div className="w-full h-full bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <FaUser size={60} />
                            </div>
                        </div>
                        <button className="absolute bottom-2 right-2 p-2.5 bg-secondary text-primary rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                            <FaCamera size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-primary/10 shadow-xl p-8 pt-20 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black italic text-secondary">{user.name}</h1>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.3em]">Customer Account • ID: {user._id?.slice(-8).toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 border-b border-primary/10 pb-4">
                            <FaUser /> Basic Information
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-secondary/30 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/20" />
                                    <input
                                        disabled={!isEditing}
                                        type="text"
                                        className="w-full bg-secondary/5 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-sm font-black text-secondary outline-none focus:bg-white focus:border-primary transition-all disabled:opacity-70"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-secondary/30 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/20" />
                                    <input
                                        disabled={!isEditing}
                                        type="email"
                                        className="w-full bg-secondary/5 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-sm font-black text-secondary outline-none focus:bg-white focus:border-primary transition-all disabled:opacity-70"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 border-b border-primary/10 pb-4">
                            <FaPhone /> Contact Details
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-secondary/30 uppercase tracking-widest ml-1">Mobile Number</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/20" />
                                    <input
                                        disabled={!isEditing}
                                        type="tel"
                                        className="w-full bg-secondary/5 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-sm font-black text-secondary outline-none focus:bg-white focus:border-primary transition-all disabled:opacity-70"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="bg-secondary/5 p-6 rounded-3xl border border-secondary/10 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary shadow-sm">
                                            <FaKey size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-secondary uppercase tracking-tight">Account Security</p>
                                            <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Update your login password</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/change-password')}
                                        className="w-full py-2.5 bg-white text-secondary font-black text-[9px] border border-secondary/10 rounded-xl hover:bg-secondary hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-primary/10 flex justify-end gap-4">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-secondary text-primary px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-secondary/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <FaEdit /> Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-white text-secondary border-2 border-secondary/10 px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-secondary/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="bg-primary text-secondary px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <FaSave /> Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
