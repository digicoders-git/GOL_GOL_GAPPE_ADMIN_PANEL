import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FaSearch, FaUtensils, FaArrowRight, FaFilter,
    FaFire, FaLeaf, FaShoppingBag, FaStar, FaBoxOpen, FaTimes, FaMapMarkerAlt
} from 'react-icons/fa';
import { getProducts, getKitchens } from '../utils/api';

const OrderMenu = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [foodType, setFoodType] = useState('All');
    const [kitchens, setKitchens] = useState([]);
    const [selectedKitchen, setSelectedKitchen] = useState(null);
    const [kitchenSearch, setKitchenSearch] = useState('');
    const [showKitchenModal, setShowKitchenModal] = useState(false);
    const navigate = useNavigate();

    const fetchMenuData = async () => {
        try {
            setLoading(true);
            const [prodRes, kitchenRes] = await Promise.all([
                getProducts(),
                getKitchens()
            ]);

            if (prodRes.data.success) {
                setProducts(prodRes.data.products);
            }
            if (kitchenRes.data.success) {
                setKitchens(kitchenRes.data.kitchens.filter(k => k.status === 'Active'));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load menu data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuData();
    }, []);

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesFoodType = foodType === 'All' || product.foodType === foodType;

        // Kitchen logic
        let matchesKitchen = true;
        if (selectedKitchen) {
            matchesKitchen = selectedKitchen.assignedProducts?.some(ap => {
                const prodId = ap.product?._id || ap.product;
                return prodId?.toString() === product._id?.toString();
            });
        }

        return matchesSearch && matchesCategory && matchesFoodType && matchesKitchen;
    });

    const filteredKitchens = kitchens.filter(k =>
        k.name.toLowerCase().includes(kitchenSearch.toLowerCase()) ||
        k.location.toLowerCase().includes(kitchenSearch.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 px-2 sm:px-4">
            {/* Header & Search Section */}
            <div className="relative overflow-hidden bg-secondary rounded-[3rem] p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10 space-y-6 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black italic leading-tight">
                            Freshly Crafted <span className="text-primary NOT-italic">Menu</span>
                        </h1>
                        <p className="text-white/60 text-lg md:text-xl font-medium mt-4 italic">
                            Deliciousness delivered at your fingertips. From spicy to sweet, we've got it all!
                        </p>
                    </motion.div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search your favorite snack..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 font-bold outline-none focus:border-primary focus:bg-white/20 transition-all placeholder:text-white/30 text-white"
                            />
                        </div>
                        <button
                            onClick={() => setShowKitchenModal(true)}
                            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[1.5rem] px-8 py-4 flex items-center justify-between gap-4 hover:bg-white/20 transition-all group"
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Kitchen</span>
                                <span className="text-sm font-black text-primary uppercase">{selectedKitchen ? selectedKitchen.name : 'ALL KITCHENS'}</span>
                            </div>
                            <FaFilter className="text-white/30 group-hover:text-primary transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Decor */}
                <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-20%] left-[10%] w-60 h-60 bg-accent/20 rounded-full blur-[80px]" />
                <FaUtensils className="absolute -bottom-10 -right-10 text-white/[0.03] text-[20rem] -rotate-12 pointer-events-none" />
            </div>

            {/* Filters Bar */}
            <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-md py-4 -mx-2 px-2 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-primary/5">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0 w-full md:w-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${selectedCategory === cat
                                ? 'bg-primary text-secondary border-primary shadow-lg shadow-primary/20'
                                : 'bg-white text-secondary/50 border-primary/10 hover:border-primary/30'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-primary/10 shadow-sm">
                    {['All', 'veg', 'non-veg'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFoodType(type)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${foodType === type
                                ? 'bg-secondary text-primary'
                                : 'text-secondary/40 hover:bg-secondary/5'
                                }`}
                        >
                            {type === 'veg' && <FaLeaf />}
                            {type === 'non-veg' && <FaFire />}
                            {type === 'All' && <FaFilter size={10} />}
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                key={product._id}
                                onClick={() => {
                                    const searchParams = selectedKitchen ? `?kitchen=${selectedKitchen._id}` : '';
                                    navigate(`/product/${product._id}${searchParams}`);
                                }}
                                className="bg-white rounded-[2.5rem] border border-primary/10 shadow-lg hover:shadow-2xl transition-all group cursor-pointer flex flex-col overflow-hidden"
                            >
                                <div className="h-56 relative overflow-hidden bg-[#F9F6F0]">
                                    {product.thumbnail ? (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                            <FaUtensils size={40} />
                                        </div>
                                    )}

                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 border backdrop-blur-md ${product.foodType === 'veg'
                                            ? 'bg-emerald-50/90 text-emerald-600 border-emerald-100'
                                            : 'bg-red-50/90 text-red-600 border-red-100'
                                            }`}>
                                            {product.foodType === 'veg' ? <FaLeaf /> : <FaFire />}
                                            {product.foodType}
                                        </span>
                                    </div>

                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black text-secondary border border-primary/10 shadow-sm uppercase tracking-widest italic">
                                        {product.category}
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="p-6 space-y-4 flex-1 flex flex-col">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-black italic text-secondary leading-tight group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-orange-500 font-black text-[10px]">
                                                <FaStar fill="currentColor" />
                                                <span>4.9</span>
                                            </div>
                                        </div>
                                        <p className="text-secondary/50 text-[10px] font-bold uppercase tracking-widest line-clamp-2">
                                            {product.description || 'Delicious and freshly prepared for you.'}
                                        </p>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-primary/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-secondary/30 uppercase tracking-widest leading-none">Price</span>
                                            <span className="text-2xl font-black text-secondary italic">₹{product.price}</span>
                                        </div>
                                        <div className="w-12 h-12 bg-secondary text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-secondary transition-all active:scale-95 shadow-lg shadow-secondary/10">
                                            <FaShoppingBag size={20} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-40 space-y-6">
                    <div className="text-9xl opacity-20 text-primary flex justify-center">
                        <FaBoxOpen />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black italic text-secondary uppercase tracking-tight">No match found</h3>
                        <p className="text-secondary/50 font-bold uppercase tracking-widest text-xs">Try searching for something else or change categories</p>
                    </div>
                </div>
            )}
            {/* Kitchen Selection Modal */}
            <AnimatePresence>
                {showKitchenModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-secondary uppercase tracking-tight italic">Select Kitchen</h3>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Filter products by location</p>
                                </div>
                                <button
                                    onClick={() => setShowKitchenModal(false)}
                                    className="w-10 h-10 bg-zinc-50 text-secondary/40 rounded-xl flex items-center justify-center hover:bg-primary hover:text-secondary transition-all"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="relative group">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search kitchen..."
                                    className="w-full bg-secondary/5 border border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-secondary outline-none focus:bg-white focus:border-primary transition-all"
                                    value={kitchenSearch}
                                    onChange={(e) => setKitchenSearch(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <button
                                    onClick={() => {
                                        setSelectedKitchen(null);
                                        setShowKitchenModal(false);
                                    }}
                                    className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all text-left ${!selectedKitchen ? 'bg-primary border-primary' : 'bg-secondary/5 border-transparent hover:bg-secondary/10'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!selectedKitchen ? 'bg-secondary text-primary' : 'bg-white text-secondary shadow-sm'}`}>
                                            <FaUtensils size={16} />
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase text-[12px] ${!selectedKitchen ? 'text-secondary' : 'text-secondary'}`}>All Kitchens</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${!selectedKitchen ? 'text-secondary/60' : 'text-secondary/40'}`}>Full Menu Access</p>
                                        </div>
                                    </div>
                                    {!selectedKitchen && <FaStar className="text-secondary" />}
                                </button>

                                {filteredKitchens.map(kitchen => (
                                    <button
                                        key={kitchen._id}
                                        onClick={() => {
                                            setSelectedKitchen(kitchen);
                                            setShowKitchenModal(false);
                                        }}
                                        className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all text-left border ${selectedKitchen?._id === kitchen._id ? 'bg-primary border-primary' : 'bg-secondary/5 border-transparent hover:bg-secondary/10'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedKitchen?._id === kitchen._id ? 'bg-secondary text-primary' : 'bg-white text-secondary shadow-sm'}`}>
                                                <FaMapMarkerAlt size={16} />
                                            </div>
                                            <div>
                                                <p className={`font-black uppercase text-[12px] ${selectedKitchen?._id === kitchen._id ? 'text-secondary' : 'text-secondary'}`}>{kitchen.name}</p>
                                                <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedKitchen?._id === kitchen._id ? 'text-secondary/60' : 'text-secondary/40'}`}>{kitchen.location}</p>
                                            </div>
                                        </div>
                                        {selectedKitchen?._id === kitchen._id && <FaStar className="text-secondary" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderMenu;
