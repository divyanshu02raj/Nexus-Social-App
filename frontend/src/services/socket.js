// src/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId) => {
  if (socket) return;

  socket = io('http://localhost:8000');

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (userId) {
      socket.emit('join', userId);
    }
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected.');
  }
};

export default socket;

