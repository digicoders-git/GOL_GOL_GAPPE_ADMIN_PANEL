import { useState, useEffect } from 'react';

const ConnectionTest = () => {
    const [status, setStatus] = useState('checking');
    const [details, setDetails] = useState({});

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        const API_URL = 'http://localhost:5000';

        try {
            console.log('🔄 Testing backend connection...');

            // Test 1: Health check
            const healthResponse = await fetch(API_URL);
            const healthData = await healthResponse.json();

            // Test 2: Products API
            const productsResponse = await fetch(`${API_URL}/api/products`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const productsData = await productsResponse.json();

            setDetails({
                health: { status: healthResponse.status, data: healthData },
                products: { status: productsResponse.status, data: productsData },
                token: localStorage.getItem('token') ? 'Present' : 'Missing'
            });

            setStatus('connected');
        } catch (error) {
            console.error('❌ Connection failed:', error);
            setDetails({ error: error.message });
            setStatus('failed');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Backend Connection Test</h1>

            <div className={`p-4 rounded-lg mb-4 ${status === 'checking' ? 'bg-yellow-50 border-yellow-200' :
                    status === 'connected' ? 'bg-green-50 border-green-200' :
                        'bg-red-50 border-red-200'
                } border`}>
                <h3 className="font-bold mb-2">
                    Status: {status === 'checking' ? 'Checking...' :
                        status === 'connected' ? '✅ Connected' :
                            '❌ Failed'}
                </h3>

                {status !== 'checking' && (
                    <pre className="text-sm bg-white p-3 rounded overflow-auto">
                        {JSON.stringify(details, null, 2)}
                    </pre>
                )}
            </div>

            <button
                onClick={testConnection}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Test Again
            </button>
        </div>
    );
};

export default ConnectionTest;