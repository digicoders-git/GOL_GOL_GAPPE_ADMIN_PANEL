import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdPeople, MdAdd, MdDelete, MdEmail, MdSecurity, MdShield, MdPersonAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const ManageAdmins = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'billing_admin'
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/admins', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            toast.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Admin created successfully!');
                setShowModal(false);
                setFormData({ email: '', password: '', role: 'billing_admin' });
                fetchUsers();
            } else {
                toast.error(data.message || 'Failed to create admin');
            }
        } catch (error) {
            toast.error('Failed to create admin');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This admin will lose all access!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F97316',
            cancelButtonColor: '#2D1B0D',
            confirmButtonText: 'Yes, delete!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    toast.success('Admin deleted');
                    fetchUsers();
                }
            } catch (error) {
                toast.error('Deletion failed');
            }
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdShield size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Access Control</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Admin Management</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Create and manage access levels for your team.</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-xl hover:bg-black transition-all font-black text-xs shadow-lg shadow-secondary/20 cursor-pointer"
                >
                    <MdAdd size={20} /> ADD NEW USER
                </button>
            </div>

            {/* Admin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user, i) => (
                    <motion.div
                        key={user._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-premium relative group"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${user.role === 'billing_admin' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                <MdPeople />
                            </div>
                            <div>
                                <h3 className="font-black text-secondary text-lg">
                                    {user.email ? user.email.split('@')[0] : (user.name || user.mobile || 'Admin')}
                                </h3>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'billing_admin' ? 'text-blue-500' : 'text-emerald-500'
                                    }`}>{user.role.replace('_', ' ')}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-xs text-secondary font-bold">
                                <MdEmail className="text-primary/40" /> {user.email || user.mobile || 'No contact added'}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 font-bold">
                                <MdSecurity className="text-zinc-400" /> Partial Access
                            </div>
                        </div>

                        <button
                            onClick={() => handleDelete(user._id)}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                        >
                            Revoke Access
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                                <MdPersonAdd size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-secondary uppercase tracking-tight italic">Grant Access</h2>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Create New Department Admin</p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 tracking-widest text-secondary">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3.5 outline-none focus:border-primary font-bold text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 tracking-widest text-secondary">Initial Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3.5 outline-none focus:border-primary font-bold text-sm"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase ml-2 tracking-widest text-secondary">Admin Role</label>
                                <select
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3.5 outline-none focus:border-primary font-bold text-sm"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="billing_admin">Billing Admin</option>
                                    <option value="kitchen_admin">Kitchen Admin</option>
                                    <option value="admin">Global Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black"
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManageAdmins;
