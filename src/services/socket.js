import { io } from 'socket.io-client';

const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_URL || 'http://localhost:3006';
    url = url.replace(/\/api\/?$/, '');
    url = url.replace(/\/$/, '');
    return url;
};

const BACKEND_URL = getBaseUrl();

let socket = null;

export function connectSocket(adminJwt) {
    if (socket?.connected) return socket;

    socket = io(BACKEND_URL, {
        auth: { token: adminJwt },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        path: '/socket.io',
    });

    socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
    socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
    socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));

    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
