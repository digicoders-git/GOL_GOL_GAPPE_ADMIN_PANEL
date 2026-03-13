import { useState } from 'react';
import { getProducts } from '../utils/api';

const QuickTest = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testAPI = async () => {
        setLoading(true);
        try {
            console.log('🔄 Testing getProducts API...');
            const response = await getProducts();
            console.log('📦 Full Response:', response);
            console.log('📊 Response Data:', response.data);
            console.log('✅ Success:', response.data.success);
            console.log('🍽️ Products:', response.data.products);
            console.log('📈 Count:', response.data.products?.length);
            
            setResult({
                success: true,
                data: response.data,
                count: response.data.products?.length || 0
            });
        } catch (error) {
            console.error('❌ API Error:', error);
            console.error('📋 Error Response:', error.response?.data);
            setResult({
                success: false,
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        }
        setLoading(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Products API Test</h1>
            
            <button 
                onClick={testAPI}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
                {loading ? 'Testing...' : 'Test Products API'}
            </button>

            {result && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-bold mb-2">Result:</h3>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default QuickTest;