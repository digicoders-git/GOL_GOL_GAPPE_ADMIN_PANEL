import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getProducts } from '../utils/api';

const OfferManagement = () => {
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', image: '', code: '', discountType: 'percentage', discountValue: 0, maxUses: 100, minOrderAmount: 0, expiryDate: '', isActive: true, productId: '' });
    const [saving, setSaving] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        fetchOffers();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            console.log('Fetching products for offers...');
            const response = await getProducts();
            console.log('Products response:', response);
            
            const productsList = response.data?.products || response.data || [];
            console.log('Products list:', productsList);
            setProducts(productsList);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleProductSelect = (productId) => {
        const product = products.find(p => p._id === productId);
        if (product) {
            setFormData({ 
                ...formData, 
                productId,
                title: formData.title || product.name,
                image: product.thumbnail || product.images?.[0] || formData.image
            });
        }
    };

    const fetchOffers = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/offers`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setOffers(data.offers);
        } catch (error) {
            toast.error('Failed to fetch offers');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            if (editingOffer) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/offers/${editingOffer._id}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success('Offer updated');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/offers`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success('Offer created');
            }
            setShowModal(false);
            setFormData({ title: '', description: '', image: '', isActive: true });
            setEditingOffer(null);
            fetchOffers();
        } catch (error) {
            toast.error('Failed to save offer');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this offer?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/offers/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Offer deleted');
            fetchOffers();
        } catch (error) {
            toast.error('Failed to delete offer');
        }
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setFormData({ 
            title: offer.title, 
            description: offer.description, 
            image: offer.image, 
            code: offer.code,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            maxUses: offer.maxUses,
            minOrderAmount: offer.minOrderAmount,
            expiryDate: offer.expiryDate?.split('T')[0] || '',
            isActive: offer.isActive,
            productId: offer.productId || ''
        });
        setProductSearch('');
        setShowModal(true);
    };

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Offer Management</h1>
                <button onClick={() => { setShowModal(true); setEditingOffer(null); setProductSearch(''); setFormData({ title: '', description: '', image: '', code: '', discountType: 'percentage', discountValue: 0, maxUses: 100, minOrderAmount: 0, expiryDate: '', isActive: true, productId: '' }); }} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={20} /> Add Offer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(offer => (
                    <div key={offer._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img src={offer.image} alt={offer.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">{offer.code}</span>
                                <span className={`px-3 py-1 rounded-full text-xs ${offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {offer.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
                            <div className="text-xs text-gray-500 space-y-1 mb-3">
                                <p>Discount: {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}</p>
                                <p>Used: {offer.usedCount}/{offer.maxUses}</p>
                                <p>Expires: {new Date(offer.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(offer)} className="text-blue-600 hover:text-blue-800">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(offer._id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">{editingOffer ? 'Edit Offer' : 'Add Offer'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Product (Optional)</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 pl-10 mb-2"
                                        />
                                    </div>
                                    {loadingProducts ? (
                                        <div className="w-full border rounded-lg px-3 py-8 text-center text-gray-400">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                            Loading products...
                                        </div>
                                    ) : (
                                        <select 
                                            value={formData.productId} 
                                            onChange={(e) => handleProductSelect(e.target.value)} 
                                            className="w-full border rounded-lg px-3 py-2 max-h-40 overflow-y-auto"
                                            size={5}
                                        >
                                            <option value="">-- Select Product --</option>
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                                                ))
                                            ) : (
                                                <option disabled>No products found</option>
                                            )}
                                        </select>
                                    )}
                                    {!loadingProducts && products.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">No products available. Add products first.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Offer Code</label>
                                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full border rounded-lg px-3 py-2" placeholder="SAVE50" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" rows="2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Discount Type</label>
                                    <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full border rounded-lg px-3 py-2" required>
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Discount Value</label>
                                    <input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Max Uses</label>
                                    <input type="number" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Min Order Amount</label>
                                    <input type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Expiry Date</label>
                                    <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Image URL</label>
                                    <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="submit" disabled={saving} className={`flex-1 bg-primary text-white py-2 rounded-lg ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 cursor-pointer'}`}>{saving ? 'Saving...' : 'Save'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;
