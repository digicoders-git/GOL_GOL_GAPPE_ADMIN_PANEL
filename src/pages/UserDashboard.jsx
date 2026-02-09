import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FaStar, FaClock, FaMapMarkerAlt, FaSearch,
    FaShoppingBag, FaBolt, FaUtensils, FaCocktail,
    FaHamburger, FaPizzaSlice, FaRegSmile
} from 'react-icons/fa';
import { getProducts } from '../utils/api';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/user-login');
            return;
        }
        setUser(JSON.parse(storedUser));
        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const response = await getProducts();
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const categories = ['All', ...new Set(products.map(p => p.category))];
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    // Get a featured product (could be random or based on tag)
    const featuredProduct = products.find(p => p.tags?.includes('Chef Special')) || products[0];

    return (
        <div className="space-y-6 pb-8 max-w-5xl mx-auto px-2">
            {/* Welcome Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[1.5rem] bg-secondary text-white relative overflow-hidden shadow-xl"
            >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black italic flex items-center gap-2">Hi, {user.name}! <FaRegSmile className="text-primary" size={20} /></h1>
                        <p className="text-white/60 text-xs mt-1 font-medium italic">What are you craving today?</p>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                <FaBolt className="text-primary" size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Healthy & Fresh Snacks</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-bounce">
                            <FaUtensils size={32} />
                        </div>
                    </div>
                </div>

                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-primary/20 rounded-full blur-[50px]" />
                <div className="absolute bottom-[-20%] left-[20%] w-36 h-36 bg-accent/20 rounded-full blur-[50px]" />
            </motion.div>

            {/* Dynamic Categories Selection */}
            <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-tight italic flex items-center gap-2 text-secondary px-1">
                    Explore Categories
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${selectedCategory === cat
                                ? 'bg-primary text-secondary shadow shadow-primary/20'
                                : 'bg-white text-secondary/50 border border-primary/10 hover:border-primary/30'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Item Dynamic */}
            {featuredProduct && (
                <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-tight italic flex items-center gap-2 text-secondary px-1">
                        <FaStar className="text-primary" size={16} />
                        Today's Special
                    </h3>

                    <div
                        onClick={() => navigate(`/product/${featuredProduct._id}`)}
                        className="bg-white p-5 rounded-[2rem] border border-primary/10 shadow-lg flex flex-col lg:flex-row gap-6 relative group overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer"
                    >
                        <div className="w-full lg:w-48 h-48 bg-[#F9F6F0] rounded-[1.5rem] overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-inner">
                            {featuredProduct.thumbnail ? (
                                <img
                                    src={featuredProduct.thumbnail}
                                    alt={featuredProduct.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-primary">
                                    <FaUtensils size={48} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-primary/20 text-primary-dark text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                                    {featuredProduct.tags?.[0] || 'Premium Selection'}
                                </span>
                                <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                    <FaStar size={10} fill="currentColor" />
                                    <span className="text-[10px] font-black">4.9</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xl font-black italic text-secondary">{featuredProduct.name}</h4>
                                <p className="text-secondary/60 text-sm font-medium mt-1 leading-relaxed max-w-xl">
                                    {featuredProduct.description || 'Experience the authentic taste with our premium selection of snacks.'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <span className="text-[10px] font-bold text-secondary/30 block uppercase tracking-widest mb-0.5 font-black">Limited Time Price</span>
                                    <span className="text-2xl font-black text-secondary">₹{featuredProduct.price}</span>
                                </div>
                                <button className="bg-primary text-secondary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary-dark hover:text-white transition-all active:scale-95 group">
                                    <FaShoppingBag size={14} className="group-hover:animate-bounce" />
                                    Order Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Grid Dynamic */}
            <div id="menu" className="scroll-mt-20 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-black uppercase tracking-tight italic flex items-center gap-2 text-secondary">
                        <FaUtensils className="text-primary" size={16} />
                        Menu Items ({filteredProducts.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(`/product/${product._id}`)}
                                className="bg-white p-4 rounded-[1.5rem] border border-primary/10 shadow hover:shadow-xl transition-all duration-300 flex flex-col gap-3 cursor-pointer"
                            >
                                <div className="h-40 bg-[#F9F6F0] rounded-[1rem] overflow-hidden flex items-center justify-center relative shadow-inner">
                                    {product.thumbnail ? (
                                        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                            <FaUtensils size={40} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-[8px] font-black text-secondary border border-primary/10 shadow-sm uppercase tracking-widest italic">
                                        {product.category}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2 px-1">
                                    <h4 className="text-base font-black italic text-secondary leading-tight">{product.name}</h4>
                                    <p className="text-secondary/50 text-[9px] font-bold uppercase tracking-widest">
                                        {product.description?.substring(0, 40) || 'Delicious and freshly prepared.'}...
                                    </p>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xl font-black text-secondary">₹{product.price}</span>
                                        <button className="bg-secondary text-primary p-2.5 rounded-xl hover:bg-primary hover:text-secondary transition-all active:scale-90 shadow shadow-secondary/10">
                                            <FaShoppingBag size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-[1.5rem] border-2 border-dashed border-primary/20">
                        <div className="text-3xl mb-3 text-primary/30 flex justify-center">
                            <FaSearch />
                        </div>
                        <p className="text-secondary/50 text-[10px] font-black uppercase tracking-widest">No products found</p>
                    </div>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-5 rounded-[1.5rem] bg-emerald-50 border-2 border-emerald-100 flex items-center gap-4 shadow-sm"
                >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <FaClock size={20} />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Est. Pickup Time</h5>
                        <p className="text-lg font-black text-secondary mt-0.5">10-15 Mins</p>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-5 rounded-[1.5rem] bg-blue-50 border-2 border-blue-100 flex items-center gap-4 shadow-sm"
                >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                        <FaMapMarkerAlt size={20} />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Store Status</h5>
                        <p className="text-lg font-black text-secondary mt-0.5 italic">Open Now</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserDashboard;
