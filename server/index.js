/**
 * @file index.js
 * @description Entry point khởi chạy Backend Server (Express + Socket.IO)
 * @assigned_to Thành viên A
 */

require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const { connectDatabase } = require("./src/config/database");
const masterRouter = require("./src/routes");
const { initSocketServer } = require("./src/sockets");

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 1. Middlewares cơ bản
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// 2. Kết nối CSDL MongoDB
connectDatabase();

// 3. Đăng ký REST API routes
app.use("/api", masterRouter);

// Endpoint kiểm tra sức khỏe server (Health check)
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// 4. Khởi tạo HTTP server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  maxHttpBufferSize: 3e7, // 30MB hỗ trợ gửi file ảnh lớn
});

// 5. Nạp cấu hình Socket
initSocketServer(io);

// 6. Lắng nghe kết nối
server.listen(PORT, () => {
  console.log(`🚀 [Server] Đang chạy tại: http://localhost:${PORT}`);
  console.log(`📡 [Socket] Đang lắng nghe kết nối từ: ${CLIENT_URL}`);
});
