import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdPeople, MdEmail, MdPhone, MdCalendarToday, MdViewModule, MdViewList } from 'react-icons/md';
import toast from 'react-hot-toast';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                            <MdPeople size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase">Customers</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary">All Users</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Total {users.length} customers</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setView('cards')}
                        className={`p-3 rounded-xl transition-all ${view === 'cards' ? 'bg-primary text-white' : 'bg-white border border-zinc-200'}`}
                    >
                        <MdViewModule size={20} />
                    </button>
                    <button
                        onClick={() => setView('table')}
                        className={`p-3 rounded-xl transition-all ${view === 'table' ? 'bg-primary text-white' : 'bg-white border border-zinc-200'}`}
                    >
                        <MdViewList size={20} />
                    </button>
                </div>
            </div>

            {view === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentUsers.map((user, i) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-lg"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
                                    <MdPeople />
                                </div>
                                <div>
                                    <h3 className="font-bold text-secondary">{user.name || 'User'}</h3>
                                    <p className="text-xs text-zinc-500">Customer</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-xs text-secondary">
                                        <MdPhone className="text-primary/40" /> {user.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <MdCalendarToday className="text-zinc-400" /> 
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-secondary uppercase tracking-wider">S.No</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-secondary uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-secondary uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-secondary uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {currentUsers.map((user, i) => (
                                    <tr key={user._id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-zinc-500">{indexOfFirstItem + i + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <MdPeople />
                                                </div>
                                                <span className="font-bold text-secondary">{user.name || 'User'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary">{user.phone || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600">Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:border-primary font-bold"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-zinc-600">entries</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-zinc-200 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
                    >
                        Previous
                    </button>
                    
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm ${
                                    currentPage === i + 1
                                        ? 'bg-primary text-white'
                                        : 'border border-zinc-200 hover:bg-zinc-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-zinc-200 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
                    >
                        Next
                    </button>
                </div>

                <span className="text-sm text-zinc-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, users.length)} of {users.length}
                </span>
            </div>
        </div>
    );
};

export default UsersManagement;
