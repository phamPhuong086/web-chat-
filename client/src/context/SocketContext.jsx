/**
 * @file SocketContext.jsx
 * @description Quản lý kết nối Socket.IO toàn cục cho ứng dụng
 * @assigned_to Phối hợp A, B, C (A tạo khung, B và C lắng nghe sự kiện)
 */

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { createSocketConnection } from "../config/socket";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Khởi tạo socket khi có token
    const newSocket = createSocketConnection(token);

    newSocket.on("connect", () => {
      console.log("🟢 [Socket Client] Đã kết nối tới Server:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 [Socket Client] Mất kết nối tới Server");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ [Socket Client] Lỗi kết nối:", err.message);
    });

    newSocket.connect();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
