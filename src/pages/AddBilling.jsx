import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdReceipt,
    MdAdd,
    MdDelete,
    MdPerson,
    MdShoppingCart,
    MdCurrencyRupee,
    MdLocalPrintshop,
    MdRemoveCircle,
    MdAddCircle,
    MdLayers,
    MdCoffee,
    MdFastfood,
    MdMoreHoriz,
    MdSearch,
    MdCreditCard,
    MdLabel,
    MdAutoAwesome,
    MdSmartphone,
    MdAccountCircle,
    MdStore,
    MdAccessTime,
    MdCheckCircle,
    MdFlashOn,
    MdRestaurant,
    MdAccountBalanceWallet,
    MdChair,
    MdDeliveryDining,
    MdShoppingBag,
    MdViewModule,
    MdViewList,
    MdChevronLeft,
    MdChevronRight
} from 'react-icons/md';
import toast from 'react-hot-toast';

const AddBilling = () => {
    // --- State Management ---
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [tableNo, setTableNo] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [orderType, setOrderType] = useState('Dine-In');
    const [manualItem, setManualItem] = useState({ name: '', price: '' });
    const [showManualModal, setShowManualModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const searchRef = useRef(null);

    // --- Mock Data ---
    const products = [
        { id: 1, name: 'Regular Gol Gappe (6pcs)', price: 30, category: 'Snacks', icon: <MdFastfood className="text-orange-500" /> },
        { id: 2, name: 'Dahi Bhalla', price: 60, category: 'Snacks', icon: <MdRestaurant className="text-orange-600" /> },
        { id: 3, name: 'Aloo Tikki', price: 50, category: 'Snacks', icon: <MdFastfood className="text-orange-400" /> },
        { id: 4, name: 'Masala Water (1L)', price: 40, category: 'Beverages', icon: <MdCoffee className="text-blue-500" /> },
        { id: 5, name: 'Special Mix Chaat', price: 80, category: 'Snacks', icon: <MdRestaurant className="text-red-500" /> },
        { id: 6, name: 'Mineral Water', price: 20, category: 'Beverages', icon: <MdCoffee className="text-blue-400" /> },
        { id: 7, name: 'Extra Masala Box', price: 10, category: 'Others', icon: <MdMoreHoriz className="text-zinc-500" /> },
        { id: 8, name: 'Papdi Chaat', price: 55, category: 'Snacks', icon: <MdFastfood className="text-orange-500" /> },
        { id: 9, name: 'Panner Tikka Gol Gappe', price: 120, category: 'Main Course', icon: <MdFlashOn className="text-yellow-500" /> },
    ];

    const categories = [
        { name: 'All', icon: <MdLayers size={14} /> },
        { name: 'Snacks', icon: <MdFastfood size={14} /> },
        { name: 'Beverages', icon: <MdCoffee size={14} /> },
        { name: 'Main Course', icon: <MdRestaurant size={14} /> },
        { name: 'Others', icon: <MdMoreHoriz size={14} /> }
    ];

    // --- Calculations ---
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const subtotal = useMemo(() =>
        cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        [cart]);

    const total = Math.max(0, subtotal - discount);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    // --- Handlers ---
    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
            toast.success(`${product.name}`, {
                icon: '🛍️',
                style: { borderRadius: '10px', background: '#2D1B0D', color: '#fff', fontSize: '10px' }
            });
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Cart empty!', { icon: '⚠️' });
            return;
        }

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        const orderData = {
            id: `INV-${Date.now().toString().slice(-6)}`,
            customer,
            tableNo,
            paymentMethod,
            orderType,
            items: [...cart],
            subtotal,
            discount,
            total,
            date: new Date().toLocaleString()
        };

        setLastOrder(orderData);
        setShowReceipt(true);
        setIsProcessing(false);
        toast.success('Done! 💳');
    };

    const finalizeOrder = () => {
        setShowReceipt(false);
        setCart([]);
        setCustomer({ name: '', phone: '' });
        setTableNo('');
        setDiscount(0);
        setPaymentMethod('Cash');
        setOrderType('Dine-In');
        setSearchQuery('');
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#2D1B0D] font-medium p-4">
            <div className="max-w-[1700px] mx-auto space-y-6">

                {/* --- Compact Header --- */}
                <header className="flex flex-col gap-6 print:hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <MdAutoAwesome size={16} className="text-primary" />
                                <span className="text-primary font-black tracking-widest text-[8px] uppercase bg-primary/10 px-2 py-0.5 rounded-full">POS v3 Compact</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-secondary italic">
                                Gappe <span className="text-primary not-italic">Billing</span>
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => setShowManualModal(true)}
                                className="bg-primary text-secondary px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                            >
                                <MdAdd size={18} className="group-hover:rotate-90 transition-transform" /> Quick Add Item
                            </button>

                            {/* --- Slim Stats --- */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Revenue', value: '₹8.4k', color: 'emerald', icon: <MdCurrencyRupee size={14} /> },
                                    { label: 'Orders', value: '38', color: 'blue', icon: <MdFlashOn size={14} /> },
                                    { label: 'Active', value: '07', color: 'orange', icon: <MdRestaurant size={14} /> },
                                    { label: 'Top', value: 'Gol Gappe', color: 'purple', icon: <MdCheckCircle size={14} /> }
                                ].map((s, i) => (
                                    <div key={i} className="bg-white px-4 py-2 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3">
                                        <div className={`p-2 rounded-xl bg-${s.color}-50 text-${s.color}-600`}>{s.icon}</div>
                                        <div>
                                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</p>
                                            <p className="text-sm font-black text-secondary">{s.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- Filter & Search Minimal --- */}
                    <div className="flex flex-col xl:flex-row items-center gap-3">
                        <div className="relative w-full xl:w-80 group">
                            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-all" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Fast Search..."
                                className="w-full bg-white border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-primary transition-all text-secondary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                            {categories.map(cat => (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap border ${selectedCategory === cat.name
                                        ? 'bg-secondary text-primary border-secondary shadow-lg shadow-secondary/10'
                                        : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'
                                        }`}
                                >
                                    {cat.icon} {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-white p-1 rounded-xl border border-zinc-200 shadow-sm ml-auto">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-secondary text-primary shadow-md' : 'text-zinc-400 hover:text-secondary'}`}
                                title="Grid View"
                            >
                                <MdViewModule size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-secondary text-primary shadow-md' : 'text-zinc-400 hover:text-secondary'}`}
                                title="Table View"
                            >
                                <MdViewList size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* --- Left Content --- */}
                    <div className="xl:col-span-8 space-y-6 print:hidden">

                        {/* --- Product Grid/Table View --- */}
                        <div className="min-h-[450px]">
                            <AnimatePresence mode='wait'>
                                {viewMode === 'grid' ? (
                                    <motion.div
                                        key="grid"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                                    >
                                        <AnimatePresence mode='popLayout'>
                                            {paginatedProducts.map((product) => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    whileHover={{ y: -5 }}
                                                    key={product.id}
                                                    onClick={() => addToCart(product)}
                                                    className="bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group flex flex-col justify-between h-full min-h-[185px]"
                                                >
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="w-11 h-11 bg-zinc-50 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:bg-primary/10 transition-colors">
                                                                {product.icon}
                                                            </div>
                                                            <div className="bg-zinc-50 group-hover:bg-primary text-secondary font-black px-3 py-2 rounded-lg text-xs transition-all">
                                                                ₹{product.price}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-1.5">{product.category}</p>
                                                            <h3 className="text-[15px] font-black text-secondary uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-dashed border-zinc-100 flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">In Stock</span>
                                                        <div className="w-8 h-8 rounded-lg bg-primary text-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg shadow-primary/20">
                                                            <MdAdd size={20} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="table"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden"
                                    >
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-zinc-50 border-b border-zinc-100">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Item</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Category</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">Price</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50">
                                                {paginatedProducts.map((product) => (
                                                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-lg">{product.icon}</div>
                                                                <span className="font-black text-secondary text-[13px] uppercase tracking-tight">{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[9px] font-black bg-zinc-100 text-zinc-500 px-2 py-1 rounded-md uppercase tracking-widest">{product.category}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="font-black text-secondary text-sm">₹{product.price}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => addToCart(product)}
                                                                className="bg-primary text-secondary p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all shadow-md"
                                                            >
                                                                <MdAdd size={20} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paginatedProducts.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-20 text-center">
                                                            <div className="flex flex-col items-center opacity-20">
                                                                <MdSearch size={48} className="text-zinc-300 mb-2" />
                                                                <p className="font-black text-sm uppercase tracking-widest">No Products Found</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* --- Pagination Controls --- */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className={`p-2 rounded-xl transition-all ${currentPage === 1 ? 'text-zinc-200 cursor-not-allowed' : 'text-secondary hover:bg-zinc-100'}`}
                                    >
                                        <MdChevronLeft size={24} />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-secondary text-primary shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className={`p-2 rounded-xl transition-all ${currentPage === totalPages ? 'text-zinc-200 cursor-not-allowed' : 'text-secondary hover:bg-zinc-100'}`}
                                    >
                                        <MdChevronRight size={24} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- Slim Customer Form --- */}
                        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                    <MdAccountCircle size={28} />
                                </div>
                                <h2 className="text-xl font-black text-secondary tracking-tighter uppercase leading-none">Customer Context</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1"><MdPerson size={10} className="text-primary" /> Name</label>
                                    <input
                                        type="text"
                                        placeholder="Customer Name"
                                        className="w-full bg-zinc-50 border border-transparent rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary"
                                        value={customer.name}
                                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1"><MdSmartphone size={10} className="text-primary" /> Contact</label>
                                    <input
                                        type="tel"
                                        placeholder="+91 Mobile"
                                        className="w-full bg-zinc-50 border border-transparent rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary"
                                        value={customer.phone}
                                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1"><MdLabel size={10} className="text-primary" /> Station/Table</label>
                                    <input
                                        type="text"
                                        placeholder="T-01"
                                        className="w-full bg-zinc-50 border border-transparent rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary"
                                        value={tableNo}
                                        onChange={(e) => setTableNo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-dashed border-zinc-100">
                                <div className="space-y-3">
                                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1"><MdAccountBalanceWallet size={10} className="text-primary" /> Payment Mode</label>
                                    <div className="flex bg-zinc-50 p-1.5 rounded-xl border border-zinc-100">
                                        {[
                                            { n: 'Cash', i: <MdCurrencyRupee size={12} /> },
                                            { n: 'UPI', i: <MdSmartphone size={12} /> },
                                            { n: 'Card', i: <MdCreditCard size={12} /> }
                                        ].map(m => (
                                            <button
                                                key={m.n}
                                                onClick={() => setPaymentMethod(m.n)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === m.n ? 'bg-secondary text-primary shadow-sm' : 'text-zinc-400 hover:text-secondary'}`}
                                            >
                                                {m.i} {m.n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1"><MdRestaurant size={10} className="text-primary" /> Service Type</label>
                                    <div className="flex bg-zinc-50 p-1.5 rounded-xl border border-zinc-100">
                                        {[
                                            { n: 'Dine-In', i: <MdChair size={12} /> },
                                            { n: 'Takeaway', i: <MdShoppingBag size={12} /> },
                                            { n: 'Home', i: <MdDeliveryDining size={12} /> }
                                        ].map(t => (
                                            <button
                                                key={t.n}
                                                onClick={() => setOrderType(t.n)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${orderType === t.n ? 'bg-primary text-secondary shadow-sm' : 'text-zinc-400 hover:text-secondary'}`}
                                            >
                                                {t.i} {t.n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Sidebar Cart --- */}
                    <aside className="xl:col-span-4 h-full print:hidden">
                        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-xl flex flex-col h-full max-h-[850px] overflow-hidden sticky top-6">
                            <div className="p-6 bg-zinc-50 border-b-2 border-dashed border-zinc-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-secondary tracking-tighter uppercase italic leading-none">Live Order</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
                                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Active Terminal</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-secondary shadow-lg shadow-primary/20">
                                        <MdReceipt size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                                <AnimatePresence mode='popLayout'>
                                    {cart.length > 0 ? (
                                        cart.map((item) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                key={item.id}
                                                className="flex flex-col gap-3 p-4 mb-3 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-zinc-100 text-[11px] font-black shadow-sm">
                                                            {item.quantity}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-secondary text-[11px] uppercase truncate w-32 tracking-tighter">{item.name}</h4>
                                                            <p className="text-[8px] font-bold text-zinc-400 uppercase">₹{item.price} / unit</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-black text-secondary text-sm tracking-tighter">₹{item.price * item.quantity}</p>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-zinc-100/50">
                                                    <div className="flex bg-white rounded-lg shadow-sm border border-zinc-100 overflow-hidden">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"><MdRemoveCircle size={16} /></button>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-500 transition-colors"><MdAddCircle size={16} /></button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><MdDelete size={16} /></button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-30">
                                            <MdShoppingCart size={48} className="text-zinc-300 mb-4" />
                                            <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-400">Cart is empty</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="p-6 bg-zinc-50 border-t-2 border-dashed border-zinc-200 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 items-center">
                                        <div className="flex items-center gap-2"><MdLayers size={12} /> Subtotal</div>
                                        <span className="text-secondary font-black">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">
                                        <div className="flex items-center gap-2"><MdLabel size={12} /> Discount</div>
                                        <div className="relative">
                                            <MdCurrencyRupee className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px]" />
                                            <input
                                                type="number"
                                                className="w-20 bg-white border border-zinc-200 rounded-lg py-1.5 pl-5 pr-2 text-right text-secondary outline-none font-black text-xs"
                                                value={discount}
                                                onChange={(e) => setDiscount(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-zinc-200">
                                    <div className="flex justify-between items-end mb-6 px-2">
                                        <div>
                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MdCreditCard size={10} /> Net Payable</p>
                                            <p className="text-4xl font-black text-secondary tracking-tighter leading-none">₹{total}</p>
                                        </div>
                                        <div className="bg-emerald-100 px-3 py-1.5 rounded-lg text-emerald-700 font-black text-[8px] uppercase flex items-center gap-2">
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            Authentic
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={isProcessing}
                                        className={`w-full font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all shadow-xl shadow-secondary/10 active:scale-95 ${isProcessing ? 'bg-zinc-200 text-zinc-400' : 'bg-secondary text-white hover:bg-black'}`}
                                    >
                                        {isProcessing ? <MdFlashOn size={22} className="animate-spin" /> : <MdLocalPrintshop size={24} />}
                                        <span className="tracking-tighter">{isProcessing ? 'SAVING DATA...' : 'GENERATE BILL'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* --- Digital Receipt Modal --- */}
                <AnimatePresence>
                    {showReceipt && lastOrder && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-md print:p-0 print:bg-white print:static">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col print:shadow-none print:w-full max-h-[90vh]"
                            >
                                <div className="p-6 bg-zinc-50 flex items-center justify-between border-b border-zinc-100 print:hidden shrink-0">
                                    <div className="flex items-center gap-3">
                                        <MdReceipt size={20} className="text-secondary" />
                                        <h3 className="font-black text-secondary uppercase text-xs tracking-widest">Digital Invoice</h3>
                                    </div>
                                    <button onClick={finalizeOrder} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-zinc-100 text-red-500 hover:bg-red-50 transition-colors"><MdAdd size={24} className="rotate-45" /></button>
                                </div>

                                <div className="flex-1 p-10 print:p-0 overflow-y-auto custom-scrollbar" id="printable-receipt">
                                    <div className="text-center mb-10">
                                        <div className="inline-block px-4 py-1.5 bg-secondary text-primary font-black text-[9px] uppercase tracking-[0.4em] mb-4 rounded-lg">Official Copy</div>
                                        <h2 className="text-4xl font-black text-secondary tracking-tighter italic uppercase leading-none">GOL GOL GAPPE</h2>
                                        <div className="flex justify-center gap-1.5 mt-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        </div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-3">Elite Chaat Experience</p>
                                    </div>

                                    <div className="bg-zinc-50 rounded-[2rem] p-6 mb-8 gap-y-4 grid grid-cols-2 border border-zinc-100">
                                        {[
                                            { l: 'Receipt ID', v: lastOrder.id, i: <MdLabel size={12} className="text-primary" /> },
                                            { l: 'Timestamp', v: lastOrder.date, i: <MdAccessTime size={12} className="text-primary" /> },
                                            { l: 'Station ID', v: lastOrder.tableNo || 'Main POS', i: <MdStore size={12} className="text-primary" /> },
                                            { l: 'Channel', v: lastOrder.paymentMethod, i: <MdAccountBalanceWallet size={12} className="text-primary" /> }
                                        ].map((x, i) => (
                                            <div key={i} className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">{x.i} {x.l}</span>
                                                <span className="text-secondary font-black text-[11px] truncate pr-2">{x.v}</span>
                                            </div>
                                        ))}
                                        {lastOrder.customer.name && (
                                            <div className="col-span-2 pt-4 border-t border-zinc-200 mt-2 flex flex-col gap-1">
                                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1"><MdPerson size={12} className="text-primary" /> Customer</span>
                                                <span className="text-secondary font-black text-[11px]">{lastOrder.customer.name} {lastOrder.customer.phone && `(${lastOrder.customer.phone})`}</span>
                                            </div>
                                        )}
                                    </div>

                                    <table className="w-full mb-10">
                                        <thead>
                                            <tr className="border-b-2 border-dashed border-zinc-200 text-[10px] font-black text-zinc-300 uppercase">
                                                <th className="text-left pb-4">Item Desc</th>
                                                <th className="text-center pb-4">Qty</th>
                                                <th className="text-right pb-4">Sum</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lastOrder.items.map((item, idx) => (
                                                <tr key={idx} className="text-xs font-black text-secondary uppercase border-b border-zinc-50/50">
                                                    <td className="py-4">{item.name}</td>
                                                    <td className="py-4 text-center">{item.quantity}</td>
                                                    <td className="py-4 text-right">₹{item.price * item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="bg-secondary text-primary rounded-[2rem] p-8 space-y-4 shadow-2xl relative overflow-hidden">
                                        <div className="flex justify-between text-[11px] font-black uppercase text-primary/40 relative z-10">
                                            <span>Subtotal Sum</span>
                                            <span>₹{lastOrder.subtotal}</span>
                                        </div>
                                        {lastOrder.discount > 0 && (
                                            <div className="flex justify-between text-[11px] font-black uppercase text-white/50 relative z-10">
                                                <span>Promo Discount</span>
                                                <span>-₹{lastOrder.discount}</span>
                                            </div>
                                        )}
                                        <div className="pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
                                            <span className="text-xs font-black text-white uppercase tracking-widest">Grand Net Total</span>
                                            <span className="text-4xl font-black tracking-tighter text-primary">₹{lastOrder.total}</span>
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                                    </div>

                                    <div className="mt-12 text-center">
                                        <MdFlashOn size={20} className="mx-auto text-primary mb-4" />
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Handcrafted with Love in Jaipur</p>
                                        <p className="mt-2 text-[8px] font-black text-zinc-300 uppercase tracking-widest">Invoice generated by SmartPOS Enterprise v3</p>
                                    </div>
                                </div>

                                <div className="p-8 flex gap-4 print:hidden bg-zinc-50 border-t border-zinc-100 shrink-0">
                                    <button onClick={finalizeOrder} className="flex-1 py-4 text-[11px] font-black uppercase rounded-2xl border-2 border-zinc-200 text-zinc-500 hover:bg-zinc-200 transition-colors">Dismiss</button>
                                    <button onClick={handlePrint} className="flex-[2.5] py-4 bg-primary text-secondary text-[11px] font-black uppercase rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"><MdLocalPrintshop size={20} /> Authorize & Print</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* --- Quick Manual Entry Modal --- */}
                <AnimatePresence>
                    {showManualModal && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 relative border border-primary/20"
                            >
                                <button
                                    onClick={() => setShowManualModal(false)}
                                    className="absolute top-6 right-6 text-zinc-300 hover:text-red-500 transition-colors"
                                >
                                    <MdAdd size={24} className="rotate-45" />
                                </button>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary text-secondary rounded-xl flex items-center justify-center shadow-lg">
                                            <MdFlashOn size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-secondary uppercase text-sm tracking-widest">Quick Entry</h3>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Add Custom Billing Item</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Item Description</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="What are they buying?"
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary"
                                                value={manualItem.name}
                                                onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all text-secondary"
                                                value={manualItem.price}
                                                onChange={(e) => setManualItem({ ...manualItem, price: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (manualItem.name && manualItem.price) {
                                                addToCart({
                                                    id: Date.now(),
                                                    name: manualItem.name,
                                                    price: Number(manualItem.price),
                                                    category: 'Custom',
                                                    icon: <MdFlashOn className="text-yellow-500" />
                                                });
                                                setManualItem({ name: '', price: '' });
                                                setShowManualModal(false);
                                                toast.success('Custom Item Added', {
                                                    icon: '✨',
                                                    style: { borderRadius: '12px', background: '#2D1B0D', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
                                                });
                                            } else {
                                                toast.error('Please enter details');
                                            }
                                        }}
                                        className="w-full bg-secondary text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E4E4E7; border-radius: 10px; }
                @media print {
                    header, aside, .print\\:hidden, button { display: none !important; }
                    .max-w-\\[1700px\\] { max-width: 100% !important; padding: 0 !important; }
                    #printable-receipt { padding: 0 !important; margin: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default AddBilling;
