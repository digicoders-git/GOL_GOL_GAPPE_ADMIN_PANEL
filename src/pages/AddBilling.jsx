import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdReceipt, MdCheckCircle, MdRestaurant, MdFlashOn, MdPerson, MdAccessTime } from 'react-icons/md';
import toast from 'react-hot-toast';

const AddBilling = () => {
    const [stats, setStats] = useState({ totalOrders: 0, completed: 0, assigned: 0, topItem: 'N/A' });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/billing', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                const bills = data.bills || [];
                
                const totalOrders = bills.length;
                const completed = bills.filter(b => b.status === 'Completed').length;
                const assigned = bills.filter(b => b.status === 'Assigned_to_Kitchen').length;
                
                const itemCount = {};
                bills.forEach(bill => {
                    bill.items?.forEach(item => {
                        const name = item.product?.name || 'Unknown';
                        itemCount[name] = (itemCount[name] || 0) + item.quantity;
                    });
                });
                const topItem = Object.keys(itemCount).length > 0 
                    ? Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0][0] 
                    : 'N/A';
                
                setStats({ totalOrders, completed, assigned, topItem });
                setOrders(bills);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                        <MdReceipt size={16} />
                    </div>
                    <span className="text-primary font-black tracking-widest text-[9px] uppercase bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Order Management</span>
                </div>
                <h1 className="text-3xl font-black text-secondary tracking-tight leading-none">Order Assignment</h1>
                <p className="text-zinc-500 text-[11px] font-medium">View and manage all orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: stats.totalOrders.toString().padStart(2, '0'), color: 'blue', icon: <MdReceipt size={20} /> },
                    { label: 'Completed', value: stats.completed.toString().padStart(2, '0'), color: 'emerald', icon: <MdCheckCircle size={20} /> },
                    { label: 'Assigned', value: stats.assigned.toString().padStart(2, '0'), color: 'orange', icon: <MdRestaurant size={20} /> },
                    { label: 'Top Item', value: stats.topItem.length > 12 ? stats.topItem.substring(0, 12) + '...' : stats.topItem, color: 'purple', icon: <MdFlashOn size={20} /> }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3.5 group hover:border-primary/30 transition-all">
                        <div className={`w-12 h-12 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <h3 className="text-xl font-black text-secondary leading-none">{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <div className="p-5 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <MdReceipt size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-secondary tracking-tight uppercase">All Orders</h2>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Complete Order History</p>
                        </div>
                    </div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-3 py-2 rounded-lg">{orders.length} Orders</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Bill No</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Items</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-zinc-400 font-bold">Loading...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-zinc-400 font-bold">No orders found</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <motion.tr
                                        key={order._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <span className="font-black text-secondary text-xs uppercase">{order.billNumber}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div>
                                                <p className="font-black text-secondary text-xs">{order.customer?.name || 'Guest'}</p>
                                                {order.customer?.phone && (
                                                    <p className="text-[8px] font-bold text-zinc-400">{order.customer.phone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[10px] font-bold text-zinc-600">{order.items?.length || 0} items</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                order.status === 'Assigned_to_Kitchen' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                                {order.status === 'Completed' && <MdCheckCircle size={12} />}
                                                {order.status === 'Assigned_to_Kitchen' && <MdRestaurant size={12} />}
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className="font-black text-secondary text-sm">₹{order.totalAmount}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="text-[10px] font-bold text-zinc-400">
                                                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[8px]">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AddBilling;
