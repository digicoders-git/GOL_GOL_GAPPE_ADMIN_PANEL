import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdRemove, MdDelete, MdReceipt, MdPerson, MdPhone } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getProducts, createBill, getKitchens } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const CreateBill = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [kitchens, setKitchens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedKitchen, setSelectedKitchen] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, kitchensRes] = await Promise.all([
                getProducts(),
                getKitchens()
            ]);

            if (productsRes.data.success) {
                setProducts(productsRes.data.products.filter(p => p.status !== 'Out of Stock'));
            }

            if (kitchensRes.data.success) {
                setKitchens(kitchensRes.data.kitchens.filter(k => k.status === 'Active'));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existing = cartItems.find(item => item.product._id === product._id);
        if (existing) {
            setCartItems(cartItems.map(item =>
                item.product._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCartItems([...cartItems, { product, quantity: 1, price: product.price }]);
        }
        toast.success(`${product.name} added to cart`);
    };

    const updateQuantity = (productId, delta) => {
        setCartItems(cartItems.map(item =>
            item.product._id === productId
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ).filter(item => item.quantity > 0));
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.product._id !== productId));
        toast.success('Item removed from cart');
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customerName.trim()) {
            toast.error('Please enter customer name');
            return;
        }

        if (!customerPhone.trim() || customerPhone.length < 10) {
            toast.error('Please enter valid phone number');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Please add items to cart');
            return;
        }

        try {
            setSubmitting(true);

            const billData = {
                customer: {
                    name: customerName,
                    phone: customerPhone
                },
                items: cartItems.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: calculateTotal(),
                paymentMethod: paymentMethod,
                status: 'Pending'
            };

            if (selectedKitchen) {
                billData.kitchen = selectedKitchen;
            }

            console.log('Creating bill:', billData);

            const response = await createBill(billData);

            if (response.data.success) {
                toast.success('Bill created successfully!');
                // Reset form
                setCustomerName('');
                setCustomerPhone('');
                setCartItems([]);
                setSelectedKitchen('');
                setPaymentMethod('Cash');
                
                // Navigate to billing management
                setTimeout(() => {
                    navigate('/billing-management');
                }, 1000);
            } else {
                toast.error(response.data.message || 'Failed to create bill');
            }
        } catch (error) {
            console.error('Error creating bill:', error);
            toast.error(error.response?.data?.message || 'Failed to create bill');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                        <MdReceipt size={16} />
                    </div>
                    <span className="text-primary font-black tracking-widest text-[9px] uppercase bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                        Billing System
                    </span>
                </div>
                <h1 className="text-3xl font-black text-secondary tracking-tight leading-none">Create New Bill</h1>
                <p className="text-zinc-500 text-[11px] font-medium">Generate customer bill and assign to kitchen</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Products */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                        <h2 className="text-base font-black text-secondary uppercase mb-4">Select Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                            {products.map(product => (
                                <motion.button
                                    key={product._id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addToCart(product)}
                                    className="p-4 border border-zinc-100 rounded-xl hover:border-primary transition-all text-left"
                                >
                                    <h3 className="font-black text-secondary text-sm mb-1">{product.name}</h3>
                                    <p className="text-xs text-zinc-400 mb-2">{product.category}</p>
                                    <p className="text-lg font-black text-primary">₹{product.price}</p>
                                    <p className="text-[8px] text-zinc-400 uppercase mt-1">Stock: {product.quantity}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Cart & Customer Details */}
                <div className="space-y-4">
                    {/* Customer Details */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                        <h2 className="text-base font-black text-secondary uppercase mb-4">Customer Details</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                                    <MdPerson className="inline mr-1" /> Name
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter customer name"
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-100 text-sm font-bold text-secondary focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                                    <MdPhone className="inline mr-1" /> Phone
                                </label>
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-100 text-sm font-bold text-secondary focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                                    Payment Method
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-100 text-sm font-bold text-secondary focus:outline-none focus:border-primary"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Online">Online</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                                    Assign Kitchen (Optional)
                                </label>
                                <select
                                    value={selectedKitchen}
                                    onChange={(e) => setSelectedKitchen(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-100 text-sm font-bold text-secondary focus:outline-none focus:border-primary"
                                >
                                    <option value="">No Kitchen (Direct Sale)</option>
                                    {kitchens.map(kitchen => (
                                        <option key={kitchen._id} value={kitchen._id}>
                                            {kitchen.name} - {kitchen.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                        <h2 className="text-base font-black text-secondary uppercase mb-4">Cart ({cartItems.length})</h2>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                            {cartItems.length === 0 ? (
                                <p className="text-center text-zinc-400 text-sm py-8">Cart is empty</p>
                            ) : (
                                cartItems.map(item => (
                                    <div key={item.product._id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                                        <div className="flex-1">
                                            <h3 className="font-black text-secondary text-xs">{item.product.name}</h3>
                                            <p className="text-[10px] text-zinc-400">₹{item.price} each</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.product._id, -1)}
                                                className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-secondary hover:bg-zinc-100"
                                            >
                                                <MdRemove size={14} />
                                            </button>
                                            <span className="font-black text-secondary text-sm w-8 text-center">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.product._id, 1)}
                                                className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-secondary hover:bg-zinc-100"
                                            >
                                                <MdAdd size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.product._id)}
                                                className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 ml-2"
                                            >
                                                <MdDelete size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Total */}
                        <div className="border-t border-zinc-100 pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-zinc-400 uppercase">Total Amount</span>
                                <span className="text-2xl font-black text-secondary">₹{calculateTotal()}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || cartItems.length === 0}
                                className="w-full py-3 bg-primary text-secondary rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating Bill...' : 'Create Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateBill;
