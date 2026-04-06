import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaStar, FaArrowLeft, FaShoppingBag, FaUtensils,
    FaInfoCircle, FaFire, FaLeaf, FaMapMarkerAlt, FaTag, FaCheckCircle
} from 'react-icons/fa';
import { getProduct, createOrder } from '../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import axios from 'axios';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [kitchens, setKitchens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [ordering, setOrdering] = useState(false);
    const [selectedKitchen, setSelectedKitchen] = useState(null);
    const [appliedOffer, setAppliedOffer] = useState(null);
    const [applyingOffer, setApplyingOffer] = useState(false);

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            const response = await getProduct(id);
            if (response.data.success) {
                const productData = response.data.product;
                setProduct(productData);
                
                // Fetch active offer if exists
                if (productData.activeOffer) {
                    try {
                        const offerResponse = await axios.get(
                            `${import.meta.env.VITE_API_URL}/api/offers/${productData.activeOffer}`,
                            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                        );
                        if (offerResponse.data.success) {
                            productData.activeOfferDetails = offerResponse.data.offer;
                            setProduct({...productData});
                        }
                    } catch (err) {
                        console.log('Failed to fetch offer details:', err);
                    }
                }
                const fetchedKitchens = response.data.kitchens || [];

                const queryParams = new URLSearchParams(location.search);
                const preferredKitchenId = queryParams.get('kitchen');

                if (preferredKitchenId) {
                    const preferred = fetchedKitchens.find(k => k._id === preferredKitchenId);
                    if (preferred) {
                        setKitchens([preferred, ...fetchedKitchens.filter(k => k._id !== preferredKitchenId)]);
                        setSelectedKitchen(preferred);
                    } else {
                        setKitchens(fetchedKitchens);
                        setSelectedKitchen(fetchedKitchens[0]);
                    }
                } else {
                    setKitchens(fetchedKitchens);
                    setSelectedKitchen(fetchedKitchens[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product details');
            navigate('/user-dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.mobile) {
            toast.error('Please login to place an order');
            navigate('/user-login');
            return;
        }

        if (kitchens.length === 0) {
            toast.error('This product is currently not available in any kitchen');
            return;
        }

        if (appliedOffer && quantity > 1) {
            toast.error('Offer can only be applied to 1 item. Please reduce quantity to 1.');
            return;
        }

        const effectivePrice = (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price;
        const itemTotal = effectivePrice * quantity;
        const packagingCharge = product.packagingCharge || 0;
        const gstAmount = product.gstPercent ? (itemTotal * product.gstPercent) / 100 : 0;
        const discount = appliedOffer ? (appliedOffer.discount || appliedOffer.discountAmount || 0) : 0;
        const totalAmount = itemTotal + packagingCharge + gstAmount - discount;

        const result = await Swal.fire({
            title: `<span class="text-2xl font-black text-secondary uppercase italic tracking-tighter">Confirm Your Cravings</span>`,
            html: `
                <div class="space-y-4 text-left p-2">
                    <div class="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-dashed border-zinc-200">
                        <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Item</span>
                        <span class="text-sm font-black text-secondary">${product.name} x ${quantity}</span>
                    </div>
                    ${(product.discountPrice && product.discountPrice < product.price) ? `
                    <div class="flex justify-between items-center bg-orange-50 p-4 rounded-2xl border border-orange-200">
                        <span class="text-[10px] font-black text-orange-600 uppercase tracking-widest">Price Discount</span>
                        <span class="text-sm font-black text-orange-600"><s>₹${product.price}</s> → ₹${product.discountPrice}/unit</span>
                    </div>
                    ` : ''}
                    ${appliedOffer ? `
                    <div class="flex justify-between items-center bg-green-50 p-4 rounded-2xl border border-green-200">
                        <span class="text-[10px] font-black text-green-600 uppercase tracking-widest">Discount (${appliedOffer.title || appliedOffer.code})</span>
                        <span class="text-sm font-black text-green-600">-₹${discount}</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between items-center bg-primary/10 p-4 rounded-2xl border border-primary/20">
                        <span class="text-[10px] font-black text-primary-dark uppercase tracking-widest">Total Valuation</span>
                        <span class="text-xl font-black text-secondary">₹${totalAmount}</span>
                    </div>
                    <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-center mt-4">Safe & Secure Payment via Cash on Delivery</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'YES, ORDER NOW!',
            cancelButtonText: 'NO, WAIT',
            confirmButtonColor: '#F97316',
            cancelButtonColor: '#f1f5f9',
            customClass: {
                popup: 'rounded-[2.5rem]',
                confirmButton: 'rounded-xl font-black uppercase text-[10px] tracking-widest px-8 py-4',
                cancelButton: 'rounded-xl font-black uppercase text-[10px] tracking-widest px-8 py-4 text-secondary'
            },
            buttonsStyling: true
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: 'Placing Your Order...',
            html: `
                <div class="flex flex-col items-center gap-4 py-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-xl"></div>
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Coordinating with ${selectedKitchen?.name || 'Kitchen'}</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            customClass: {
                popup: 'rounded-[2.5rem]'
            }
        });

        setOrdering(true);
        try {
            const effectivePrice = (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price;
            const itemTotal = effectivePrice * quantity;
            const packagingCharge = product.packagingCharge || 0;
            const gstAmount = product.gstPercent ? (itemTotal * product.gstPercent) / 100 : 0;
            const discount = appliedOffer ? (appliedOffer.discount || appliedOffer.discountAmount || 0) : 0;
            const totalAmount = itemTotal + packagingCharge + gstAmount - discount;

            const orderData = {
                items: [
                    {
                        product: product._id,
                        quantity: quantity,
                        price: (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price
                    }
                ],
                totalAmount: totalAmount,
                paymentMethod: 'Cash',
                paymentStatus: 'Pending',
                offerCode: appliedOffer ? (appliedOffer.code || product.activeOfferDetails?.code) : null
            };

            const response = await createOrder(orderData);
            if (response.data.success) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#F97316', '#2D1B0D', '#fbbf24']
                });

                await Swal.fire({
                    title: `<span class="text-3xl font-black text-emerald-600 uppercase italic tracking-tighter">Congratulations!</span>`,
                    html: `
                        <div class="space-y-4">
                            <div class="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                                <FaShoppingBag size={40} />
                            </div>
                            <p class="text-sm font-bold text-secondary">Your order <span class="text-emerald-600 font-black">#${response.data.order.orderNumber}</span> has been successfully placed!</p>
                            <p class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Redirecting you to track your cravings...</p>
                        </div>
                    `,
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: true,
                    confirmButtonText: 'VIEW MY ORDERS',
                    confirmButtonColor: '#10b981',
                    customClass: {
                        popup: 'rounded-[2.5rem]',
                        confirmButton: 'rounded-xl font-black uppercase text-[10px] tracking-widest px-8 py-4'
                    }
                });

                navigate('/user-orders');
            }
        } catch (error) {
            console.error('Order error:', error);
            Swal.close(); // Close the "Placing Your Order..." modal
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setOrdering(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!product) return null;

    const handleApplyOffer = async () => {
        if (!product.activeOfferDetails) {
            toast.error('No active offer available');
            return;
        }

        if (quantity > 1) {
            toast.error('Offer can only be applied to 1 item. Please set quantity to 1.');
            return;
        }

        setApplyingOffer(true);
        try {
            const effectivePrice = (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price;
            const itemTotal = effectivePrice * quantity;
            
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/offers/apply`,
                {
                    code: product.activeOfferDetails.code,
                    orderAmount: itemTotal,
                    productId: product._id
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.data.success) {
                setAppliedOffer(response.data.offer);
                toast.success(`🎉 ${response.data.offer.title} Applied! Saved ₹${response.data.priceBreakdown.savings}`, {
                    duration: 4000,
                    icon: '🎉'
                });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to apply offer';
            toast.error(message);
        } finally {
            setApplyingOffer(false);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        if (appliedOffer && newQuantity > 1) {
            toast.error('Offer is applied. Cannot change quantity.');
            return;
        }
        setQuantity(newQuantity);
    };

    const effectivePrice = (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price;
    const discountPercent = (product.discountPrice && product.discountPrice < product.price) ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    const calculateTotal = () => {
        const itemTotal = effectivePrice * quantity;
        const packagingCharge = product.packagingCharge || 0;
        const gstAmount = product.gstPercent ? (itemTotal * product.gstPercent) / 100 : 0;
        const discount = appliedOffer ? (appliedOffer.discount || appliedOffer.discountAmount || 0) : 0;
        return itemTotal + packagingCharge + gstAmount - discount;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-secondary/60 hover:text-secondary font-black uppercase tracking-widest text-xs transition-colors group"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Menu
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    <div className="aspect-square bg-white rounded-[3rem] border-2 border-primary/10 overflow-hidden shadow-2xl relative group">
                        {product.thumbnail ? (
                            <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#F9F6F0] text-primary">
                                <FaUtensils size={80} />
                            </div>
                        )}

                        <div className="absolute top-6 left-6">
                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border ${product.foodType === 'veg' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                {product.foodType === 'veg' ? <FaLeaf /> : <FaFire />}
                                {product.foodType}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-20 h-20 rounded-2xl border border-primary/10 bg-white shadow-sm overflow-hidden flex items-center justify-center text-primary/30">
                                <FaUtensils size={24} />
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-primary/20 text-primary-dark text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
                                {product.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                <FaStar size={14} fill="currentColor" />
                                <span className="text-xs font-black">4.9 (120+ Reviews)</span>
                            </div>
                        </div>

                        <h1 className="text-5xl font-black italic text-secondary">{product.name}</h1>
                        <p className="text-secondary/60 text-lg font-medium leading-relaxed">
                            {product.detailedDescription || product.description || 'No detailed description available for this product.'}
                        </p>

                        <div className="flex items-baseline gap-3 mt-2">
                            <span className="text-3xl font-black text-secondary">₹{effectivePrice}</span>
                            {discountPercent > 0 && (
                                <>
                                    <span className="text-lg font-bold text-secondary/30 line-through">₹{product.price}</span>
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">
                                        {discountPercent}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-secondary/40 uppercase tracking-widest flex items-center gap-2">
                                <FaUtensils className="text-primary" /> Multi-Kitchen Availability
                            </h4>
                            <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded-md">
                                {kitchens.length} Units Serving
                            </span>
                        </div>

                        {kitchens.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {kitchens.map((kitchen) => (
                                    <button
                                        key={kitchen._id}
                                        onClick={() => setSelectedKitchen(kitchen)}
                                        className={`p-4 rounded-[1.5rem] border-2 text-left transition-all ${selectedKitchen?._id === kitchen._id
                                            ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10'
                                            : 'bg-white border-primary/5 hover:border-primary/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedKitchen?._id === kitchen._id ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-400'
                                                    }`}>
                                                    <FaMapMarkerAlt size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-secondary leading-tight uppercase italic">{kitchen.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">{kitchen.location}</p>
                                                        <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                                                        <p className="text-[9px] font-black text-emerald-600 uppercase italic">Stock: {kitchen.availableQuantity}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${kitchen.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {kitchen.status}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 text-center">
                                <p className="text-sm font-bold text-red-500 italic">Not available in any kitchen right now</p>
                                <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mt-1">Please try again later or select another item</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between py-6 border-y border-primary/10">
                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-primary/10 shadow-sm">
                            <button
                                onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-black text-xl flex items-center justify-center hover:bg-orange-100 active:scale-95 transition-all"
                            >
                                -
                            </button>
                            <span className="w-8 text-center font-black text-lg text-secondary">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-black text-xl flex items-center justify-center hover:bg-orange-100 active:scale-95 transition-all"
                            >
                                +
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-secondary/30 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-4xl font-black text-secondary">₹{calculateTotal()}</p>
                        </div>
                    </div>

                    {product.activeOfferDetails && !appliedOffer && (
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-200">
                            <div className="flex items-center gap-2 mb-4">
                                <FaTag className="text-orange-600" />
                                <h3 className="text-sm font-black text-orange-800 uppercase tracking-wider">Special Offer Available!</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-orange-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-black text-orange-900 text-base uppercase">{product.activeOfferDetails.title}</p>
                                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-black">
                                            {product.activeOfferDetails.discountValue}{product.activeOfferDetails.discountType === 'percentage' ? '%' : '₹'} OFF
                                        </span>
                                    </div>
                                    {product.activeOfferDetails.description && (
                                        <p className="text-xs text-orange-700 font-medium">{product.activeOfferDetails.description}</p>
                                    )}
                                    <p className="text-xs text-orange-600 font-bold mt-2">Code: {product.activeOfferDetails.code}</p>
                                </div>
                                <button
                                    onClick={handleApplyOffer}
                                    disabled={applyingOffer || quantity > 1}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {applyingOffer ? 'Applying...' : quantity > 1 ? 'Set Qty to 1 to Apply' : 'Apply Offer'}
                                </button>
                            </div>
                        </div>
                    )}

                    {appliedOffer && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-300">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                                    <FaCheckCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-green-700 text-base uppercase">{appliedOffer.title}</p>
                                    <p className="text-sm text-green-600 font-bold">You saved ₹{appliedOffer.discount || appliedOffer.discountAmount}!</p>
                                    <p className="text-xs text-green-500 font-medium mt-1">Offer successfully applied to your order</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            disabled={ordering || kitchens.length === 0}
                            onClick={handleOrder}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${kitchens.length === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-primary text-secondary shadow-primary/20 hover:bg-primary-dark hover:text-white'
                                }`}
                        >
                            {ordering ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-secondary border-t-transparent"></div>
                            ) : (
                                <>
                                    <FaShoppingBag size={18} />
                                    Confirm Order
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm text-center">
                            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Protein</p>
                            <p className="text-sm font-black text-secondary">{product.nutrition?.protein || 0}g</p>
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm text-center">
                            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Carbs</p>
                            <p className="text-sm font-black text-secondary">{product.nutrition?.carbs || 0}g</p>
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm text-center">
                            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Fat</p>
                            <p className="text-sm font-black text-secondary">{product.nutrition?.fat || 0}g</p>
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm text-center">
                            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Calories</p>
                            <p className="text-sm font-black text-secondary">{product.nutrition?.calories || 0} kcal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex items-center gap-2 text-secondary/40">
                            <FaInfoCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tight">
                                {product.packagingCharge > 0 ? `+ ₹${product.packagingCharge} Packaging` : 'Free Packaging'}
                                {product.gstPercent > 0 ? ` • Incl. ${product.gstPercent}% GST` : ''}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetail;
