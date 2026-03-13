import { useState, useEffect } from 'react';
import { getProducts } from '../utils/api';

const DebugProducts = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('🔄 Fetching products...');
                const response = await getProducts();
                console.log('📦 Raw API Response:', response);
                console.log('📊 Response Data:', response.data);
                
                setData(response.data);
                
                if (response.data.success) {
                    console.log('✅ Products found:', response.data.products?.length || 0);
                    console.log('🍽️ Sample products:', response.data.products?.slice(0, 3));
                } else {
                    console.log('❌ API returned success: false');
                }
            } catch (err) {
                console.error('💥 API Error:', err);
                console.error('📋 Error details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading products...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Product Debug Panel</h1>
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-red-800">Error:</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-4">API Response:</h3>
                <pre className="bg-white p-4 rounded border overflow-auto text-sm">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>

            {data?.success && data?.products && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-4">
                        Products Found: {data.products.length}
                    </h3>
                    <div className="grid gap-4">
                        {data.products.slice(0, 5).map((product, index) => (
                            <div key={product._id || index} className="bg-white p-4 rounded border">
                                <h4 className="font-semibold">{product.name || 'No Name'}</h4>
                                <p className="text-sm text-gray-600">
                                    Category: {product.category || 'No Category'} | 
                                    Quantity: {product.quantity || 0} | 
                                    Status: {product.status || 'No Status'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data?.success === false && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-800">API Success: False</h3>
                    <p className="text-yellow-600">The API returned success: false</p>
                </div>
            )}
        </div>
    );
};

export default DebugProducts;