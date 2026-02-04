import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdSwapHoriz,
    MdLocationOn,
    MdInventory,
    MdRestaurant,
    MdSend,
    MdHistory,
    MdDelete,
    MdCheckCircle,
    MdAccessTime,
    MdAdd,
    MdArrowForward,
    MdLocalShipping,
    MdPerson,
    MdNotes
} from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';

// Initialize 3D module
if (typeof Highcharts3D === 'function') {
    Highcharts3D(Highcharts);
}

const ProductAssign = () => {
    const [formData, setFormData] = useState({
        product: '',
        kitchen: '',
        quantity: '',
        staff: '',
        notes: ''
    });

    const [assignments, setAssignments] = useState([
        { id: 1, product: 'Regular Gol Gappe', kitchen: 'Main Kitchen', quantity: 500, unit: 'pcs', staff: 'Rahul', time: '10:30 AM', status: 'delivered' },
        { id: 2, product: 'Masala Water', kitchen: 'Counter A', quantity: 20, unit: 'ltr', staff: 'Anita', time: '11:15 AM', status: 'shipped' },
        { id: 3, product: 'Atta (Premium)', kitchen: 'Basement Store', quantity: 50, unit: 'kg', staff: 'Suresh', time: '09:00 AM', status: 'delivered' },
    ]);

    const [products] = useState([
        { id: 'p1', name: 'Regular Gol Gappe', unit: 'pcs', currentStock: 4500 },
        { id: 'p2', name: 'Masala Water', unit: 'ltr', currentStock: 80 },
        { id: 'p3', name: 'Atta (Premium)', unit: 'kg', currentStock: 220 },
        { id: 'p4', name: 'Cooking Oil', unit: 'ltr', currentStock: 15 },
    ]);

    const [kitchens] = useState([
        { id: 'k1', name: 'Main Kitchen', location: 'Section A' },
        { id: 'k2', name: 'Counter A', location: 'Gate 1' },
        { id: 'k3', name: 'Counter B', location: 'Main Entrance' },
        { id: 'k4', name: 'Kitchen 2', location: 'Floor 1' },
    ]);

    const stats = useMemo(() => [
        { title: 'Today Assigned', value: '850 Units', icon: <MdSwapHoriz />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Pending Pickup', value: '12 Items', icon: <MdAccessTime />, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Active Kitchens', value: kitchens.length, icon: <MdRestaurant />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Most Moved', value: 'Gol Gappe', icon: <MdInventory />, color: 'text-purple-600', bg: 'bg-purple-50' },
    ], [kitchens.length]);

    const handleAssign = (e) => {
        e.preventDefault();
        if (!formData.product || !formData.kitchen || !formData.quantity) {
            toast.error('Please fill all required fields!');
            return;
        }

        const selectedProd = products.find(p => p.name === formData.product);

        const newAssignment = {
            id: Date.now(),
            product: formData.product,
            kitchen: formData.kitchen,
            quantity: Number(formData.quantity),
            unit: selectedProd?.unit || 'units',
            staff: formData.staff || 'Admin',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'shipped'
        };

        setAssignments([newAssignment, ...assignments]);
        setFormData({ product: '', kitchen: '', quantity: '', staff: '', notes: '' });
        toast.success('Product successfully assigned! 🚚', {
            style: { borderRadius: '12px', background: '#2D1B0D', color: '#fff' },
        });
    };

    const deleteAssignment = (id) => {
        Swal.fire({
            title: 'Delete Assignment?',
            text: "This record will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Yes, delete it!',
            background: '#ffffff',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm',
                cancelButton: 'px-6 py-2.5 rounded-xl font-bold text-sm'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setAssignments(assignments.filter(a => a.id !== id));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Record has been removed.',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    customClass: {
                        popup: 'rounded-[2rem]',
                        confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm'
                    }
                });
            }
        });
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">

            {/* --- Compact Header --- */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                        <MdSwapHoriz size={16} />
                    </div>
                    <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Inventory Distribution</span>
                </div>
                <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Product Assign</h1>
                <p className="text-zinc-500 text-[11px] font-medium">Distribute products to kitchens, counters, and storage areas</p>
            </div>

            {/* --- Stats --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3.5 group hover:border-primary/30 transition-all">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.title}</p>
                            <h3 className="text-lg font-black text-secondary leading-none">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Chart Section --- */}
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-100">
                        <MdInventory size={16} />
                    </div>
                    <div>
                        <h3 className="font-black text-secondary uppercase tracking-tight">Distribution Analytics</h3>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Kitchen-wise Allocation</p>
                    </div>
                </div>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                        chart: {
                            type: 'column',
                            backgroundColor: 'transparent',
                            height: 300,
                            style: { fontFamily: 'inherit' },
                            animation: {
                                duration: 2000,
                                easing: 'easeOutBounce'
                            },
                            options3d: {
                                enabled: true,
                                alpha: 10,
                                beta: 15,
                                depth: 50,
                                viewDistance: 25
                            }
                        },
                        title: { text: null },
                        xAxis: {
                            categories: kitchens.map(k => k.name),
                            labels: {
                                style: {
                                    color: '#94a3b8',
                                    fontWeight: '900',
                                    fontSize: '9px',
                                    textTransform: 'uppercase'
                                },
                                rotation: -15
                            },
                            gridLineWidth: 0,
                            lineColor: '#e2e8f0'
                        },
                        yAxis: {
                            title: { text: null },
                            labels: {
                                style: {
                                    color: '#94a3b8',
                                    fontWeight: '900',
                                    fontSize: '10px'
                                }
                            },
                            gridLineColor: '#f1f5f9',
                            gridLineDashStyle: 'Dash'
                        },
                        tooltip: {
                            useHTML: true,
                            headerFormat: '<div style="padding: 8px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px 8px 0 0; margin: -8px -8px 8px -8px;"><span style="font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">{point.key}</span></div>',
                            pointFormat: '<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"><span style="color:{point.color}; font-size: 20px;">●</span><span style="font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Assigned:</span><b style="color: #8b5cf6; font-size: 16px; margin-left: auto;">{point.y} items</b></div>',
                            backgroundColor: '#ffffff',
                            borderRadius: 16,
                            borderWidth: 2,
                            borderColor: '#8b5cf6',
                            shadow: {
                                color: 'rgba(139, 92, 246, 0.3)',
                                offsetX: 0,
                                offsetY: 4,
                                opacity: 0.5,
                                width: 10
                            }
                        },
                        plotOptions: {
                            column: {
                                depth: 40,
                                borderRadius: 8,
                                borderWidth: 0,
                                colorByPoint: true,
                                grouping: true,
                                dataLabels: {
                                    enabled: true,
                                    style: {
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        color: '#2D1B0D',
                                        textOutline: '2px #ffffff'
                                    }
                                },
                                states: {
                                    hover: {
                                        brightness: 0.1,
                                        borderColor: '#8b5cf6',
                                        borderWidth: 2
                                    }
                                }
                            }
                        },
                        credits: { enabled: false },
                        legend: { enabled: false },
                        series: [{
                            name: 'Items Assigned',
                            data: kitchens.map((k, index) => ({
                                y: assignments
                                    .filter(a => a.kitchen === k.name)
                                    .reduce((acc, curr) => acc + curr.quantity, 0),
                                color: {
                                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                    stops: [
                                        [0, ['#F59E0B', '#10B981', '#3B82F6', '#6366F1'][index % 4]],
                                        [1, ['#b45309', '#047857', '#1d4ed8', '#4338ca'][index % 4]]
                                    ]
                                }
                            })),
                            animation: {
                                duration: 2500,
                                easing: 'easeOutQuart'
                            }
                        }]
                    }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* --- Assignment Form --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-5"
                >
                    <div className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-premium">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                <MdLocalShipping size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-secondary tracking-tight uppercase">New Assignment</h2>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Transfer Request</p>
                            </div>
                        </div>

                        <form onSubmit={handleAssign} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Product</label>
                                <div className="relative">
                                    <MdInventory className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                    <select
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm appearance-none"
                                        value={formData.product}
                                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.name}>{p.name} ({p.currentStock} {p.unit})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Destination Kitchen</label>
                                <div className="relative">
                                    <MdRestaurant className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                    <select
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm appearance-none"
                                        value={formData.kitchen}
                                        onChange={(e) => setFormData({ ...formData, kitchen: e.target.value })}
                                    >
                                        <option value="">Select Kitchen</option>
                                        {kitchens.map(k => (
                                            <option key={k.id} value={k.name}>{k.name} - {k.location}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Staff Name</label>
                                    <div className="relative">
                                        <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 text-lg" />
                                        <input
                                            type="text"
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                            value={formData.staff}
                                            onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                                <div className="relative">
                                    <MdNotes className="absolute left-4 top-4 text-zinc-300 text-lg" />
                                    <textarea
                                        rows="3"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm resize-none"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any special instructions..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-secondary text-primary font-black py-3.5 rounded-xl shadow-lg shadow-secondary/10 hover:shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm group mt-2 cursor-pointer"
                            >
                                <MdSend size={18} className="group-hover:translate-x-1 transition-transform" />
                                ASSIGN PRODUCT
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* --- Assignment History --- */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-7"
                >
                    <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-premium overflow-hidden">
                        <div className="p-5 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                                    <MdHistory size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-secondary tracking-tight uppercase">Assignment History</h2>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Recent Transfers</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-white border border-zinc-100 px-3 py-2 rounded-lg shadow-sm">{assignments.length} Records</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-100">
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Product</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Destination</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Quantity</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    <AnimatePresence>
                                        {assignments.map((assign) => (
                                            <motion.tr
                                                key={assign.id}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="group hover:bg-zinc-50/50 transition-colors"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-zinc-100 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-200 group-hover:bg-primary/10 transition-all shadow-inner text-xs">
                                                            {assign.product.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-secondary text-xs uppercase tracking-tight leading-none mb-1">{assign.product}</h4>
                                                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                                                <MdAccessTime size={10} /> {assign.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2 text-zinc-600 text-xs font-bold">
                                                        <MdLocationOn size={14} className="text-primary" />
                                                        {assign.kitchen}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="inline-block px-3 py-1.5 bg-secondary text-white rounded-lg font-black text-xs shadow-sm">
                                                        {assign.quantity} {assign.unit}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${assign.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                                        }`}>
                                                        <MdCheckCircle size={12} />
                                                        {assign.status}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <button
                                                        onClick={() => deleteAssignment(assign.id)}
                                                        className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition-all border border-red-100 flex items-center justify-center shadow-sm cursor-pointer"
                                                    >
                                                        <MdDelete size={16} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductAssign;
