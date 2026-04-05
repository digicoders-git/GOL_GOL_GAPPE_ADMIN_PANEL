import { useState } from 'react';

const ApiTest = () => {
    const [testResults, setTestResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const testProductsAPI = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            console.log('Products API Test:', data);
            
            setTestResults({
                status: response.status,
                success: response.ok,
                data: data,
                productsCount: data.products?.length || 0
            });
        } catch (error) {
            console.error('API Test Error:', error);
            setTestResults({
                status: 'ERROR',
                success: false,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Products API Test</h1>
            
            <button 
                onClick={testProductsAPI}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
            >
                {loading ? 'Testing...' : 'Test Products API'}
            </button>

            {testResults && (
                <div className={`p-4 rounded border ${
                    testResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                    <h3 className="font-bold mb-2">API Test Results</h3>
                    <p><strong>Status:</strong> {testResults.status}</p>
                    <p><strong>Success:</strong> {testResults.success ? 'Yes' : 'No'}</p>
                    <p><strong>Products Found:</strong> {testResults.productsCount}</p>
                    
                    <details className="mt-4">
                        <summary className="cursor-pointer font-bold">Raw Response</summary>
                        <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-64 mt-2 border">
                            {JSON.stringify(testResults.data || testResults.error, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default ApiTest;