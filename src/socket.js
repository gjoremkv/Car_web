// src/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ['websocket']
});

export const registerSocketUser = (userId) => {
  if (userId) {
    socket.emit('registerUser', userId);
  }
};

socket.on('connect', () => {
  console.log('✅ Socket connected with ID:', socket.id);
});

export default socket;
