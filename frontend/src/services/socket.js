import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

const socketService = {
  connect: () => {
    if (!socket.connected) {
      socket.connect();
    }
  },

  disconnect: () => {
    socket.disconnect();
  },

  joinCompany: (companyId) => {
    socket.emit('join-company', companyId);
  },

  joinUser: (userId) => {
    socket.emit('join-user', userId);
  },

  sendLocationUpdate: (data) => {
    socket.emit('location-update', data);
  },

  on: (event, callback) => {
    socket.on(event, callback);
  },

  off: (event, callback) => {
    socket.off(event, callback);
  },

  getSocket: () => socket,
};

export default socketService;
