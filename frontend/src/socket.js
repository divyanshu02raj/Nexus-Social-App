//frontend\src\socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});

export default socket;
