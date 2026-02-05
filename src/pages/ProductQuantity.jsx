import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, updateProduct, deleteProduct } from '../utils/api';
import {
    MdSearch,
    MdFilterList,
    MdSwapVert,
    MdMoreVert,
    MdEdit,
    MdDelete,
    MdWarning,
    MdCheckCircle,
    MdInventory,
    MdLayers,
    MdShoppingBag,
    MdTrendingDown,
    MdClose,
    MdSave,
    MdBarChart,
    MdRefresh
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { FaSearch, FaSearchPlus } from "react-icons/fa";
import Swal from 'sweetalert2';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';

// Initialize 3D module
if (typeof Highcharts3D === 'function') {
    Highcharts3D(Highcharts);
}

const ProductQuantity = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'stock', 'category'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'inStock', 'lowStock', 'outOfStock'
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts();
            if (response.data.success) {
                const mappedProducts = response.data.products.map(p => ({
                    id: p._id,
                    name: p.name || 'Unknown Product',
                    category: p.category || 'General',
                    stock: p.quantity || 0,
                    minStock: p.minStock || 0,
                    unit: p.unit || 'unit',
                    lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN') : 'N/A'
                }));
                setInventory(mappedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const categories = ['All', 'Ingredients', 'Snacks', 'Packaging', 'Others'];

    // Stats calculation
    const stats = useMemo(() => {
        const lowStock = inventory.filter(item => item.stock > 0 && item.stock <= item.minStock).length;
        const outOfStock = inventory.filter(item => item.stock === 0).length;
        return [
            { title: 'Total Products', value: inventory.length, icon: <MdInventory />, color: 'text-blue-600', bg: 'bg-blue-50', trendValue: 'Active' },
            { title: 'Low Stock Alert', value: lowStock, icon: <MdWarning />, color: 'text-orange-600', bg: 'bg-orange-50', trendValue: `${lowStock} items` },
            { title: 'Out of Stock', value: outOfStock, icon: <MdTrendingDown />, color: 'text-red-600', bg: 'bg-red-50', trendValue: `${outOfStock} items` },
            { title: 'Categories', value: categories.length - 1, icon: <MdLayers />, color: 'text-emerald-600', bg: 'bg-emerald-50', trendValue: 'Ready' },
        ];
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        let filtered = inventory.filter(item => {
            const matchesSearch = (item.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

            // Status filter
            let matchesStatus = true;
            if (filterStatus === 'inStock') {
                matchesStatus = item.stock > item.minStock;
            } else if (filterStatus === 'lowStock') {
                matchesStatus = item.stock > 0 && item.stock <= item.minStock;
            } else if (filterStatus === 'outOfStock') {
                matchesStatus = item.stock === 0;
            }

            return matchesSearch && matchesCategory && matchesStatus;
        });

        // Sorting
        filtered.sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'stock') {
                comparison = a.stock - b.stock;
            } else if (sortBy === 'category') {
                comparison = a.category.localeCompare(b.category);
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [inventory, searchQuery, selectedCategory, filterStatus, sortBy, sortOrder]);

    const getStockStatus = (stock, minStock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500' };
        if (stock <= minStock) return { label: 'Low Stock', color: 'bg-orange-50 text-orange-600 border-orange-100', dot: 'bg-orange-500' };
        return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' };
    };

    const chartOptions = useMemo(() => ({
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
            categories: inventory.map(item => item.name),
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
            headerFormat: '<div style="padding: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0; margin: -8px -8px 8px -8px;"><span style="font-size: 11px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px;">{point.key}</span></div>',
            pointFormat: '<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"><span style="color:{point.color}; font-size: 20px;">●</span><span style="font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Stock Level:</span><b style="color: #10b981; font-size: 16px; margin-left: auto;">{point.y}</b></div>',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#10b981',
            shadow: {
                color: 'rgba(16, 185, 129, 0.3)',
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
                        borderColor: '#10b981',
                        borderWidth: 2
                    }
                }
            }
        },
        credits: { enabled: false },
        legend: { enabled: false },
        series: [{
            name: 'Stock',
            data: inventory.map(item => ({
                y: item.stock,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, item.stock <= item.minStock ? '#ef4444' : '#10b981'],
                        [1, item.stock <= item.minStock ? '#b91c1c' : '#059669']
                    ]
                }
            })),
            animation: {
                duration: 2500,
                easing: 'easeOutQuart'
            }
        }]
    }), [inventory]);

    const toggleSort = () => {
        if (sortBy === 'name' && sortOrder === 'asc') {
            setSortOrder('desc');
            toast.success('Sorted Z-A', { icon: '🔽' });
        } else {
            setSortBy('name');
            setSortOrder('asc');
            toast.success('Sorted A-Z', { icon: '🔼' });
        }
    };

    const handleEdit = (product) => {
        setEditingProduct({ ...product });
        setIsEditModalOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Remove Product?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Yes, remove it!',
            background: '#ffffff',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm',
                cancelButton: 'px-6 py-2.5 rounded-xl font-bold text-sm'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteProduct(id);
                    if (response.data.success) {
                        setInventory(inventory.filter(p => p.id !== id));
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Product has been removed.',
                            icon: 'success',
                            confirmButtonColor: '#10b981',
                            customClass: {
                                popup: 'rounded-[2rem]',
                                confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-sm'
                            }
                        });
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    toast.error('Failed to delete product');
                }
            }
        });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            const response = await updateProduct(editingProduct.id, {
                name: editingProduct.name,
                quantity: editingProduct.stock,
                minStock: editingProduct.minStock
            });
            if (response.data.success) {
                setInventory(inventory.map(p => p.id === editingProduct.id ? editingProduct : p));
                setIsEditModalOpen(false);
                toast.success('Stock updated successfully');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update product');
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">

            {/* --- Compact Header --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdBarChart size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Inventory Overview</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">Product Quantity</h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Real-time monitoring of stock levels and alerts</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-zinc-100 shadow-sm w-fit">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${selectedCategory === cat ? 'bg-secondary text-primary shadow-lg' : 'text-zinc-400 hover:text-secondary'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Quick Stats --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3.5 group hover:border-primary/30 transition-all">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.title}</p>
                            <h3 className="text-lg font-black text-secondary leading-none">{stat.value}</h3>
                            <p className="text-[7px] font-bold text-zinc-300 uppercase italic mt-1">{stat.trendValue}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Chart Section --- */}
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-100">
                        <MdBarChart size={16} />
                    </div>
                    <div>
                        <h3 className="font-black text-secondary uppercase tracking-tight">Stock Analytics</h3>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Visual Overview</p>
                    </div>
                </div>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </div>

            {/* --- Inventory Table Container --- */}
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-premium overflow-hidden">
                {/* Table Controls */}
                <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group flex-1 max-w-md">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by product name..."
                            className="w-full bg-white border border-zinc-100 rounded-xl py-3 pl-12 pr-4 text-secondary font-bold outline-none focus:border-primary transition-all text-sm shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSort}
                            className="flex items-center gap-2 bg-white text-zinc-600 border border-zinc-100 px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-all font-bold text-xs shadow-sm cursor-pointer"
                        >
                            <MdSwapVert size={16} /> {sortOrder === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
                        </button>
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-black hover:text-primary transition-all font-bold text-xs shadow-lg cursor-pointer ${filterStatus !== 'all' ? 'bg-primary text-secondary border border-primary' : 'bg-secondary text-primary'}`}
                        >
                            <MdFilterList size={16} /> Filter {filterStatus !== 'all' && '(Active)'}
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Product Info</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Category</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Current Stock</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                <th className="px-5 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            <AnimatePresence mode='popLayout'>
                                {filteredInventory.map((item) => {
                                    const status = getStockStatus(item.stock, item.minStock);
                                    return (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={item.id}
                                            className="group hover:bg-zinc-50/50 transition-colors"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-primary font-black border border-zinc-200 group-hover:bg-primary/10 transition-all shadow-inner text-sm">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-secondary text-xs uppercase tracking-tight leading-none mb-1">{item.name}</h4>
                                                        <p className="text-[8px] font-bold text-zinc-400 uppercase">Updated {item.lastUpdated}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-block px-3 py-1.5 bg-zinc-50 text-zinc-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-100">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-black text-secondary text-base">{item.stock}</span>
                                                    <span className="text-[8px] font-bold text-zinc-400 uppercase">{item.unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${status.color}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                                                    {status.label}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-all border border-blue-100 flex items-center justify-center shadow-sm cursor-pointer"
                                                    >
                                                        <MdEdit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 transition-all border border-red-100 flex items-center justify-center shadow-sm cursor-pointer"
                                                    >
                                                        <MdDelete size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Edit Modal --- */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl border border-zinc-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-secondary uppercase tracking-tight">Edit Stock</h3>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Update Inventory</p>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="w-9 h-9 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-secondary transition-all flex items-center justify-center cursor-pointer"
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <form onSubmit={saveEdit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Product Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                        value={editingProduct?.name || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                            value={editingProduct?.stock || 0}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Min Stock</label>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary shadow-sm text-sm"
                                            value={editingProduct?.minStock || 0}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 bg-zinc-50 text-zinc-600 font-black py-3 rounded-xl hover:bg-zinc-100 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <MdClose size={16} />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-secondary text-primary font-black py-3 rounded-xl hover:bg-black hover:text-primary transition-all shadow-lg shadow-secondary/10 flex items-center justify-center gap-2 text-sm cursor-pointer"
                                    >
                                        <MdSave size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Filter Modal --- */}
            <AnimatePresence>
                {showFilterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowFilterModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl border border-zinc-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-secondary uppercase tracking-tight">Filter Products</h3>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Stock Status</p>
                                </div>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="w-9 h-9 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-secondary transition-all flex items-center justify-center cursor-pointer"
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { value: 'all', label: 'All Products', icon: <MdInventory size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { value: 'inStock', label: 'In Stock', icon: <MdCheckCircle size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { value: 'lowStock', label: 'Low Stock', icon: <MdWarning size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                                    { value: 'outOfStock', label: 'Out of Stock', icon: <MdTrendingDown size={18} />, color: 'text-red-600', bg: 'bg-red-50' }
                                ].map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => {
                                            setFilterStatus(filter.value);
                                            setShowFilterModal(false);
                                            toast.success(`Filter: ${filter.label}`, { icon: <FaSearchPlus /> });
                                        }}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${filterStatus === filter.value
                                            ? 'border-secondary bg-secondary/5 shadow-lg'
                                            : 'border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'
                                            } cursor-pointer`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${filter.bg} ${filter.color} flex items-center justify-center shadow-inner`}>
                                            {filter.icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h4 className="font-black text-secondary text-sm uppercase tracking-tight">{filter.label}</h4>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                                {filter.value === 'all' && 'Show all inventory'}
                                                {filter.value === 'inStock' && 'Stock above minimum'}
                                                {filter.value === 'lowStock' && 'Stock at or below minimum'}
                                                {filter.value === 'outOfStock' && 'Zero stock items'}
                                            </p>
                                        </div>
                                        {filterStatus === filter.value && (
                                            <MdCheckCircle size={24} className="text-secondary" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-zinc-100 flex gap-3">
                                <button
                                    onClick={() => {
                                        setFilterStatus('all');
                                        setShowFilterModal(false);
                                        toast.success('Filter cleared', { icon: <MdRefresh /> });
                                    }}
                                    className="flex-1 bg-zinc-50 text-zinc-600 font-black py-3 rounded-xl hover:bg-zinc-100 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <MdDelete size={16} />
                                    Clear Filter
                                </button>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="flex-1 bg-secondary text-primary font-black py-3 rounded-xl hover:bg-black hover:text-primary transition-all shadow-lg shadow-secondary/10 text-sm cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <MdCheckCircle size={16} />
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductQuantity;
