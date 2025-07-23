// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export const registerSocketUser = (userId) => {
  if (userId) {
    socket.emit('registerUser', userId);
  }
};

socket.on('connect', () => {
  console.log('✅ Socket connected with ID:', socket.id);
});

export default socket;
