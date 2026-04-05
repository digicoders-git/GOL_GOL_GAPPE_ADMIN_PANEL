import { useState } from 'react';

const DirectTest = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testDirect = async () => {
        setLoading(true);
        try {
            const API_URL = 'http://localhost:4000/api/test/test-products';
            console.log('🔄 Testing direct API:', API_URL);
            
            const response = await fetch(API_URL);
            const data = await response.json();
            
            console.log('📦 Direct API Response:', data);
            setResult(data);
        } catch (error) {
            console.error('❌ Direct test error:', error);
            setResult({ success: false, error: error.message });
        }
        setLoading(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Direct Database Test</h1>
            
            <button 
                onClick={testDirect}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded mb-4"
            >
                {loading ? 'Testing...' : 'Test Direct DB'}
            </button>

            {result && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-bold mb-2">Direct DB Result:</h3>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default DirectTest;