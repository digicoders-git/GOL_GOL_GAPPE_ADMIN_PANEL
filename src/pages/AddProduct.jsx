import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdAdd,
    MdInventory,
    MdSave,
    MdDelete,
    MdHistory,
    MdFileDownload,
    MdCategory,
    MdEdit,
    MdAttachMoney,
    MdFastfood,
    MdRestaurant,
    MdTag,
    MdImage,
    MdDescription,
    MdNumbers,
    MdCheckCircle,
    MdCancel,
    MdCloudUpload,
    MdVideoLibrary,
    MdAnalytics,
    MdClose,
    MdArrowForward
} from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../utils/api';
import api from '../utils/api';

const AddProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const thumbnailInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        slug: '',
        description: '',
        detailedDescription: '',
        category: '',
        cuisineType: '', // Will split into array on submit
        tags: '', // Will split into array on submit
        images: [],
        thumbnail: '',
        videoUrl: '',
        price: '',
        discountPrice: '',
        gstPercent: 0,
        serviceChargeApplicable: false,
        packagingCharge: 0,
        costPrice: '',
        foodType: 'veg',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        inStock: true,
        unit: 'pcs',
        quantity: 0,
        minStock: 10
    });

    const [searchQuery, setSearchQuery] = useState('');

    // Precise Price Calculation Engine
    const priceDetails = useMemo(() => {
        const p = parseFloat(formData.price) || 0;
        const dp = parseFloat(formData.discountPrice);
        const hasDiscount = !isNaN(dp) && dp > 0 && dp < p;
        const basePrice = hasDiscount ? dp : p;

        const gstPercent = parseFloat(formData.gstPercent) || 0;
        const packaging = parseFloat(formData.packagingCharge) || 0;
        const serviceChargePercent = 0.10;

        const gstAmount = (basePrice * gstPercent) / 100;
        const serviceCharge = formData.serviceChargeApplicable ? (basePrice * serviceChargePercent) : 0;
        const total = basePrice + gstAmount + serviceCharge + packaging;
        const savings = hasDiscount ? (p - dp) : 0;
        const savingsPercent = hasDiscount ? ((savings / p) * 100).toFixed(0) : 0;

        return {
            basePrice,
            gstAmount,
            serviceCharge,
            packaging,
            total: total.toFixed(2),
            savings,
            savingsPercent,
            hasDiscount,
            mrp: p
        };
    }, [formData.price, formData.discountPrice, formData.gstPercent, formData.packagingCharge, formData.serviceChargeApplicable]);

    const calculateTotalPrice = () => priceDetails.total;

    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('Fetching products...');
            const response = await getProducts();
            console.log('Products API response:', response);

            if (response?.data?.success && Array.isArray(response.data.products)) {
                console.log('Products found:', response.data.products.length);
                setProducts(response.data.products);
            } else if (Array.isArray(response?.data)) {
                console.log('Products array found directly:', response.data.length);
                setProducts(response.data);
            } else {
                console.log('No products found or invalid format');
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            console.error('Error response:', error.response?.data);
            setProducts([]);
        } finally {
            setTimeout(() => setLoading(false), 100); // Small delay to prevent flicker
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        (product?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product?.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        // Validation
        if (!formData.name?.trim()) {
            toast.error('Product name is required');
            return;
        }
        if (!formData.price || Number(formData.price) <= 0) {
            toast.error('Valid price is required');
            return;
        }
        if (!formData.category?.trim()) {
            toast.error('Category is required');
            return;
        }
        if (formData.discountPrice && Number(formData.discountPrice) >= Number(formData.price)) {
            toast.error('Discount price must be less than selling price');
            return;
        }

        setSaving(true);

        // Image already uploaded to Cloudinary, just use the URL
        const formattedData = {
            ...formData,
            // thumbnail already contains Cloudinary URL
            cuisineType: (formData.cuisineType || '').toString().split(',').map(item => item.trim()).filter(i => i),
            tags: (formData.tags || '').toString().split(',').map(item => item.trim()).filter(i => i),
            images: formData.images,
            nutrition: {
                calories: Number(formData.calories) || 0,
                protein: Number(formData.protein) || 0,
                carbs: Number(formData.carbs) || 0,
                fat: Number(formData.fat) || 0
            },
            price: Number(formData.price),
            discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
            costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
            gstPercent: Number(formData.gstPercent) || 0,
            packagingCharge: Number(formData.packagingCharge) || 0,
        };

        console.log('Sending data:', formattedData);

        const loadingToast = toast.loading(isEditing ? 'Updating product...' : 'Creating product...');
        try {
            let response;
            if (isEditing) {
                response = await updateProduct(currentId, formattedData);
            } else {
                response = await createProduct(formattedData);
            }

            if (response.data.success) {
                toast.success(isEditing ? 'Product updated!' : 'Product created!', { id: loadingToast });
                resetForm();
                fetchProducts();
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to save product', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            shortName: '',
            slug: '',
            description: '',
            detailedDescription: '',
            category: '',
            cuisineType: '',
            tags: '',
            images: '',
            thumbnail: '',
            videoUrl: '',
            price: '',
            discountPrice: '',
            gstPercent: 0,
            serviceChargeApplicable: false,
            packagingCharge: 0,
            costPrice: '',
            foodType: 'veg',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            inStock: true,
            unit: 'pcs',
            quantity: 0,
            minStock: 10
        });
        setThumbnailFile(null);
        setThumbnailPreview('');
        setGalleryFiles([]);
        setGalleryPreviews([]);
        setVideoFile(null);
        setVideoPreview('');
        setIsEditing(false);
        setCurrentId(null);
        setActiveSection('basic');
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name || '',
            shortName: product.shortName || '',
            slug: product.slug || '',
            description: product.description || '',
            detailedDescription: product.detailedDescription || '',
            category: product.category || '',
            cuisineType: product.cuisineType?.join(', ') || '',
            tags: product.tags?.join(', ') || '',
            images: product.images || [],
            thumbnail: product.thumbnail || '',
            videoUrl: product.videoUrl || '',
            price: product.price || '',
            discountPrice: product.discountPrice || '',
            gstPercent: product.gstPercent || 0,
            serviceChargeApplicable: product.serviceChargeApplicable || false,
            packagingCharge: product.packagingCharge || 0,
            costPrice: product.costPrice || '',
            foodType: product.foodType || 'veg',
            calories: product.nutrition?.calories || 0,
            protein: product.nutrition?.protein || 0,
            carbs: product.nutrition?.carbs || 0,
            fat: product.nutrition?.fat || 0,
            inStock: product.hasOwnProperty('inStock') ? product.inStock : true,
            unit: product.unit || 'pcs',
            quantity: product.quantity || 0,
            minStock: product.minStock || 10
        });
        setThumbnailPreview(product.thumbnail || '');
        setGalleryPreviews(product.images || []);
        setVideoPreview(product.videoUrl || '');
        setIsEditing(true);
        setCurrentId(product._id);
        setActiveSection('basic');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Product?',
            text: "This product will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!',
            background: '#ffffff',
            customClass: { popup: 'rounded-[2rem]' }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteProduct(id);
                    if (response.data.success) {
                        toast.success('Product deleted');
                        fetchProducts();
                    }
                } catch (error) {
                    toast.error('Failed to delete');
                }
            }
        });
    };

    const SectionTab = ({ id, label, icon: Icon }) => (
        <button
            type="button"
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${activeSection === id
                ? 'bg-secondary text-primary shadow-lg'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 p-4 lg:p-6 animate-fade-in text-secondary">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
                            <MdFastfood size={16} />
                        </div>
                        <span className="text-primary font-black tracking-widest text-[9px] uppercase italic bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">Menu Management</span>
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight italic leading-none">
                        {isEditing ? 'Update Product' : 'Add New Product'}
                    </h1>
                    <p className="text-zinc-500 text-[11px] font-medium">Products loaded: {products.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-12 xl:col-span-7">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-premium relative overflow-hidden">
                        {/* Section Navigation */}
                        <div className="flex flex-wrap gap-2 mb-8 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                            <SectionTab id="basic" label="Basic Info" icon={MdInventory} />
                            <SectionTab id="pricing" label="Pricing & Tax" icon={MdAttachMoney} />
                            <SectionTab id="media" label="Media & Tags" icon={MdImage} />
                            <SectionTab id="nutrition" label="Nutrition" icon={MdAnalytics} />
                            <SectionTab id="stock" label="Stock Status" icon={MdCheckCircle} />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {activeSection === 'basic' && (
                                    <motion.div
                                        key="basic"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Product Name *</label>
                                            <div className="relative">
                                                <MdInventory className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g., Paneer Butter Masala"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Short Name *</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm"
                                                value={formData.shortName}
                                                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                                                placeholder="e.g., Paneer BM"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category *</label>
                                            <div className="relative">
                                                <MdCategory className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    placeholder="e.g., Main Course"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Description *</label>
                                            <textarea
                                                rows="2"
                                                required
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm resize-none"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Brief overview..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Food Type *</label>
                                            <select
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm appearance-none"
                                                value={formData.foodType}
                                                onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                                            >
                                                <option value="veg">Veg</option>
                                                <option value="non-veg">Non-Veg</option>
                                                <option value="jain">Jain</option>
                                                <option value="vegan">Vegan</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Cuisine Type *</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm"
                                                value={formData.cuisineType}
                                                onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                                                placeholder="e.g., North Indian, Punjabi"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'pricing' && (
                                    <motion.div
                                        key="pricing"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Selling Price *</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 font-bold">₹</div>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Discount Price</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 font-bold">₹</div>
                                                <input
                                                    type="text"
                                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm"
                                                    value={formData.discountPrice}
                                                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl md:col-span-2">
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-secondary uppercase tracking-tight">Service Charge Applicable?</p>
                                                <p className="text-[9px] text-zinc-400 uppercase">Will add 10% service charge</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, serviceChargeApplicable: !formData.serviceChargeApplicable })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${formData.serviceChargeApplicable ? 'bg-secondary' : 'bg-zinc-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.serviceChargeApplicable ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="md:col-span-2 p-6 bg-gradient-to-br from-secondary to-black rounded-3xl border-2 border-primary/10 shadow-2xl relative overflow-hidden group">
                                            {/* Decorative Background Elements */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl" />

                                            <div className="relative space-y-4">
                                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Final Invoice Estimate</p>
                                                    {priceDetails.hasDiscount && (
                                                        <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                                                            Saving {priceDetails.savingsPercent}%
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                                                    <div className="flex justify-between">
                                                        <span>Base Rate</span>
                                                        <span className="text-white">₹{priceDetails.basePrice.toFixed(2)}</span>
                                                    </div>



                                                </div>

                                                <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Customer Payable</p>
                                                        <h3 className="text-3xl font-black text-primary tracking-tighter leading-none mt-1">
                                                            ₹{priceDetails.total}
                                                        </h3>
                                                    </div>
                                                    {priceDetails.hasDiscount && (
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">MRP: ₹{priceDetails.mrp.toFixed(2)}</p>
                                                            <p className="text-[9px] font-black text-emerald-400">Save ₹{priceDetails.savings.toFixed(2)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'media' && (
                                    <motion.div
                                        key="media"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Product Thumbnail</label>
                                            <div className="relative">
                                                <input
                                                    ref={thumbnailInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (file.size > 5 * 1024 * 1024) {
                                                                toast.error(`"${file.name}" ki size ${(file.size / (1024 * 1024)).toFixed(2)}MB hai — maximum 5MB allowed hai. Chhoti image use karo!`);
                                                                e.target.value = '';
                                                                return;
                                                            }
                                                            // Show loading state
                                                            setThumbnailPreview('loading');
                                                            
                                                            try {
                                                                // Convert to base64 and upload to Cloudinary immediately
                                                                const reader = new FileReader();
                                                                const base64 = await new Promise((resolve) => {
                                                                    reader.onloadend = () => resolve(reader.result);
                                                                    reader.readAsDataURL(file);
                                                                });
                                                                
                                                                // Upload to Cloudinary via API
                                                                const uploadResponse = await api.post('/products/upload-image', {
                                                                    image: base64,
                                                                    folder: 'products/thumbnails'
                                                                });
                                                                
                                                                if (uploadResponse.data.success) {
                                                                    const cloudinaryUrl = uploadResponse.data.url;
                                                                    setThumbnailPreview(cloudinaryUrl);
                                                                    setFormData({ ...formData, thumbnail: cloudinaryUrl });
                                                                    toast.success('Thumbnail uploaded to Cloudinary!');
                                                                } else {
                                                                    throw new Error('Upload failed');
                                                                }
                                                            } catch (error) {
                                                                console.error('Upload error:', error);
                                                                toast.error('Failed to upload image');
                                                                setThumbnailPreview('');
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div
                                                    onClick={() => thumbnailInputRef.current?.click()}
                                                    className="w-full bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl py-8 px-4 font-bold outline-none hover:border-primary hover:bg-primary/5 transition-all text-sm flex flex-col items-center gap-3 cursor-pointer"
                                                >
                                                    {thumbnailPreview === 'loading' ? (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                            <p className="text-primary font-black">Uploading ...</p>
                                                        </div>
                                                    ) : thumbnailPreview ? (
                                                        <div className="relative">
                                                            <img src={thumbnailPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-zinc-200" />
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setThumbnailPreview('');
                                                                    setFormData({ ...formData, thumbnail: '' });
                                                                }}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                                                            >
                                                                <MdClose size={14} />
                                                            </div>
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] p-1 rounded-b-xl text-center">
                                                                Cloudinary ✓
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <MdCloudUpload size={40} className="text-zinc-300" />
                                                            <div className="text-center">
                                                                <p className="text-secondary font-black">Click to upload to Cloudinary</p>
                                                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">PNG, JPG up to 5MB</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Gallery Images (Multiple Files)</label>
                                            <div className="relative">
                                                <input
                                                    ref={galleryInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const files = Array.from(e.target.files);
                                                        if (files.length > 0) {
                                                            const validFiles = files.filter(file => {
                                                                if (file.size > 5 * 1024 * 1024) {
                                                                    toast.error(`"${file.name}" ki size ${(file.size / (1024 * 1024)).toFixed(2)}MB hai — maximum 5MB allowed hai.`);
                                                                    return false;
                                                                }
                                                                return true;
                                                            });
                                                            
                                                            if (validFiles.length > 0) {
                                                                const uploadedUrls = [];
                                                                const previews = [];
                                                                
                                                                for (const file of validFiles) {
                                                                    try {
                                                                        const reader = new FileReader();
                                                                        const base64 = await new Promise((resolve) => {
                                                                            reader.onloadend = () => resolve(reader.result);
                                                                            reader.readAsDataURL(file);
                                                                        });
                                                                        
                                                                        const uploadResponse = await api.post('/products/upload-image', {
                                                                            image: base64,
                                                                            folder: 'products/gallery'
                                                                        });
                                                                        
                                                                        if (uploadResponse.data.success) {
                                                                            uploadedUrls.push(uploadResponse.data.url);
                                                                            previews.push(uploadResponse.data.url);
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Upload error:', error);
                                                                        toast.error(`Failed to upload ${file.name}`);
                                                                    }
                                                                }
                                                                
                                                                if (uploadedUrls.length > 0) {
                                                                    setGalleryPreviews([...galleryPreviews, ...previews]);
                                                                    setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
                                                                    toast.success(`${uploadedUrls.length} images uploaded!`);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div
                                                    onClick={() => galleryInputRef.current?.click()}
                                                    className="w-full bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl py-6 px-4 font-bold outline-none hover:border-primary hover:bg-primary/5 transition-all text-sm flex flex-col items-center gap-3 cursor-pointer"
                                                >
                                                    <MdCloudUpload size={32} className="text-zinc-300" />
                                                    <div className="text-center">
                                                        <p className="text-secondary font-black">Click to upload multiple images</p>
                                                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">PNG, JPG up to 5MB each</p>
                                                    </div>
                                                </div>
                                                
                                                {galleryPreviews.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                                        {galleryPreviews.map((preview, index) => (
                                                            <div key={index} className="relative">
                                                                <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-20 object-cover rounded-lg border-2 border-zinc-200" />
                                                                <div
                                                                    onClick={() => {
                                                                        const newPreviews = galleryPreviews.filter((_, i) => i !== index);
                                                                        const newImages = formData.images.filter((_, i) => i !== index);
                                                                        setGalleryPreviews(newPreviews);
                                                                        setFormData({ ...formData, images: newImages });
                                                                    }}
                                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                                                                >
                                                                    <MdClose size={12} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Video Upload (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    ref={videoInputRef}
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (file.size > 50 * 1024 * 1024) {
                                                                toast.error(`Video size ${(file.size / (1024 * 1024)).toFixed(2)}MB hai — maximum 50MB allowed hai.`);
                                                                e.target.value = '';
                                                                return;
                                                            }
                                                            
                                                            setVideoPreview('loading');
                                                            
                                                            try {
                                                                const reader = new FileReader();
                                                                const base64 = await new Promise((resolve) => {
                                                                    reader.onloadend = () => resolve(reader.result);
                                                                    reader.readAsDataURL(file);
                                                                });
                                                                
                                                                const uploadResponse = await api.post('/products/upload-video', {
                                                                    video: base64,
                                                                    folder: 'products/videos'
                                                                });
                                                                
                                                                if (uploadResponse.data.success) {
                                                                    const videoUrl = uploadResponse.data.url;
                                                                    setVideoPreview(videoUrl);
                                                                    setFormData({ ...formData, videoUrl });
                                                                    toast.success('Video uploaded successfully!');
                                                                } else {
                                                                    throw new Error('Upload failed');
                                                                }
                                                            } catch (error) {
                                                                console.error('Video upload error:', error);
                                                                toast.error('Failed to upload video');
                                                                setVideoPreview('');
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div
                                                    onClick={() => videoInputRef.current?.click()}
                                                    className="w-full bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl py-6 px-4 font-bold outline-none hover:border-primary hover:bg-primary/5 transition-all text-sm flex flex-col items-center gap-3 cursor-pointer"
                                                >
                                                    {videoPreview === 'loading' ? (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                            <p className="text-primary font-black">Uploading video...</p>
                                                        </div>
                                                    ) : videoPreview ? (
                                                        <div className="relative">
                                                            <video src={videoPreview} className="w-32 h-20 object-cover rounded-xl border-2 border-zinc-200" controls />
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setVideoPreview('');
                                                                    setFormData({ ...formData, videoUrl: '' });
                                                                }}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                                                            >
                                                                <MdClose size={14} />
                                                            </div>
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] p-1 rounded-b-xl text-center">
                                                                Video ✓
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <MdVideoLibrary size={32} className="text-zinc-300" />
                                                            <div className="text-center">
                                                                <p className="text-secondary font-black">Click to upload video</p>
                                                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">MP4, MOV up to 50MB</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tags (Comma separated)</label>
                                            <div className="relative">
                                                <MdTag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                                                <input
                                                    type="text"
                                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 font-bold outline-none focus:border-primary focus:bg-white transition-all text-sm"
                                                    value={formData.tags}
                                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                    placeholder="Bestseller, Spicy, New..."
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'nutrition' && (
                                    <motion.div
                                        key="nutrition"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Calories (kcal)</label>
                                            <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none text-sm" value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Protein (g)</label>
                                            <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none text-sm" value={formData.protein} onChange={(e) => setFormData({ ...formData, protein: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Carbs (g)</label>
                                            <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none text-sm" value={formData.carbs} onChange={(e) => setFormData({ ...formData, carbs: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Fat (g)</label>
                                            <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 font-bold outline-none text-sm" value={formData.fat} onChange={(e) => setFormData({ ...formData, fat: e.target.value })} />
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === 'stock' && (
                                    <motion.div
                                        key="stock"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 gap-4"
                                    >
                                        <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-secondary uppercase tracking-tight">Active In Stock?</p>
                                                <p className="text-[9px] text-zinc-400 uppercase">Turn off to temporarily hide from menu</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${formData.inStock ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.inStock ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-zinc-100 text-zinc-600 font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <MdCancel size={18} /> Cancel
                                </button>
                                {activeSection === 'stock' ? (
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`flex-[2] bg-secondary text-primary font-black py-4 rounded-2xl shadow-xl shadow-secondary/20 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black active:scale-[0.98] cursor-pointer'}`}
                                    >
                                        <MdSave size={18} /> {saving ? 'Saving...' : isEditing ? 'Update Master Record' : 'Save To Global Catalog'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const sections = ['basic', 'pricing', 'media', 'nutrition', 'stock'];
                                            const currentIndex = sections.indexOf(activeSection);
                                            if (currentIndex < sections.length - 1) {
                                                setActiveSection(sections[currentIndex + 1]);
                                            }
                                        }}
                                        className="flex-[2] bg-secondary text-primary font-black py-4 rounded-2xl shadow-xl shadow-secondary/20 hover:bg-black transition-all active:scale-[0.98] text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        Next <MdArrowForward size={18} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-12 xl:col-span-5">
                    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-premium overflow-hidden sticky top-6">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-sm font-black text-secondary tracking-widest uppercase mb-4">Catalog Overview</h2>
                            <div className="relative">
                                <MdInventory className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                                <input
                                    type="text"
                                    placeholder="Search catalog..."
                                    className="w-full bg-white border border-zinc-100 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:border-primary shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="max-h-[700px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-xs text-zinc-400 mt-2">Loading products...</p>
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div key={product._id} className="p-5 border-b border-zinc-50 hover:bg-zinc-50/80 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                                                {product.thumbnail ? (
                                                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400 font-black text-lg">
                                                        {product.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-secondary text-xs uppercase truncate">{product.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded-md ${product.foodType === 'veg' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                        {product.foodType}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{product.category}</span>
                                                    <span className="text-[8px] font-black text-secondary">₹{product.price}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(product)} className="p-2 bg-blue-50 text-blue-500 rounded-lg transition-colors hover:bg-blue-100"><MdEdit size={16} /></button>
                                                <button onClick={() => handleDelete(product._id)} className="p-2 bg-red-50 text-red-500 rounded-lg transition-colors hover:bg-red-100"><MdDelete size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <MdInventory size={48} className="text-zinc-200 mx-auto mb-3" />
                                    <p className="text-xs font-bold text-zinc-400 uppercase">No products found</p>
                                    <p className="text-[10px] text-zinc-300 mt-1">Add your first product using the form</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
