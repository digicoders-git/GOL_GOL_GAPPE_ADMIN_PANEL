import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join-admin');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const onStockUpdated = (callback) => {
  const sock = getSocket();
  sock.on('stock-updated', callback);
};

export const onOrderCreated = (callback) => {
  const sock = getSocket();
  sock.on('order-created', callback);
};

export const onOrderAssigned = (callback) => {
  const sock = getSocket();
  sock.on('order-assigned', callback);
};

export const onOrderStatusUpdated = (callback) => {
  const sock = getSocket();
  sock.on('order-status-updated', callback);
};

export const offStockUpdated = () => {
  const sock = getSocket();
  sock.off('stock-updated');
};

export const offOrderCreated = () => {
  const sock = getSocket();
  sock.off('order-created');
};

export const offOrderAssigned = () => {
  const sock = getSocket();
  sock.off('order-assigned');
};

export const offOrderStatusUpdated = () => {
  const sock = getSocket();
  sock.off('order-status-updated');
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
