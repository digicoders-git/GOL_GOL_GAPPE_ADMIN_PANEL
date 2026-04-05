import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, Package, Zap } from 'lucide-react';
import { initSocket, onStockUpdated, onOrderCreated, onOrderAssigned, offStockUpdated, offOrderCreated, offOrderAssigned } from '../utils/socketService';

const StockDashboard = () => {
  const [stockUpdates, setStockUpdates] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const socket = initSocket();

    socket.on('connect', () => {
      console.log('Admin panel connected');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Admin panel disconnected');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    });

    // Listen for stock updates
    onStockUpdated((data) => {
      console.log('Stock updated in admin:', data);
      setStockUpdates(prev => [
        {
          ...data,
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 9)
      ]);
    });

    // Listen for new orders
    onOrderCreated((data) => {
      console.log('Order created in admin:', data);
      setRecentOrders(prev => [
        {
          orderNumber: data.order.orderNumber,
          products: data.products,
          timestamp: new Date().toLocaleTimeString(),
          id: data.order._id,
          status: data.order.status
        },
        ...prev.slice(0, 4)
      ]);
    });

    // Listen for order assignments
    onOrderAssigned((order) => {
      console.log('Order assigned in admin:', order);
      setRecentOrders(prev => 
        prev.map(o => o.id === order._id ? { ...o, status: order.status } : o)
      );
    });

    return () => {
      offStockUpdated();
      offOrderCreated();
      offOrderAssigned();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Real-time Stock Dashboard</h1>
        <div className={`px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 ${
          connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        }`}>
          <span className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-white' : 'bg-white animate-pulse'
          }`}></span>
          {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Connecting...'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Updates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Live Stock Updates</h2>
            {stockUpdates.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {stockUpdates.length} updates
              </span>
            )}
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stockUpdates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Waiting for stock updates...</p>
            ) : (
              stockUpdates.map(update => (
                <div key={update.id} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-blue-900">Order: {update.orderNumber}</p>
                      <div className="text-xs text-gray-600 mt-1 space-y-1">
                        {update.products?.map(p => (
                          <p key={p._id} className="flex justify-between">
                            <span>{p.name}</span>
                            <span className="font-semibold text-blue-600">{p.quantity} {p.unit}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{update.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="text-green-600" size={24} />
            <h2 className="text-xl font-bold">Recent Orders</h2>
            {recentOrders.length > 0 && (
              <span className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {recentOrders.length} orders
              </span>
            )}
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet...</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="border-l-4 border-green-500 bg-green-50 p-3 rounded hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-green-900">{order.orderNumber}</p>
                      <div className="text-xs text-gray-600 mt-1">
                        {order.products?.map(p => (
                          <p key={p._id}>{p.name}</p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold block mb-1 ${
                        order.status === 'Ready' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-500">{order.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="lg:col-span-2 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-800">Stock Monitoring Active</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Real-time stock updates are being monitored. Kitchen panel and admin dashboard are synchronized.
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="lg:col-span-2 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <Zap className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-blue-800">Real-time Synchronization</h3>
              <p className="text-sm text-blue-700 mt-1">
                {connectionStatus === 'connected' 
                  ? 'Connected to server. All updates are live and instant.' 
                  : 'Attempting to reconnect...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
