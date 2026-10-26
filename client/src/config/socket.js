/**
 * @file socket.js
 * @description Hàm tạo kết nối Socket.IO Client kèm JWT Handshake token
 * @assigned_to Dùng chung (Do A khởi tạo, B và C sử dụng)
 */

import { io } from "socket.io-client";

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

/**
 * Khởi tạo socket kết nối tới server với token hiện tại
 * @param {string} token - JWT token của user đăng nhập
 */
export const createSocketConnection = (token) => {
  return io(SOCKET_URL, {
    auth: { token },
    autoConnect: false, // Để AuthContext chủ động connect sau khi login
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
};
